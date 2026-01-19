
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function OpenRouterChatbotPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">

          {/* Hero */}
          <div className="max-w-4xl mx-auto mb-20">
            <h1 className="text-4xl font-bold text-foreground mb-6 text-center">
              Build a Superior Chatbot with HeHo and OpenRouter
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              The intelligence of your chatbot is defined by its underlying AI model. As a new, open-source startup, HeHo refuses to lock you into a single, proprietary option. We believe in the power of choice. That's why we built HeHo on OpenRouter, giving you unparalleled access to a diverse universe of cutting-edge language models and the freedom to switch between them instantly.
            </p>
          </div>

          {/* Why HeHo and OpenRouter Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-6 text-center">
              The Ultimate AI Flexibility
            </h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Instant Access to 35+ AI Models:</strong> Getting started is effortless. Create a free account at OpenRouter, generate an API key, and paste it into your HeHo settings. You instantly unlock a massive library of models from providers like OpenAI, Google, Anthropic, Mistral, and more. Your chatbot is no longer tied to one brain.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Optimize for Performance, Cost, and Creativity:</strong> Don't settle for a one-size-fits-all AI. Choose the best model for your specific needs. Select a powerful model for complex reasoning, a cost-effective one for simple queries, or a creative one for text generation. With HeHo and OpenRouter, you control the balance.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Future-Proof Your AI Strategy:</strong> The AI landscape is evolving at lightning speed. A new, groundbreaking model could be released tomorrow. With HeHo, you can switch to the latest and greatest models available on OpenRouter with a single click in your dashboard. No code changes, no complex migrations. You always stay on the cutting edge.
                </p>
              </li>
               <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Commitment to Open Source:</strong> Both HeHo and OpenRouter are champions of the open-source movement. By building with us, you are part of a transparent, collaborative ecosystem that prioritizes developer freedom and community-driven innovation. We are building the future of AI in the open.
                </p>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to unlock a universe of AI models?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Take control of your AI stack. Build a more capable, adaptable, and future-proof chatbot with the combined power of HeHo and OpenRouter.
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
