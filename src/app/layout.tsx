import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Verdant Archive — A home for your collection",
  description: "A calm, beautifully curated digital home for books, photographs and films."
};
export default async function RootLayout({children}:{children:React.ReactNode}) {
  let theme: React.CSSProperties = {};
  try {
    const supabase = await createClient();
    const {data} = await supabase.from("site_settings").select("accent_color,olive_color").eq("id",1).maybeSingle();
    if (data) theme = {"--jade":data.accent_color||"#4f8975","--olive":data.olive_color||"#89945c"} as React.CSSProperties;
  } catch {}
  return <html lang="en"><body style={theme}><SiteHeader/>{children}<SiteFooter/></body></html>;
}
