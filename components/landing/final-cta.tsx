import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCTA() {
  return (
    <section className="border-t border-border bg-gradient-to-b from-background to-black py-24 text-white">
      <div className="mx-auto max-w-4xl space-y-8 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.55em] text-white/60">Pronto para mudar sua relação com o dinheiro?</p>
        <h2 className="text-4xl font-semibold">A jornada rumo ao controle financeiro começa aqui</h2>
        <p className="text-white/70">
          Comece gratuitamente e descubra o poder de um sistema feito para quem valoriza organização e eficiência. 
          Evolua quando quiser e tenha total domínio das suas finanças.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/pricing">
              Ver planos e começar agora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button variant="outline" size="lg" className="border-white/30 text-white" asChild>
            <a href="mailto:contato@controlefinanceiro.com">Falar com o time</a>
          </Button>
        </div>

        <p className="text-xs text-white/50">
          Planos a partir de R$39,90/mês. Cancelamento instantâneo. Seus dados, sua liberdade.
        </p>
      </div>
    </section>
  )
}
