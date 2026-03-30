import { ShieldCheck } from "lucide-react";

export default function InfoCard() {
  return (
    <div className="my-6 flex items-start gap-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
        <ShieldCheck size={16} />
      </div>
      <div>
        <p className="text-sm font-medium leading-snug text-[hsl(var(--foreground))]">
          Connect multiple accounts to schedule posts across all platforms at once.
        </p>
        <p className="mt-0.5 text-xs text-[hsl(var(--foreground-muted))]">
          Your accounts are securely encrypted and stored at rest.
        </p>
      </div>
    </div>
  );
}
