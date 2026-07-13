import Link from "next/link";
import { MontenegroLogo } from "@/components/brand/MontenegroLogo";

export default function Home() {
  return (
    <main
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 100% at 50% -10%, var(--mn-light) 0%, var(--mn-base) 45%, var(--mn-deep) 100%)",
      }}
    >
      {/* Subtle texture / vignette */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--mn-cream) 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-7 sm:px-14">
        <MontenegroLogo />
        <a
          href="mailto:sac@montenegrourbanismo.com.br"
          className="hidden text-sm tracking-wide text-mn-cream opacity-75 transition hover:opacity-100 sm:block"
        >
          sac@montenegrourbanismo.com.br
        </a>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 flex flex-col items-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.5em] text-mn-gold">
            Empreendimento
          </p>
          <h1 className="font-serif-display text-6xl font-semibold leading-none tracking-wide text-mn-cream sm:text-7xl">
            Vila dos Pássaros
          </h1>
          <p className="mt-5 max-w-xl text-balance text-base leading-relaxed text-mn-cream opacity-90">
            Painel de performance da campanha de mídia — Meta Ads e Google Ads.
            Acompanhe investimento, alcance, vídeo e engajamento em tempo real.
          </p>
        </div>

        <Link
          href="/vila-dos-passaros"
          className="group inline-flex items-center gap-3 rounded-full bg-mn-gold px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-mn-deep shadow-lg shadow-black/20 transition hover:brightness-110"
        >
          Acessar Dashboard
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="transition-transform group-hover:translate-x-1"
          >
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-6 text-center text-xs tracking-wide text-mn-cream opacity-50 sm:px-14">
        Montenegro Urbanismo · Vila dos Pássaros — Dashboard de mídia
      </footer>
    </main>
  );
}
