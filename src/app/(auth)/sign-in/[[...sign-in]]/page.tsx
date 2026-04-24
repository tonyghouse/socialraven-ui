import { SignIn } from "@clerk/nextjs";

import { authClerkAppearance } from "@/components/generic/auth-clerk-appearance";

export default function SignInPage() {
  return <SignIn afterSignInUrl="/dashboard" appearance={authClerkAppearance} />;
}
