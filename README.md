# Verdant Archive

A Vercel-ready Next.js digital archive starter for Books, Photos and Videos. Built with Next.js 14, TypeScript, Tailwind CSS and Supabase.

## Features
- User sign-up, sign-in and sign-out
- Public Books, Photos and Videos collections
- Authenticated uploads into separate Supabase Storage buckets
- Admin-only dashboard with collection counts and brand settings
- Olive, moss, jade and celadon visual direction
- Dedicated Reading Room, nature-inspired Photos and cinema-style Videos pages
- Responsive desktop/mobile layout
- Vercel deployment configuration

## Requirements
- Node.js 18.17 or newer (Node 20 LTS recommended)
- npm
- Supabase project
- Vercel account for deployment

## 1. Install
```bash
npm install
```

## 2. Configure Supabase
1. Create a Supabase project.
2. Open Project Settings > API.
3. Copy Project URL and the publishable/anon key.
4. Copy `.env.example` to `.env.local` and fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
Never put a `service_role` key in a `NEXT_PUBLIC_` variable or commit it to Git.

## 3. Create database and buckets
1. In Supabase, open SQL Editor.
2. Run the full `supabase/schema.sql` file once.
3. In Authentication > URL Configuration, set Site URL to your local URL while developing.
4. For the easiest demo sign-up, you can turn email confirmation off in Authentication > Providers > Email. For production, configure SMTP and keep confirmation enabled.
5. Register your own user through `/signup`.
6. Promote that account to admin by running the final SQL statement in `schema.sql`, replacing `YOUR_EMAIL`.
7. Check Storage: `books`, `photos`, and `videos` buckets should exist.

## 4. Run locally
```bash
npm run dev
```
Open http://localhost:3000.

## 5. Deploy to Vercel
1. Push this folder to a GitHub repository.
2. In Vercel, choose Add New > Project and import that repository.
3. Framework should be detected as Next.js.
4. Add the same three environment variables from `.env.local` under Project Settings > Environment Variables (Production, Preview and Development as required).
5. Deploy.
6. In Supabase Authentication > URL Configuration, update Site URL to your Vercel production URL, e.g. `https://your-project.vercel.app`.
7. Add the Vercel URL and any preview URLs to Supabase Redirect URLs if you later enable email confirmation or OAuth.
8. Test sign-up, sign-in, upload and admin access on the deployed site.

## Admin access
Only profiles with `role = 'admin'` can open `/admin` or change website settings. The first user is not automatically an admin. Promote your account using the SQL statement described above. Do not expose the Supabase service-role key.

## Important production notes
- This is a clean starter project, not a hosted website. You must connect your own Supabase project and deploy it.
- Upload limits are set to 50 MB for books, 10 MB for photos and 500 MB for videos in the starter SQL. Adjust limits and allowed MIME types based on your needs and Supabase plan.
- Public buckets mean uploaded files can be viewed by anyone who has the file URL. For private collections, change bucket privacy and implement signed URLs consistently.
- The appearance settings form saves the website name, logo initials or a public logo image URL, and Jade/Olive colours. The shared header reads the saved brand settings.
- The admin dashboard currently provides overview counts and basic brand controls. User moderation, edit/delete manager, direct logo file upload, one-click named theme presets, user moderation, content edit/delete manager and audit logs are planned extensions.
- Test policies and backups before using real client data.
