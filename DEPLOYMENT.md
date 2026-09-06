# Putting the system online

GitHub, Vercel and Supabase, which are the three services named in Part 2 of the
specification. No command line anywhere. Everything below is done in a browser.

Work through the parts in order. Part 5 is where it becomes a real system rather
than a website, so do not stop before it.

---

## Part 1. Create the repository

1. Go to **github.com** and sign in. If the school has no account, create one on
   a school address rather than a personal one, or the account leaves when the
   person does.
2. Click **+** at the top right, then **New repository**.
3. Name it `ghs-mbonjo-limbe`. Set it to **Private**. Do not tick anything else.
   Click **Create repository**.
4. On the page that follows, click the link **uploading an existing file**.
5. Unzip this package on your computer, open the folder, select **everything
   inside it**, and drag it onto the page. Take the contents, not the folder
   itself.
6. Wait for the upload to finish, write `First upload` in the box at the bottom,
   and click **Commit changes**.

GitHub Pages will not work for this repository and should be left off. Pages
serves fixed files, and this application runs code on a server.

---

## Part 2. Create the database

1. Go to **supabase.com**, click **Start your project**, and sign in with GitHub.
2. Click **New project**. Name it `ghs-mbonjo-limbe`.
3. Choose a region in Europe, which is the nearest Supabase offers to Cameroon.
4. Set a database password and **write it down somewhere the school will still
   have it next year**. It cannot be recovered, only reset.
5. Wait about two minutes while the project is created.

### Build the tables

6. Open **SQL Editor** in the left column and click **New query**.
7. Open `supabase/01-schema.sql` from this package in any text editor, copy all
   of it, paste it in, and click **Run**. It should say Success.
8. Repeat for the other three files, **in this order and one at a time**:
   `02-policies.sql`, then `03-seed-data.sql`, then `04-seed-roles.sql`.
   The order matters. The policies refer to tables the schema creates, and the
   roles refer to the staff the seed inserts.
9. Open **Table Editor** and click on `staff`. You should see 92 rows.

### Check the security is on

10. Still in **Table Editor**, look at the list of tables. Each should show
    **RLS enabled**. If any does not, `02-policies.sql` did not finish; run it
    again and read the error.

### Turn off open sign-ups

11. Open **Authentication**, then **Providers**, and confirm **Email** is on.
12. Open **Authentication**, then **Sign In / Providers**, and turn
    **Allow new users to sign up** off. Only accounts the Principal creates
    should exist.

---

## Part 3. Deploy the site

1. Go to **vercel.com**, click **Sign Up**, then **Continue with GitHub**, and
   allow the access it asks for.
2. On the dashboard click **Add New**, then **Project**.
3. Find `ghs-mbonjo-limbe` and click **Import**.
4. Vercel will recognise Next.js by itself. Leave the build command and the
   output directory alone.
5. Before clicking Deploy, open **Environment Variables** and add the three
   below. Part 4 explains where the values come from. Deploying without them
   will fail, which is expected and harmless.
6. Click **Deploy** and wait about two minutes.

---

## Part 4. Join the two together

### The values

1. In Supabase open **Settings**, then **API**. Three things are shown: the
   Project URL, the `anon public` key, and the `service_role` key.

### Where they go

2. In Vercel open the project, then **Settings**, then **Environment Variables**,
   and add these:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | the Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the `anon public` key |
   | `SUPABASE_SERVICE_ROLE_KEY` | the `service_role` key |
   | `WAKE_SECRET` | a long random string you invent |

   **Anything named `NEXT_PUBLIC_` is sent to the browser.** The service role key
   must never carry that prefix. It opens the whole database.

3. Open **Deployments**, find the newest, click the three dots and choose
   **Redeploy**. Environment variables are read at build time, so a deployment
   made before you added them will not see them.

4. Open the address Vercel gives you. The home page should show the school name
   and the campus photograph.

---

## Part 5. Create the Principal's account

Nobody can sign in yet, because no account exists.

1. In Supabase open **Authentication**, then **Users**, then **Add user**, then
   **Create new user**.
2. Enter the Principal's email and a password. Tick **Auto Confirm User**.
3. Click **Create user**, then copy the **UID** shown in the list.
4. Open **SQL Editor**, click **New query**, and run this, replacing the UID with
   the one you copied:

   ```sql
   insert into profiles (id, staff_id, account_role)
   select 'PASTE-THE-UID-HERE', s.id, 'principal'
   from staff s where s.display_name = 'David Moki Ndive';
   ```

5. Go back to the site, click **Staff portal**, and sign in with that email and
   password. You should reach the dashboard.

Every other account is made the same way. Change `'principal'` to
`'vice_principal'`, `'secretary'`, `'hod'`, `'teacher'` and so on, and change
the name in the last line. For a pupil or parent account, use `student_id`
instead of `staff_id` and select from `students`.

---

## Part 6. Keep the project awake

A Supabase project on the free plan is suspended after seven days without
database activity. Two triggers on different days cost nothing and prevent it.

### The first, in GitHub

1. In the repository open **Settings**, then **Secrets and variables**, then
   **Actions**.
2. Click **New repository secret** twice and add:
   - `WAKE_URL`, set to `https://your-site.vercel.app/api/health`
   - `WAKE_SECRET`, the same long string you put into Vercel
3. Open the **Actions** tab. If it asks, enable workflows.
4. Choose **Wake** in the left column, then **Run workflow**, and run it once by
   hand. It should turn green. Do this before relying on it.

The workflow runs every six days, leaving a margin of one day, because scheduled
workflows on GitHub are not guaranteed to run on time. It also commits a
timestamp once a month, because scheduled workflows are disabled after sixty
days without activity in the repository.

### The second, on a different day

5. Go to **uptimerobot.com** and create a free account.
6. Click **New monitor**. Type **HTTP(s)**. URL, your health address. Interval,
   every twelve hours.
7. Under **Advanced**, add the header `x-wake-secret` with your secret, or the
   route will answer 401 and the monitor will alarm.
8. Enter an email for alerts, so that a failure is noticed rather than
   discovered when the site has already gone quiet.

The health route performs a real database read and touches storage. A ping that
reaches only the web server does not count as database activity, and that is the
common and expensive mistake.

---

## Part 7. Backup

1. In Supabase open **Database**, then **Backups**. The free plan keeps daily
   backups for seven days.
2. Once a week, download one and put it somewhere off the platform. A school
   Google Drive is enough.

A staff register that exists in one place only is a register waiting to be lost.

---

## Part 8. A domain of the school's own

Worth doing once the address is going onto letters and the school gate.

1. Buy the domain from any registrar.
2. In Vercel open the project, then **Settings**, then **Domains**.
3. Type the domain and click **Add**. Vercel shows an `A` record and a `CNAME`.
4. At the registrar find **DNS** or **Manage DNS** and enter the two records
   exactly as shown.
5. Wait. It is often minutes and can be a day. Vercel fits the certificate
   itself, so the address will be `https` with no further work.

---

## Part 9. The drafting layer

Optional, and the system works without it. If no provider is configured the
editor simply opens empty, which is the intended behaviour in Part 8.

1. Obtain a key from any service offering an OpenAI-compatible interface, or
   from Google for Gemini.
2. In Vercel add `AI_PROVIDER_1_NAME`, `AI_PROVIDER_1_BASE_URL`,
   `AI_PROVIDER_1_MODEL`, `AI_PROVIDER_1_KEY` and `AI_PROVIDER_1_ADAPTER`.
   The adapter is `openai_compatible` or `gemini`.
3. Add a second provider as `AI_PROVIDER_2_...`. They are tried in order, and a
   provider that fails three times running is set aside for fifteen minutes.
4. Redeploy.

Keys are used only in server routes and are never sent to the browser.

---

## Part 10. Before you tell anyone the address

- Sign in as the Principal and assign the ten Heads of Department. Until that is
  done their attestations print "HEAD OF DEPARTMENT" with no department after it.
- Print one attestation on the school's own printer and hold it against a
  stamped one. Check the margins, the matricule and the reference number before
  anything goes to the Divisional Delegation.
- Open the site on a telephone over mobile data, not on the school wifi.
- Settle the home page picture first. Once a link has been shared on WhatsApp
  the preview is held for a long time, and changing it will not change what has
  already been seen.

---

## If something goes wrong

**The deployment fails on Vercel.** Open the deployment and read the log from the
top. The first red line is the real error and everything after it is noise. A
missing environment variable and a version that has moved on are the two usual
causes. See the last section of `NOTES.md`.

**The site loads but every page says the register could not be read.** The
environment variables were added after the deployment. Redeploy.

**Sign in works but the portal is empty.** The `profiles` row was not created, or
the UID was pasted wrong. Run the query in Part 5 again and check the row exists.

**A policy error, or no rows where there should be rows.** Row level security is
working and the person's role does not reach that table. Check their
`account_role` in `profiles` against `supabase/02-policies.sql`.

**The site is slow to answer first thing in the morning.** The project went to
sleep. Check the Actions tab for a failed wake run.
