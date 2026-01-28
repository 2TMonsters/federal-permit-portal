import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MoreHorizontal, FileText, MapPin, Calendar, Building2 } from "lucide-react";
import type { Permit } from "@shared/schema";
import { PermitTimeline } from "@/components/permits/PermitTimeline";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";

export function PermitTable() {
  const { data: permits = [] } = useQuery<Permit[]>({
    queryKey: ["/api/permits"],
  });
  const getStatusColor = (status: Permit['status']) => {
    switch (status) {
      case 'Maestro Workflow':
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case 'EPA Review':
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
      case 'Approved':
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case 'Final Sign-off':
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  return (
    <div className="rounded-md border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[140px]">Permit ID</TableHead>
            <TableHead>Project Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permits.map((permit: Permit) => (
            <TableRow key={permit.id} className="hover:bg-muted/30 group">
              <TableCell className="font-mono text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {permit.id}
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{permit.project_name}</span>
                  <span className="text-xs text-muted-foreground font-normal">{permit.applicant}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm">{permit.location}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{permit.submitted_date}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("font-medium", getStatusColor(permit.status))}>
                  {permit.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-view-${permit.id}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader className="mb-6">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-mono">{permit.id}</span>
                      </div>
                      <SheetTitle className="text-2xl">{permit.project_name}</SheetTitle>
                      <SheetDescription>
                        Applicant: <span className="font-medium text-foreground">{permit.applicant}</span>
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="space-y-8">
                      {/* Timeline Section */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Request Status</h3>
                        <PermitTimeline status={permit.status} />
                      </div>

                      <Separator />

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" /> Location
                          </h4>
                          <p className="text-sm font-medium">{permit.location}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" /> Submitted
                          </h4>
                          <p className="text-sm font-medium">{permit.submitted_date}</p>
                        </div>
                      </div>

                      {/* Agency Routing */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                          <Building2 className="h-3 w-3" /> Agency Routing
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {permit.agency_routing.map((agency: string) => (
                            <Badge key={agency} variant="secondary" className="px-3 py-1">
                              {agency}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          This permit triggers automatic review workflows with the above agencies based on environmental impact assessment.
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-border">
                        <h4 className="font-medium mb-2 text-sm">Maestro Workflow Details</h4>
                        <div className="space-y-2 text-xs font-mono text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Workflow ID:</span>
                            <span className="text-foreground">wf_{Math.random().toString(36).substr(2, 9)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Instance:</span>
                            <span className="text-foreground">inst_{Math.random().toString(36).substr(2, 9)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Trigger Source:</span>
                            <span className="text-foreground">API / Intake Portal</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                      <Button className="w-full">Open in DocuSign</Button>
                      <Button variant="outline" className="w-full">Download PDF</Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
