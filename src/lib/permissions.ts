// Part 4 of the specification, as a table rather than as scattered checks.
// "Scoped" means limited to the departments named in that person's role
// assignments. A Vice Principal responsible for Chemistry sees Chemistry,
// and nothing else, unless the Principal widens her assignment.

export type Role =
  | 'principal' | 'vice_principal' | 'senior_discipline_master' | 'bursar'
  | 'hod' | 'teacher' | 'secretary' | 'student' | 'parent';

export type Capability =
  | 'staff.view.all' | 'staff.view.scoped' | 'staff.edit'
  | 'roles.assign' | 'import.staff' | 'import.students'
  | 'document.generate' | 'document.sign' | 'reference.edit'
  | 'notes.approve' | 'notes.upload' | 'assess.set' | 'marks.record'
  | 'discipline.record' | 'content.publish' | 'ai.configure' | 'audit.view';

export const MATRIX: Record<Capability, Role[]> = {
  'staff.view.all':    ['principal', 'secretary'],
  'staff.view.scoped': ['vice_principal', 'hod', 'teacher'],
  'staff.edit':        ['principal'],
  'roles.assign':      ['principal'],
  'import.staff':      ['principal'],
  'import.students':   ['principal', 'vice_principal'],
  'document.generate': ['principal', 'vice_principal', 'secretary'],
  'document.sign':     ['principal'],
  'reference.edit':    ['principal'],
  'notes.approve':     ['principal', 'vice_principal', 'hod'],
  'notes.upload':      ['principal', 'vice_principal', 'hod', 'teacher'],
  'assess.set':        ['principal', 'vice_principal', 'hod', 'teacher'],
  'marks.record':      ['principal', 'vice_principal', 'hod', 'teacher'],
  'discipline.record': ['principal', 'vice_principal', 'senior_discipline_master'],
  'content.publish':   ['principal', 'vice_principal'],
  'ai.configure':      ['principal'],
  'audit.view':        ['principal'],
};

export const can = (role: Role | null, cap: Capability) =>
  !!role && MATRIX[cap].includes(role);

export const ROLE_LABEL: Record<Role, string> = {
  principal: 'Principal',
  vice_principal: 'Vice Principal',
  senior_discipline_master: 'Senior Discipline Master or Mistress',
  bursar: 'Bursar',
  hod: 'Head of Department',
  teacher: 'Teacher',
  secretary: 'Secretary',
  student: 'Student',
  parent: 'Parent',
};
