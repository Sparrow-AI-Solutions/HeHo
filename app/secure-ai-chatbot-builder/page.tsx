
import React from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const SecureAIChatbotBuilderPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Build a Secure AI Chatbot with HeHo</h1>
          <p className="text-lg mb-4">
            Security is not an afterthought; it's at the core of our platform. HeHo provides a secure AI chatbot builder that you can trust with your data and your users' conversations.
          </p>
          <h2 className="text-2xl font-bold mt-6 mb-2">Our Commitment to Security:</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Database Security by Supabase:</strong> We leverage Supabase for its robust security features, including row-level security and secure authentication.
            </li>
            <li>
              <strong>Data Encryption:</strong> All data, both at rest and in transit, is encrypted to protect it from unauthorized access.
            </li>
            <li>
              <strong>Secure Connections:</strong> We enforce HTTPS on all connections to our platform to ensure secure communication.
            </li>
            <li>
              <strong>Regular Security Audits:</strong> Our platform undergoes regular security audits to identify and address potential vulnerabilities.
            </li>
          </ul>
          <p className="mt-6">
            When you build with HeHo, you can be confident that your chatbot and your data are secure.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SecureAIChatbotBuilderPage;
