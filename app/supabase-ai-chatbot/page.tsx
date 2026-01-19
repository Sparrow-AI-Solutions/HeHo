
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function SupabaseAIChatbotPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">

          {/* Hero */}
          <div className="max-w-4xl mx-auto mb-20">
            <h1 className="text-4xl font-bold text-foreground mb-6 text-center">
              Build a Supabase AI Chatbot in Minutes with HeHo
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              As a new, open-source startup, we designed HeHo to be the fastest and most secure way to build AI chatbots on top of your Supabase database. Connect your data in seconds and create a chatbot that can interact with your application in real-time. This isn't just an integration; it's a superpower for your project.
            </p>
          </div>

          {/* Why HeHo and Supabase Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-6 text-center">
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
