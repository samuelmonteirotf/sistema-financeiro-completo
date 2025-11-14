type FaqItem = {
  question: string
  answer: string
}

type FaqSectionProps = {
  items: FaqItem[]
}

export function FaqSection({ items }: FaqSectionProps) {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-4xl space-y-8 px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.55em] text-muted-foreground">FAQ</p>
            <h2 className="mt-3 text-4xl font-semibold text-foreground">Perguntas frequentes</h2>
            <p className="mt-4 text-base text-muted-foreground">
              Transparência total sobre billing, limites e segurança de dados.
            </p>
          </div>
        <div className="space-y-4">
          {items.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-[28px] border border-border/70 bg-card/60 p-6 transition hover:border-primary/50"
            >
              <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-foreground">
                <span>{faq.question}</span>
                <span className="text-muted-foreground transition group-open:rotate-90">+</span>
              </summary>
              <p className="mt-4 text-base text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
