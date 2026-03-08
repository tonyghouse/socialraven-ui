import { ShieldCheck } from "lucide-react";

export default function InfoCard() {
  return (
    <div className="flex items-start gap-3 my-6 px-5 py-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-foreground/8 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <ShieldCheck className="w-4 h-4 text-accent" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground leading-snug">
          Connect multiple accounts to schedule posts across all platforms at once.
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your accounts are securely encrypted and stored at rest.
        </p>
      </div>
    </div>
  );
}
