import { useGetDashboardStats, useGetPopularBooks, useGetOverdueBorrowings, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, AlertCircle, TrendingUp, Clock, History, CheckCircle2, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { formatDateTime } from "@/lib/formatters";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: popularBooks, isLoading: popularLoading } = useGetPopularBooks({ limit: 5 });
  const { data: overdue, isLoading: overdueLoading } = useGetOverdueBorrowings();
  const { data: recentActivity, isLoading: recentLoading } = useGetRecentActivity({ limit: 5 });

  return (
    <div className="space-y-12 pb-12">
      <div className="border-b border-border/50 pb-6 relative">
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-2 font-sans tracking-wide uppercase text-xs">Today's snapshot of library operations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Catalog" 
          value={stats?.totalBooks} 
          icon={<BookOpen className="h-5 w-5 text-primary/70" />} 
          loading={statsLoading}
          description={`${stats?.availableBooks || 0} currently available`}
        />
        <StatCard 
          title="Active Patrons" 
          value={stats?.totalMembers} 
          icon={<Users className="h-5 w-5 text-primary/70" />} 
          loading={statsLoading}
          description="Registered members"
        />
        <StatCard 
          title="Active Borrowings" 
          value={stats?.activeBorrowings} 
          icon={<TrendingUp className="h-5 w-5 text-primary/70" />} 
          loading={statsLoading}
          description={`${stats?.returnedToday || 0} returned today`}
        />
        <StatCard 
          title="Outstanding Fines" 
          value={stats?.totalOutstandingFines != null ? `$${stats.totalOutstandingFines.toFixed(2)}` : "$0.00"}
          rawValue={stats?.totalOutstandingFines}
          icon={<DollarSign className="h-5 w-5 text-destructive/70" />} 
          loading={statsLoading}
          description={`${stats?.overdueCount || 0} overdue items`}
          accent={stats?.totalOutstandingFines ? "destructive" : undefined}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <Card className="glass-panel border-0 shadow-2xl overflow-hidden rounded-sm relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-transparent"></div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 font-serif text-xl font-medium tracking-wide">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overdueLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full bg-muted/20" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {overdue?.slice(0, 5).map((borrowing) => {
                    const fine = borrowing.fineAmount ?? 0;
                    return (
                      <div key={borrowing.id} className="group flex items-center justify-between border-b border-border/40 last:border-0 pb-4 last:pb-0 transition-colors">
                        <div className="flex flex-col gap-1">
                          <Link href={`/books/${borrowing.bookId}`} className="font-serif text-lg hover:text-primary transition-colors text-foreground truncate max-w-[200px]">
                            {borrowing.book?.title || `Book #${borrowing.bookId}`}
                          </Link>
                          <Link href={`/members/${borrowing.memberId}`} className="text-xs font-sans text-muted-foreground hover:text-foreground uppercase tracking-wider">
                            {borrowing.member?.name || `Member #${borrowing.memberId}`}
                          </Link>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-destructive bg-destructive/10 px-2 py-1 rounded-sm uppercase">
                            <Clock className="h-3 w-3" />
                            Due {new Date(borrowing.dueAt).toLocaleDateString()}
                          </div>
                          {fine > 0 && (
                            <div className="text-xs font-mono font-bold text-destructive/80 tracking-wider">
                              Fine: ${fine.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {!overdue?.length && (
                    <div className="flex flex-col items-center justify-center py-8 text-emerald-500/70">
                      <CheckCircle2 className="h-10 w-10 mb-3 opacity-50" strokeWidth={1} />
                      <p className="text-sm font-sans tracking-widest uppercase">All records clear</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel border-0 shadow-2xl rounded-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 font-serif text-xl font-medium tracking-wide">
                <History className="h-5 w-5 text-primary" />
                Recent Ledger
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full bg-muted/20" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity?.map((activity: any) => (
                    <div key={activity.id} className="flex items-center justify-between border-b border-border/40 last:border-0 pb-4 last:pb-0">
                      <div className="flex flex-col gap-1.5">
                        <div className="text-sm font-serif">
                          <Link href={`/members/${activity.memberId}`} className="font-medium hover:text-primary transition-colors text-foreground">
                            {activity.member?.name || `Member #${activity.memberId}`}
                          </Link>
                          <span className="text-muted-foreground italic mx-1.5">
                            {activity.status === "returned" ? "returned" : "borrowed"}
                          </span>
                          <Link href={`/books/${activity.bookId}`} className="font-medium hover:text-primary transition-colors text-foreground">
                            {activity.book?.title || `Book #${activity.bookId}`}
                          </Link>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans">
                          {formatDateTime(activity.status === "returned" ? activity.returnedAt : activity.borrowedAt)}
                        </span>
                      </div>
                      <StatusBadge status={activity.status} />
                    </div>
                  ))}
                  {!recentActivity?.length && <p className="text-xs uppercase tracking-widest text-muted-foreground py-8 text-center">No recent entries</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="glass-panel border-0 shadow-2xl rounded-sm">
            <CardHeader className="pb-4 border-b border-border/30 mb-4">
              <CardTitle className="flex items-center gap-3 font-serif text-xl font-medium tracking-wide">
                <BookOpen className="h-5 w-5 text-primary" />
                Frequently Requested
              </CardTitle>
            </CardHeader>
            <CardContent>
              {popularLoading ? (
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full bg-muted/20" />)}
                </div>
              ) : (
                <div className="space-y-6">
                  {popularBooks?.map((book, index) => (
                    <div key={book.id} className="group flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 text-right font-serif text-2xl font-light text-muted-foreground group-hover:text-primary transition-colors">
                        0{index + 1}
                      </div>
                      <div className="flex-1 min-w-0 border-b border-border/40 pb-5">
                        <Link href={`/books/${book.id}`} className="block group-hover:translate-x-1 transition-transform">
                          <h3 className="font-serif text-lg leading-tight text-foreground truncate">{book.title}</h3>
                          <p className="text-sm text-muted-foreground font-sans tracking-wide mt-1 truncate">{book.author}</p>
                        </Link>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary/80 bg-primary/5 px-2 py-0.5 rounded-sm">
                            {book.genre}
                          </span>
                          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">
                            {book.borrowCount} borrows
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!popularBooks?.length && <p className="text-xs uppercase tracking-widest text-muted-foreground py-8 text-center">No catalog data</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, rawValue, icon, loading, description, accent }: any) {
  const isDestructive = accent === "destructive";
  return (
    <Card className="glass-panel border-0 shadow-xl rounded-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <p className="text-xs font-sans font-bold tracking-widest uppercase text-muted-foreground">{title}</p>
          <div className={`p-2 rounded-sm border shadow-inner ${isDestructive ? "bg-destructive/5 border-destructive/20" : "bg-background border-border/50"}`}>
            {icon}
          </div>
        </div>
        <div>
          {loading ? (
            <Skeleton className="h-12 w-24 bg-muted/20 mb-2" />
          ) : (
            <h3 className={`text-5xl font-serif font-light mb-2 ${isDestructive && rawValue > 0 ? "text-destructive" : "text-foreground"}`}>
              {value ?? 0}
            </h3>
          )}
          {description && (
            <p className="text-xs font-sans tracking-wide text-muted-foreground/70">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
