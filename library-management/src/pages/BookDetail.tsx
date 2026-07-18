import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetBook, 
  useUpdateBook, 
  useDeleteBook,
  useListBorrowings,
  getGetBookQueryKey,
  getListBorrowingsQueryKey,
  getListBooksQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronLeft, Edit2, Trash2, ArrowRightLeft, AlignLeft, Calendar, Hash, Library } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/lib/formatters";

const bookUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  author: z.string().min(1, "Author is required").optional(),
  isbn: z.string().min(1, "ISBN is required").optional(),
  genre: z.string().min(1, "Genre is required").optional(),
  publishedYear: z.coerce.number().min(1000).max(new Date().getFullYear()).optional(),
  totalCopies: z.coerce.number().min(1, "Must have at least 1 copy").optional(),
  description: z.string().optional(),
});

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const bookId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const { data: book, isLoading: bookLoading } = useGetBook(bookId, {
    query: { enabled: !!bookId, queryKey: getGetBookQueryKey(bookId) }
  });

  const { data: borrowings, isLoading: borrowingsLoading } = useListBorrowings({ bookId }, {
    query: { enabled: !!bookId, queryKey: getListBorrowingsQueryKey({ bookId }) }
  });

  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  const form = useForm<z.infer<typeof bookUpdateSchema>>({
    resolver: zodResolver(bookUpdateSchema),
    defaultValues: {
      title: book?.title,
      author: book?.author,
      isbn: book?.isbn,
      genre: book?.genre,
      publishedYear: book?.publishedYear || new Date().getFullYear(),
      totalCopies: book?.totalCopies,
      description: book?.description || "",
    },
  });

  const onSubmit = (data: z.infer<typeof bookUpdateSchema>) => {
    updateBook.mutate({ id: bookId, data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(bookId) });
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
        setEditOpen(false);
        toast({ title: "Success", description: "Book record updated." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to update record.", variant: "destructive" });
      }
    });
  };

  const handleDelete = () => {
    deleteBook.mutate({ id: bookId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
        toast({ title: "Success", description: "Volume removed from catalog." });
        setLocation("/books");
      },
      onError: () => {
        toast({ title: "Error", description: "Cannot delete volume with active borrowings.", variant: "destructive" });
      }
    });
  };

  if (bookLoading) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex items-center gap-6"><Skeleton className="h-12 w-12 rounded-sm" /><Skeleton className="h-12 w-1/3" /></div>
        <div className="grid lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-96 w-full rounded-sm" />
          <Skeleton className="h-96 w-full rounded-sm" />
        </div>
      </div>
    );
  }

  if (!book) return <div className="text-center py-20 font-serif text-2xl">Volume not found</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-border/50 pb-8">
        <div className="flex items-start gap-5">
          <Button variant="outline" size="icon" onClick={() => setLocation("/books")} className="rounded-sm border-border/50 bg-background/50 hover:bg-primary hover:text-primary-foreground hover:border-primary mt-1">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-light leading-tight text-foreground">{book.title}</h1>
            <p className="text-xl text-primary font-serif italic mt-3">{book.author}</p>
            <div className="flex items-center gap-3 mt-4">
              <span className="inline-flex items-center px-2 py-1 border border-border/50 rounded-sm text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground bg-background/50">
                {book.genre}
              </span>
              <span className="text-xs font-mono text-muted-foreground/70">{book.publishedYear}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 lg:ml-auto">
          <Dialog open={editOpen} onOpenChange={(open) => {
            setEditOpen(open);
            if (open) {
              form.reset({
                title: book.title, author: book.author, isbn: book.isbn, genre: book.genre,
                publishedYear: book.publishedYear || new Date().getFullYear(), totalCopies: book.totalCopies, description: book.description || ""
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-sm font-sans tracking-widest uppercase text-xs font-bold border-border/50 bg-background/50">
                <Edit2 className="h-3.5 w-3.5" /> Edit Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] glass-panel border border-border/30 shadow-2xl rounded-sm">
              <DialogHeader className="mb-4 border-b border-border/30 pb-4">
                <DialogTitle className="font-serif text-2xl font-light">Edit Record</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Title</FormLabel>
                      <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-serif text-lg h-12" {...field} /></FormControl>
                      <FormMessage className="text-[10px] uppercase tracking-widest" />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-5">
                    <FormField control={form.control} name="author" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Author</FormLabel>
                        <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm" {...field} /></FormControl>
                        <FormMessage className="text-[10px] uppercase tracking-widest" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="isbn" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">ISBN</FormLabel>
                        <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary font-mono text-sm rounded-sm" {...field} /></FormControl>
                        <FormMessage className="text-[10px] uppercase tracking-widest" />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    <FormField control={form.control} name="genre" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Classification</FormLabel>
                        <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm" {...field} /></FormControl>
                        <FormMessage className="text-[10px] uppercase tracking-widest" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="publishedYear" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Year</FormLabel>
                        <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary font-mono text-sm rounded-sm" type="number" {...field} /></FormControl>
                        <FormMessage className="text-[10px] uppercase tracking-widest" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="totalCopies" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Inventory</FormLabel>
                        <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary font-mono text-sm rounded-sm" type="number" min="1" {...field} /></FormControl>
                        <FormMessage className="text-[10px] uppercase tracking-widest" />
                      </FormItem>
                    )} />
                  </div>
                  <div className="pt-4 border-t border-border/30 flex justify-end">
                    <Button type="submit" disabled={updateBook.isPending} className="rounded-sm font-sans tracking-widest uppercase text-xs font-bold">
                      {updateBook.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-sm font-sans tracking-widest uppercase text-xs font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30">
                <Trash2 className="h-3.5 w-3.5" /> Withdraw
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-panel border-border/30 rounded-sm">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-serif text-2xl font-light">Withdraw Volume?</AlertDialogTitle>
                <AlertDialogDescription className="font-sans">
                  This action permanently removes the record from the catalog. Volumes currently lent to patrons cannot be withdrawn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6">
                <AlertDialogCancel className="rounded-sm font-sans tracking-widest uppercase text-xs">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="rounded-sm font-sans tracking-widest uppercase text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleteBook.isPending ? "Withdrawing..." : "Confirm Withdrawal"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-panel border-0 shadow-xl rounded-sm">
            <CardHeader className="pb-2 border-b border-border/30 mb-6">
              <CardTitle className="font-serif text-xl font-medium tracking-wide flex items-center gap-3">
                <AlignLeft className="h-5 w-5 text-primary" />
                Bibliographic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {book.description ? (
                <div className="prose prose-sm dark:prose-invert max-w-none font-serif text-lg leading-relaxed text-muted-foreground">
                  <p>{book.description}</p>
                </div>
              ) : (
                <p className="text-muted-foreground/50 font-serif italic text-lg">No description available in the ledger.</p>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4 pt-6 border-t border-border/30">
                <div>
                  <p className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2 mb-2">
                    <Hash className="h-3 w-3" /> ISBN
                  </p>
                  <p className="font-mono text-sm text-foreground">{book.isbn}</p>
                </div>
                <div>
                  <p className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2 mb-2">
                    <Library className="h-3 w-3" /> Class
                  </p>
                  <p className="font-sans font-medium text-sm text-foreground">{book.genre}</p>
                </div>
                <div>
                  <p className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2 mb-2">
                    <Calendar className="h-3 w-3" /> Published
                  </p>
                  <p className="font-sans font-medium text-sm text-foreground">{book.publishedYear || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-0 shadow-xl rounded-sm">
            <CardHeader className="pb-4 border-b border-border/30 mb-4">
              <CardTitle className="flex items-center gap-3 font-serif text-xl font-medium tracking-wide">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                Ledger History
              </CardTitle>
              <CardDescription className="font-sans uppercase tracking-widest text-[10px]">Circulation records</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-background/30">
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-3">Patron</TableHead>
                      <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-3">Issued</TableHead>
                      <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-3">Returned</TableHead>
                      <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-3">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {borrowingsLoading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8"><Skeleton className="h-8 w-1/2 mx-auto bg-muted/20" /></TableCell></TableRow>
                    ) : borrowings?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                          <p className="font-sans text-xs tracking-widest uppercase">No circulation history</p>
                        </TableCell>
                      </TableRow>
                    ) : borrowings?.map((borrowing: any) => (
                      <TableRow key={borrowing.id} className="border-border/20 hover:bg-primary/5 transition-colors">
                        <TableCell className="font-serif text-base py-4">{borrowing.member?.name || `Member #${borrowing.memberId}`}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{formatDateTime(borrowing.borrowedAt)}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{borrowing.returnedAt ? formatDateTime(borrowing.returnedAt) : "—"}</TableCell>
                        <TableCell><StatusBadge status={borrowing.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="glass-panel border-0 shadow-xl rounded-sm">
            <CardHeader className="pb-2 border-b border-border/30 mb-6">
              <CardTitle className="font-serif text-xl font-medium tracking-wide text-center">Current Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-8 bg-background/40 rounded-sm border border-border/30 shadow-inner">
                <div className="relative">
                  <div className={`absolute inset-0 blur-xl opacity-20 ${book.availableCopies === 0 ? 'bg-destructive' : 'bg-primary'}`}></div>
                  <div className={`text-7xl font-serif font-light relative z-10 ${book.availableCopies === 0 ? 'text-destructive' : 'text-primary'}`}>
                    {book.availableCopies}
                  </div>
                </div>
                <div className="w-12 h-px bg-border my-6"></div>
                <p className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground text-center">
                  Available out of {book.totalCopies} total
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
