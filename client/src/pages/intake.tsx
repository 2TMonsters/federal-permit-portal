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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Upload, 
  FileCode, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  AlertTriangle,
  FileText,
  Wand2,
  Sparkles
} from "lucide-react";
import { useLocation } from "wouter";
import { MOCK_EXTRACTED_DATA } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InsertPermit } from "@shared/schema";

const AVAILABLE_AGENCIES = ["DOT", "EPA", "CEQ", "USACE", "FEMA", "FWS", "NOAA", "BLM", "FRA"];

export default function IntakePortal() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    projectName: "",
    location: "",
    applicant: "",
    projectDescription: "",
    estimatedBudget: "",
    selectedAgencies: [] as string[],
  });

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

  const populateDemoData = () => {
    setFormData({
      projectName: MOCK_EXTRACTED_DATA.Project_Name,
      location: MOCK_EXTRACTED_DATA.Location,
      applicant: MOCK_EXTRACTED_DATA.Applicant_Entity,
      projectDescription: MOCK_EXTRACTED_DATA.Project_Description,
      estimatedBudget: MOCK_EXTRACTED_DATA.Estimated_Budget,
      selectedAgencies: MOCK_EXTRACTED_DATA.Agency_Routing,
    });
    toast({
      title: "Demo Data Loaded",
      description: "Form populated with sample project data.",
    });
  };

  const handleAgencyToggle = (agency: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAgencies: prev.selectedAgencies.includes(agency)
        ? prev.selectedAgencies.filter(a => a !== agency)
        : [...prev.selectedAgencies, agency]
    }));
  };

  const submitPermit = async (data: { projectName: string; location: string; applicant: string; agencies: string[] }) => {
    try {
      const result = await createPermitMutation.mutateAsync({
        project_name: data.projectName,
        location: data.location,
        applicant: data.applicant,
        status: "Maestro Workflow",
        progress: 15,
        agency_routing: data.agencies
      });

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
      
      setTimeout(() => setLocation("/review"), 1000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit permit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const triggerMaestroFromFile = async () => {
    await submitPermit({
      projectName: MOCK_EXTRACTED_DATA.Project_Name,
      location: MOCK_EXTRACTED_DATA.Location,
      applicant: MOCK_EXTRACTED_DATA.Applicant_Entity,
      agencies: MOCK_EXTRACTED_DATA.Agency_Routing
    });
  };

  const triggerMaestroFromForm = async () => {
    if (!formData.projectName || !formData.location || !formData.applicant) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    if (formData.selectedAgencies.length === 0) {
      toast({
        title: "No Agencies Selected",
        description: "Please select at least one agency for review.",
        variant: "destructive",
      });
      return;
    }
    await submitPermit({
      projectName: formData.projectName,
      location: formData.location,
      applicant: formData.applicant,
      agencies: formData.selectedAgencies
    });
  };

  const isFormValid = formData.projectName && formData.location && formData.applicant && formData.selectedAgencies.length > 0;

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
            Upload a document for AI extraction or fill out the form manually.
          </p>
        </div>

        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2" data-testid="tab-upload">
              <Upload className="h-4 w-4" />
              Upload Document
            </TabsTrigger>
            <TabsTrigger value="form" className="flex items-center gap-2" data-testid="tab-form">
              <FileText className="h-4 w-4" />
              Fill Out Form
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
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
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" data-testid="button-select-file">
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
                        onClick={triggerMaestroFromFile}
                        disabled={createPermitMutation.isPending}
                        data-testid="button-submit-file"
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

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-primary" />
                    Extracted Data Preview
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
          </TabsContent>

          {/* Form Tab */}
          <TabsContent value="form" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Project Information</CardTitle>
                      <CardDescription>Enter the permit application details</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={populateDemoData}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:from-amber-600 hover:to-orange-600 hover:text-white shadow-md"
                      data-testid="button-demo-data"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Demo Data
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      placeholder="Enter project name"
                      value={formData.projectName}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                      data-testid="input-project-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      data-testid="input-location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="applicant">Applicant Entity *</Label>
                    <Input
                      id="applicant"
                      placeholder="Organization or company name"
                      value={formData.applicant}
                      onChange={(e) => setFormData(prev => ({ ...prev, applicant: e.target.value }))}
                      data-testid="input-applicant"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Estimated Budget</Label>
                    <Input
                      id="budget"
                      placeholder="$0.00"
                      value={formData.estimatedBudget}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedBudget: e.target.value }))}
                      data-testid="input-budget"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the project..."
                      rows={3}
                      value={formData.projectDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                      data-testid="input-description"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Agency Routing *</CardTitle>
                    <CardDescription>Select agencies that need to review this permit</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {AVAILABLE_AGENCIES.map((agency) => (
                        <div key={agency} className="flex items-center space-x-2">
                          <Checkbox
                            id={agency}
                            checked={formData.selectedAgencies.includes(agency)}
                            onCheckedChange={() => handleAgencyToggle(agency)}
                            data-testid={`checkbox-${agency}`}
                          />
                          <Label 
                            htmlFor={agency} 
                            className="text-sm font-medium cursor-pointer"
                          >
                            {agency}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {formData.selectedAgencies.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Selected agencies:</p>
                        <div className="flex gap-2 flex-wrap">
                          {formData.selectedAgencies.map(agency => (
                            <Badge key={agency} variant="secondary">{agency}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className={cn(
                  "transition-all",
                  isFormValid ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : ""
                )}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      {isFormValid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      )}
                      {isFormValid ? "Ready to Submit" : "Complete Required Fields"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {isFormValid 
                        ? "All required information has been provided. Click below to initiate the Maestro workflow."
                        : "Please fill in all required fields (*) and select at least one agency."}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={triggerMaestroFromForm}
                      disabled={!isFormValid || createPermitMutation.isPending}
                      data-testid="button-submit-form"
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
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}
