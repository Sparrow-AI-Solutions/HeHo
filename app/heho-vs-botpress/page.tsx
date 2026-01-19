
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HehoVsBotpressPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">

          {/* Hero */}
          <div className="max-w-4xl mx-auto mb-20">
            <h1 className="text-4xl font-bold text-foreground mb-6 text-center">
              HeHo vs. Botpress: Why Startups & Developers Choose HeHo
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              As a new, open-source startup, we built HeHo to solve the problems we faced ourselves: the need for speed, power, and simplicity. While Botpress offers a flexible open-source platform, it often comes with a steep learning curve and significant maintenance overhead. HeHo is the modern alternative, designed from the ground up to be the fastest and most intuitive way to build powerful, data-aware AI chatbots.
            </p>
          </div>

          {/* Why HeHo is Better Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-6 text-center">
              The HeHo Advantage
            </h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Radical Simplicity and Speed:</strong> Go from idea to production-ready chatbot in minutes. HeHo is a fully web-based platform with one-click deployment. There is no infrastructure to set up or code to clone. In contrast, Botpress often requires significant developer effort for configuration, deployment, and ongoing maintenance, slowing you down.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Unmatched AI Flexibility with OpenRouter:</strong> HeHo is powered by OpenRouter. After a simple sign-up, you just paste your OpenRouter API key into the HeHo dashboard to unlock over 35 free and premium AI models. This freedom to choose the best model (like Llama, Mistral, or Gemma) for your specific need is something Botpress can't easily match. You are in full control of your AI stack.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Secure, Automated Supabase Integration:</strong> HeHo connects directly to *your own* Supabase database. Our secure OAuth connection process automatically sets up the necessary tables and Row Level Security (RLS) policies. This means your chatbot can safely read and write data right away, without you writing a single line of SQL. It's security and power, automated.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Truly Open-Source, No Lock-In:</strong> HeHo is 100% open-source. As a startup, we believe in transparency and community. You are not tied to a proprietary ecosystem. This ensures you always have the freedom to customize, extend, and evolve your AI strategy, a crucial advantage for any forward-thinking company.
                </p>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to build faster and smarter?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Experience a platform designed for the speed of modern development. Start for free and discover why developers are choosing the simplicity and power of HeHo.
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
