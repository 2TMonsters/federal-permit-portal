import { useState, useRef } from "react";
import { Shell } from "@/components/layout/Shell";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileCode, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  Code,
  AlertTriangle
} from "lucide-react";
import { useLocation } from "wouter";
import { MOCK_EXTRACTED_DATA } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InsertPermit } from "@shared/schema";

export default function IntakePortal() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);

  const createPermitMutation = useMutation({
    mutationFn: async (permitData: InsertPermit) => {
      const response = await fetch("/api/permits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permitData),
      });
      if (!response.ok) throw new Error("Failed to create permit");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permits"] });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    setIsProcessing(true);
    setExtractionComplete(false);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      setExtractionComplete(true);
      toast({
        title: "Analysis Complete",
        description: `Successfully extracted data from ${file.name}`,
      });
    }, 2000);
  };

  const triggerMaestroWorkflow = async () => {
    try {
      // Create the permit via API (this also triggers Maestro)
      const result = await createPermitMutation.mutateAsync({
        project_name: MOCK_EXTRACTED_DATA.Project_Name,
        location: MOCK_EXTRACTED_DATA.Location,
        applicant: MOCK_EXTRACTED_DATA.Applicant_Entity,
        status: "Maestro Workflow",
        progress: 15,
        agency_routing: MOCK_EXTRACTED_DATA.Agency_Routing
      });

      // Check if we're in simulation mode
      const maestroInfo = (result as any)?.maestro;
      
      if (maestroInfo?.simulationMode) {
        toast({
          title: "Workflow Initiated (Simulation)",
          description: "Running in demo mode. Permit routed to Interagency Review.",
          variant: "default",
        });
      } else {
        toast({
          title: "Maestro Workflow Triggered",
          description: `Permit sent to DocuSign for Interagency Review. Instance: ${maestroInfo?.instanceId}`,
          variant: "default",
        });
      }
      
      // Redirect to Agency Review page
      setTimeout(() => setLocation("/review"), 1000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit permit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Step 1 of 3</Badge>
            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Application Intake</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">New Permit Application</h1>
          <p className="text-muted-foreground text-lg">
            Upload the project proposal document to begin the AI-assisted intake process.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Upload & Preview */}
          <div className="space-y-6">
            <Card className={cn("border-2 border-dashed transition-all", 
              file ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            )}>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="p-4 rounded-full bg-background border border-border shadow-sm">
                  {isProcessing ? (
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  ) : extractionComplete ? (
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">
                    {file ? file.name : "Upload Permit Application"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isProcessing ? "Analyzing document structure..." : 
                     extractionComplete ? "Document ready for review" : 
                     "Drag and drop or click to browse (PDF, DOCX)"}
                  </p>
                </div>

                {!file && (
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    Select File
                  </Button>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,.docx,.doc" 
                  onChange={handleFileSelect} 
                />
              </CardContent>
            </Card>

            {extractionComplete && (
              <Card className="bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Review Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    The system has identified this project as <strong>Tier 2 Environmental Impact</strong>. 
                    This will trigger automatic routing to EPA and USACE.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={triggerMaestroWorkflow}
                    disabled={createPermitMutation.isPending}
                  >
                    {createPermitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initiating Workflow...
                      </>
                    ) : (
                      <>
                        Send to Interagency Review
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Right Column: Developer View / Extracted Data */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <FileCode className="h-4 w-4 text-primary" />
                Intelligent Extraction
              </h3>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Extracted from uploaded application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {extractionComplete ? (
                  Object.entries(MOCK_EXTRACTED_DATA).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        {key.replace(/_/g, " ")}
                      </Label>
                      <div className="font-medium">
                        {Array.isArray(value) ? (
                          <div className="flex gap-2 flex-wrap">
                            {value.map(v => (
                              <Badge key={v} variant="secondary" className="text-xs">
                                {v}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          value
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/40 text-sm space-y-2">
                    <FileCode className="h-10 w-10" />
                    <p>Data will appear here after analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
}
