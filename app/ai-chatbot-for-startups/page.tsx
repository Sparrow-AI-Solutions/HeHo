
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function AIChatbotForStartupsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">

          {/* Hero */}
          <div className="max-w-4xl mx-auto mb-20">
            <h1 className="text-4xl font-bold text-foreground mb-6 text-center">
              The AI Chatbot Builder for Startups: Your Unfair Advantage
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              In the high-stakes world of startups, you need to build better products, faster, and with fewer resources. HeHo is the AI chatbot platform built by a startup, for startups. We are a new, open-source company that understands your challenges because we live them. We’ve built HeHo to be the ultimate unfair advantage for startups aiming to leverage AI.
            </p>
          </div>

          {/* Why HeHo for Startups Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-6 text-center">
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
                  <strong>Zero-Headache API &amp; Database Setup:</strong> We automate the technical hurdles. Simply connect your Supabase account with OAuth and paste in your OpenRouter API key. HeHo handles the rest, from database table creation to secure RLS policies. You get a powerful, secure backend without the DevOps overhead.
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
