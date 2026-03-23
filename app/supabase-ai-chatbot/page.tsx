
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Database, Lock, Zap, BarChart3, Code2, Workflow } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Supabase AI Chatbots | HeHo",
  description: "Create intelligent AI chatbots connected to your Supabase database in minutes. Secure, real-time, and fully integrated. No code required.",
  keywords: [
    "Supabase chatbot",
    "AI chatbot Supabase",
    "database chatbot",
    "Supabase AI integration",
    "real-time chatbot",
    "secure chatbot",
    "no-code chatbot",
    "OpenRouter Supabase",
    "data-driven chatbot",
    "autonomous backend"
  ],
  openGraph: {
    title: "Build Supabase AI Chatbots | HeHo",
    description: "Create intelligent AI chatbots connected to your Supabase database in minutes. Secure, real-time, and fully integrated.",
    type: "website",
    url: "https://heho.vercel.app/supabase-ai-chatbot",
  },
  twitter: {
    card: "summary_large_image",
    title: "Build Supabase AI Chatbots | HeHo",
    description: "Create intelligent AI chatbots connected to your Supabase database in minutes.",
  },
};

export default function SupabaseAIChatbotPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">

          {/* Hero */}
          <div className="max-w-4xl mx-auto mb-20">
            <h1 className="text-5xl font-bold text-foreground mb-6 text-center">
              Build a Supabase AI Chatbot in Minutes with HeHo
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed text-center">
              As a new, open-source startup, we designed HeHo to be the fastest and most secure way to build AI chatbots on top of your Supabase database. Connect your data in seconds and create a chatbot that can interact with your application in real-time. This isn't just an integration; it's a superpower for your project.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/integrations">
                <Button size="lg" variant="outline">
                  View Integrations
                </Button>
              </Link>
            </div>
          </div>

          {/* Why HeHo and Supabase Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
              The Perfect Match for Data-Driven AI
            </h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Automated & Secure Connection:</strong> Forget writing complex connection code. HeHo uses a secure OAuth flow to connect to your Supabase project. We automatically create the necessary tables and enable battle-tested Row Level Security (RLS) policies. Your data is secure and accessible to your bot from the start.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Unlock Real-Time Capabilities:</strong> Leverage Supabase's real-time features to build truly dynamic chatbots. Create assistants that can react to database changes instantly, check order statuses, update user profiles, or query inventory, providing a live and engaging user experience.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Simple API Key Integration:</strong> To power the AI, simply create a free account on OpenRouter, get your API key, and paste it into your HeHo dashboard. This simple step unlocks a universe of AI models that can now securely interact with your Supabase data.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Open-Source and Built to Scale:</strong> HeHo is an open-source platform, giving you full transparency and control. As your startup grows, our Supabase-backed architecture scales with you, ensuring your chatbot can handle anything from one user to millions without a hitch.
                </p>
              </li>
            </ul>
          </div>

          {/* Use Cases Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
              Real-World Use Cases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-border/50 bg-card/50">
                <div className="flex items-start gap-3 mb-3">
                  <BarChart3 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <h3 className="text-xl font-bold text-foreground">E-Commerce Support</h3>
                </div>
                <p className="text-muted-foreground">
                  Build a chatbot that checks order statuses, manages returns, and handles customer inquiries by querying your Supabase database in real-time.
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50">
                <div className="flex items-start gap-3 mb-3">
                  <Database className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <h3 className="text-xl font-bold text-foreground">Data Query Assistant</h3>
                </div>
                <p className="text-muted-foreground">
                  Create an intelligent assistant that allows non-technical users to query your database using natural language.
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50">
                <div className="flex items-start gap-3 mb-3">
                  <Workflow className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <h3 className="text-xl font-bold text-foreground">Autonomous Operations</h3>
                </div>
                <p className="text-muted-foreground">
                  Let your AI agent autonomously manage database operations, create records, and update data based on conditions and triggers.
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50">
                <div className="flex items-start gap-3 mb-3">
                  <Lock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <h3 className="text-xl font-bold text-foreground">Secure Knowledge Base</h3>
                </div>
                <p className="text-muted-foreground">
                  Build a secure knowledge base chatbot that only reveals information the user has permission to access, powered by RLS.
                </p>
              </Card>
            </div>
          </div>

          {/* Technical Benefits Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
              Built on Enterprise-Grade Technology
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-border/50 bg-card/50">
                <Lock className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Security First</h3>
                <p className="text-muted-foreground text-sm">
                  Row-level security, encrypted connections, and your data stays in your database. Full control, zero compromise.
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50">
                <Zap className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Real-Time Sync</h3>
                <p className="text-muted-foreground text-sm">
                  Leverage Supabase's real-time subscriptions for instant updates. Your chatbot always has the latest data.
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50">
                <Code2 className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Developer Friendly</h3>
                <p className="text-muted-foreground text-sm">
                  REST API for programmatic access. Integrate with your existing stack seamlessly.
                </p>
              </Card>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="max-w-4xl mx-auto mb-24 bg-card/30 border border-border/50 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              How It Works
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Connect Your Supabase</h3>
                  <p className="text-muted-foreground">Sign in with your Supabase account using OAuth. HeHo securely connects to your database with one click.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Add Your OpenRouter API Key</h3>
                  <p className="text-muted-foreground">Paste your free OpenRouter API key to unlock access to 35+ AI models. No credit card required to get started.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Create Your Chatbot</h3>
                  <p className="text-muted-foreground">Define your chatbot's purpose, select your data sources, and choose your AI model. No code needed.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Deploy & Share</h3>
                  <p className="text-muted-foreground">Your chatbot is live instantly. Share it with your team, embed it in your app, or access it via REST API.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to bring your data to life?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Connect your Supabase database and build a powerful, data-driven AI chatbot today. Join our community of developers and innovators.
            </p>
            <Link href="/signup">
              <Button size="lg" className="group">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
