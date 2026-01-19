
import React from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const HehoVsBotpressPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">HeHo vs. Botpress: Why HeHo is the Superior Choice</h1>
          <p className="text-lg mb-4">
            When it comes to building AI chatbots, both HeHo and Botpress offer powerful platforms. However, HeHo stands out with its seamless integration, ease of use, and advanced features designed for startups and developers who want to move fast.
          </p>
          <h2 className="text-2xl font-bold mt-6 mb-2">Key Advantages of HeHo:</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>No-Code Simplicity:</strong> Get started in minutes with our intuitive no-code builder. You don't need to be a developer to create a powerful chatbot.
            </li>
            <li>
              <strong>One-Click Deployment:</strong> Deploy your chatbot instantly with a single click. No complex configurations or servers to manage.
            </li>
            <li>
              <strong>Powered by the Best:</strong> We leverage the power of OpenRouter to give you access to a wide range of cutting-edge AI models, and Supabase for a secure and scalable database.
            </li>
            <li>
              <strong>Startup Friendly:</strong> HeHo is built for startups. We offer a generous free plan and scalable pricing to grow with you.
            </li>
            <li>
              <strong>Secure and Reliable:</strong> Security is our top priority. With HeHo, you get a secure AI chatbot builder that you can trust.
            </li>
          </ul>
          <p className="mt-6">
            While Botpress is a capable open-source platform, it often requires more technical expertise and setup time. HeHo's managed platform lets you focus on what matters most: building a great user experience.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HehoVsBotpressPage;
