import { Shell } from "@/components/layout/Shell";
import { useQuery } from "@tanstack/react-query";
import type { Permit } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileText, 
  MoreHorizontal, 
  Filter,
  Building2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PermitTimeline } from "@/components/permits/PermitTimeline";

export default function AgencyReview() {
  const { data: permits = [] } = useQuery<Permit[]>({
    queryKey: ["/api/permits"],
  });

  // Filter for only "Agency Review" relevant statuses for the "Active Reviews" section?
  // Or just show all sorted by date. The prompt says "sorted with last created on top".
  // MOCK_PERMITS is already being modified by addPermit to put new ones on top.
  // We'll just display them all for now, maybe highlighting the ones in 'Review'.

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
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Agency Review</h1>
            <p className="text-muted-foreground">
              Monitor and act on permits currently undergoing interagency review workflows.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Button>
          </div>
        </div>

        {/* Priority / Needs Action Section */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Clock className="h-5 w-5" />
                Pending Your Review
              </CardTitle>
              <CardDescription>
                Items requiring immediate attention from your agency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {permits.filter((p: Permit) => p.status.includes('Review') || p.status === 'Maestro Workflow').slice(0, 2).map((permit: Permit) => (
                  <div key={permit.id} className="bg-background rounded-lg p-4 border shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{permit.project_name}</h4>
                        <p className="text-xs text-muted-foreground">{permit.id} • Submitted {permit.submitted_date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{permit.agency_routing[0]} Next</Badge>
                      <Button size="sm" className="h-8">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Review Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">Avg. Turnaround</span>
                <span className="font-semibold">3.2 Days</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Escalated</span>
                <span className="font-semibold text-red-600 flex items-center gap-1">
                  2 <AlertCircle className="h-3 w-3" />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main List */}
        <Card>
          <CardHeader>
            <CardTitle>All Active Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Permit ID</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead>Routing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permits.map((permit: Permit) => (
                  <TableRow key={permit.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                      {permit.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{permit.project_name}</span>
                        <span className="text-xs text-muted-foreground">{permit.applicant}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="font-medium">
                          {permit.status === 'Maestro Workflow' ? 'Intelligent Routing' : 
                           permit.status === 'EPA Review' ? 'Environmental Impact' :
                           permit.status === 'Approved' ? 'Finalized' : 'Processing'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Started {permit.submitted_date}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex -space-x-2 overflow-hidden">
                        {permit.agency_routing.slice(0, 3).map((agency: string, i: number) => (
                          <div key={i} className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-background bg-slate-100 ring-2 ring-background text-[10px] font-bold">
                            {agency.substring(0, 1)}
                          </div>
                        ))}
                        {permit.agency_routing.length > 3 && (
                          <div className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-background bg-slate-100 ring-2 ring-background text-[10px] font-bold">
                            +{permit.agency_routing.length - 3}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-medium", getStatusColor(permit.status))}>
                        {permit.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="sm">
                            View
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
                            <div className="space-y-4">
                              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Workflow Progress</h3>
                              <PermitTimeline status={permit.status} />
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-border">
                              <h4 className="font-medium mb-4 text-sm flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                Review Actions
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                <Button size="sm" variant="default" className="w-full">Approve Phase</Button>
                                <Button size="sm" variant="outline" className="w-full text-destructive hover:bg-destructive/10">Request Changes</Button>
                                <Button size="sm" variant="secondary" className="w-full col-span-2">Delegate to Sub-Agency</Button>
                              </div>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
