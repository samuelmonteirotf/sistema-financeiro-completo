import { type LucideIcon } from "lucide-react"

type Feature = {
  icon: LucideIcon
  title: string
  description: string
}

type FeatureGalleryProps = {
  features: Feature[]
}

export function FeatureGallery({ features }: FeatureGalleryProps) {
  return (
    <section className="bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl space-y-10 px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-muted-foreground">Profundidade</p>
          <h2 className="mt-3 text-4xl font-semibold text-foreground">Design modular pronto para planos pagos</h2>
          <p className="mt-4 text-base text-muted-foreground">
            Componentes reenquadrados com respiro, micro sombras e estados responsivos dignos dos produtos Apple.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-[28px] border border-border bg-card/70 p-8 shadow-[0_20px_35px_rgba(15,23,42,0.15)] transition hover:-translate-y-1 hover:border-primary"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
              </div>
              <p className="mt-4 text-base text-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
