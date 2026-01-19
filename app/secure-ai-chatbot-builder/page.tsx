
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function SecureAIChatbotBuilderPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">

          {/* Hero */}
          <div className="max-w-4xl mx-auto mb-20">
            <h1 className="text-4xl font-bold text-foreground mb-6 text-center">
              The Secure AI Chatbot Builder You Can Trust
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              When your chatbot handles sensitive user data, security is not optional. It’s the foundation of trust. As a new, open-source startup, we built HeHo with a security-first mindset. We provide an enterprise-grade, transparent, and auditable security model from day one, so you can build with confidence.
            </p>
          </div>

          {/* Security Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-6 text-center">
              A Multi-Layered Security Architecture
            </h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Automated Supabase Security:</strong> Our integration with Supabase is seamless and secure. During the OAuth connection, HeHo automatically creates the necessary tables in *your* database and, crucially, enables Row Level Security (RLS) policies. This ensures that your chatbot can only access the specific data it is explicitly permitted to, preventing any unauthorized data exposure from the very start.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Your API Keys Remain Yours:</strong> We never see or store your sensitive API keys. Your OpenRouter API key is passed directly from your HeHo dashboard to the AI models. This client-side handling means you retain full control over your credentials, dramatically reducing the attack surface.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>The Transparency of Open Source:</strong> Trust through transparency is our core belief. HeHo is 100% open-source. Our code is public and available for audit by anyone. This openness holds us to the highest standard of security and allows the community to contribute to making the platform safer for everyone.
                </p>
              </li>
               <li className="flex items-start gap-4">
                <span className="text-primary font-bold text-xl mt-1">→</span>
                <p className="text-lg md:text-xl text-muted-foreground">
                  <strong>Fortified by Supabase's Infrastructure:</strong> By building on Supabase, we inherit a world-class security foundation. This includes mandatory SSL/TLS for all data in transit, at-rest encryption for all database content, and compliance with the highest industry standards. We build on a rock-solid base, and so do you.
                </p>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to build AI on a foundation of trust?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Don’t compromise on security. Build powerful, data-driven AI chatbots with a platform that puts your data and your users' trust first.
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
