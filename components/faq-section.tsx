"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is HeHo?",
    answer:
      "HeHo is an AI-powered platform for building both intelligent chatbots and autonomous backends. It allows you to connect your own data from Supabase, upload project context, and deploy AI solutions that understand your business and can act on your data.",
  },
  {
    question: "Can I use HeHo as a backend for my own app?",
    answer:
      "Absolutely. HeHo provides a complete AI-driven backend that you can connect to any web or mobile application via our REST API. You can use it to manage data, generate custom API endpoints, and power your application's logic with autonomous AI agents.",
  },
  {
    question: "What AI models can I use?",
    answer:
      "HeHo provides access to over 35 AI models from OpenRouter, including Llama, Mistral, and Gemma. These models power both the conversational chatbots and the autonomous backend logic, allowing for sophisticated data reasoning and action execution.",
  },
  {
    question: "How does the Supabase integration work?",
    answer:
      "You can connect your Supabase project to HeHo securely. The AI can then be granted permissions to read, write, and even create tables in your database. This powers both the chatbot's memory and the backend's ability to perform autonomous data operations for your other applications.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, your data is secure. HeHo uses industry-standard encryption and security practices. With our Supabase integration, you maintain full control over your data in your own database, with fine-grained permissions for the AI.",
  },
  {
    question: "Can I customize the interface?",
    answer:
      "Yes. While we provide a ready-to-use chatbot interface, our primary focus is on providing a powerful backend and API. You can use our REST API to build your own custom chat interface or integrate HeHo's AI capabilities into any existing application.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about HeHo's AI chatbot and backend builder.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto mb-12">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left text-lg font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

      </div>
    </section>
  )
}
