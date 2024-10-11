"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Feather, BarChart } from "lucide-react";
import { useRouter } from 'next/navigation';

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function LandingPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b ">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-orange-800">
                  Automate Your Social Media Presence
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                  Schedule, analyze, and optimize your social media posts across
                  multiple platforms with Social Raven.
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-orange-500 text-white hover:bg-orange-600">
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  className="text-orange-500 border-orange-500 hover:bg-orange-50"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 text-orange-800">
              Features
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg transition-all hover:bg-orange-50">
                <Calendar className="h-12 w-12 mb-2 text-orange-500" />
                <h3 className="text-xl font-bold text-orange-800">
                  Smart Scheduling
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Schedule posts for optimal times to maximize engagement.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg transition-all hover:bg-orange-50">
                <Clock className="h-12 w-12 mb-2 text-orange-500" />
                <h3 className="text-xl font-bold text-orange-800">
                  Auto-Posting
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Set it and forget it with our reliable auto-posting feature.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg transition-all hover:bg-orange-50">
                <Feather className="h-12 w-12 mb-2 text-orange-500" />
                <h3 className="text-xl font-bold text-orange-800">
                  Content Creation
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Create engaging content with our AI-powered suggestions.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg transition-all hover:bg-orange-50">
                <BarChart className="h-12 w-12 mb-2 text-orange-500" />
                <h3 className="text-xl font-bold text-orange-800">Analytics</h3>
                <p className="text-sm text-gray-600 text-center">
                  Track your performance with detailed analytics and insights.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-orange-500 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Ready to Revolutionize Your Social Media Strategy?
                </h2>
                <p className="max-w-[900px] text-orange-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of businesses and influencers who trust Social
                  Raven to manage their social media presence.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input
                    className="max-w-lg flex-1 bg-white text-orange-900 placeholder-orange-300"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Link href={"/sign-up"}>
                    <Button
                      type="submit"
                      className="bg-orange-700 text-white hover:bg-orange-800"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gray-50">
        <p className="text-xs text-gray-500">
          © 2024 Social Raven. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-xs hover:underline underline-offset-4 text-gray-500 hover:text-orange-500"
            href="#"
          >
            Terms of Service
          </Link>
          <Link
            className="text-xs hover:underline underline-offset-4 text-gray-500 hover:text-orange-500"
            href="#"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
