import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Key, 
  CheckCircle2, 
  XCircle, 
  Save,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ConfigStatus {
  accountId: boolean;
  workflowId: boolean;
  accessToken: boolean;
  allConfigured: boolean;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [accountId, setAccountId] = useState("");
  const [workflowId, setWorkflowId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [showToken, setShowToken] = useState(false);

  // Fetch current config status
  const { data: configStatus, isLoading } = useQuery<ConfigStatus>({
    queryKey: ["/api/config/status"],
  });

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (config: { accountId?: string; workflowId?: string; accessToken?: string }) => {
      const response = await fetch("/api/config/docusign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error("Failed to save configuration");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/config/status"] });
      toast({
        title: "Configuration Saved",
        description: data.message || "DocuSign settings have been updated.",
      });
      // Clear fields after save
      setAccountId("");
      setWorkflowId("");
      setAccessToken("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const config: { accountId?: string; workflowId?: string; accessToken?: string } = {};
    if (accountId.trim()) config.accountId = accountId.trim();
    if (workflowId.trim()) config.workflowId = workflowId.trim();
    if (accessToken.trim()) config.accessToken = accessToken.trim();
    
    if (Object.keys(config).length === 0) {
      toast({
        title: "No Changes",
        description: "Enter at least one value to update.",
        variant: "destructive",
      });
      return;
    }
    
    saveConfigMutation.mutate(config);
  };

  return (
    <Shell>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground text-lg">
            Configure your DocuSign Maestro integration and system preferences.
          </p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              DocuSign Maestro Connection
            </CardTitle>
            <CardDescription>
              Status of your DocuSign API credentials for workflow automation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking configuration...
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">Account ID</span>
                  {configStatus?.accountId ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Configured
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                      <XCircle className="h-3 w-3 mr-1" /> Not Set
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">Workflow ID</span>
                  {configStatus?.workflowId ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Configured
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                      <XCircle className="h-3 w-3 mr-1" /> Not Set
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Access Token</span>
                  {configStatus?.accessToken ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Configured
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                      <XCircle className="h-3 w-3 mr-1" /> Not Set
                    </Badge>
                  )}
                </div>

                <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2">
                    {configStatus?.allConfigured ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Ready for Live Workflows</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">Running in Simulation Mode</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Update Credentials</CardTitle>
            <CardDescription>
              Enter new values to update your DocuSign configuration. Leave fields blank to keep existing values.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                placeholder="Enter your DocuSign Account ID"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                data-testid="input-account-id"
              />
              <p className="text-xs text-muted-foreground">
                Found in your DocuSign admin settings under "API and Keys"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workflowId">Workflow ID</Label>
              <Input
                id="workflowId"
                placeholder="Enter your Maestro Workflow ID"
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value)}
                data-testid="input-workflow-id"
              />
              <p className="text-xs text-muted-foreground">
                The ID at the end of your Maestro workflow URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <div className="relative">
                <Input
                  id="accessToken"
                  type={showToken ? "text" : "password"}
                  placeholder="Enter your DocuSign Access Token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="pr-10"
                  data-testid="input-access-token"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Generate from the DocuSign Token Generator with <code className="bg-muted px-1 rounded">aow_manage</code> and <code className="bg-muted px-1 rounded">signature</code> scopes
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="flex justify-between w-full">
              <a 
                href="https://developers.docusign.com/token-generator/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                DocuSign Token Generator <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://apps-d.docusign.com/send/documents?view=in-progress&status=in_progress" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                DocuSign Portal <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saveConfigMutation.isPending}
              className="w-full"
              data-testid="button-save-config"
            >
              {saveConfigMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Shell>
  );
}
