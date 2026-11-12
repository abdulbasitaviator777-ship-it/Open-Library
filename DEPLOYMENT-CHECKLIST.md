# Client preview checklist

- [ ] `npm install` completes
- [ ] `.env.local` contains Supabase URL and publishable/anon key
- [ ] `supabase/schema.sql` executed successfully
- [ ] `books`, `photos`, `videos` buckets visible
- [ ] First user registered and promoted to `admin`
- [ ] `/login`, `/signup`, `/upload` tested
- [ ] Books, Photos and Videos each tested with a sample file
- [ ] Admin settings save successfully
- [ ] Vercel environment variables added
- [ ] Supabase Site URL changed to deployed Vercel URL
- [ ] Production deployment tested in a private/incognito browser

Do not share your Supabase service-role key with a client or place it in frontend environment variables.
