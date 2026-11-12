import Link from "next/link";
import { ArrowUpRight, BookOpen, Image as ImageIcon, Clapperboard, Sparkles } from "lucide-react";
export default function Home() {
  return <>
    <section className="hero">
      <div className="hero-orbit"/>
      <div className="eyebrow"><Sparkles size={13} style={{display:"inline",marginRight:7}}/> YOUR PERSONAL DIGITAL COLLECTION</div>
      <h1>Keep what<br />moves you <em>close.</em></h1>
      <p>A considered space for the books you return to, the moments you capture, and the films worth remembering. Welcome to your archive.</p>
      <div className="hero-actions"><Link href="/books" className="button button-dark">Explore the archive <ArrowUpRight size={16}/></Link><Link href="/signup" className="button button-outline">Create an account</Link></div>
    </section>
    <section className="section">
      <div className="section-head"><div><div className="eyebrow">THREE WAYS TO COLLECT</div><h2>Your world, in chapters.</h2><p>Distinct spaces, one beautifully connected archive.</p></div></div>
      <div className="feature-grid">
        <Link href="/books" className="feature-tile tile-books"><BookOpen/><div><h3>The Reading Room</h3><p>Build a library of ideas, references and stories.</p></div><ArrowUpRight className="tile-arrow"/></Link>
        <Link href="/photos" className="feature-tile tile-photos"><ImageIcon/><div><h3>Nature & Moments</h3><p>Give your photographs room to breathe.</p></div><ArrowUpRight className="tile-arrow"/></Link>
        <Link href="/videos" className="feature-tile tile-videos"><Clapperboard/><div><h3>The Cinema</h3><p>A cinematic shelf for the moving image.</p></div><ArrowUpRight className="tile-arrow"/></Link>
      </div>
    </section>
  </>;
}
