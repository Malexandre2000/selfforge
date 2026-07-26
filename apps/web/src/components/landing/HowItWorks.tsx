const steps = [
  {
    n: "01",
    title: "Tell us where you're starting",
    body: "A 3-minute intake — age, goals, current physique, skin and hair concerns, budget, confidence level, sleep, and gym experience.",
  },
  {
    n: "02",
    title: "Get your personal roadmap",
    body: "Your coach turns your answers into a complete, phased plan across every pillar — not a template, yours.",
  },
  {
    n: "03",
    title: "Follow today's plan",
    body: "Every day: a workout, a meal plan, a skincare step, a grooming task, a confidence challenge, a habit, and a reason to keep going.",
  },
  {
    n: "04",
    title: "Talk to a coach that remembers",
    body: "Ask questions, log how you're feeling, share a setback. Your coach carries context forward and adjusts the plan as you change.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-ink-50 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
            How SelfForge works
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((step) => (
            <div key={step.n} className="flex flex-col">
              <span className="font-display text-3xl text-ink-300">{step.n}</span>
              <h3 className="mt-4 text-lg font-semibold text-ink-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
