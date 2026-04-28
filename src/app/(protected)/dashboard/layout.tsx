export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-[var(--ds-background-200)] text-[var(--ds-gray-1000)] [&>main]:bg-[var(--ds-background-200)] [&>main]:text-[var(--ds-gray-1000)]">
      {children}
    </div>
  );
}
