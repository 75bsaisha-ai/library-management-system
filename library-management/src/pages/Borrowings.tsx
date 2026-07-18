import { useState } from "react";
import { Link } from "wouter";
import { 
  useListBorrowings, 
  useIssueBorrowing, 
  useReturnBorrowing,
  useWaiveFine,
  useListBooks,
  useListMembers,
  getListBorrowingsQueryKey,
  getGetDashboardStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Plus, ArrowRightLeft, CheckCircle2, Clock, DollarSign, BadgeCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/lib/formatters";

const borrowingSchema = z.object({
  memberId: z.coerce.number().min(1, "Member is required"),
  bookId: z.coerce.number().min(1, "Book is required"),
  dueDays: z.coerce.number().min(1).default(14),
});

export default function Borrowings() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: borrowings, isLoading } = useListBorrowings({ 
    status: statusFilter !== "all" ? statusFilter as any : undefined 
  });
  
  const { data: books } = useListBooks({ available: true });
  const { data: members } = useListMembers({ status: "active" });

  const issueBorrowing = useIssueBorrowing();
  const returnBorrowing = useReturnBorrowing();
  const waiveFine = useWaiveFine();

  const form = useForm<z.infer<typeof borrowingSchema>>({
    resolver: zodResolver(borrowingSchema),
    defaultValues: { memberId: undefined as any, bookId: undefined as any, dueDays: 14 },
  });

  const onSubmit = (data: z.infer<typeof borrowingSchema>) => {
    issueBorrowing.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBorrowingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        setOpen(false);
        form.reset();
        toast({ title: "Success", description: "Volume issued to patron." });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.response?.data?.error || "Failed to process issuance.", variant: "destructive" });
      }
    });
  };

  const handleReturn = (id: number) => {
    returnBorrowing.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBorrowingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        toast({ title: "Success", description: "Volume accessioned back into inventory." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to process return.", variant: "destructive" });
      }
    });
  };

  const handleWaive = (id: number) => {
    waiveFine.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBorrowingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        toast({ title: "Fine Waived", description: "Outstanding fine has been cleared." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to waive fine.", variant: "destructive" });
      }
    });
  };

  const totalFines = borrowings?.reduce((sum: number, b: any) => sum + (b.fineAmount ?? 0), 0) ?? 0;
  const hasOverdueFines = totalFines > 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-border/50 pb-6 relative">
        <div>
          <h1 className="text-4xl font-serif font-light tracking-tight text-foreground">Circulation Log</h1>
          <p className="text-muted-foreground mt-2 font-sans tracking-wide uppercase text-xs">Master ledger of loans and returns</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-sm font-sans tracking-widest uppercase text-xs font-bold gap-2">
              <Plus className="h-4 w-4" /> Issue Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] glass-panel border border-border/30 shadow-2xl rounded-sm">
            <DialogHeader className="mb-4 border-b border-border/30 pb-4">
              <DialogTitle className="font-serif text-2xl font-light">Issue Volume to Patron</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="memberId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Select Patron</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-border/50 focus:ring-primary rounded-sm font-serif text-lg h-12">
                          <SelectValue placeholder="Locate member in registry..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-border/50 bg-popover/95 backdrop-blur-md max-h-[300px]">
                        {members?.map(m => (
                          <SelectItem key={m.id} value={m.id.toString()} className="font-serif text-base py-3">
                            <span className="font-bold mr-2">{m.name}</span>
                            <span className="text-muted-foreground font-sans text-xs tracking-wider opacity-70">({m.email})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px] uppercase tracking-widest" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bookId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Select Volume</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-border/50 focus:ring-primary rounded-sm font-serif text-lg h-12">
                          <SelectValue placeholder="Locate volume in catalog..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-border/50 bg-popover/95 backdrop-blur-md max-h-[300px]">
                        {books?.map(b => (
                          <SelectItem key={b.id} value={b.id.toString()} className="font-serif text-base py-3">
                            <span className="font-bold mr-2 truncate max-w-[200px] inline-block align-bottom">{b.title}</span>
                            <span className="text-primary font-sans text-[10px] uppercase tracking-widest ml-2 px-1.5 py-0.5 bg-primary/10 rounded-sm">Qty: {b.availableCopies}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px] uppercase tracking-widest" />
                  </FormItem>
                )} />
                <div className="pt-4 border-t border-border/30 flex justify-end">
                  <Button type="submit" disabled={issueBorrowing.isPending} className="rounded-sm font-sans tracking-widest uppercase text-xs font-bold">
                    {issueBorrowing.isPending ? "Processing..." : "Authorize Loan"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {hasOverdueFines && (
        <div className="flex items-center gap-4 px-5 py-4 rounded-sm border border-destructive/30 bg-destructive/5">
          <DollarSign className="h-5 w-5 text-destructive flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-sans font-bold tracking-widest uppercase text-destructive">
              Outstanding Fines — ${totalFines.toFixed(2)} total
            </p>
            <p className="text-xs text-muted-foreground font-sans mt-0.5">
              Accruing at $0.25/day per overdue item
            </p>
          </div>
        </div>
      )}

      <Card className="glass-panel border-0 shadow-2xl rounded-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/40 bg-card/40 flex items-center justify-between">
            <ToggleGroup type="single" value={statusFilter} onValueChange={(v) => { if(v) setStatusFilter(v) }} className="justify-start gap-2">
              <ToggleGroupItem value="all" className="rounded-sm px-4 h-9 font-sans text-xs uppercase tracking-widest data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-transparent data-[state=off]:border-border/50">Master</ToggleGroupItem>
              <ToggleGroupItem value="active" className="rounded-sm px-4 h-9 font-sans text-xs uppercase tracking-widest data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400 border border-transparent data-[state=off]:border-border/50">Active</ToggleGroupItem>
              <ToggleGroupItem value="returned" className="rounded-sm px-4 h-9 font-sans text-xs uppercase tracking-widest data-[state=on]:bg-muted data-[state=on]:text-muted-foreground border border-transparent data-[state=off]:border-border/50">Archived</ToggleGroupItem>
              <ToggleGroupItem value="overdue" className="rounded-sm px-4 h-9 font-sans text-xs uppercase tracking-widest data-[state=on]:bg-destructive/20 data-[state=on]:text-destructive border border-transparent data-[state=off]:border-border/50">Delinquent</ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-background/50">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="w-[260px] text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-4">Volume</TableHead>
                  <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-4">Patron</TableHead>
                  <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-4">Issuance</TableHead>
                  <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-4">Maturity / Return</TableHead>
                  <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-4">State</TableHead>
                  <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-4">Fine</TableHead>
                  <TableHead className="text-right text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <TableRow key={i} className="border-border/20">
                      <TableCell className="py-4"><Skeleton className="h-6 w-40 bg-muted/20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32 bg-muted/20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24 bg-muted/20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24 bg-muted/20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 bg-muted/20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-14 bg-muted/20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24 ml-auto bg-muted/20" /></TableCell>
                    </TableRow>
                  ))
                ) : borrowings?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
                      <ArrowRightLeft className="h-10 w-10 mx-auto mb-4 opacity-20" strokeWidth={1} />
                      <p className="font-sans text-sm tracking-widest uppercase">Ledger is void of entries</p>
                    </TableCell>
                  </TableRow>
                ) : borrowings?.map((borrowing: any) => {
                  const isActive = borrowing.status === "active" || borrowing.status === "overdue";
                  const fine = borrowing.fineAmount ?? 0;
                  return (
                    <TableRow key={borrowing.id} className="hover:bg-primary/5 transition-colors border-border/20 group">
                      <TableCell className="py-4">
                        <Link href={`/books/${borrowing.bookId}`} className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">
                          {borrowing.book?.title || `Volume #${borrowing.bookId}`}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/members/${borrowing.memberId}`} className="font-sans text-sm tracking-wide text-foreground group-hover:text-primary transition-colors">
                          {borrowing.member?.name || `Patron #${borrowing.memberId}`}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground/80">{formatDateTime(borrowing.borrowedAt)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {borrowing.returnedAt ? (
                          <span className="text-muted-foreground/60">{formatDateTime(borrowing.returnedAt)}</span>
                        ) : (
                          <span className={`${borrowing.status === "overdue" ? "text-destructive font-bold flex items-center gap-1.5" : "text-foreground"}`}>
                            {borrowing.status === "overdue" && <Clock className="h-3 w-3" />}
                            {formatDateTime(borrowing.dueAt)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={borrowing.status} />
                      </TableCell>
                      <TableCell>
                        {fine > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-sm">
                            ${fine.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/40 font-mono">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {fine > 0 && !borrowing.finePaid && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWaive(borrowing.id)}
                              disabled={waiveFine.isPending}
                              className="gap-1.5 h-8 rounded-sm font-sans tracking-widest uppercase text-[10px] font-bold border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-amber-950 transition-colors"
                            >
                              <BadgeCheck className="h-3.5 w-3.5" /> Waive
                            </Button>
                          )}
                          {isActive && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleReturn(borrowing.id)}
                              disabled={returnBorrowing.isPending}
                              className="gap-2 h-8 rounded-sm font-sans tracking-widest uppercase text-[10px] font-bold border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-emerald-950 transition-colors"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Reclaim
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
