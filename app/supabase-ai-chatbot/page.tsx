
import React from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const SupabaseAIChatbotPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Build a Supabase AI Chatbot with HeHo</h1>
          <p className="text-lg mb-4">
            Combine the power of Supabase's scalable and secure database with HeHo's no-code chatbot builder to create a truly dynamic AI assistant. Connect your Supabase project in minutes and start building.
          </p>
          <h2 className="text-2xl font-bold mt-6 mb-2">Why HeHo and Supabase are the Perfect Match:</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Seamless Integration:</strong> Our native Supabase integration makes it incredibly easy to connect your database. No APIs or complex code required.
            </li>
            <li>
              <strong>Real-time Data:</strong> Leverage Supabase's real-time capabilities to create chatbots that can access and update data instantly.
            </li>
            <li>
              <strong>Secure by Design:</strong> HeHo and Supabase both prioritize security, ensuring your data and conversations are always protected.
            </li>
            <li>
              <strong>Scalable Infrastructure:</strong> As your user base grows, Supabase and HeHo scale with you, so you never have to worry about performance.
            </li>
          </ul>
          <p className="mt-6">
            Ready to build a powerful, data-driven chatbot? Get started with HeHo and Supabase today.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SupabaseAIChatbotPage;
