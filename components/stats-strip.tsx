const stats = [
  { value: "200+", label: "Teams helped" },
  { value: "3,400", label: "Sponsors found" },
  { value: "$1.2M", label: "Raised so far" },
  { value: "12 min", label: "Avg. time to first draft" },
]

export function StatsStrip() {
  return (
    <section className="border-y border-border bg-secondary px-4 py-14">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center text-center">
            <span className="text-3xl font-bold text-primary md:text-4xl">
              {stat.value}
            </span>
            <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
