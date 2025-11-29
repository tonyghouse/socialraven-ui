"use client";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 md:px-10 py-14 flex justify-center">
      <div className="max-w-4xl w-full bg-white/60 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-[0_8px_35px_-10px_rgba(15,23,42,0.15)] p-8 md:p-12">
        
        {/* Title */}
        <h1 className="text-4xl font-semibold tracking-tight mb-4 text-foreground">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        {/* Section Wrapper */}
        <div className="space-y-10">

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
            <p className="text-foreground/70 leading-relaxed">
              Welcome to <strong>Social Raven</strong> (“the App”, “we”, “us”). 
              These Terms of Service govern your access to and use of Social Raven’s tools,
              features, and connected services. By using the App, you agree to these Terms.
            </p>
          </section>

          <div className="h-px bg-border/60" />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Eligibility</h2>
            <p className="text-foreground/70 leading-relaxed">
              You must be at least 16 years old and legally able to enter into these Terms.
              You must use the App in compliance with all laws and platform rules.
            </p>
          </section>

          <div className="h-px bg-border/60" />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Your Account</h2>
            <p className="text-foreground/70 leading-relaxed">
              You are responsible for maintaining the security of your account and all 
              activity that occurs under it. If you suspect unauthorized access, you must 
              notify us immediately.
            </p>
          </section>

          <div className="h-px bg-border/60" />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Prohibited Content</h2>
            <p className="text-foreground/70 leading-relaxed mb-3">
              You must NOT use Social Raven to create, upload, schedule, or publish:
            </p>
            <ul className="list-disc pl-6 text-foreground/70 space-y-2">
              <li>Illegal or copyrighted content</li>
              <li>Explicit sexual content or pornography</li>
              <li>Violence, hate speech, or harassment</li>
              <li>Deceptive, fraudulent, or harmful content</li>
              <li>Spam, bots, or platform manipulation</li>
              <li>Material violating Instagram, X/Twitter, LinkedIn, YouTube, or other platform policies</li>
            </ul>
            <p className="text-foreground/70 mt-3">
              We reserve the right to remove content or terminate accounts that violate these rules.
            </p>
          </section>

          <div className="h-px bg-border/60" />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Third-Party Platforms</h2>
            <p className="text-foreground/70 leading-relaxed">
              Social Raven integrates with social media services such as Instagram, X/Twitter, 
              LinkedIn, YouTube, and Facebook. You must comply with the Terms of each connected 
              platform. We are not responsible for outages, API changes, or restrictions from 
              these platforms.
            </p>
          </section>

          <div className="h-px bg-border/60" />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Privacy</h2>
            <p className="text-foreground/70 leading-relaxed">
              Your data is handled as described in our Privacy Policy. We do not sell your information.
            </p>
          </section>

          <div className="h-px bg-border/60" />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Intellectual Property</h2>
            <p className="text-foreground/70 leading-relaxed">
              All branding, UI, text, design, and software belong to Social Raven. 
              You may not copy, reverse-engineer, or redistribute the App.
            </p>
          </section>

          <div className="h-px bg-border/60" />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Termination</h2>
            <p className="text-foreground/70 leading-relaxed">
              We may suspend or terminate your access if you violate these Terms, misuse APIs,
              or publish prohibited content.
            </p>
          </section>

          <div className="h-px bg-border/60" />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Disclaimers</h2>
            <p className="text-foreground/70 leading-relaxed">
              The App is provided “as-is” without warranties. We do not guarantee
              uninterrupted service or compatibility with future social media changes.
            </p>
          </section>

          <div className="h-px bg-border/60" />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">10. Limitation of Liability</h2>
            <p className="text-foreground/70 leading-relaxed">
              We are not liable for loss of data, revenue, or damages arising from your use 
              of the App. Our maximum liability is limited to fees paid in the last 12 months.
            </p>
          </section>

          <div className="h-px bg-border/60" />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">11. Updates to Terms</h2>
            <p className="text-foreground/70 leading-relaxed">
              We may update these Terms at any time. Continued use of the App after changes 
              means you accept the updated Terms.
            </p>
          </section>

          <div className="h-px bg-border/60" />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">12. Contact</h2>
            <p className="text-foreground/70 leading-relaxed">
              For questions, email us at:  
              <br />
              <span className="font-medium text-foreground">support@socialraven.app</span>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
