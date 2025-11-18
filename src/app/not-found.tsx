import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <AlertCircle className="h-16 w-16 text-primary" aria-hidden="true" />
          <h1 className="mt-6 text-4xl font-extrabold text-gray-900">404 - Page Not Found</h1>
        </div>
        <p className="mt-2 text-lg text-gray-600">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary/90 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-5 w-5" aria-hidden="true" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}