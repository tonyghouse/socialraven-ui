import Link from 'next/link'
import Image from 'next/image'
import { House as Home, ArrowLeft } from "@phosphor-icons/react/dist/ssr"

export default function NotFound() {
  return (
    <div className="min-h-screen page-bg flex flex-col">

      {/* Header */}
      <header className="px-6 sm:px-10 py-5 bg-white/70 backdrop-blur-sm border-b border-border/60">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <Image
            src="/SocialRavenLogo.svg"
            alt="SocialRaven"
            width={30}
            height={30}
            className="rounded-[7px]"
          />
          <span className="text-[15px] font-semibold text-gray-900 tracking-tight">
            SocialRaven
          </span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-sm mx-auto space-y-8">

          {/* Logo mark */}
          <div className="flex justify-center">
            <div className="depth-soft rounded-2xl p-1 bg-white">
              <Image
                src="/SocialRavenLogo.svg"
                alt="SocialRaven"
                width={72}
                height={72}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* 404 */}
          <div>
            <p
              className="text-[7.5rem] sm:text-[9rem] font-black leading-none tracking-tighter select-none bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, hsl(214,65%,52%), hsl(214,65%,36%))',
              }}
            >
              404
            </p>
          </div>

          {/* Divider */}
          <div className="w-10 h-px bg-border mx-auto" />

          {/* Copy */}
          <div className="space-y-3">
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              Page not found
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or may have
              been moved. Check the URL, or head back to continue.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-white text-gray-700 text-sm font-medium hover:bg-secondary/60 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 px-6 text-center border-t border-border/60">
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} SocialRaven &mdash; Social media scheduling for modern teams
        </p>
      </footer>

    </div>
  )
}
