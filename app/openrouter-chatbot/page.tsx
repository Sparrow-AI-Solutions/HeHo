
import React from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const OpenRouterChatbotPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Create an OpenRouter Chatbot with HeHo</h1>
          <p className="text-lg mb-4">
            Unlock the full potential of AI with HeHo's integration with OpenRouter. Access a diverse range of large language models (LLMs) to power your chatbot and deliver the best possible conversational experience.
          </p>
          <h2 className="text-2xl font-bold mt-6 mb-2">The HeHo and OpenRouter Advantage:</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Model Flexibility:</strong> Choose from a wide variety of LLMs available through OpenRouter, including models from OpenAI, Google, and more.
            </li>
            <li>
              <strong>Optimized Performance:</strong> HeHo is optimized to work seamlessly with OpenRouter, ensuring fast response times and a smooth user experience.
            </li>
            <li>
              <strong>Cost-Effective:</strong> OpenRouter's competitive pricing, combined with HeHo's efficient platform, helps you keep costs low.
            </li>
            <li>
              <strong>Future-Proof:</strong> As new and better models become available on OpenRouter, you can easily switch to them within the HeHo platform.
            </li>
          </ul>
          <p className="mt-6">
            Don't be limited to a single AI model. Build a more capable and flexible chatbot with HeHo and OpenRouter.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OpenRouterChatbotPage;
