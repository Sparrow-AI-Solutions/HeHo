
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Zap, Shield, Rocket, BarChart3, Code2, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chatbot Builder for Startups | HeHo",
  description: "Build intelligent AI chatbots in minutes without code. Perfect for startups. Connect your database, deploy instantly, and scale infinitely with HeHo.",
  keywords: [
    "AI chatbot for startups",
    "no-code chatbot builder",
    "startup AI tools",
    "customer support chatbot",
    "AI backend for startups",
    "open-source chatbot",
    "Supabase chatbot",
    "OpenRouter integration",
    "fast chatbot deployment",
    "affordable AI chatbot"
  ],
  openGraph: {
    title: "AI Chatbot Builder for Startups | HeHo",
    description: "Build intelligent AI chatbots in minutes without code. Perfect for startups. Connect your database, deploy instantly, and scale infinitely.",
    type: "website",
    url: "https://heho.vercel.app/ai-chatbot-for-startups",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Chatbot Builder for Startups | HeHo",
    description: "Build intelligent AI chatbots in minutes without code. Perfect for startups.",
  },
};

export default function AIChatbotForStartupsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">

          {/* Hero */}
          <div className="max-w-4xl mx-auto mb-20">
            <h1 className="text-5xl font-bold text-foreground mb-6 text-center">
              The AI Chatbot Builder for Startups: Your Unfair Advantage
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed text-center">
              In the high-stakes world of startups, you need to build better products, faster, and with fewer resources. HeHo is the AI chatbot platform built by a startup, for startups. We understand your challenges because we live them. We've built HeHo to be the ultimate unfair advantage for startups aiming to leverage AI.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/#features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Why HeHo for Startups Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
              Why Ambitious Startups Choose HeHo
            </h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Launch in Minutes, Not Months:</strong> Your most valuable asset is time. HeHo's web-based platform and one-click deployment mean you can go from idea to a live, data-connected chatbot in minutes. While your competitors are stuck in complex setups, you are already shipping and iterating.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Zero-Headache API & Database Setup:</strong> We automate the technical hurdles. Simply connect your Supabase account with OAuth and paste in your OpenRouter API key. HeHo handles the rest, from database table creation to secure RLS policies. You get a powerful, secure backend without the DevOps overhead.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Scale Infinitely, Not Expensively:</strong> HeHo is designed for growth. Our platform is built to scale with you from day one, without imposing punitive limits. And because you can use powerful free models from OpenRouter, you can keep your operational costs incredibly low while still delivering a world-class AI experience.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>An Open-Source Partner You Can Trust:</strong> As a fellow startup, we value transparency and community. HeHo is fully open-source. We are not a black box. You have full visibility into our code, and you are joining a community dedicated to building the future of AI without vendor lock-in.
                </p>
              </li>
            </ul>
          </div>

          {/* Use Cases Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
              What You Can Build
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-border/50 bg-card/50">
                <div className="flex items-start gap-3 mb-3">
                  <Users className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <h3 className="text-xl font-bold text-foreground">Customer Support Bots</h3>
                </div>
                <p className="text-muted-foreground">
                  Automate customer inquiries 24/7. Your chatbot learns from your data and handles support tickets, FAQs, and escalations intelligently.
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50">
                <div className="flex items-start gap-3 mb-3">
                  <BarChart3 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <h3 className="text-xl font-bold text-foreground">Data Analytics Assistants</h3>
                </div>
                <p className="text-muted-foreground">
                  Let your AI agent query your database and generate insights. Perfect for internal dashboards and business intelligence.
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50">
                <div className="flex items-start gap-3 mb-3">
                  <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <h3 className="text-xl font-bold text-foreground">Workflow Automation</h3>
                </div>
                <p className="text-muted-foreground">
                  Automate business processes. Your chatbot can read, analyze, and update data autonomously based on natural language commands.
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50">
                <div className="flex items-start gap-3 mb-3">
                  <Code2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <h3 className="text-xl font-bold text-foreground">Custom APIs</h3>
                </div>
                <p className="text-muted-foreground">
                  Generate REST APIs instantly. Integrate AI-powered backends into your product without writing backend code.
                </p>
              </Card>
            </div>
          </div>

          {/* Features Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
              Why HeHo is Built for Startup Success
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-border/50 bg-card/50">
                <Rocket className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Lightning Fast</h3>
                <p className="text-muted-foreground text-sm">
                  Deploy in minutes. No infrastructure setup, no DevOps knowledge required. Just connect and go live.
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50">
                <Shield className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Enterprise Security</h3>
                <p className="text-muted-foreground text-sm">
                  Your data stays in your Supabase database. Encrypted, secure, and under your complete control with RLS.
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50">
                <BarChart3 className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Cost Efficient</h3>
                <p className="text-muted-foreground text-sm">
                  Access 35+ free AI models. Pay only for what you use. Scale from zero to millions without breaking the bank.
                </p>
              </Card>
            </div>
          </div>

          {/* Comparison Section */}
          <div className="max-w-4xl mx-auto mb-24 bg-card/30 border border-border/50 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
              HeHo vs. Traditional Approaches
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="text-primary font-bold text-lg">✓</div>
                <p className="text-muted-foreground"><strong>No coding required:</strong> Startups can't afford to hire expensive engineers. HeHo's no-code interface means anyone can build AI chatbots.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-primary font-bold text-lg">✓</div>
                <p className="text-muted-foreground"><strong>No vendor lock-in:</strong> Open-source means you're never trapped. Your data is yours, your code is yours, your future is yours.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-primary font-bold text-lg">✓</div>
                <p className="text-muted-foreground"><strong>No infrastructure headaches:</strong> We handle servers, scaling, security, and updates. You focus on your product.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-primary font-bold text-lg">✓</div>
                <p className="text-muted-foreground"><strong>No expensive models:</strong> Access powerful free models from OpenRouter. Premium models available when you need them.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to give your startup an AI advantage?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Stop wasting time and money on slow, complex platforms. Choose HeHo and give your startup the speed, power, and freedom it needs to win.
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
