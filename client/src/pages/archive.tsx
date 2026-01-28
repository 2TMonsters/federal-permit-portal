import { Shell } from "@/components/layout/Shell";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Archive, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Copy,
  FileJson
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { apiRequest } from "@/lib/queryClient";

interface ApiLog {
  id: string;
  timestamp: string;
  permitId: string;
  projectName: string;
  endpoint: string;
  method: string;
  requestPayload: any;
  responseStatus: number | null;
  responseBody: any;
  success: boolean;
  simulationMode: boolean;
}

function LogEntry({ log }: { log: ApiLog }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (data: any, label: string) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast({
      title: "Copied",
      description: `${label} copied to clipboard.`,
    });
  };

  const formattedDate = new Date(log.timestamp).toLocaleString();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="mb-4">
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileJson className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">{log.projectName}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3" />
                    {formattedDate}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {log.simulationMode ? (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    Simulation
                  </Badge>
                ) : log.success ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Success
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" /> Failed
                  </Badge>
                )}
                {log.responseStatus && (
                  <Badge variant="outline">
                    {log.responseStatus}
                  </Badge>
                )}
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Permit ID:</span>
                <p className="font-mono text-xs mt-1">{log.permitId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Endpoint:</span>
                <p className="font-medium mt-1">{log.endpoint}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Request Payload</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(log.requestPayload, "Request payload");
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </Button>
              </div>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                {JSON.stringify(log.requestPayload, null, 2)}
              </pre>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(log.responseBody, "Response");
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </Button>
              </div>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                {JSON.stringify(log.responseBody, null, 2)}
              </pre>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function ArchivePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: logs, isLoading } = useQuery<ApiLog[]>({
    queryKey: ["/api/logs"],
  });

  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/logs");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      toast({
        title: "Logs Cleared",
        description: "All API logs have been removed.",
      });
    },
  });

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Archive className="h-8 w-8 text-primary" />
              API Archive
            </h1>
            <p className="text-muted-foreground text-lg">
              View all DocuSign API requests and responses for troubleshooting.
            </p>
          </div>
          
          {logs && logs.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => clearLogsMutation.mutate()}
              disabled={clearLogsMutation.isPending}
              data-testid="button-clear-logs"
            >
              {clearLogsMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Clear Logs
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !logs || logs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Archive className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No API Logs Yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Submit a permit application to see the DocuSign API requests logged here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {logs.length} API request{logs.length !== 1 ? 's' : ''}
            </p>
            {logs.map((log) => (
              <LogEntry key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
