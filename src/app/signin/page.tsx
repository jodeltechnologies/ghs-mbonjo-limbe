import { Masthead } from '@/components/Masthead';
import { getSettings } from '@/lib/settings';
import { signIn } from './actions';

export const metadata = { title: 'Sign in' };

export default async function SignIn({
  searchParams,
}: { searchParams: { error?: string; next?: string } }) {
  const { school } = await getSettings();
  return (
    <>
      <Masthead cfg={school} />
      <div className="mx-auto max-w-[440px] px-5 py-14">
        <h1 className="text-3xl">Sign in</h1>
        <p className="text-sm text-ink2 mt-2">
          Accounts are created by the Principal. If you have none, ask at the office.
        </p>
        <form action={signIn} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={searchParams.next ?? '/portal'} />
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="username"
                   className="w-full min-h-[44px] px-3 border-[1.5px] border-rule rounded-sm bg-paper" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password"
                   className="w-full min-h-[44px] px-3 border-[1.5px] border-rule rounded-sm bg-paper" />
          </div>
          {searchParams.error && (
            <p className="text-brick text-sm border-l-[3px] border-brick pl-3">
              That email and password do not match an account. Try again, or ask the office to reset it.
            </p>
          )}
          <button className="min-h-[44px] px-4 rounded-sm bg-green text-white font-semibold w-full">
            Sign in
          </button>
        </form>
      </div>
    </>
  );
}
