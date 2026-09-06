import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { can, ROLE_LABEL, type Capability } from '@/lib/permissions';
import { signOut } from '@/app/signin/actions';

const RAIL: Array<[string, string, Capability | null]> = [
  ['/portal',                    'Dashboard',            null],
  ['/portal/staff',              'Staff register',       'staff.view.scoped'],
  ['/portal/departments',        'Departments',          'staff.view.scoped'],
  ['/portal/documents',          'Generate a document',  'document.generate'],
  ['/portal/documents/register', 'Reference register',   'document.generate'],
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/signin?next=/portal');

  const visible = RAIL.filter(([, , cap]) =>
    !cap || can(session.role, cap) || can(session.role, 'staff.view.all'));

  return (
    <div className="md:grid md:grid-cols-[248px_1fr] min-h-screen">
      <aside className="bg-green-deep text-[#CFE0D5] md:sticky md:top-0 md:h-screen overflow-y-auto py-4">
        <div className="flex gap-2 items-center px-4 pb-3 border-b border-white/15 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/shield.png" alt="" width={34} height={34} />
          <span>
            <b className="text-white font-serif block text-[15px] leading-tight">GHS Mbonjo</b>
            <span className="text-[11px] text-[#9BB6A5]">Staff portal</span>
          </span>
        </div>
        {visible.map(([href, label]) => (
          <Link key={href} href={href}
                className="block px-4 py-2.5 min-h-[42px] text-sm hover:bg-white/10 hover:text-white">
            {label}
          </Link>
        ))}
        <div className="px-4 pt-3 mt-3 border-t border-white/15">
          <b className="text-white block text-[13.5px]">{session.name}</b>
          <span className="text-[11.5px] text-[#9BB6A5]">{ROLE_LABEL[session.role]}</span>
          {session.scope.length > 0 && (
            <span className="block text-[11px] text-[#9BB6A5] mt-1">
              Scoped to {session.scope.join(', ')}
            </span>
          )}
          <form action={signOut} className="mt-2">
            <button className="text-[13px] underline">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="px-5 md:px-7 py-6 pb-24">{children}</main>
    </div>
  );
}
