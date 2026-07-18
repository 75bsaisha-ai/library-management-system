import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";
import { PrivateRoute } from "@/components/PrivateRoute";
import Dashboard from "@/pages/Dashboard";
import Books from "@/pages/Books";
import BookDetail from "@/pages/BookDetail";
import Members from "@/pages/Members";
import MemberDetail from "@/pages/MemberDetail";
import Borrowings from "@/pages/Borrowings";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Profile from "@/pages/Profile";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route>
        {() => (
          <AppLayout>
            <Switch>
              <Route path="/">
                {() => (
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                )}
              </Route>
              <Route path="/profile">
                {() => (
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                )}
              </Route>
              <Route path="/books">
                {() => (
                  <PrivateRoute>
                    <Books />
                  </PrivateRoute>
                )}
              </Route>
              <Route path="/books/:id">
                {() => (
                  <PrivateRoute>
                    <BookDetail />
                  </PrivateRoute>
                )}
              </Route>
              <Route path="/members">
                {() => (
                  <PrivateRoute>
                    <Members />
                  </PrivateRoute>
                )}
              </Route>
              <Route path="/members/:id">
                {() => (
                  <PrivateRoute>
                    <MemberDetail />
                  </PrivateRoute>
                )}
              </Route>
              <Route path="/borrowings">
                {() => (
                  <PrivateRoute>
                    <Borrowings />
                  </PrivateRoute>
                )}
              </Route>
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
