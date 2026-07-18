import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { 
  useGetMember, 
  useUpdateMember, 
  useDeleteMember,
  useGetMemberBorrowings,
  getGetMemberQueryKey,
  getGetMemberBorrowingsQueryKey,
  getListMembersQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronLeft, Edit2, Trash2, User, Mail, Phone, BookOpen, Clock, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/lib/formatters";

const memberUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  membershipType: z.enum(["standard", "premium", "student"]).optional(),
  status: z.enum(["active", "suspended", "expired"]).optional(),
});

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const memberId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const { data: member, isLoading: memberLoading } = useGetMember(memberId, {
    query: { enabled: !!memberId, queryKey: getGetMemberQueryKey(memberId) }
  });

  const { data: borrowings, isLoading: borrowingsLoading } = useGetMemberBorrowings(memberId, {
    query: { enabled: !!memberId, queryKey: getGetMemberBorrowingsQueryKey(memberId) }
  });

  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  const form = useForm<z.infer<typeof memberUpdateSchema>>({
    resolver: zodResolver(memberUpdateSchema),
    defaultValues: {
      name: member?.name,
      email: member?.email,
      phone: member?.phone || "",
      membershipType: member?.membershipType,
      status: member?.status,
    },
  });

  const onSubmit = (data: z.infer<typeof memberUpdateSchema>) => {
    updateMember.mutate({ id: memberId, data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMemberQueryKey(memberId) });
        queryClient.invalidateQueries({ queryKey: getListMembersQueryKey() });
        setEditOpen(false);
        toast({ title: "Success", description: "Patron record updated." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to update record.", variant: "destructive" });
      }
    });
  };

  const handleDelete = () => {
    deleteMember.mutate({ id: memberId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMembersQueryKey() });
        toast({ title: "Success", description: "Patron removed from registry." });
        setLocation("/members");
      },
      onError: () => {
        toast({ title: "Error", description: "Cannot delete patron with active loans.", variant: "destructive" });
      }
    });
  };

  if (memberLoading) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex items-center gap-6"><Skeleton className="h-12 w-12 rounded-sm" /><Skeleton className="h-12 w-1/3" /></div>
        <div className="grid lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-1 h-96 w-full rounded-sm" />
          <Skeleton className="lg:col-span-2 h-96 w-full rounded-sm" />
        </div>
      </div>
    );
  }

  if (!member) return <div className="text-center py-20 font-serif text-2xl">Patron not found</div>;

  const activeLoans = borrowings?.filter(b => b.status === "active" || b.status === "overdue")?.length || 0;
  const totalFines = (borrowings as any[])?.reduce((sum: number, b: any) => sum + (b.fineAmount ?? 0), 0) ?? 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-border/50 pb-8">
        <div className="flex items-start gap-5">
          <Button variant="outline" size="icon" onClick={() => setLocation("/members")} className="rounded-sm border-border/50 bg-background/50 hover:bg-primary hover:text-primary-foreground hover:border-primary mt-1">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-light leading-tight text-foreground">{member.name}</h1>
            <p className="text-muted-foreground mt-3 font-sans uppercase tracking-widest text-xs flex items-center gap-3">
              <span>Patron #{member.id.toString().padStart(4, '0')}</span>
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <StatusBadge status={member.status} /> 
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 lg:ml-auto">
          <Dialog open={editOpen} onOpenChange={(open) => {
            setEditOpen(open);
            if (open) {
              form.reset({
                name: member.name, email: member.email, phone: member.phone || "",
                membershipType: member.membershipType, status: member.status
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-sm font-sans tracking-widest uppercase text-xs font-bold border-border/50 bg-background/50">
                <Edit2 className="h-3.5 w-3.5" /> Edit Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-panel border border-border/30 shadow-2xl rounded-sm">
              <DialogHeader className="mb-4 border-b border-border/30 pb-4">
                <DialogTitle className="font-serif text-2xl font-light">Modify Patron Record</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</FormLabel>
                      <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-serif text-lg h-12" {...field} /></FormControl>
                      <FormMessage className="text-[10px] uppercase tracking-widest" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Electronic Mail</FormLabel>
                      <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-mono text-sm" type="email" {...field} /></FormControl>
                      <FormMessage className="text-[10px] uppercase tracking-widest" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Telephone</FormLabel>
                      <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-mono text-sm" {...field} /></FormControl>
                      <FormMessage className="text-[10px] uppercase tracking-widest" />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-5">
                    <FormField control={form.control} name="membershipType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Privilege Tier</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50 border-border/50 focus:ring-primary rounded-sm font-sans tracking-wide">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-border/50 bg-popover/95 backdrop-blur-md">
                            <SelectItem value="standard" className="font-sans">Standard</SelectItem>
                            <SelectItem value="premium" className="font-sans text-primary">Premium</SelectItem>
                            <SelectItem value="student" className="font-sans text-blue-400">Student</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px] uppercase tracking-widest" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Standing</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50 border-border/50 focus:ring-primary rounded-sm font-sans tracking-wide">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-border/50 bg-popover/95 backdrop-blur-md">
                            <SelectItem value="active" className="font-sans text-emerald-400">Active</SelectItem>
                            <SelectItem value="suspended" className="font-sans text-destructive">Suspended</SelectItem>
                            <SelectItem value="expired" className="font-sans text-muted-foreground">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px] uppercase tracking-widest" />
                      </FormItem>
                    )} />
                  </div>
                  <div className="pt-4 border-t border-border/30 flex justify-end">
                    <Button type="submit" disabled={updateMember.isPending} className="rounded-sm font-sans tracking-widest uppercase text-xs font-bold">
                      {updateMember.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-sm font-sans tracking-widest uppercase text-xs font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30">
                <Trash2 className="h-3.5 w-3.5" /> Purge
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-panel border-border/30 rounded-sm">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-serif text-2xl font-light">Purge Patron Record?</AlertDialogTitle>
                <AlertDialogDescription className="font-sans">
                  This action permanently erases the patron from the registry. Records cannot be purged if the patron holds unreturned items.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6">
                <AlertDialogCancel className="rounded-sm font-sans tracking-widest uppercase text-xs">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="rounded-sm font-sans tracking-widest uppercase text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleteMember.isPending ? "Purging..." : "Confirm Purge"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="glass-panel border-0 shadow-xl rounded-sm">
            <CardHeader className="pb-2 border-b border-border/30 mb-6">
              <CardTitle className="font-serif text-xl font-medium tracking-wide flex items-center gap-3">
                <User className="h-5 w-5 text-primary" /> 
                Dossier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2 mb-1.5">
                    <Mail className="h-3 w-3" /> Electronic Mail
                  </p>
                  <p className="font-mono text-sm text-foreground">{member.email}</p>
                </div>
                {member.phone && (
                  <div>
                    <p className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2 mb-1.5">
                      <Phone className="h-3 w-3" /> Telephone
                    </p>
                    <p className="font-mono text-sm text-foreground">{member.phone}</p>
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-border/30 space-y-5">
                <div>
                  <p className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground mb-2">Privilege Tier</p>
                  <StatusBadge status={member.membershipType} />
                </div>
                <div>
                  <p className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground mb-1.5">Date of Enrollment</p>
                  <p className="font-sans text-sm font-medium text-foreground tracking-wide">{new Date(member.joinDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-0 shadow-xl rounded-sm">
            <CardContent className="p-8 text-center">
              <div className="text-5xl font-serif font-light text-primary mb-4">{activeLoans}</div>
              <p className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground">Volumes Currently Held</p>
            </CardContent>
          </Card>

          {totalFines > 0 && (
            <Card className="glass-panel border-0 shadow-xl rounded-sm border border-destructive/20 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-destructive/60 to-transparent" />
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-sm bg-destructive/10 border border-destructive/20">
                    <DollarSign className="h-4 w-4 text-destructive" />
                  </div>
                  <p className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground">Outstanding Fines</p>
                </div>
                <div className="text-4xl font-serif font-light text-destructive mb-2">${totalFines.toFixed(2)}</div>
                <p className="text-[10px] font-sans text-muted-foreground tracking-wide">$0.25 / day per overdue item</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card className="glass-panel border-0 shadow-xl rounded-sm h-full">
            <CardHeader className="pb-4 border-b border-border/30 mb-4">
              <CardTitle className="flex items-center gap-3 font-serif text-xl font-medium tracking-wide">
                <BookOpen className="h-5 w-5 text-primary" />
                Ledger Entries
              </CardTitle>
              <CardDescription className="font-sans uppercase tracking-widest text-[10px]">Patron circulation history</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-background/30">
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-3">Volume</TableHead>
                      <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-3">Issued</TableHead>
                      <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-3">Expected / Returned</TableHead>
                      <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-3">Status</TableHead>
                      <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-3">Fine</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {borrowingsLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8"><Skeleton className="h-8 w-1/2 mx-auto bg-muted/20" /></TableCell></TableRow>
                    ) : borrowings?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                          <p className="font-sans text-xs tracking-widest uppercase">Clean slate. No prior loans.</p>
                        </TableCell>
                      </TableRow>
                    ) : borrowings?.map((borrowing: any) => {
                      const fine = borrowing.fineAmount ?? 0;
                      return (
                      <TableRow key={borrowing.id} className="border-border/20 hover:bg-primary/5 transition-colors">
                        <TableCell className="font-serif text-base py-4 max-w-[200px] truncate" title={borrowing.book?.title}>
                          <Link href={`/books/${borrowing.bookId}`} className="hover:text-primary transition-colors">
                            {borrowing.book?.title || `Book #${borrowing.bookId}`}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{formatDateTime(borrowing.borrowedAt)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {borrowing.returnedAt ? (
                            <span className="text-muted-foreground">{formatDateTime(borrowing.returnedAt)}</span>
                          ) : (
                            <span className={`${borrowing.status === "overdue" ? "text-destructive font-bold flex items-center gap-1.5" : "text-foreground"}`}>
                              {borrowing.status === "overdue" && <Clock className="h-3 w-3" />}
                              {formatDateTime(borrowing.dueAt)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell><StatusBadge status={borrowing.status} /></TableCell>
                        <TableCell>
                          {fine > 0 ? (
                            <span className="inline-flex items-center text-xs font-mono font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-sm">
                              ${fine.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40 font-mono">—</span>
                          )}
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
      </div>
    </div>
  );
}
