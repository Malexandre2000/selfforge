import {
  Dumbbell,
  Utensils,
  Sparkles,
  Scissors,
  Shirt,
  Brush,
  Smile,
  ListChecks,
  Moon,
  Flame,
  Target,
  type LucideIcon,
} from "lucide-react";

const pillars: { icon: LucideIcon; label: string; blurb: string }[] = [
  { icon: Dumbbell, label: "Fitness", blurb: "Training built around your goal and experience." },
  { icon: Utensils, label: "Nutrition", blurb: "Meals that fit your budget, not a generic macro sheet." },
  { icon: Sparkles, label: "Skincare", blurb: "A routine matched to your actual skin concerns." },
  { icon: Scissors, label: "Haircare", blurb: "Guidance for your hair type and goals." },
  { icon: Shirt, label: "Style", blurb: "Dress for the body and life you actually have." },
  { icon: Brush, label: "Grooming", blurb: "The small habits that compound into presence." },
  { icon: Smile, label: "Confidence", blurb: "Daily challenges that build real self-assurance." },
  { icon: ListChecks, label: "Habits", blurb: "Systems that stick, tracked without the guilt." },
  { icon: Moon, label: "Sleep", blurb: "Recovery treated as part of the plan, not an afterthought." },
  { icon: Flame, label: "Motivation", blurb: "A coach that meets you where you are today." },
  { icon: Target, label: "Discipline", blurb: "Structure that makes showing up the default." },
];

export function Pillars() {
  return (
    <section id="pillars" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
            Every dimension of self-care. One coach.
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            Most apps give you a workout plan, or a meal plan, or a skincare routine.
            SelfForge builds all of it as one connected roadmap — and adjusts it as you change.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-ink-200 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ icon: Icon, label, blurb }) => (
            <div
              key={label}
              className="group flex flex-col gap-4 bg-white p-8 transition-colors hover:bg-ink-50"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink-950 text-white transition-transform group-hover:scale-105">
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-display text-lg text-ink-950">{label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
