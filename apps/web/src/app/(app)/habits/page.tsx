import { PaywallGate } from "@/components/billing/PaywallGate";
import { HabitsList } from "@/components/habits/HabitsList";

export default function HabitsPage() {
  return (
    <PaywallGate>
      <HabitsList />
    </PaywallGate>
  );
}
