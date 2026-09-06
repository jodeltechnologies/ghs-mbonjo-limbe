import { supabaseServer } from '@/lib/supabase/server';
import type { Role } from '@/lib/permissions';

export type Session = {
  userId: string;
  role: Role;
  staffId: string | null;
  studentId: string | null;
  name: string;
  scope: string[];      // department codes this person may see
};

export async function getSession(): Promise<Session | null> {
  const db = supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;

  const { data: profile } = await db
    .from('profiles')
    .select('account_role, staff_id, student_id')
    .eq('id', user.id)
    .single();
  if (!profile) return null;

  let name = user.email ?? '';
  let scope: string[] = [];

  if (profile.staff_id) {
    const { data: staff } = await db
      .from('staff').select('display_name').eq('id', profile.staff_id).single();
    if (staff) name = staff.display_name;

    const { data: roles } = await db
      .from('role_assignments')
      .select('department')
      .eq('staff_id', profile.staff_id)
      .is('ends_on', null);
    scope = (roles ?? []).map(r => r.department).filter(Boolean) as string[];
  } else if (profile.student_id) {
    const { data: st } = await db
      .from('students').select('display_name').eq('id', profile.student_id).single();
    if (st) name = st.display_name;
  }

  return {
    userId: user.id,
    role: profile.account_role as Role,
    staffId: profile.staff_id,
    studentId: profile.student_id,
    name,
    scope,
  };
}

export async function audit(action: string, entity: string, detail: string) {
  const db = supabaseServer();
  const s = await getSession();
  await db.from('audit_log').insert({
    actor_id: s?.userId ?? null,
    actor_name: s?.name ?? null,
    actor_role: s?.role ?? null,
    action, entity, detail,
  });
}
