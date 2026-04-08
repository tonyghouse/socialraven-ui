import { SignIn } from "@clerk/nextjs";

import { authClerkAppearance } from "@/components/generic/auth-clerk-appearance";
import { AuthPageShell } from "@/components/generic/auth-page-shell";

export default function SignInPage() {
  return (
    <AuthPageShell
      badge="Sign in"
      title="Sign in to Social Raven"
      description="Access your workspace, connected accounts, approval flows, and publishing history from one place."
      helperTitle="Returning users"
      helperDescription="Use this page to sign in to an existing Social Raven account. If you need a new account, use the sign-up page to create a trial workspace."
      alternatePrompt="Need a new account?"
      alternateLabel="Create one here"
      alternateHref="/sign-up"
    >
      <SignIn afterSignInUrl="/dashboard" appearance={authClerkAppearance} />
    </AuthPageShell>
  );
}
