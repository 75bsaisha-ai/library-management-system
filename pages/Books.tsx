import { useState } from "react";
import { Link } from "wouter";
import { useListBooks, useCreateBook, getListBooksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Search, Plus, Book, MoreHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().min(1, "ISBN is required"),
  genre: z.string().min(1, "Genre is required"),
  publishedYear: z.coerce.number().min(1000).max(new Date().getFullYear()),
  totalCopies: z.coerce.number().min(1, "Must have at least 1 copy"),
  description: z.string().optional(),
});

export default function Books() {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const { data: allBooks } = useListBooks({});
  const { data: books, isLoading } = useListBooks({
    search: search || undefined,
    genre: genreFilter !== "all" ? genreFilter : undefined,
  });

  const createBook = useCreateBook();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const genres = Array.from(new Set((allBooks ?? []).map((b) => b.genre))).sort();

  const form = useForm<z.infer<typeof bookSchema>>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "", author: "", isbn: "", genre: "", totalCopies: 1, description: "", publishedYear: new Date().getFullYear(),
    },
  });

  const onSubmit = (data: z.infer<typeof bookSchema>) => {
    createBook.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
        setOpen(false);
        form.reset();
        toast({ title: "Success", description: "Book added to catalog." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to add book.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-border/50 pb-6 relative">
        <div>
          <h1 className="text-4xl font-serif font-light tracking-tight text-foreground">Catalog</h1>
          <p className="text-muted-foreground mt-2 font-sans tracking-wide uppercase text-xs">The complete library collection</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-sm font-sans tracking-widest uppercase text-xs font-bold gap-2">
              <Plus className="h-4 w-4" /> Add Volume
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] glass-panel border border-border/30 shadow-2xl rounded-sm">
            <DialogHeader className="mb-4 border-b border-border/30 pb-4">
              <DialogTitle className="font-serif text-2xl font-light">Accession New Volume</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Title</FormLabel>
                    <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-serif text-lg h-12" placeholder="The Great Gatsby" {...field} /></FormControl>
                    <FormMessage className="text-[10px] uppercase tracking-widest" />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-5">
                  <FormField control={form.control} name="author" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Author</FormLabel>
                      <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm" placeholder="F. Scott Fitzgerald" {...field} /></FormControl>
                      <FormMessage className="text-[10px] uppercase tracking-widest" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isbn" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">ISBN</FormLabel>
                      <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary font-mono text-sm rounded-sm" placeholder="978-0743273565" {...field} /></FormControl>
                      <FormMessage className="text-[10px] uppercase tracking-widest" />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-3 gap-5">
                  <FormField control={form.control} name="genre" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Classification</FormLabel>
                      <FormControl><Input className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm" placeholder="Fiction" {...field} /></FormControl>
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
                  <Button type="submit" disabled={createBook.isPending} className="rounded-sm font-sans tracking-widest uppercase text-xs font-bold">
                    {createBook.isPending ? "Adding..." : "Accession to Catalog"}
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
                placeholder="Query catalog by title, author, or ISBN..."
                className="pl-11 bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm h-12 font-serif text-base placeholder:font-sans placeholder:text-sm placeholder:tracking-wide"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {genres.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground mr-1">Genre:</span>
                <ToggleGroup
                  type="single"
                  value={genreFilter}
                  onValueChange={(v) => { if (v) setGenreFilter(v); }}
                  className="flex-wrap justify-start gap-2"
                >
                  <ToggleGroupItem
                    value="all"
                    className="rounded-sm px-3 h-7 font-sans text-[10px] uppercase tracking-widest data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-transparent data-[state=off]:border-border/50"
                  >
                    All
                  </ToggleGroupItem>
                  {genres.map((g) => (
                    <ToggleGroupItem
                      key={g}
                      value={g}
                      className="rounded-sm px-3 h-7 font-sans text-[10px] uppercase tracking-widest data-[state=on]:bg-primary/20 data-[state=on]:text-primary data-[state=on]:border-primary/40 border border-transparent data-[state=off]:border-border/50"
                    >
                      {g}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-background/50">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="w-[400px] text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-4">Title & Author</TableHead>
                  <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-4">Classification</TableHead>
                  <TableHead className="text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-4">ISBN</TableHead>
                  <TableHead className="text-right text-[10px] font-sans font-bold tracking-widest uppercase text-muted-foreground py-4">Availability</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <TableRow key={i} className="border-border/20">
                      <TableCell className="py-4"><Skeleton className="h-12 w-full bg-muted/20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 bg-muted/20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24 bg-muted/20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12 ml-auto bg-muted/20" /></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))
                ) : books?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                      <Book className="h-10 w-10 mx-auto mb-4 opacity-20" strokeWidth={1} />
                      <p className="font-sans text-sm tracking-widest uppercase">No volumes found</p>
                    </TableCell>
                  </TableRow>
                ) : books?.map((book) => (
                  <TableRow key={book.id} className="hover:bg-primary/5 cursor-pointer border-border/20 transition-colors group">
                    <TableCell className="py-4">
                      <Link href={`/books/${book.id}`} className="block">
                        <div className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">{book.title}</div>
                        <div className="text-sm font-sans tracking-wide text-muted-foreground mt-0.5">{book.author}</div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 border border-border/50 rounded-sm text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground bg-background/50">
                        {book.genre}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground/70 tracking-widest">{book.isbn}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono text-base font-medium ${book.availableCopies === 0 ? 'text-destructive' : 'text-primary'}`}>
                        {book.availableCopies} <span className="text-muted-foreground/50 font-sans text-xs">/ {book.totalCopies}</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/books/${book.id}`}>
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
