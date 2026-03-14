# HeHo 🚀  
**The Ultimate Open-Source, No-Code AI Chatbot & Database Builder**

HeHo is a powerful, context-aware platform designed to bridge the gap between AI and your data. It allows you to build sophisticated AI chatbots that connect directly to **your own Supabase database**, enabling them to read, write, and manage data without writing a single line of code.

---

## ✨ Key Features

### 🤖 Advanced Chatbot Builder
- **No-Code Interface**: Create and deploy chatbots in minutes via a user-friendly dashboard.
- **Context-Aware AI**: Powered by **OpenRouter**, giving you access to 35+ top-tier AI models (Llama, Mistral, GPT, etc.).
- **Grounded Responses**: Drastically reduce AI hallucinations by grounding the chatbot's knowledge in your actual database records.

### 🗄️ Database Empowerment
- **Bring Your Own DB**: Connect your existing Supabase project or create a new one directly through HeHo.
- **Dynamic Data Interaction**: Your chatbots aren't just for talking—they can **read** from and **write** to your database tables based on the permissions you grant.
- **Automated Schema Setup**: HeHo can automatically create standard tables (Products, Leads, Customer Queries, Sales) and configure Row Level Security (RLS) for you.

### 🔐 Security & Control
- **Fine-Grained Permissions**: You decide exactly which tables your AI can access and whether it can perform `read`, `add`, `edit`, or `delete` operations.
- **Data Sovereignty**: Your data never leaves your Supabase project. HeHo only acts as the intelligent orchestration layer.
- **Encrypted Keys**: All API keys are encrypted at rest using industry-standard AES-256 encryption.

---

## 🛠️ Tech Stack

HeHo is built with a modern, high-performance stack:
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **AI Orchestration**: [OpenRouter API](https://openrouter.ai/)
- **3D Elements**: [Three.js](https://threejs.org/) (via React Three Fiber)

---

## 🔌 HeHo API (v1)

HeHo provides a robust REST API for developers to integrate chatbot and database management into their own applications.

### Authentication
All API requests require a Bearer token in the Authorization header:
```bash
Authorization: Bearer YOUR_HEHO_API_KEY
```

### Endpoints

#### 1. Chatbot Management
- **`GET /api/v1/chatbots`**: List all available database tables connected to your account.
- **`POST /api/v1/chatbots`**: Create and deploy a new chatbot.
  - **Payload**: `{ name, goal, description, model, tone, theme, db_meta }`

#### 2. Database Operations
- **`GET /api/v1/database/manage`**: Fetch all connected tables and their detailed schemas (columns, types, requirements).
- **`POST /api/v1/database/manage`**: Perform CRUD operations on your connected database.
  - **Actions**: `read`, `add`, `edit`, `delete`
  - **Example (Add Row)**:
    ```json
    {
      "action": "add",
      "tableName": "leads",
      "data": { "name": "John Doe", "email": "john@example.com" }
    }
    ```

---

## 🚀 Getting Started

### 1. Connect Your Data
Sign up at [heho.vercel.app](https://heho.vercel.app) and connect your Supabase project via OAuth. HeHo will handle the initial handshake and permission setup.

### 2. Configure AI
Add your OpenRouter API key in the settings to unlock the full potential of dozens of AI models.

### 3. Build & Deploy
Use the "Create Chatbot" wizard to define your bot's personality, select its data access levels, and get a public deployment link instantly.

---

## 🔮 Roadmap
- [ ] **AI-Generated Chatbot UIs**: Let the AI design the look and feel of your chat interface.
- [ ] **Advanced Analytics**: Track chatbot performance and user interactions in real-time.
- [ ] **Multi-DB Support**: Connect to PostgreSQL, MySQL, and more beyond Supabase.
- [ ] **Team Collaboration**: Shared workspaces for organizations.

---

## 📜 License
HeHo is 100% open-source and licensed under the **MIT License**.

---
**No code. No lock-in. Your data, your AI.**
