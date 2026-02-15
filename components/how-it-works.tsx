import { Search, FileText, Send } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Find Sponsors",
    description:
      "We scan local businesses near your team and rank them by fit. Dentists, gyms, restaurants, and more.",
  },
  {
    icon: FileText,
    title: "Generate Proposals",
    description:
      "AI drafts personalized emails and sponsorship proposals with your team's branding and details.",
  },
  {
    icon: Send,
    title: "Send Outreach",
    description:
      "Create Gmail drafts with proposals attached. Review, tweak, and send right from your inbox.",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-secondary px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          How it works
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Three steps to go from zero sponsors to funded season.
        </p>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center rounded-xl bg-card p-8 text-center shadow-sm"
            >
              <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </div>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">
                {step.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
