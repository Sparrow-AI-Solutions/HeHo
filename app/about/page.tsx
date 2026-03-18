import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">

          {/* Hero */}
          <div className="max-w-4xl mx-auto mb-20">
            <h1 className="text-4xl font-bold text-foreground mb-6 text-center">
              About HeHo
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              HeHo is an open-source, no-code platform that empowers developers, product teams, and businesses to build intelligent AI chatbots, autonomous backends, and custom APIs—all without writing a single line of code. We believe artificial intelligence should be accessible, transparent, and deeply integrated with your business data.
              <br /><br />
              By connecting modern language models directly to your Supabase database, HeHo enables you to create sophisticated AI agents that don't just respond to queries—they understand your data, reason about it, and take autonomous actions within your system. Whether you're building customer support chatbots, internal knowledge assistants, autonomous data management systems, or workflow automation tools, HeHo provides the foundation to deploy production-ready AI experiences with confidence and control.
              <br /><br />
            </p>
          </div>

          {/* Mission Section */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-foreground mb-6 text-center">
              Our Mission
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              We believe AI should be accessible, understandable, and deeply integrated with your business needs. Too often, powerful AI tools are locked behind complexity, expensive infrastructure, vendor lock-in, or require extensive coding knowledge. HeHo was created to change that—giving teams the freedom to build intelligent systems without sacrificing ownership, security, or flexibility.
            </p>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Our mission is to democratize AI by removing technical barriers and unlocking the full potential of language models for everyday use. By combining a no-code interface with a powerful REST API, HeHo serves both non-technical users and developers, enabling teams to deploy AI-powered backends and chatbots in minutes, not months.
            </p>
          </div>

          {/* What Makes HeHo Different */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-6 text-center">
              What Makes HeHo Different
            </h2>

            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Backend + Chatbot in One:</strong> HeHo is more than a chatbot builder. It's a complete AI-powered backend orchestrator that provides autonomous data management, custom API generation, and intelligent agents—all integrated seamlessly.
                </p>
              </li>

              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Powering Other Applications:</strong> HeHo is designed to be the brain of any application. Our API allows you to use HeHo as a robust backend for web, mobile, and internal apps, enabling them to leverage sophisticated AI reasoning and database operations.
                </p>
              </li>

              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>35+ Free AI Models:</strong> Powered by OpenRouter, HeHo gives you access to the latest open-source and commercial AI models—Llama, Mistral, Qwen, Arcee Trinity, and more—completely free. Switch models anytime without vendor lock-in.
                </p>
              </li>

              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Data-First & Secure:</strong> Your data remains in your own Supabase database, under your complete control. HeHo provides fine-grained permissions so you decide exactly what the AI can read, write, edit, or access—ensuring trust and compliance at every step.
                </p>
              </li>

              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>No Code, Real Power:</strong> Define your chatbot's purpose, connect it to your data, and deploy it in minutes. HeHo removes the complexity of AI infrastructure, API development, and backend orchestration so you can focus on building meaningful experiences.
                </p>
              </li>

              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Developer-Friendly REST API:</strong> Beyond the no-code interface, HeHo provides a comprehensive REST API (v1) for programmatic chatbot management, database operations, and autonomous backend control. Perfect for teams that want to integrate AI into their existing systems.
                </p>
              </li>
            </ul>
          </div>

          {/* Capabilities Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-6 text-center">
              What You Can Build
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-border/50 bg-card/50">
                <h3 className="text-xl font-bold text-foreground mb-3">Intelligent Chatbots</h3>
                <p className="text-muted-foreground">
                  Customer support bots, knowledge assistants, and conversational agents that understand your business context and data.
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50">
                <h3 className="text-xl font-bold text-foreground mb-3">Autonomous Backends</h3>
                <p className="text-muted-foreground">
                  AI-powered systems that autonomously manage your database, create tables, and perform CRUD operations based on natural language instructions for any app.
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50">
                <h3 className="text-xl font-bold text-foreground mb-3">Custom APIs</h3>
                <p className="text-muted-foreground">
                  Instantly generate RESTful API endpoints for chatbot management, database operations, and integration with your existing applications.
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/50">
                <h3 className="text-xl font-bold text-foreground mb-3">Workflow Automation</h3>
                <p className="text-muted-foreground">
                  Automate business processes by connecting AI agents to your database, enabling them to read, analyze, and update data autonomously.
                </p>
              </Card>
            </div>
          </div>

          {/* Built With Section */}
          <Card className="max-w-2xl mx-auto p-8 border-primary/30 bg-primary/5 mb-20">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Built with Modern Technology
            </h2>

            <p className="text-muted-foreground mb-6">
              HeHo is built using battle-tested, industry-leading technologies trusted by developers and enterprises worldwide.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="bg-background/50 px-4 py-2 rounded-lg">
                <p className="font-semibold text-foreground">Next.js 14</p>
                <p className="text-sm text-muted-foreground">Modern web framework</p>
              </div>

              <div className="bg-background/50 px-4 py-2 rounded-lg">
                <p className="font-semibold text-foreground">OpenRouter</p>
                <p className="text-sm text-muted-foreground">35+ AI models</p>
              </div>

              <div className="bg-background/50 px-4 py-2 rounded-lg">
                <p className="font-semibold text-foreground">Supabase</p>
                <p className="text-sm text-muted-foreground">Database & auth</p>
              </div>

              <div className="bg-background/50 px-4 py-2 rounded-lg">
                <p className="font-semibold text-foreground">TypeScript</p>
                <p className="text-sm text-muted-foreground">Type-safe code</p>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to build your first AI backend or chatbot?
            </h2>

            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join a growing community of builders and innovators. Start for free today and experience how simple building AI-powered systems can be.
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
  )
}
