import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Code, Key } from "lucide-react";

export default function Documentation() {
  const codeExample = `import fetch from 'node-fetch';

const API_KEY = 'your-api-key-here';
const API_URL = '${typeof window !== "undefined" ? window.location.origin : "http://localhost:5000"}';

async function chatCompletion() {
  const response = await fetch(\`\${API_URL}/api/chat/completions\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${API_KEY}\`
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'Hello, how are you?' }
      ],
      mode: 'chat' // or 'code' for code-specific responses
    })
  });

  const data = await response.json();
  console.log(data.content);
}

chatCompletion();`;

  const pythonExample = `import requests

API_KEY = 'your-api-key-here'
API_URL = '${typeof window !== "undefined" ? window.location.origin : "http://localhost:5000"}'

def chat_completion():
    response = requests.post(
        f"{API_URL}/api/chat/completions",
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {API_KEY}'
        },
        json={
            'messages': [
                {'role': 'user', 'content': 'Hello, how are you?'}
            ],
            'mode': 'chat'  # or 'code' for code-specific responses
        }
    )
    
    data = response.json()
    print(data['content'])

chat_completion()`;

  const curlExample = `curl -X POST ${typeof window !== "undefined" ? window.location.origin : "http://localhost:5000"}/api/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-api-key-here" \\
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "mode": "chat"
  }'`;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <Button variant="ghost" data-testid="button-back-home">
              ← Back to Chat
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">API Documentation</h1>
          <Link href="/api-keys" data-testid="link-api-keys">
            <Button variant="outline" data-testid="button-manage-keys">
              Manage API Keys
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Getting Started</h2>
            <p className="text-muted-foreground text-lg">
              Learn how to integrate the chat API into your applications
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Authentication
              </CardTitle>
              <CardDescription>
                All API requests require authentication using an API key
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To authenticate your requests, include your API key in the Authorization header:
              </p>
              <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
                <code data-testid="text-auth-example">Authorization: Bearer your-api-key-here</code>
              </pre>
              <p className="text-sm text-muted-foreground">
                Don't have an API key?{" "}
                <Link href="/api-keys" data-testid="link-create-key">
                  <span className="text-primary underline">Create one now</span>
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold" data-testid="text-endpoint-chat">
                  POST /api/chat/completions
                </h3>
                <p className="text-muted-foreground">
                  Send messages and receive AI-generated responses
                </p>
                <div className="space-y-3 mt-4">
                  <div>
                    <h4 className="font-medium mb-2">Request Body:</h4>
                    <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
                      <code data-testid="text-request-body">{`{
  "messages": [
    { "role": "user", "content": "Your message here" },
    { "role": "assistant", "content": "Previous response" }
  ],
  "mode": "chat" // or "code"
}`}</code>
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Response:</h4>
                    <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
                      <code data-testid="text-response-body">{`{
  "content": "AI-generated response"
}`}</code>
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Parameters:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>
                        <strong>messages</strong> (required): Array of message objects with role
                        and content
                      </li>
                      <li>
                        <strong>mode</strong> (required): "chat" for general conversation or "code"
                        for programming tasks
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>
                Example implementations in different programming languages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">JavaScript (Node.js)</h3>
                <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
                  <code data-testid="text-example-javascript">{codeExample}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Python</h3>
                <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
                  <code data-testid="text-example-python">{pythonExample}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">cURL</h3>
                <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm">
                  <code data-testid="text-example-curl">{curlExample}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Keep your API keys secure and never share them publicly</li>
                <li>Use environment variables to store your API keys</li>
                <li>Implement proper error handling for API requests</li>
                <li>Respect rate limits to ensure fair usage</li>
                <li>Use the appropriate mode (chat vs code) for better responses</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Handling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>The API returns standard HTTP status codes:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  <strong>200</strong> - Success
                </li>
                <li>
                  <strong>400</strong> - Bad Request (invalid parameters)
                </li>
                <li>
                  <strong>401</strong> - Unauthorized (invalid or missing API key)
                </li>
                <li>
                  <strong>500</strong> - Server Error
                </li>
                <li>
                  <strong>503</strong> - Service Unavailable (AI service not configured)
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
