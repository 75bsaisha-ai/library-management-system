import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Library, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password, data.rememberMe);
      
      toast({
        title: "Login Successful",
        description: "Welcome back to Folio Library!",
      });
      
      setTimeout(() => setLocation("/"), 1000);
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative ambient light */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/3 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-4">
            <Library className="h-7 w-7" />
          </div>
          <h1 className="text-4xl font-serif font-light tracking-tight text-foreground">Folio</h1>
          <p className="text-muted-foreground text-sm font-sans tracking-widest uppercase mt-2">Library Management System</p>
        </div>

        {/* Login Card */}
        <Card className="glass-panel border-0 shadow-2xl rounded-sm">
          <CardHeader className="pb-4 border-b border-border/30">
            <CardTitle className="font-serif text-2xl font-light">Sign In</CardTitle>
            <CardDescription className="font-sans text-xs tracking-widest uppercase mt-2">
              Access your library management portal
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-mono text-sm h-11"
                          placeholder="jane@example.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase tracking-widest" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-mono text-sm h-11 pr-10"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase tracking-widest" />
                    </FormItem>
                  )}
                />

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded-sm border-border/50 bg-background/50 accent-primary cursor-pointer"
                          />
                        </FormControl>
                        <FormLabel className="font-sans text-xs cursor-pointer text-muted-foreground">
                          Remember me
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setLocation("/forgot-password")}
                    className="text-xs text-primary hover:text-primary/80 font-medium tracking-wide transition-colors font-sans"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-border/30">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-sm font-sans tracking-widest uppercase text-xs font-bold h-11"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>

                {/* Register Link */}
                <div className="text-center text-sm font-sans space-y-3">
                  <div>
                    <span className="text-muted-foreground">New to Folio? </span>
                    <button
                      type="button"
                      onClick={() => setLocation("/register")}
                      className="text-primary hover:text-primary/80 font-medium tracking-wide transition-colors"
                    >
                      Create an account
                    </button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Features Info */}
        <div className="mt-8 space-y-3 text-xs font-sans text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            <span>Manage your library catalog and circulation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            <span>Track member accounts and loan history</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            <span>Monitor fines and manage returns</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground font-sans tracking-widest uppercase mt-8">
          © 2026 Library Management System
        </p>
      </div>
    </div>
  );
}
