import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  FileCheck, 
  Send 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineProps {
  status: string;
}

const STEPS = [
  { id: 'intake', label: 'Intake & Validation', status: 'completed' },
  { id: 'maestro', label: 'Maestro Workflow', status: 'current' },
  { id: 'agency', label: 'Interagency Review', status: 'upcoming' },
  { id: 'signoff', label: 'Final Authorization', status: 'upcoming' },
];

export function PermitTimeline({ status }: TimelineProps) {
  // Simple logic to determine active step based on status string
  const getCurrentStepIndex = (status: string) => {
    if (status === 'In Intake') return 0;
    if (status === 'Maestro Workflow') return 1;
    if (status === 'EPA Review' || status.includes('Review')) return 2;
    if (status === 'Final Sign-off') return 3;
    if (status === 'Approved') return 4;
    return 0;
  };

  const currentIndex = getCurrentStepIndex(status);

  return (
    <div className="relative">
      <div className="absolute left-0 top-1/2 -mt-px h-0.5 w-full bg-border" aria-hidden="true" />
      <ul role="list" className="relative flex justify-between w-full">
        {STEPS.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentIndex;
          const isCurrent = stepIdx === currentIndex;

          return (
            <li key={step.label} className="relative flex flex-col items-center group">
              <span className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background z-10 transition-colors duration-300",
                isCompleted ? "border-primary bg-primary text-primary-foreground" :
                isCurrent ? "border-primary ring-4 ring-primary/20" :
                "border-muted-foreground/30"
              )}>
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : isCurrent ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/30" />
                )}
              </span>
              <span className={cn(
                "absolute -bottom-8 flex flex-col items-center w-32 text-center text-xs font-medium",
                isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
