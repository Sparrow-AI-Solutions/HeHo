
import React from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const AIChatbotForStartupsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">The Best AI Chatbot Builder for Startups is HeHo</h1>
          <p className="text-lg mb-4">
            Startups need to move fast and build efficiently. HeHo is the perfect AI chatbot platform for startups, offering a powerful combination of no-code simplicity, one-click deployment, and scalable infrastructure.
          </p>
          <h2 className="text-2xl font-bold mt-6 mb-2">Why Startups Choose HeHo:</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Build and Launch Faster:</strong> Our no-code builder lets you create and deploy a chatbot in minutes, not weeks. Get your MVP to market faster than ever.
            </li>
            <li>
              <strong>Save on Development Costs:</strong> With HeHo, you don't need to hire a team of developers to build and maintain your chatbot. Our platform is designed for everyone.
            </li>
            <li>
              <strong>Scale with Confidence:</strong> Start with our generous free plan and scale up as you grow. Our integration with Supabase and OpenRouter ensures your chatbot can handle any amount of traffic.
            </li>
            <li>
              <strong>Focus on Your Product:</strong> Let us handle the complexities of chatbot development and infrastructure, so you can focus on building your core product.
            </li>
          </ul>
          <p className="mt-6">
            Join the growing number of startups that are using HeHo to build amazing conversational experiences.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AIChatbotForStartupsPage;
