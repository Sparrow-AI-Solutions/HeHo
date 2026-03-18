# Bacillus (formerly HeHo) 🚀  
**The Ultimate AI-Powered Backend & Database Orchestrator**

Bacillus is a powerful, context-aware backend-as-a-service (BaaS) platform designed to bridge the gap between AI, APIs, and your data. It allows you to build sophisticated AI-driven backends that connect directly to **your own Supabase database**, enabling autonomous data management, custom API generation, and intelligent chatbot integration without writing a single line of code.

---

## ✨ Key Features

### 🛠️ AI-Powered Backend Provider
- **Autonomous DB Management**: Connect your Supabase database and let AI read, write, and create tables based on high-level business logic.
- **Custom API Generation**: Automatically generate and deploy RESTful API endpoints that interact with your data and AI models.
- **Project Context Awareness**: Upload detailed project descriptions so the entire backend understands your full business context and logic.

### 🤖 Advanced Chatbot Integration
- **Context-Aware AI**: Powered by **OpenRouter**, giving you access to 35+ top-tier AI models (Llama, Mistral, GPT, etc.).
- **Grounded Responses**: Drastically reduce AI hallucinations by grounding the AI's knowledge in your actual database records and backend logic.
- **No-Code Interface**: Create and deploy intelligent agents in minutes via a user-friendly dashboard.

### 🔐 Security & Control
- **Fine-Grained Permissions**: You decide exactly which tables your AI can access and whether it can perform `read`, `add`, `edit`, or `delete` operations.
- **Data Sovereignty**: Your data never leaves your Supabase project. Bacillus only acts as the intelligent orchestration layer.
- **Encrypted Keys**: All API keys are encrypted at rest using industry-standard AES-256 encryption.

---

## 🛠️ Tech Stack

Bacillus is built with a modern, high-performance stack:
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **AI Orchestration**: [OpenRouter API](https://openrouter.ai/)
- **3D Elements**: [Three.js](https://threejs.org/) (via React Three Fiber)

---

## 🔌 Bacillus API (v1)

Bacillus provides a robust REST API for developers to integrate AI backend services and database management into their own applications.

### Authentication
All API requests require a Bearer token in the Authorization header:
```bash
Authorization: Bearer YOUR_BACILLUS_API_KEY
```

### Endpoints

#### 1. AI & Chat Services
- **`POST /api/aichat`**: Send a message to an AI agent and receive an intelligent, data-grounded reply.
- **`POST /api/verify-user`**: Verifies your API key and returns the complete user profile.

#### 2. Backend & Database Management
- **`GET /api/v1/chatbots/manage`**: List all active AI agents and connected database structures.
- **`POST /api/v1/chatbots/manage`**: Create and deploy a new AI-driven backend agent.
- **`DELETE /api/v1/chatbots/manage`**: Remove an existing agent or backend configuration.

---

## 🚀 Getting Started

### 1. Connect Your Data
Sign up at the dashboard and connect your Supabase project via OAuth. Bacillus will handle the initial handshake and permission setup.

### 2. Configure AI & Logic
Add your OpenRouter API key and upload your project documentation to define the "brain" of your backend.

### 3. Deploy & Integrate
Use the generated API endpoints or the built-in chatbot interface to power your applications with autonomous AI capabilities.

---

## 📜 License
Bacillus is 100% open-source and licensed under the **MIT License**.

---
**No code. No lock-in. Your data, your AI, your Backend.**
