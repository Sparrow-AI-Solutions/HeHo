
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Check, X } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HeHo vs Supabase: AI Chatbot & Backend Comparison",
  description: "Compare HeHo and Supabase. HeHo is the AI-powered backend orchestrator built on Supabase. Understand the differences and why you need both.",
  keywords: [
    "HeHo vs Supabase",
    "Supabase alternative",
    "AI backend comparison",
    "chatbot builder vs database",
    "HeHo features",
    "Supabase features",
    "AI chatbot platform",
    "backend orchestration",
    "no-code AI",
    "database with AI"
  ],
  openGraph: {
    title: "HeHo vs Supabase: AI Chatbot & Backend Comparison",
    description: "Compare HeHo and Supabase. HeHo is the AI-powered backend orchestrator built on Supabase.",
    type: "website",
    url: "https://heho.vercel.app/heho-vs-supabase",
  },
  twitter: {
    card: "summary_large_image",
    title: "HeHo vs Supabase: AI Chatbot & Backend Comparison",
    description: "Compare HeHo and Supabase. HeHo is the AI-powered backend orchestrator built on Supabase.",
  },
};

export default function HeHoVsSupabasePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">

          {/* Hero */}
          <div className="max-w-4xl mx-auto mb-20">
            <h1 className="text-5xl font-bold text-foreground mb-6 text-center">
              HeHo vs Supabase: Understanding the Difference
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed text-center">
              Supabase is an excellent open-source database and authentication platform. HeHo is built on top of Supabase and adds a powerful layer of AI-powered backend orchestration, autonomous agents, and no-code chatbot creation. They're complementary, not competitive.
            </p>
          </div>

          {/* Key Insight Section */}
          <div className="max-w-4xl mx-auto mb-24 bg-primary/10 border border-primary/30 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
              The Simple Truth
            </h2>
            <p className="text-lg text-muted-foreground text-center">
              <strong>Supabase is your database.</strong> HeHo is your AI-powered backend orchestrator that sits on top of Supabase. You need Supabase for data storage. You need HeHo to make that data intelligent and accessible through AI.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
              Feature Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-bold text-foreground">Feature</th>
                    <th className="text-center py-4 px-4 font-bold text-foreground">HeHo</th>
                    <th className="text-center py-4 px-4 font-bold text-foreground">Supabase</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-4 px-4 text-foreground font-semibold">Database & Storage</td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 px-4 text-foreground font-semibold">Authentication</td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 px-4 text-foreground font-semibold">AI Chatbots (No-Code)</td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <X className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 px-4 text-foreground font-semibold">AI Model Integration</td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <X className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 px-4 text-foreground font-semibold">Autonomous Backend Agents</td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <X className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 px-4 text-foreground font-semibold">REST API for AI Operations</td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <X className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 px-4 text-foreground font-semibold">Row-Level Security (RLS)</td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 px-4 text-foreground font-semibold">Real-Time Subscriptions</td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 px-4 text-foreground font-semibold">File Storage (Pantry)</td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 px-4 text-foreground font-semibold">Open Source</td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* What Each Does Best */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
              What Each Platform Does Best
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 border-border/50 bg-card/50">
                <h3 className="text-2xl font-bold text-foreground mb-6">Supabase</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">PostgreSQL database with full SQL support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Built-in authentication (Email, OAuth, etc.)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Real-time subscriptions and webhooks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">File storage (S3-compatible)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Row-level security for data isolation</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8 border-border/50 bg-card/50">
                <h3 className="text-2xl font-bold text-foreground mb-6">HeHo</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">No-code AI chatbot builder</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Access to 35+ free AI models (OpenRouter)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Autonomous backend agents and CRUD operations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">REST API for programmatic access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">One-click deployment and sharing</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          {/* The HeHo Advantage Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
              The HeHo Advantage
            </h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Built on Supabase:</strong> HeHo leverages Supabase's rock-solid infrastructure. You get the best of both worlds: Supabase's reliability and HeHo's AI intelligence.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>No-Code AI:</strong> While Supabase requires coding for most use cases, HeHo lets anyone build AI-powered backends without writing a single line of code.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Autonomous Operations:</strong> HeHo's AI agents can autonomously read, write, and update your Supabase data based on natural language instructions.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Complete Data Control:</strong> Your data stays in your Supabase database. HeHo is just the orchestration layer. You maintain 100% ownership and control.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Cost Efficiency:</strong> Use free AI models from OpenRouter. Scale from zero to millions without expensive infrastructure costs.
                </p>
              </li>
            </ul>
          </div>

          {/* Use Case Scenarios */}
          <div className="max-w-4xl mx-auto mb-24 bg-card/30 border border-border/50 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              When to Use What
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">Use Supabase if you need:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• A reliable PostgreSQL database</li>
                  <li>• Authentication and user management</li>
                  <li>• Real-time data synchronization</li>
                  <li>• File storage</li>
                  <li>• Custom backend APIs (with coding)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">Use HeHo if you need:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• AI-powered chatbots without code</li>
                  <li>• Autonomous backend agents</li>
                  <li>• Natural language database queries</li>
                  <li>• Quick deployment of AI features</li>
                  <li>• REST API for AI operations</li>
                </ul>
              </div>
              <div className="border-t border-border pt-6 mt-6">
                <h3 className="text-xl font-bold text-foreground mb-3">Use Both if you need:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• A complete data-driven AI platform</li>
                  <li>• Secure, scalable infrastructure with AI intelligence</li>
                  <li>• No-code chatbots connected to your data</li>
                  <li>• Autonomous operations on your database</li>
                  <li>• The best of open-source database and AI tools</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to build with HeHo?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Start building AI-powered backends and chatbots today. HeHo works seamlessly with your Supabase database.
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
