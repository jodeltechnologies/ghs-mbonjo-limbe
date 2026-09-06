'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { getSession, audit } from '@/lib/session';
import { can } from '@/lib/permissions';
import { getSettings } from '@/lib/settings';
import { takeReference, referenceInUse } from '@/lib/references';

export async function issueDocument(formData: FormData) {
  const session = await getSession();
  if (!session || !can(session.role, 'document.generate')) {
    throw new Error('Your role does not permit generating documents.');
  }

  const db = supabaseServer();
  const { school, reference } = await getSettings();
  const type = String(formData.get('type')) as 'attestation' | 'certificate' | 'letter';
  const staffId = String(formData.get('staff_id') ?? '') || null;
  const manual = String(formData.get('reference') ?? '').trim();

  // The number is allocated at the moment of issue, never while drafting.
  const ref = manual || await takeReference(type, reference, school.academic_year);
  if (manual && await referenceInUse(manual)) {
    // Reissue is legitimate, so this warns rather than refuses.
    await audit('reuse', 'reference', `${manual} was already in use and was issued again`);
  }

  const snapshot = {
    type,
    reference: ref,
    issued_on: String(formData.get('issued_on') ?? ''),
    function_text: String(formData.get('function_text') ?? ''),
    decision_no: String(formData.get('decision_no') ?? 'ON DUTY'),
    assumed_on: String(formData.get('assumed_on') ?? ''),
    academic_year: school.academic_year,
    title: String(formData.get('title') ?? ''),
    body: String(formData.get('body') ?? ''),
  };

  const { error } = await db.from('documents').insert({
    reference: ref,
    reference_manual: !!manual,
    type,
    status: 'final',
    subject_staff_id: staffId,
    issued_on: snapshot.issued_on || new Date().toISOString().slice(0, 10),
    issued_by: session.staffId,
    snapshot,
  });
  if (error) throw error;

  await audit('generate', 'document', `${ref}, ${type}`);
  revalidatePath('/portal/documents/register');
  redirect(`/portal/documents/register?issued=${encodeURIComponent(ref)}`);
}

export async function cancelDocument(formData: FormData) {
  const session = await getSession();
  if (!session || !can(session.role, 'document.sign')) {
    throw new Error('Only the Principal may cancel a document.');
  }
  const db = supabaseServer();
  const id = String(formData.get('id'));
  const reason = String(formData.get('reason') ?? '');
  // The number is kept, so the register has no gaps.
  const { error } = await db.from('documents')
    .update({ status: 'cancelled', cancelled_reason: reason }).eq('id', id);
  if (error) throw error;
  await audit('cancel', 'document', reason);
  revalidatePath('/portal/documents/register');
}
