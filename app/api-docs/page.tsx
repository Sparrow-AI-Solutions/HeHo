import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ApiDocsPage = () => {
  const exampleCurl = `curl -X POST -H "Authorization: Bearer YOUR_HEHO_API_KEY" https://heho.vercel.app/api/verify-user`;

  const exampleNode = `
async function verifyUser(apiKey) {
  try {
    const response = await fetch('https://heho.vercel.app/api/verify-user', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${apiKey}\`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || \`HTTP error! Status: \${response.status}\`);
    }

    const userData = await response.json();
    console.log('User data:', userData);
    return userData;
  } catch (error) {
    console.error('Failed to verify user:', error);
  }
}

// Usage:
// verifyUser('heho_xxxxxxxxxxxxxxxxxxxxxxxx');
  `;

  const exampleResponse = `
{
  "id": "12345678-1234-1234-1234-1234567890ab",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2023-10-27T10:00:00Z",
  "updated_at": "2023-10-27T10:00:00Z",
  "plan": "free",
  "openrouter_key_encrypted": "enc_...",
  "supabase_url": "https://[project_ref].supabase.co",
  "supabase_key_encrypted": "enc_...",
  "supabase_permissions": {
    "can_read": true,
    "can_create": false,
    "can_delete": false,
    "can_insert": true
  },
  "setup_completed": true,
  "provider_token": "prov_...",
  "refresh_token": "ref_...",
  "supabase_service_key_encrypted": "enc_...",
  "heho_api_key": "heho_xxxxxxxxxxxxxxxxxxxxxxxx"
}
  `;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Heho API Documentation</h1>
        <p className="text-muted-foreground mb-10">A simple guide to using your Heho API key.</p>

        <div className="space-y-8">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>API Endpoint</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">To verify a user based on their Heho API key, send a POST request to the following endpoint:</p>
              <pre className="bg-background/80 p-2 rounded-md"><code className="font-mono text-sm">POST /api/verify-user</code></pre>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Authentication is handled via a Bearer token in the <code className="bg-background/80 p-1 rounded-md text-xs">Authorization</code> header. You can generate your API key from your <a href="/settings" className="text-primary hover:underline">settings page</a>.</p>
              
              <h3 className="font-semibold mb-2 mt-4">cURL Example</h3>
              <pre className="bg-background/80 p-4 rounded-md overflow-x-auto"><code className="language-bash">{exampleCurl.trim()}</code></pre>
              
              <h3 className="font-semibold mb-2 mt-6">JavaScript (Node.js) Example</h3>
              <pre className="bg-background/80 p-4 rounded-md overflow-x-auto"><code className="language-javascript">{exampleNode.trim()}</code></pre>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Successful Response (200 OK)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">If the API key is valid, the server will respond with a JSON object containing the full user record associated with that key.</p>
               <p className="text-sm text-amber-500 mb-4"><b>Warning:</b> The response contains sensitive data, including encrypted keys. Handle it securely.</p>
              <pre className="bg-background/80 p-4 rounded-md overflow-x-auto"><code className="language-json">{exampleResponse.trim()}</code></pre>
            </CardContent>
          </Card>

           <Card className="border-destructive/30 bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive">Error Responses</CardTitle>
            </CardHeader>
            <CardContent>
                <p><code className="bg-background/80 p-1 rounded-md text-xs">401 Unauthorized</code>: This response is returned if the API key is missing, malformed, or invalid.</p>
                <p className="mt-2"><code className="bg-background/80 p-1 rounded-md text-xs">500 Internal Server Error</code>: This indicates an unexpected error on the server side.</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default ApiDocsPage;
