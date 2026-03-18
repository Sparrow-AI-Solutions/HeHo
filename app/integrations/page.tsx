import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"

const integrations = [
  {
    name: "OpenRouter",
    description: "Access to 35+ free and premium AI models including Llama, Mistral, Qwen, Arcee Trinity, and more",
    features: [
      "35+ free AI models available",
      "Switch between models anytime",
      "No API key required for free tier",
      "Premium models available with API key",
      "Model context windows up to 131,072 tokens",
    ],
    status: "Active",
  },
  {
    name: "Supabase",
    description: "Connect your Supabase database for secure data storage, authentication, and autonomous backend operations",
    features: [
      "Email and OAuth authentication",
      "Row-level security (RLS) for data isolation",
      "Real-time subscriptions and webhooks",
      "PostgreSQL database with full SQL support",
      "Automated backups and disaster recovery",
    ],
    status: "Active",
  },
  {
    name: "REST API",
    description: "Programmatic access to HeHo's chatbot management, database operations, and autonomous backend control",
    features: [
      "Chatbot creation and management",
      "Database CRUD operations (read, add, edit, delete)",
      "Table creation and connection",
      "User verification and API key management",
      "Complete audit logging and monitoring",
    ],
    status: "Active",
  },
  {
    name: "Custom Databases",
    description: "Connect to any PostgreSQL or MySQL database through Supabase for flexible data management",
    features: [
      "Support for PostgreSQL and MySQL",
      "Full database schema access",
      "Query builder and custom queries",
      "Automated backup support",
      "Migration tools available",
    ],
    status: "Beta",
  },
]

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-5xl font-bold text-foreground mb-6 text-center">Integrations</h1>
          <p className="text-lg text-muted-foreground text-center mb-4">
            HeHo integrates seamlessly with the best tools to power your AI chatbots and autonomous backends
          </p>
          <p className="text-sm text-muted-foreground text-center mb-16">
            Connect your data, deploy your AI, and scale with confidence
          </p>

          <div className="grid grid-cols-1 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.name} className="p-8 border-border/50 bg-card/50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <h2 className="text-2xl font-bold text-foreground">{integration.name}</h2>
                    <p className="text-muted-foreground text-sm mt-1">{integration.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                      integration.status === "Active" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                    }`}
                  >
                    {integration.status}
                  </span>
                </div>
                <div className="space-y-2 mt-6">
                  {integration.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-16 p-8 border-border/50 bg-card/50">
            <h2 className="text-2xl font-bold text-foreground mb-4">Coming Soon</h2>
            <p className="text-muted-foreground mb-4">
              We're constantly expanding HeHo's integration ecosystem. Here's what's on our roadmap:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong className="text-foreground">Slack Integration</strong> - Deploy chatbots directly in Slack</li>
              <li>• <strong className="text-foreground">Discord Integration</strong> - Build Discord bots with AI backends</li>
              <li>• <strong className="text-foreground">Webhook Support</strong> - Trigger autonomous operations from external events</li>
              <li>• <strong className="text-foreground">Zapier Integration</strong> - Connect HeHo to 5,000+ apps</li>
              <li>• <strong className="text-foreground">Custom Connectors</strong> - Build your own integrations with our SDK</li>
            </ul>
          </Card>

          <div className="text-center text-sm text-muted-foreground mt-12 pt-8 border-t border-border/50">
            <p>HeHo is defined and owned by Sparrow AI Solutions 2026 HeHo. All rights reserved.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
