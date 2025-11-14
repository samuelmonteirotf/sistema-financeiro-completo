import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type HeroSectionProps = {
  highlights: Array<{ label: string; value: string }>
}

export function HeroSection({ highlights }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(80,139,255,0.22),transparent_65%)]" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(circle,_rgba(14,165,233,0.15),transparent_55%)] blur-3xl opacity-80" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-600/40 to-cyan-400/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-between px-6 py-20 lg:px-12">
        <div className="space-y-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/70">
            Controle financeiro profissional
          </p>

          <div className="space-y-6 font-semibold">
            <h1 className="text-4xl leading-tight text-white sm:text-5xl lg:text-[64px] lg:leading-[1.05]">
              Organize suas finanças com{" "}
              <span className="text-transparent bg-gradient-to-br from-sky-300 via-white to-indigo-200 bg-clip-text">
                precisão, beleza e autonomia
              </span>
              .
            </h1>
            <p className="max-w-3xl text-base font-normal text-white/70 sm:text-xl">
              Tudo que você precisa para dominar seus gastos, planejar investimentos e visualizar o futuro financeiro
              com clareza. Sem burocracia. Sem dependências externas.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="gap-2" asChild aria-label="Começar agora com plano Pro">
              <Link href="/pricing">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white backdrop-blur" asChild>
              <Link href="/dashboard">Ver o sistema em ação</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-6 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl sm:grid-cols-3">
          {highlights.map((highlight) => (
            <div key={highlight.label} className="space-y-1">
              <p className="text-sm uppercase tracking-[0.35em] text-white/60">{highlight.label}</p>
              <p className="text-2xl font-semibold text-white">{highlight.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
