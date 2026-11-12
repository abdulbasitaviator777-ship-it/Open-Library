import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
export default function Login(){return <main className="auth-wrap"><section className="auth-card"><div className="eyebrow">WELCOME BACK</div><h1>Sign in.</h1><p>Return to your personal archive.</p><AuthForm mode="login"/><div className="auth-switch">New here? <Link href="/signup">Create an account</Link></div></section></main>}
