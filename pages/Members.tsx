import { useState } from "react";
import { Link } from "wouter";
import { useListMembers, useCreateMember, getListMembersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Search, Plus, Mail, Phone, Users, MoreHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/formatters";

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  membershipType: z.enum(["standard", "premium", "student"]),
});

export default function Members() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const { data: members, isLoading } = useListMembers({
    search: search || undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    membershipType: tierFilter !== "all" ? (tierFilter as any) : undefined,
  });

  const createMember = useCreateMember();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: { name: "", email: "", phone: "", membershipType: "standard" },
  });

  const onSubmit = (data: z.infer<typeof memberSchema>) => {
    createMember.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMembersQueryKey() });
        setOpen(false);
        form.reset();
        toast({ title: "Success", description: "Member registered." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to register member.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-border/50 pb-6 relative">
        <div>
          <h1 className="text-4xl font-serif font-light tracking-tight text-foreground">Patrons</h1>
          <p className="text-muted-foreground mt-2 font-sans tracking-wide uppercase text-xs">Library member registry</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-sm font-sans tracking-widest uppercase text-xs font-bold gap-2">
              <Plus className="h-4 w-4" /> Enroll Patron
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] glass-panel border border-border/30 shadow-2xl rounded-sm">
            <DialogHeader className="mb-4 border-b border-border/30 pb-4">
              <DialogTitle className="font-serif text-2xl font-light">Enroll New Patron</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</FormLabel>
                    <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-serif text-lg h-12" placeholder="Jane Doe" {...field} /></FormControl>
                    <FormMessage className="text-[10px] uppercase tracking-widest" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Electronic Mail</FormLabel>
                    <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-mono text-sm" type="email" placeholder="jane@example.com" {...field} /></FormControl>
                    <FormMessage className="text-[10px] uppercase tracking-widest" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Telephone (Optional)</FormLabel>
                    <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-mono text-sm" placeholder="(555) 123-4567" {...field} /></FormControl>
                    <FormMessage className="text-[10px] uppercase tracking-widest" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="membershipType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Privilege Tier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-border/50 focus:ring-primary rounded-sm font-sans tracking-wide">
                          <SelectValue placeholder="Select a tier" />
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
                <div className="pt-4 border-t border-border/30 flex justify-end">
                  <Button type="submit" disabled={createMember.isPending} className="rounded-sm font-sans tracking-widest uppercase text-xs font-bold">
                    {createMember.isPending ? "Processing..." : "Enroll Patron"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-panel border-0 shadow-2xl rounded-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/40 bg-card/40 space-y-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Query registry by name or email..."
                className="pl-11 bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm h-12 font-serif text-base placeholder:font-sans placeholder:text-sm placeholder:tracking-wide"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">Standing:</span>
                <ToggleGroup type="single" value={statusFilter} onValueChange={(v) => { if (v) setStatusFilter(v); }} className="gap-1.5">
                  <ToggleGroupItem value="all" className="rounded-sm px-3 h-7 font-sans text-[10px] uppercase tracking-widest data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-transparent data-[state=off]:border-border/50">All</ToggleGroupItem>
                  <ToggleGroupItem value="active" className="rounded-sm px-3 h-7 font-sans text-[10px] uppercase tracking-widest data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400 border border-transparent data-[state=off]:border-border/50">Active</ToggleGroupItem>
                  <ToggleGroupItem value="suspended" className="rounded-sm px-3 h-7 font-sans text-[10px] uppercase tracking-widest data-[state=on]:bg-destructive/20 data-[state=on]:text-destructive border border-transparent data-[state=off]:border-border/50">Suspended</ToggleGroupItem>
                  <ToggleGroupItem value="expired" className="rounded-sm px-3 h-7 font-sans text-[10px] uppercase tracking-widest data-[state=on]:bg-muted data-[state=on]:text-muted-foreground border border-transparent data-[state=off]:border-border/50">Expired</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">Tier:</span>
                <ToggleGroup type="single" value={tierFilter} onValueChange={(v) => { if (v) setTierFilter(v); }} className="gap-1.5">
                  <ToggleGroupItem value="all" className="rounded-sm px-3 h-7 font-sans text-[10px] uppercase tracking-widest data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-transparent data-[state=off]:border-border/50">All</ToggleGroupItem>
                  <ToggleGroupItem value="premium" className="rounded-sm px-3 h-7 font-sans text-[10px] uppercase tracking-widest data-[state=on]:bg-primary/20 data-[state=on]:text-primary border border-transparent data-[state=off]:border-border/50">Premium</ToggleGroupItem>
                  <ToggleGroupItem value="standard" className="rounded-sm px-3 h-7 font-sans text-[10px] uppercase tracking-widest data-[state=on]:bg-muted data-[state=on]:text-foreground border border-transparent data-[state=off]:border-border/50">Standard</ToggleGroupItem>
                  <ToggleGroupItem value="student" className="rounded-sm px-3 h-7 font-sans text-[10px] uppercase tracking-widest data-[state=on]:bg-blue-500/20 data-[state=on]:text-blue-400 border border-transparent data-[state=off]:border-border/50">Student</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-background/50">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="w-[350px] text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-4">Patron Details</TableHead>
                  <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-4">Standing</TableHead>
                  <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-4">Tier</TableHead>
                  <TableHead className="text-right text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-4">Enrolled</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <TableRow key={i} className="border-border/20">
                      <TableCell className="py-4"><Skeleton className="h-12 w-full bg-muted/20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 bg-muted/20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 bg-muted/20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24 ml-auto bg-muted/20" /></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))
                ) : members?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                      <Users className="h-10 w-10 mx-auto mb-4 opacity-20" strokeWidth={1} />
                      <p className="font-sans text-sm tracking-widest uppercase">No records found</p>
                    </TableCell>
                  </TableRow>
                ) : members?.map((member) => (
                  <TableRow key={member.id} className="hover:bg-primary/5 cursor-pointer border-border/20 transition-colors group">
                    <TableCell className="py-4">
                      <Link href={`/members/${member.id}`} className="block">
                        <div className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">{member.name}</div>
                        <div className="text-xs font-mono text-muted-foreground mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1.5 opacity-80"><Mail className="h-3 w-3"/> {member.email}</span>
                          {member.phone && <span className="flex items-center gap-1.5 opacity-80"><Phone className="h-3 w-3"/> {member.phone}</span>}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell><StatusBadge status={member.status} /></TableCell>
                    <TableCell><StatusBadge status={member.membershipType} /></TableCell>
                    <TableCell className="text-right text-sm font-mono text-muted-foreground/70 tracking-wider">
                      {formatDate(member.joinDate)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/members/${member.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm hover:bg-primary/20 hover:text-primary">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
