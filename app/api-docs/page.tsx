'use client'

import Link from "next/link";
import { ArrowLeft, Book, Terminal } from "lucide-react";

export default function ApiDocsPage() {
  const curlCreateTable = `curl -X POST YOUR_APP_URL/api/v1/chatbots \\ 
  -H "Authorization: Bearer YOUR_HEHO_API_KEY" \\ 
  -H "Content-Type: application/json" \\ 
  -d '{ 
    "name": "My API-Powered Bot", 
    "goal": "Lead Capture", 
    "description": "This chatbot is designed to capture leads from our website. It should ask for the user\'s name, email, and company, and then record this information in the leads table. It must be professional and concise.", 
    "model": "mistralai/mistral-7b-instruct:free", 
    "tone": "professional",
    "db_meta": { 
      "tables": { 
        "leads": { "can_read": true, "can_insert": true } 
      } 
    } 
  }'`;

  const curlGetTables = `curl -X GET YOUR_APP_URL/api/v1/chatbots \\ 
  -H "Authorization: Bearer YOUR_HEHO_API_KEY"`;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/app/settings" className="text-indigo-400 hover:underline mb-8 block">
          <ArrowLeft className="inline-block mr-2 h-4 w-4" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <Book className="h-10 w-10 text-indigo-400" />
          <h1 className="text-5xl font-bold tracking-tight">Heho API Documentation</h1>
        </div>
        <p className="text-gray-400 mb-12 text-lg">
          Welcome to the Heho API. This guide will walk you through everything you need to build powerful integrations.
        </p>

        <div className="space-y-16">
          {/* Authentication */}
          <section id="authentication">
            <h2 className="text-3xl font-semibold border-b border-gray-700 pb-3 mb-6 text-gray-100">Authentication</h2>
            <p className="mb-4 text-gray-300">
              The Heho API uses API keys to authenticate requests. You can view and manage your API keys in the <Link href="/app/settings" className="text-indigo-400 hover:underline">Settings</Link> page. All API requests must be made over <code className="bg-gray-800 px-1 py-0.5 rounded">HTTPS</code>.
            </p>
            <p className="text-gray-300">
              To authenticate, provide your API key in the <code className="bg-gray-800 px-1 py-0.5 rounded">Authorization</code> header of your request, using the <code className="bg-gray-800 px-1 py-0.5 rounded">Bearer</code> schema.
            </p>
             <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mt-4">
                <p className="font-mono text-sm text-gray-400">Authorization: Bearer YOUR_HEHO_API_KEY</p>
            </div>
          </section>

          {/* Create Chatbot */}
          <section id="create-chatbot">
            <h2 className="text-3xl font-semibold border-b border-gray-700 pb-3 mb-6 text-gray-100">Create a Chatbot</h2>
            <p className="mb-4">
              <span className="font-semibold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-md text-sm">POST</span> <code className="ml-3 bg-gray-800 px-3 py-1 rounded-md font-mono">/api/v1/chatbots</code>
            </p>
            <p className="mb-6 text-gray-300">
              This is the primary endpoint for creating and configuring a new chatbot. It allows for detailed customization of the bot\'s behavior, appearance, and data access permissions.
            </p>
            <h3 className="text-xl font-semibold mb-3 text-gray-200">Request Body Parameters</h3>
            <ul className="list-disc list-inside space-y-3 mb-6 text-gray-300">
                <li><code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-100">name</code> (string, <span className="text-red-400">required</span>): The public name of your chatbot.</li>
                <li><code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-100">goal</code> (string, <span className="text-red-400">required</span>): The chatbot\'s primary function (e.g., "Customer Support", "Sales Assistant").</li>
                <li><code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-100">description</code> (string, <span className="text-red-400">required</span>): A detailed prompt outlining the chatbot\'s purpose, constraints, and personality. Must be at least 200 characters.</li>
                <li><code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-100">model</code> (string, <span className="text-red-400">required</span>): The AI model the chatbot will use.</li>
                <li><code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-100">tone</code> (string, optional): The conversational tone. Defaults to <code className="bg-gray-800 px-1 py-0.5 rounded">Friendly</code>.</li>
                <li><code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-100">theme</code> (string, optional): The color theme for the widget. Defaults to <code className="bg-gray-800 px-1 py-0.5 rounded">light</code>.</li>
                <li><code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-100">db_meta</code> (object, optional): Defines database table permissions. Structure: <code className="bg-gray-800 text-xs px-1 py-0.5 rounded">{`{ \"tables\": { \"table_name\": { \"can_read\": boolean, \"can_insert\": boolean } } }`}</code>.</li>
            </ul>
             <h3 className="text-xl font-semibold mb-3 text-gray-200">Example: Create a Lead Capture Bot</h3>
             <div className="bg-gray-900 border border-gray-700 rounded-lg">
                <div className="p-4 border-b border-gray-700 flex items-center gap-2">
                    <Terminal className="h-5 w-5"/>
                    <span className="font-semibold">cURL Request</span>
                </div>
                <pre className="p-4 text-sm overflow-x-auto"><code>{curlCreateTable}</code></pre>
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-3 text-gray-200">Success Response (200 OK)</h3>
            <p className="text-muted-foreground mb-4">Upon successful creation, the API returns the new chatbot\'s ID and a direct link to its deployment page.</p>
            <div className="bg-gray-900 border border-gray-700 rounded-lg">
                 <pre className="p-4 text-sm overflow-x-auto"><code>{`{
  "message": "Chatbot created and deployed successfully!",
  "chatbotId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "deploymentLink": "YOUR_APP_URL/deploy/a1b2c3d4-e5f6-7890-1234-567890abcdef"
}`}</code></pre>
            </div>
          </section>
          
           {/* Get Tables */}
          <section id="get-tables">
            <h2 className="text-3xl font-semibold border-b border-gray-700 pb-3 mb-6 text-gray-100">List Available Tables</h2>
            <p className="mb-4">
              <span className="font-semibold bg-sky-500/20 text-sky-300 px-3 py-1 rounded-md text-sm">GET</span> <code className="ml-3 bg-gray-800 px-3 py-1 rounded-md font-mono">/api/v1/chatbots</code>
            </p>
            <p className="text-gray-300 mb-6">
              This endpoint is a utility to fetch a list of all database tables available for your chatbot to use. This includes both the default tables provided by Heho and any tables that you have connected from your own Supabase instance.
            </p>
            <h3 className="text-xl font-semibold mb-3 text-gray-200">Example: Fetching all Table Names</h3>
            <div className="bg-gray-900 border border-gray-700 rounded-lg">
                <div className="p-4 border-b border-gray-700 flex items-center gap-2">
                    <Terminal className="h-5 w-5"/>
                    <span className="font-semibold">cURL Request</span>
                </div>
                <pre className="p-4 text-sm overflow-x-auto"><code>{curlGetTables}</code></pre>
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-3 text-gray-200">Success Response (200 OK)</h3>
            <p className="text-muted-foreground mb-4">Returns a JSON object containing a list of all available table names.</p>
             <div className="bg-gray-900 border border-gray-700 rounded-lg">
                <pre className="p-4 text-sm overflow-x-auto"><code>{`{
  "tables": [
    "products",
    "leads",
    "customer_queries",
    "sales",
    "your_custom_table_from_supabase",
    "another_custom_table"
  ]
}`}</code></pre>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
