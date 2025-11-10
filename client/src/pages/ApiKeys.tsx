import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Trash2, Key, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface NewlyCreatedApiKey extends ApiKey {
  key: string;
}

export default function ApiKeys() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: apiKeys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/keys"],
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/keys", { name });
      return await res.json() as NewlyCreatedApiKey;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      setNewlyCreatedKey(data.key);
      setKeyName("");
      toast({
        title: "API Key created",
        description: "Your new API key has been created successfully. Make sure to copy it now.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/keys/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: "API Key deleted",
        description: "Your API key has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    },
  });

  const handleCreateKey = () => {
    if (keyName.trim()) {
      createKeyMutation.mutate(keyName.trim());
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const displayKey = (keyPrefix: string) => {
    return `${keyPrefix}••••••••`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <Button variant="ghost" data-testid="button-back-home">
              ← Back to Chat
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">API Keys</h1>
          <Link href="/docs" data-testid="link-docs">
            <Button variant="outline" data-testid="button-view-docs">
              View Documentation
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold">Manage Your API Keys</h2>
              <p className="text-muted-foreground mt-1">
                Create and manage API keys to access the chat API programmatically
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-key">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Key
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-create-key">
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Give your API key a descriptive name to help you identify it later
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input
                      id="key-name"
                      placeholder="e.g., Production Server"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && keyName.trim()) {
                          handleCreateKey();
                        }
                      }}
                      data-testid="input-key-name"
                    />
                  </div>
                  {newlyCreatedKey && (
                    <Card className="bg-accent">
                      <CardHeader>
                        <CardTitle className="text-base">Your new API key</CardTitle>
                        <CardDescription>
                          Make sure to copy it now. You won't be able to see it again!
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 p-2 bg-background rounded text-sm break-all" data-testid="text-new-key">
                            {newlyCreatedKey}
                          </code>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => copyToClipboard(newlyCreatedKey)}
                            data-testid="button-copy-new-key"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setNewlyCreatedKey(null);
                    }}
                    data-testid="button-cancel-create"
                  >
                    {newlyCreatedKey ? "Done" : "Cancel"}
                  </Button>
                  {!newlyCreatedKey && (
                    <Button
                      onClick={handleCreateKey}
                      disabled={!keyName.trim() || createKeyMutation.isPending}
                      data-testid="button-confirm-create"
                    >
                      {createKeyMutation.isPending ? "Creating..." : "Create Key"}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading API keys...
              </CardContent>
            </Card>
          ) : apiKeys.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No API keys yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first API key to start using the API
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <Card key={key.id} data-testid={`card-key-${key.id}`}>
                  <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3 flex-wrap">
                    <div className="space-y-1">
                      <CardTitle className="text-base" data-testid={`text-key-name-${key.id}`}>
                        {key.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 flex-wrap">
                        <code className="text-xs" data-testid={`text-key-masked-${key.id}`}>
                          {displayKey(key.keyPrefix)}
                        </code>
                        <span>•</span>
                        <span>Created {formatDate(key.createdAt)}</span>
                        {key.lastUsedAt && (
                          <>
                            <span>•</span>
                            <span>Last used {formatDate(key.lastUsedAt)}</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => deleteKeyMutation.mutate(key.id)}
                        disabled={deleteKeyMutation.isPending}
                        data-testid={`button-delete-${key.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
