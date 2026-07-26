import { PaywallGate } from "@/components/billing/PaywallGate";
import { ProgressView } from "@/components/progress/ProgressView";

export default function ProgressPage() {
  return (
    <PaywallGate>
      <ProgressView />
    </PaywallGate>
  );
}
