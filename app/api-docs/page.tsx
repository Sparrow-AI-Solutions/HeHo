
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ApiDocsPage = () => {
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
            <code>{'Authorization: Bearer YOUR_HEHO_API_KEY'}</code>
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
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Example: cURL</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
              <code>
{`curl -X POST https://heho.vercel.app/api/verify-user \\ 
  -H "Authorization: Bearer YOUR_HEHO_API_KEY"`}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center"><Badge variant="secondary" className="mr-2">POST</Badge> /api/aichat</CardTitle>
          <CardDescription>Send a message to one of your chatbots and receive an AI-generated reply.</CardDescription>
        </CardHeader>
        <CardContent>
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
                <TableCell>The unique ID of your chatbot. Find this on the chatbot's settings page.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>messages</code></TableCell>
                <TableCell>array</TableCell>
                <TableCell>An array of new message objects.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>history</code></TableCell>
                <TableCell>array (optional)</TableCell>
                <TableCell>An array of previous messages for context.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Example: cURL</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
              <code>
{`curl -X POST https://heho.vercel.app/api/aichat \\ 
  -H "Authorization: Bearer YOUR_HEHO_API_KEY" \\ 
  -H "Content-Type: application/json" \\ 
  -d '{ 
    "chatbotId": "YOUR_CHATBOT_ID", 
    "messages": [{"role": "user", "content": "Hello?"}] 
  }'`}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-3xl font-bold tracking-tight mb-6">Chatbot Management</h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center"><Badge variant="secondary" className="mr-2">POST</Badge> /api/v1/chatbots/manage</CardTitle>
          <CardDescription>Create a new chatbot with specific configuration and data sources.</CardDescription>
        </CardHeader>
        <CardContent>
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
                <TableCell><code>name</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>The name of your chatbot (Required).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>goal</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>The primary goal of the chatbot (Required).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>description</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>A detailed description/prompt (Min 200 characters) (Required).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>model</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>AI model ID (Required). Examples: qwen/qwen3-next-80b-a3b-instruct:free, arcee-ai/trinity-large-preview:free</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>tone</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>Chatbot tone (Optional, defaults to 'professional'). Values: friendly, professional, strict</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>theme</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>UI theme name (Optional, defaults to 'sky'). Values: twilight, sunrise, ocean, forest, grape, rose, sky, candy</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <h4 className="font-semibold text-lg mb-2 mt-6">Data Source Configuration (All Optional)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Configure up to 3 data sources. If not provided, fields default to null/false.</p>
          
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
                <TableCell><code>data_table_1</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>Name of the first data source table (Optional, defaults to null).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>data_table_1_read</code></TableCell>
                <TableCell>boolean</TableCell>
                <TableCell>Allow chatbot to read from table 1 (Optional, defaults to false).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>data_table_1_write</code></TableCell>
                <TableCell>boolean</TableCell>
                <TableCell>Allow chatbot to write/insert data to table 1 (Optional, defaults to false).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>data_table_1_edit</code></TableCell>
                <TableCell>boolean</TableCell>
                <TableCell>Allow chatbot to edit/update existing records in table 1 (Optional, defaults to false).</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Example: cURL (Minimal)</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
              <code>
{`curl -X POST https://heho.vercel.app/api/v1/chatbots/manage \\ 
  -H "Authorization: Bearer YOUR_HEHO_API_KEY" \\ 
  -H "Content-Type: application/json" \\ 
  -d '{ 
    "name": "My AI Assistant", 
    "goal": "Customer Support", 
    "description": "This is a very long description that must be at least 200 characters long to satisfy the validation requirements of the HeHo platform and ensure the AI has enough context to operate effectively...", 
    "model": "qwen/qwen3-next-80b-a3b-instruct:free"
  }'`}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center"><Badge variant="secondary" className="mr-2">GET</Badge> /api/v1/chatbots/manage</CardTitle>
          <CardDescription>Retrieve a list of all your chatbots.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Example: cURL</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
              <code>
{`curl -X GET https://heho.vercel.app/api/v1/chatbots/manage \\ 
  -H "Authorization: Bearer YOUR_HEHO_API_KEY"`}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center"><Badge variant="secondary" className="mr-2">DELETE</Badge> /api/v1/chatbots/manage</CardTitle>
          <CardDescription>Delete a specific chatbot by its ID.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Example: cURL (Query Parameter)</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
              <code>
{`curl -X DELETE "https://heho.vercel.app/api/v1/chatbots/manage?chatbotId=YOUR_CHATBOT_ID" \\ 
  -H "Authorization: Bearer YOUR_HEHO_API_KEY"`}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-3xl font-bold tracking-tight mb-6">Database Management</h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center"><Badge variant="secondary" className="mr-2">GET</Badge> /api/v1/database/manage</CardTitle>
          <CardDescription>Fetch all connected tables and their column structures.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Example: cURL</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
              <code>
{`curl -X GET https://heho.vercel.app/api/v1/database/manage \\ 
  -H "Authorization: Bearer YOUR_HEHO_API_KEY"`}
              </code>
            </pre>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Response Example</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
              <code>
{`{
  "tables": [
    {
      "table_name": "products",
      "columns": [
        { "column_name": "id", "data_type": "uuid", "required": true },
        { "column_name": "name", "data_type": "text", "required": true },
        { "column_name": "price", "data_type": "numeric", "required": false }
      ]
    }
  ]
}`}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center"><Badge variant="secondary" className="mr-2">POST</Badge> /api/v1/database/tables</CardTitle>
          <CardDescription>Create a new table in your Supabase database.</CardDescription>
        </CardHeader>
        <CardContent>
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
                <TableCell><code>tableName</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>The name of the table to create (Required). Must contain only letters, numbers, and underscores.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>columns</code></TableCell>
                <TableCell>array</TableCell>
                <TableCell>Array of column definitions (Required). Each column should have: name, type, primaryKey (optional), notNull (optional), defaultValue (optional).</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Example: cURL</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
              <code>
{`curl -X POST https://heho.vercel.app/api/v1/database/tables \\ 
  -H "Authorization: Bearer YOUR_HEHO_API_KEY" \\ 
  -H "Content-Type: application/json" \\ 
  -d '{ 
    "tableName": "customers", 
    "columns": [
      { "name": "id", "type": "uuid", "primaryKey": true },
      { "name": "name", "type": "text", "notNull": true },
      { "name": "email", "type": "text" }
    ]
  }'`}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center"><Badge variant="secondary" className="mr-2">POST</Badge> /api/v1/database/tables/connect</CardTitle>
          <CardDescription>Connect an existing table from your Supabase database to HeHo.</CardDescription>
        </CardHeader>
        <CardContent>
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
                <TableCell><code>tableName</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>The name of the existing table to connect (Required).</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Example: cURL</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
              <code>
{`curl -X POST https://heho.vercel.app/api/v1/database/tables/connect \\ 
  -H "Authorization: Bearer YOUR_HEHO_API_KEY" \\ 
  -H "Content-Type: application/json" \\ 
  -d '{ 
    "tableName": "existing_table"
  }'`}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center"><Badge variant="secondary" className="mr-2">DELETE</Badge> /api/v1/database/tables</CardTitle>
          <CardDescription>Delete a table from your Supabase database.</CardDescription>
        </CardHeader>
        <CardContent>
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
                <TableCell><code>tableName</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>The name of the table to delete (Required).</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Example: cURL</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
              <code>
{`curl -X DELETE https://heho.vercel.app/api/v1/database/tables \\ 
  -H "Authorization: Bearer YOUR_HEHO_API_KEY" \\ 
  -H "Content-Type: application/json" \\ 
  -d '{ 
    "tableName": "customers"
  }'`}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center"><Badge variant="secondary" className="mr-2">POST</Badge> /api/v1/database/manage</CardTitle>
          <CardDescription>Perform CRUD operations (Read, Add, Edit, Delete) on your connected tables.</CardDescription>
        </CardHeader>
        <CardContent>
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
                <TableCell><code>action</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>The operation to perform: <code>read</code>, <code>add</code>, <code>edit</code>, <code>delete</code> (Required).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>tableName</code></TableCell>
                <TableCell>string</TableCell>
                <TableCell>The name of the table (Required).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>data</code></TableCell>
                <TableCell>object</TableCell>
                <TableCell>The row data for <code>add</code> or <code>edit</code> actions.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>id</code></TableCell>
                <TableCell>any</TableCell>
                <TableCell>The primary key value for <code>edit</code> or <code>delete</code> actions.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><code>query</code></TableCell>
                <TableCell>object</TableCell>
                <TableCell>Filter criteria for <code>read</code> action (e.g., <code>{"{ \"id\": 1 }"}</code>).</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Example: Add Row</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
              <code>
{`curl -X POST https://heho.vercel.app/api/v1/database/manage \\ 
  -H "Authorization: Bearer YOUR_HEHO_API_KEY" \\ 
  -H "Content-Type: application/json" \\ 
  -d '{ 
    "action": "add", 
    "tableName": "products", 
    "data": { "name": "New Product", "price": 99.99 } 
  }'`}
              </code>
            </pre>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Example: Read Rows</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
              <code>
{`curl -X POST https://heho.vercel.app/api/v1/database/manage \\ 
  -H "Authorization: Bearer YOUR_HEHO_API_KEY" \\ 
  -H "Content-Type: application/json" \\ 
  -d '{ 
    "action": "read", 
    "tableName": "products"
  }'`}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ApiDocsPage;
