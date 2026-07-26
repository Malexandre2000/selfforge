import { PaywallGate } from "@/components/billing/PaywallGate";
import { MissionsList } from "@/components/missions/MissionsList";

export default function MissionsPage() {
  return (
    <PaywallGate allowPreview>
      <MissionsList />
    </PaywallGate>
  );
}
