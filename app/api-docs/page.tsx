
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ApiDocsPage = () => {
  const curlVerify = `curl -X POST https://heho.vercel.app/api/verify-user \ 
  -H "Authorization: Bearer YOUR_HEHO_API_KEY"`;

  const fetchVerify = `fetch('https://heho.vercel.app/api/verify-user', { 
  method: 'POST', 
  headers: { 
    'Authorization': 'Bearer YOUR_HEHO_API_KEY' 
  } 
}) 
.then(response => response.json()) 
.then(data => console.log(data)) 
.catch(error => console.error('Error:', error));`;

  const curlChat = `curl -X POST https://heho.vercel.app/api/aichat \ 
  -H "Authorization: Bearer YOUR_HEHO_API_KEY" \ 
  -H "Content-Type: application/json" \ 
  -d '{
    "chatbotId": "YOUR_CHATBOT_ID",
    "history": [{ "role": "user", "content": "Who are you?" }, { "role": "assistant", "content": "I am an AI assistant." }],
    "messages": [{ "role": "user", "content": "What can you do?" }]
  }'`;

  const fetchChat = `const chatbotId = 'YOUR_CHATBOT_ID';
const history = [{ role: 'user', content: 'Who are you?' }, { role: 'assistant', content: 'I am an AI assistant.' }];
const messages = [{ role: 'user', content: 'What can you do?' }];

fetch('https://heho.vercel.app/api/aichat', { 
  method: 'POST', 
  headers: { 
    'Authorization': 'Bearer YOUR_HEHO_API_KEY', 
    'Content-Type': 'application/json'
  }, 
  body: JSON.stringify({ chatbotId, history, messages })
}) 
.then(response => response.json()) 
.then(data => console.log('AI Reply:', data.reply)) 
.catch(error => console.error('Error:', error));`;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">Heho API Documentation</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Welcome to the Heho API. Use your API key to integrate Heho services into your own applications.
        </p>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>Your API key must be included in the Authorization header of every request.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Get your API key from the <a href="/settings" className="text-blue-500 hover:underline">Settings</a> page.</p>
          <pre className="mt-2 bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
            <code>Authorization: Bearer YOUR_HEHO_API_KEY</code>
          </pre>
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-500">
            <p className="font-bold text-yellow-800 dark:text-yellow-300">Warning</p>
            <p className="text-yellow-700 dark:text-yellow-400">Your API key is a secret! Do not share it publicly or commit it to version control.</p>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-3xl font-bold tracking-tight mb-6">API Endpoints</h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center"><Badge variant="secondary" className="mr-2">POST</Badge> /api/verify-user</CardTitle>
          <CardDescription>Verifies your API key and returns your complete user profile from the database.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-semibold mb-2">Description</p>
          <p className="mb-4">This endpoint is a simple way to confirm that your API key is working correctly. It retrieves and returns the full user object associated with the key.</p>
          <p className="font-semibold mb-2">Response Body (on success)</p>
          <p className="mb-4">Returns a JSON object representing the authenticated user.</p>
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Example: cURL</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto"><code>{curlVerify}</code></pre>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Example: JavaScript (fetch)</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto"><code>{fetchVerify}</code></pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Badge variant="secondary" className="mr-2">POST</Badge> /api/aichat</CardTitle>
          <CardDescription>Send a message to one of your chatbots and receive an AI-generated reply.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-semibold mb-2">Description</p>
          <p className="mb-4">This endpoint allows you to interact with a specific chatbot you own. You must provide the chatbot's ID and a standard messages array. It supports the full functionality of the internal chat, including reading from and writing to connected databases.</p>
          <p className="font-semibold mb-2">Request Body (JSON)</p>
          <Table className="mb-4">
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><code>chatbotId</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>The unique ID of the chatbot you want to interact with.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>messages</code></TableCell>
                <TableCell>array</TableCell>
                <TableCell>An array of new message objects (e.g., `[{ role: 'user', content: 'Hello' }]`).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>history</code></TableCell>
                <TableCell>array (optional)</TableCell>
                <TableCell>An array of previous messages to provide conversation context.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="font-semibold mb-2">Response Body (on success)</p>
          <p className="mb-4">Returns a JSON object containing the AI's reply: `{ "reply": "The AI response here." }`</p>
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Example: cURL</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto"><code>{curlChat}</code></pre>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Example: JavaScript (fetch)</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto"><code>{fetchChat}</code></pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDocsPage;
