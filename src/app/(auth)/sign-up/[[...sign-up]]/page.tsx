import { SignUp } from "@clerk/nextjs";

import { authClerkAppearance } from "@/components/generic/auth-clerk-appearance";
import { AuthPageShell } from "@/components/generic/auth-page-shell";

export default function SignUpPage() {
  return (
    <AuthPageShell
      badge="Create account"
      title="Create your Social Raven account"
      description="Start a trial workspace, connect supported channels, and evaluate the planning, review, and publishing workflow."
      helperTitle="Account creation"
      helperDescription="Self-serve account creation is available on this page. New workspaces begin on a trial flow, and public pricing plus policy links remain available before you continue."
      alternatePrompt="Already have an account?"
      alternateLabel="Sign in instead"
      alternateHref="/sign-in"
    >
      <SignUp appearance={authClerkAppearance} />
    </AuthPageShell>
  );
}
