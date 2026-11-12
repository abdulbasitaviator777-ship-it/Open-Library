import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
export default function Signup(){return <main className="auth-wrap"><section className="auth-card"><div className="eyebrow">START COLLECTING</div><h1>Create account.</h1><p>Your personal archive is just a few details away.</p><AuthForm mode="signup"/><div className="auth-switch">Already a member? <Link href="/login">Sign in</Link></div></section></main>}
