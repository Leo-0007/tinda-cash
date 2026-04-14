import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#09090B] text-zinc-100">
      <header className="border-b border-white/[0.06] bg-black/40 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.04]"
          >
            <ArrowLeft size={16} />
          </Link>
          <span className="text-sm font-semibold text-white">Tinda Cash</span>
          <span className="text-xs text-white/30">· Documents légaux</span>
        </div>
      </header>
      <article className="legal-article max-w-3xl mx-auto px-5 py-10 text-white/80 leading-relaxed">
        {children}
      </article>
      <footer className="border-t border-white/[0.06] mt-16">
        <div className="max-w-3xl mx-auto px-5 py-6 flex flex-wrap gap-4 text-xs text-white/40">
          <Link href="/terms" className="hover:text-white">Conditions générales</Link>
          <Link href="/privacy" className="hover:text-white">Confidentialité</Link>
          <Link href="/aml" className="hover:text-white">Politique AML</Link>
          <Link href="/complaints" className="hover:text-white">Réclamations</Link>
          <Link href="/help" className="hover:text-white">Aide</Link>
        </div>
      </footer>
    </main>
  );
}
