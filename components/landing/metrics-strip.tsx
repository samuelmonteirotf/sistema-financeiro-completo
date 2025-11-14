type MetricsStripProps = {
  items: Array<{ title: string; description: string }>
}

export function MetricsStrip({ items }: MetricsStripProps) {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-border/60 bg-muted/30 p-6 shadow-[0px_30px_60px_rgba(15,23,42,0.15)] transition hover:-translate-y-1"
            >
              <p className="text-2xl font-semibold text-foreground">{item.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
