import Image from "next/image"

type ShowcasePanelsProps = {
  panels: Array<{
    title: string
    description: string
    media: {
      src: string
      alt: string
    }
  }>
}

export function ShowcasePanels({ panels }: ShowcasePanelsProps) {
  return (
    <section className="bg-gradient-to-b from-background via-background to-muted/40 py-24">
      <div className="mx-auto max-w-6xl space-y-12 px-6">
        {panels.map((panel, index) => (
          <article
            key={panel.title}
            className="overflow-hidden rounded-[32px] border border-border bg-card/60 shadow-[0px_40px_70px_rgba(15,23,42,0.25)] backdrop-blur"
          >
            <div
              className={`flex flex-col gap-10 p-8 lg:flex-row ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              } lg:items-center`}
            >
              <div className="space-y-4 lg:w-1/2">
                <p className="text-sm uppercase tracking-[0.5em] text-muted-foreground/80">Experience</p>
                <h2 className="text-3xl font-semibold text-foreground">{panel.title}</h2>
                <p className="text-base text-muted-foreground">{panel.description}</p>
              </div>
              <div className="relative overflow-hidden rounded-[24px] border border-border/60 bg-black/80 lg:w-1/2">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-cyan-400/10" />
                <Image
                  src={panel.media.src}
                  alt={panel.media.alt}
                  width={1200}
                  height={800}
                  className="relative h-full w-full object-cover"
                  priority={index === 0}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
