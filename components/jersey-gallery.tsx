import { Shirt } from "lucide-react"

const jerseys = [
  { team: "Riverside Thunder", primary: "#0d9488", secondary: "#f59e0b", sponsor: "Joe's Pizza" },
  { team: "Valley Hawks", primary: "#2563eb", secondary: "#ffffff", sponsor: "Peak Fitness" },
  { team: "Sunset Strikers", primary: "#dc2626", secondary: "#1e1e1e", sponsor: "City Dental" },
  { team: "Metro United", primary: "#7c3aed", secondary: "#fbbf24", sponsor: "Quick Loans" },
]

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
        <div className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-4">
          {jerseys.map((jersey) => (
            <div
              key={jersey.team}
              className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div
                className="flex h-28 w-24 items-center justify-center rounded-lg"
                style={{ backgroundColor: jersey.primary }}
              >
                <Shirt className="h-16 w-16" style={{ color: jersey.secondary }} />
              </div>
              <p className="mt-4 text-sm font-semibold text-card-foreground">
                {jersey.team}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {jersey.sponsor}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
