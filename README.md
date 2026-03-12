# HeHo 🚀  
**Fully Open-Source, No-Code AI Chatbot Builder**

HeHo is a completely open-source platform for building powerful, context-aware AI chatbots that connect directly to **your own Supabase database**. You don’t need to clone any repository or set up infrastructure locally—everything works directly from the web.

---

## ✨ Key Features

- 🧩 No-code AI chatbot builder  
- 🔓 100% open-source  
- 🗄️ Connect **your own Supabase database**  
- 🤖 Powered by **OpenRouter** (Free AI models)  
- 🔐 Fine-grained database permissions  
- 📖 Chatbots can read data and create new entries  
- 🧠 Reduced AI hallucinations via controlled DB access  
- 🔮 Roadmap: edit data & AI-generated chatbot UIs  

---

## 🚀 Getting Started (No Installation Required)

### 1️⃣ Visit HeHo

Go to 👉 **https://heho.vercel.app**

No local setup, no cloning, no configuration files.

---

### 2️⃣ Sign Up

- Sign up using email authentication  
- Supabase Auth securely manages your account  
- Email verification is required for security  

Your HeHo account is created instantly.

---

### 3️⃣ Connect Your Supabase Project

HeHo works with **your own Supabase account**, not ours.

#### Requirements:
- A Supabase account → https://supabase.com  
- A new or existing Supabase project  

#### How it works:
- Connect Supabase via secure OAuth  
- HeHo automatically:
  - Creates all required default tables
  - Sets up Row Level Security (RLS)
  - Configures safe database permissions  

> ✅ No manual SQL or table setup required.

---

### 4️⃣ Add Your OpenRouter API Key

To power your chatbot’s AI:

1. Create an account at https://openrouter.ai  
2. Generate an API key  
3. Paste the key into HeHo’s dashboard  

This unlocks **Free AI models** including Llama, Mistral, and Gemma.

---

## 🤖 Building Your First Chatbot

- Define your chatbot’s purpose  
- Upload or describe your project context  
- Choose AI models via OpenRouter  
- Select database permissions:
  - Read data
  - Create new entries  
- Start chatting in real time  

All actions are permission-based and auditable.

---

## 🔐 Security & Data Ownership

- Your data stays **inside your Supabase**
- API keys are encrypted at rest (AES-256)
- HTTPS/TLS encryption in transit
- Strict permission boundaries prevent misuse

Security rule:
\\[
\text{AI Access} \le \text{Explicitly Granted Permissions}
\\]

---

## 🧠 Hallucination Reduction

HeHo minimizes AI hallucinations by:
- Restricting AI responses to verified database queries
- Blocking unauthorized operations
- Enforcing schema-aware actions

This ensures answers are grounded in **real data**, not guesses.

---

## 🔮 What’s Coming Next

- 🔑 HeHo API keys for no-code app integrations  
- ✏️ Permission-based editing of existing data  
- 🎨 AI-generated chatbot UIs  
- 👥 Team collaboration & roles  

---

## 🌍 Open Source & Transparency

HeHo is fully open-source.  
You can inspect, audit, and contribute to the codebase at any time.

---

## 📜 License

MIT License © 2026 HeHo AI

---

**No code. No lock-in. Your data, your AI.**
