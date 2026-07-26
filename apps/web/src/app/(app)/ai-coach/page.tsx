import { PaywallGate } from "@/components/billing/PaywallGate";
import { AICoachChat } from "@/components/ai-coach/AICoachChat";

export default function AiCoachPage() {
  return (
    <PaywallGate>
      <AICoachChat />
    </PaywallGate>
  );
}
