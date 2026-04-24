import { SignUp } from "@clerk/nextjs";

import { authClerkAppearance } from "@/components/generic/auth-clerk-appearance";

export default function SignUpPage() {
  return <SignUp appearance={authClerkAppearance} />;
}
