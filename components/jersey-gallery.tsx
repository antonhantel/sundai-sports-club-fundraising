import Image from "next/image"

export function JerseyGallery() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Your brand, on the jersey
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          AI-generated jersey mockups help sponsors visualize the partnership.
        </p>
        <div className="mt-14 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <Image
            src="/jersey-mockups-section.png"
            alt="Jersey mockups: Riverside Thunder with Joe's Pizza, Valley Hawks with Peak Fitness, Sunset Strikers with City Dental, Metro United with Quick Loans"
            width={1200}
            height={600}
            className="w-full object-contain"
            priority={false}
          />
        </div>
      </div>
    </section>
  )
}
