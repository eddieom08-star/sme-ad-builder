import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, TrendingUp, Zap } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();

  // If user is logged in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SME Ad Builder</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Zap className="h-4 w-4" />
            AI-Powered Marketing Campaigns
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
            Build Marketing Campaigns
            <span className="block text-primary mt-2">In Minutes, Not Hours</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create professional Google Ads and social media campaigns with AI assistance.
            Perfect for small businesses looking to grow their online presence.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8">
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 rounded-lg bg-card border shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Google Ads Builder</h3>
            <p className="text-muted-foreground">
              Create responsive search ads with AI-powered headlines and descriptions.
              Optimize for maximum performance.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Social Media Campaigns</h3>
            <p className="text-muted-foreground">
              Launch campaigns across Facebook, Instagram, LinkedIn, and TikTok.
              All from one platform.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
            <p className="text-muted-foreground">
              Track campaign performance with real-time analytics.
              Make data-driven decisions to grow your business.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 p-12 rounded-2xl bg-primary text-primary-foreground">
          <h2 className="text-4xl font-bold">Ready to Grow Your Business?</h2>
          <p className="text-lg opacity-90">
            Join hundreds of small businesses using SME Ad Builder to create successful marketing campaigns.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t mt-20">
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; 2025 SME Ad Builder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
