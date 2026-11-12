import { UploadForm } from "@/components/upload-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function UploadPage(){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");return <main className="upload-layout"><div className="upload-intro"><div className="eyebrow">ADD TO YOUR COLLECTION</div><h1>Make room for something new.</h1><p>Choose a collection, add a title and place your file into the archive. Your upload will appear in its matching section.</p><div className="notice">Supported uploads depend on your Supabase Storage bucket limits. Set suitable file size limits in your Supabase dashboard.</div></div><UploadForm/></main>}
