type ExperienceFlowProps = {
  steps: Array<{
    title: string
    description: string
    footnote?: string
  }>
}

export function ExperienceFlow({ steps }: ExperienceFlowProps) {
  return (
    <section className="border-y border-border bg-background py-24">
      <div className="mx-auto max-w-5xl space-y-10 px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.6em] text-muted-foreground">Jornada contínua</p>
          <h2 className="mt-3 text-4xl font-semibold text-foreground">Fluxo inspirado na Apple, do toque ao checkout</h2>
          <p className="mt-4 text-base text-muted-foreground">
            Tudo responde com fluidez: cards magnéticos, degradês suaves e foco total na conversão.
          </p>
        </div>
        <div className="space-y-4 rounded-[32px] border border-border/70 bg-card/70 p-8">
          {steps.map((step, idx) => (
            <div key={step.title} className="flex flex-col gap-4 border-b border-border/50 py-6 last:border-none">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {idx + 1}
                  </span>
                  <h3 className="text-xl font-medium text-foreground">{step.title}</h3>
                </div>
                {step.footnote ? <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{step.footnote}</p> : null}
              </div>
              <p className="text-base text-muted-foreground md:pl-14">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
