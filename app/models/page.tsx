import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const aiModels = [
  {
    name: "Arcee AI: Trinity Large Preview",
    id: "arcee-ai/trinity-large-preview:free",
    provider: "Arcee AI",
    contextSize: "131,072",
    bestFor: "High-performance reasoning",
  },
  {
    name: "Arcee AI: Trinity Mini",
    id: "arcee-ai/trinity-mini:free",
    provider: "Arcee AI",
    contextSize: "131,072",
    bestFor: "Fast, efficient responses",
  },
  {
    name: "Liquid: LFM 2.5 1.2B Thinking",
    id: "liquid/lfm-2.5-1.2b-thinking:free",
    provider: "Liquid",
    contextSize: "32,768",
    bestFor: "Complex step-by-step reasoning",
  },
  {
    name: "Qwen: Qwen3 Next 80B Instruct",
    id: "qwen/qwen3-next-80b-a3b-instruct:free",
    provider: "Qwen",
    contextSize: "131,072",
    bestFor: "Large-scale general purpose",
  },
  {
    name: "Venice: Dolphin Mistral 24B",
    id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    provider: "Venice",
    contextSize: "32,768",
    bestFor: "Uncensored, creative tasks",
  },
  {
    name: "Nous: Hermes 3 Llama 3.1 405B",
    id: "nousresearch/hermes-3-llama-3.1-405b:free",
    provider: "Nous",
    contextSize: "131,072",
    bestFor: "Instruction following, complex logic",
  },
  {
    name: "OpenRouter: Hunter Alpha",
    id: "openrouter/hunter-alpha",
    provider: "OpenRouter",
    contextSize: "128,000",
    bestFor: "Experimental high-quality output",
  },
]

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-5xl font-bold text-foreground mb-6 text-center">Free AI Models</h1>
          <p className="text-lg text-muted-foreground text-center mb-4">
            Powered by OpenRouter - All completely free, all available right now
          </p>
          <p className="text-sm text-muted-foreground text-center mb-16">
            Switch between models anytime in your chatbot settings. No cost, no limits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiModels.map((model) => (
              <Card
                key={model.id}
                className="p-4 border-border/50 bg-card/50 hover:border-white/30 hover:bg-card/80 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-sm">{model.name}</h3>
                    <p className="text-xs text-muted-foreground">{model.provider}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Free
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{model.bestFor}</p>
                <p className="text-xs text-muted-foreground">Context: {model.contextSize}</p>
              </Card>
            ))}
          </div>

          <div className="mt-16 p-8 bg-white/5 border border-white/20 rounded-lg">
            <h2 className="text-2xl font-bold text-foreground mb-4">Recommendations</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                • <strong className="text-foreground">Hermes 3 405B</strong> - Best for complex logic and instructions
              </li>
              <li>
                • <strong className="text-foreground">Trinity Large</strong> - Excellent high-performance reasoning
              </li>
              <li>
                • <strong className="text-foreground">LFM 2.5 Thinking</strong> - Best for step-by-step problem solving
              </li>
              <li>
                • <strong className="text-foreground">Qwen3 Next 80B</strong> - Powerful general-purpose assistant
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
