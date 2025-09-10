import { Badge } from "./badge";

export function ProviderBadge({ label, className }: { label: string; className?: string }) {
  return <Badge className={className}>{label}</Badge>;
}
