// app/privacy-policy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Social Raven",
  description:
    "Privacy Policy for Social Raven – how we collect, use, store, and protect your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-10">
        {/* Header */}
        <header className="space-y-3 border-b border-slate-100 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <span>✅</span>
            <span>SOCIAL RAVEN – PRIVACY POLICY</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Privacy Policy
          </h1>

          <p className="text-sm text-slate-500">
            Production-ready, App Store/Play Store compliant
          </p>

          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Last Updated: <span className="text-slate-900">January 2025</span>
          </p>
        </header>

        {/* Intro */}
        <section className="space-y-3 text-sm leading-relaxed text-slate-700">
          <p>
            Welcome to <span className="font-semibold">Social Raven</span> (&quot;we&quot;,
            &quot;our&quot;, &quot;us&quot;). We are committed to protecting your privacy and
            ensuring you have a safe experience while using our platform.
          </p>
          <p>
            This Privacy Policy explains how Social Raven collects, uses, stores,
            and protects your information when you sign up, connect social media
            accounts, publish content, or interact with our website and services.
          </p>
          <p>
            By using Social Raven, you agree to the practices described in this
            policy.
          </p>
        </section>

        {/* 1. Information We Collect */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            1. Information We Collect
          </h2>
          <p className="text-sm text-slate-700">
            We only collect information required to provide secure social media
            automation and analytics. We do not store your passwords, personal
            profile data (unless necessary for posting), or any data unrelated to
            our service.
          </p>

          <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
            <h3 className="font-semibold text-slate-900">1.1 Account Information</h3>
            <ul className="ml-5 list-disc space-y-1">
              <li>Name</li>
              <li>Email</li>
              <li>Authentication identifiers (e.g., Clerk, OAuth identities)</li>
            </ul>
          </div>

          <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
            <h3 className="font-semibold text-slate-900">1.2 OAuth Tokens</h3>
            <p>
              When you connect a social media account (Instagram, YouTube, LinkedIn,
              Twitter/X), we store:
            </p>
            <ul className="ml-5 list-disc space-y-1">
              <li>Access tokens</li>
              <li>Refresh tokens (if applicable)</li>
              <li>Platform user IDs</li>
            </ul>
            <p className="pt-2">
              These tokens only allow Social Raven to:
            </p>
            <ul className="ml-5 list-disc space-y-1">
              <li>Publish posts on your behalf</li>
              <li>Retrieve analytics</li>
              <li>Manage scheduled posts</li>
            </ul>
            <p className="pt-2">
              We never access private messages, login credentials, or personal data
              outside granted scopes.
            </p>
          </div>

          <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
            <h3 className="font-semibold text-slate-900">1.3 Usage Data</h3>
            <ul className="ml-5 list-disc space-y-1">
              <li>Log data (device type, browser)</li>
              <li>Page interactions and feature usage</li>
              <li>Scheduling and posting activity</li>
            </ul>
          </div>
        </section>

        {/* 2. How We Use Your Information */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            2. How We Use Your Information
          </h2>
          <p className="text-sm text-slate-700">
            Social Raven uses your information solely to deliver platform
            functionality:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-sm text-slate-800">
            <li>✔ Scheduling posts</li>
            <li>✔ Auto-publishing content</li>
            <li>✔ Storing drafts</li>
            <li>✔ Fetching analytics</li>
            <li>✔ Managing connected accounts</li>
            <li>✔ Improving system reliability</li>
          </ul>
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm">
            <p className="font-semibold text-rose-800">We do not:</p>
            <ul className="ml-5 mt-1 list-disc space-y-1 text-rose-900">
              <li>Sell your data</li>
              <li>Share your data with advertisers</li>
              <li>Monetize your content or profile</li>
            </ul>
          </div>
          <p className="text-sm text-slate-700">
            Your data is used strictly for platform operations.
          </p>
        </section>

        {/* 3. Storage & Protection */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            3. How We Store &amp; Protect Your Data
          </h2>
          <p className="text-sm text-slate-700">
            We use industry-standard security practices:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-sm text-slate-800">
            <li>Encrypted OAuth tokens</li>
            <li>Encrypted database storage</li>
            <li>HTTPS everywhere</li>
            <li>Secure API communication</li>
            <li>Regular security reviews</li>
          </ul>
          <p className="text-sm text-slate-700">
            We never store plaintext passwords or sensitive platform authentication
            details.
          </p>
        </section>

        {/* 4. Third-Party Services */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            4. Third-Party Services We Use
          </h2>
          <p className="text-sm text-slate-700">
            Social Raven integrates with social media platforms via official APIs,
            including:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-sm text-slate-800">
            <li>Meta Platforms (Instagram, Facebook)</li>
            <li>Google (YouTube)</li>
            <li>LinkedIn</li>
            <li>X (Twitter)</li>
            <li>Clerk (authentication)</li>
          </ul>
          <p className="text-sm text-slate-700">
            Each integration follows the platform&apos;s terms and permissions. You may
            revoke access at any time through the respective platform&apos;s
            security settings.
          </p>
        </section>

        {/* 5. Data Retention */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">5. Data Retention</h2>
          <p className="text-sm text-slate-700">
            We retain your data only as long as:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-sm text-slate-800">
            <li>Your Social Raven account is active, or</li>
            <li>You maintain connected social media accounts</li>
          </ul>
          <p className="text-sm text-slate-700">
            When you disconnect an account, we permanently delete its tokens.
          </p>
          <p className="text-sm text-slate-700">
            When you delete your Social Raven account, all data is erased within{" "}
            <span className="font-semibold">48 hours</span>.
          </p>
        </section>

        {/* 6. Your Rights */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">6. Your Rights</h2>
          <p className="text-sm text-slate-700">
            You have the right to:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-sm text-slate-800">
            <li>Access your stored data</li>
            <li>Update account information</li>
            <li>Disconnect connected accounts</li>
            <li>Request complete data deletion</li>
            <li>Revoke platform access (LinkedIn, YouTube, Instagram, Twitter)</li>
          </ul>
          <p className="text-sm text-slate-700">
            Contact us anytime to request deletion.
          </p>
        </section>

        {/* 7. Data Deletion Request */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            7. Data Deletion Request
          </h2>
          <p className="text-sm text-slate-700">
            To delete your data, email:
          </p>
          <p className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">
            <span>📧</span>
            <span>support@socialraven.tonyghouse.com</span>
          </p>
          <p className="text-sm text-slate-700">
            We will remove:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-sm text-slate-800">
            <li>Your account</li>
            <li>All OAuth tokens</li>
            <li>All scheduled posts</li>
            <li>All analytics</li>
            <li>All logs linked to your identity</li>
          </ul>
          <p className="text-sm text-slate-700">
            within <span className="font-semibold">48 hours</span>.
          </p>
        </section>

        {/* 8. Children’s Privacy */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            8. Children&apos;s Privacy
          </h2>
          <p className="text-sm text-slate-700">
            Social Raven is not intended for individuals under 13. We do not
            knowingly collect data from children.
          </p>
        </section>

        {/* 9. Updates */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            9. Updates to This Privacy Policy
          </h2>
          <p className="text-sm text-slate-700">
            We may update this policy to reflect service improvements or legal
            requirements. If changes are significant, we will notify you via email
            or platform notification.
          </p>
        </section>

        {/* 10. Contact */}
        <section className="space-y-4 border-t border-slate-100 pt-6">
          <h2 className="text-lg font-semibold text-slate-900">10. Contact Us</h2>
          <p className="text-sm text-slate-700">
            If you have questions about this Privacy Policy or how we handle your
            data, reach out anytime:
          </p>
          <p className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">
            <span>📧</span>
            <span>support@socialraven.tonyghouse.com</span>
          </p>
        </section>
      </div>
    </main>
  );
}
