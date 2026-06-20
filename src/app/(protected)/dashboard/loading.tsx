export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--allgrey-background-color)]">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--ui-border-color)] border-t-[var(--primary-color)]" />
    </div>
  );
}
