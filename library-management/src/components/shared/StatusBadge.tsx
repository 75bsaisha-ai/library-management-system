import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = 'active' | 'suspended' | 'expired' | 'returned' | 'overdue' | 'standard' | 'premium' | 'student';

export function StatusBadge({ status, className }: { status: StatusType | string, className?: string }) {
  let badgeClass = '';

  switch (status.toLowerCase()) {
    case 'active':
      badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      break;
    case 'returned':
      badgeClass = 'bg-muted/50 text-muted-foreground border-border';
      break;
    case 'overdue':
    case 'suspended':
    case 'expired':
      badgeClass = 'bg-destructive/10 text-destructive border-destructive/20';
      break;
    case 'standard':
      badgeClass = 'bg-secondary text-secondary-foreground border-border';
      break;
    case 'premium':
      badgeClass = 'bg-primary/10 text-primary border-primary/20';
      break;
    case 'student':
      badgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      break;
    default:
      badgeClass = 'bg-secondary text-secondary-foreground border-border';
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-sans font-bold uppercase tracking-wider border",
        badgeClass,
        className
      )}
    >
      {status}
    </span>
  );
}
