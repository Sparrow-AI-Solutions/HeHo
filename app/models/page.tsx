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
    bestFor: "High-performance reasoning and complex tasks",
    features: ["Excellent reasoning", "Large context window", "Fast inference"],
  },
  {
    name: "Arcee AI: Trinity Mini",
    id: "arcee-ai/trinity-mini:free",
    provider: "Arcee AI",
    contextSize: "131,072",
    bestFor: "Fast, efficient responses with good quality",
    features: ["Fast inference", "Efficient", "Good quality"],
  },
  {
    name: "Liquid: LFM 2.5 1.2B Thinking",
    id: "liquid/lfm-2.5-1.2b-thinking:free",
    provider: "Liquid",
    contextSize: "32,768",
    bestFor: "Complex step-by-step reasoning and problem-solving",
    features: ["Step-by-step reasoning", "Transparent thinking", "Problem-solving"],
  },
  {
    name: "Qwen: Qwen3 Next 80B Instruct",
    id: "qwen/qwen3-next-80b-a3b-instruct:free",
    provider: "Qwen",
    contextSize: "131,072",
    bestFor: "Large-scale general-purpose tasks and instruction following",
    features: ["Powerful", "Instruction-following", "Large context"],
  },
  {
    name: "Venice: Dolphin Mistral 24B",
    id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    provider: "Venice",
    contextSize: "32,768",
    bestFor: "Uncensored responses and creative tasks",
    features: ["Creative", "Uncensored", "Versatile"],
  },
  {
    name: "Nous: Hermes 3 Llama 3.1 405B",
    id: "nousresearch/hermes-3-llama-3.1-405b:free",
    provider: "Nous",
    contextSize: "131,072",
    bestFor: "Instruction following, complex logic, and detailed reasoning",
    features: ["Instruction-following", "Complex logic", "Detailed reasoning"],
  },
  {
    name: "OpenRouter: Hunter Alpha",
    id: "openrouter/hunter-alpha",
    provider: "OpenRouter",
    contextSize: "128,000",
    bestFor: "Experimental high-quality output and cutting-edge performance",
    features: ["Experimental", "High-quality", "Cutting-edge"],
  },
  {
    name: "Meta: Llama 3.1 70B",
    id: "meta-llama/llama-3.1-70b-instruct:free",
    provider: "Meta",
    contextSize: "131,072",
    bestFor: "Balanced performance across all tasks",
    features: ["Balanced", "Reliable", "Well-rounded"],
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
            Powered by OpenRouter - 35+ completely free models, all available right now
          </p>
          <p className="text-sm text-muted-foreground text-center mb-16">
            Switch between models anytime in your chatbot settings. No cost, no limits, no vendor lock-in.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
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
                <p className="text-xs text-muted-foreground mb-3">{model.bestFor}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {model.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Context: {model.contextSize}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <Card className="p-8 border-border/50 bg-card/50">
              <h2 className="text-2xl font-bold text-foreground mb-4">Model Recommendations</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <strong className="text-foreground">For Complex Reasoning:</strong> Hermes 3 405B or Trinity Large
                </li>
                <li>
                  <strong className="text-foreground">For Speed:</strong> Trinity Mini or Arcee AI models
                </li>
                <li>
                  <strong className="text-foreground">For Step-by-Step Logic:</strong> LFM 2.5 Thinking
                </li>
                <li>
                  <strong className="text-foreground">For General Purpose:</strong> Qwen3 Next 80B or Llama 3.1 70B
                </li>
                <li>
                  <strong className="text-foreground">For Creative Tasks:</strong> Dolphin Mistral 24B
                </li>
              </ul>
            </Card>

            <Card className="p-8 border-border/50 bg-card/50">
              <h2 className="text-2xl font-bold text-foreground mb-4">Why Free Models?</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <strong className="text-foreground">No Vendor Lock-in:</strong> Switch models anytime without restrictions
                </li>
                <li>
                  <strong className="text-foreground">Cost Effective:</strong> Build production-grade AI without expensive API fees
                </li>
                <li>
                  <strong className="text-foreground">Latest Technology:</strong> Access cutting-edge open-source models
                </li>
                <li>
                  <strong className="text-foreground">Full Control:</strong> Choose the model that best fits your use case
                </li>
                <li>
                  <strong className="text-foreground">Scalable:</strong> Unlimited usage with no per-request charges
                </li>
              </ul>
            </Card>
          </div>

          <Card className="p-8 border-primary/30 bg-primary/5">
            <h2 className="text-2xl font-bold text-foreground mb-4">How to Choose a Model</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Context Size:</strong> Larger context windows (131,072 tokens) allow the model to process more information at once. This is important for chatbots that need to reference long documents or extensive conversation history.
              </p>
              <p>
                <strong className="text-foreground">Inference Speed:</strong> Smaller models like Trinity Mini are faster but may be less capable. Larger models like Hermes 405B are more powerful but slower. Choose based on your latency requirements.
              </p>
              <p>
                <strong className="text-foreground">Task Specialization:</strong> Some models excel at reasoning, others at instruction-following, and others at creative tasks. Test different models with your specific use case to find the best fit.
              </p>
              <p>
                <strong className="text-foreground">Experimentation:</strong> HeHo makes it easy to switch models. Start with a recommendation and experiment to find what works best for your chatbot or backend.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
