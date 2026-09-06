'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { getSession, audit } from '@/lib/session';
import { can } from '@/lib/permissions';

export async function setHead(formData: FormData) {
  const session = await getSession();
  if (!session || !can(session.role, 'roles.assign')) {
    throw new Error('Only the Principal assigns Heads of Department.');
  }
  const db = supabaseServer();
  const code = String(formData.get('code'));
  const staffId = String(formData.get('staff_id') ?? '');
  const today = new Date().toISOString().slice(0, 10);

  // An appointment is ended rather than deleted, so the record of who held the
  // post on a past date survives.
  await db.from('role_assignments').update({ ends_on: today })
    .eq('role', 'hod').eq('department', code).is('ends_on', null);

  if (staffId) {
    // If this person was already an unassigned Head, name their department
    // rather than creating a second appointment.
    const { data: existing } = await db.from('role_assignments')
      .select('id').eq('staff_id', staffId).eq('role', 'hod')
      .is('department', null).is('ends_on', null).maybeSingle();

    if (existing) {
      await db.from('role_assignments')
        .update({ department: code, note: null }).eq('id', existing.id);
    } else {
      await db.from('role_assignments').insert({
        staff_id: staffId, role: 'hod', department: code,
        starts_on: today, assigned_by: session.staffId,
      });
    }
    await audit('assign', 'role', `Head of ${code} appointed`);
  } else {
    await audit('assign', 'role', `Head of ${code} cleared`);
  }
  revalidatePath('/portal/departments');
}
