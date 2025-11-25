import { SignIn } from "@clerk/nextjs";
import { AuthPatternBackground } from "@/components/generic/auth-pattern-background";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <AuthPatternBackground />
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-md px-4">
       
            <SignIn afterSignInUrl="/dashboard" />
          </div>
    </div>
  );
}
