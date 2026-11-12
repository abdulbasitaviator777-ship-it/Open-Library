import Link from "next/link";
import { Leaf, BookOpen, Image as ImageIcon, Clapperboard, LayoutDashboard, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  let user = null; let role = "user";
  let brandName = "Verdant Archive"; let logoText = "VA"; let logoUrl = "";
  let accent = "#4f8975"; let olive = "#89945c";
  try {
    const supabase = await createClient();
    const [{ data: auth }, { data: settings }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()
    ]);
    user = auth.user;
    if (settings) {
      brandName = settings.site_name || brandName;
      logoText = settings.logo_text || logoText;
      logoUrl = settings.logo_url || "";
      accent = settings.accent_color || accent;
      olive = settings.olive_color || olive;
    }
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      role = profile?.role || "user";
    }
  } catch {}
  const words = brandName.split(" ");
  return <header className="site-header" style={{"--jade":accent,"--olive":olive} as React.CSSProperties}>
    <Link href="/" className="brand">
      <span className="brand-mark">{logoUrl ? <img src={logoUrl} alt="Site logo" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:12}}/> : logoText || <Leaf size={20}/>}</span>
      <span>{words.slice(0,-1).join(" ") || brandName} <span className="brand-light">{words.length>1?words[words.length-1]:""}</span></span>
    </Link>
    <nav className="main-nav">
      <Link href="/books"><BookOpen size={16}/> Books</Link>
      <Link href="/photos"><ImageIcon size={16}/> Photos</Link>
      <Link href="/videos"><Clapperboard size={16}/> Videos</Link>
    </nav>
    <div className="header-actions">
      {user ? <><Link className="nav-quiet" href="/upload">Upload</Link>{role === "admin" && <Link className="nav-quiet" href="/admin"><LayoutDashboard size={16}/> Admin</Link>}<form action="/auth/signout" method="post"><button className="button button-dark small">Sign out</button></form></> : <Link className="button button-dark small" href="/login"><LogIn size={15}/> Sign in</Link>}
    </div>
  </header>;
}
