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
import { Library, Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain uppercase, lowercase, and numbers"
  ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const password = form.watch("password");

  const passwordStrength = {
    hasLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;
  const strengthColor = strengthScore <= 2 ? "text-destructive" : strengthScore === 3 ? "text-amber-500" : "text-emerald-500";

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      
      toast({
        title: "Registration Successful",
        description: "Welcome to Folio Library! Redirecting to dashboard...",
      });
      
      setTimeout(() => setLocation("/"), 1500);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again or contact support.",
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

        {/* Registration Card */}
        <Card className="glass-panel border-0 shadow-2xl rounded-sm">
          <CardHeader className="pb-4 border-b border-border/30">
            <CardTitle className="font-serif text-2xl font-light">Create Your Account</CardTitle>
            <CardDescription className="font-sans text-xs tracking-widest uppercase mt-2">
              Join Folio to manage library resources
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-serif text-base h-11"
                          placeholder="Jane Doe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase tracking-widest" />
                    </FormItem>
                  )}
                />

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
                      <div className="flex items-center justify-between mb-2">
                        <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
                          Password
                        </FormLabel>
                        <div className="flex items-center gap-1.5">
                          <div className={cn("text-[9px] font-sans font-bold uppercase tracking-widest", strengthColor)}>
                            {strengthScore === 0 ? "—" : strengthScore <= 2 ? "Weak" : strengthScore === 3 ? "Good" : "Strong"}
                          </div>
                        </div>
                      </div>

                      {/* Password Strength Indicator */}
                      <div className="grid grid-cols-4 gap-1.5 mb-3">
                        <div className={cn(
                          "h-1 rounded-full transition-colors",
                          passwordStrength.hasLength ? "bg-emerald-500" : "bg-muted/30"
                        )} />
                        <div className={cn(
                          "h-1 rounded-full transition-colors",
                          passwordStrength.hasUppercase ? "bg-emerald-500" : "bg-muted/30"
                        )} />
                        <div className={cn(
                          "h-1 rounded-full transition-colors",
                          passwordStrength.hasLowercase ? "bg-emerald-500" : "bg-muted/30"
                        )} />
                        <div className={cn(
                          "h-1 rounded-full transition-colors",
                          passwordStrength.hasNumber ? "bg-emerald-500" : "bg-muted/30"
                        )} />
                      </div>

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

                      {/* Password Requirements */}
                      <div className="mt-3 space-y-1.5 text-[10px] font-sans">
                        <div className="flex items-center gap-2">
                          {passwordStrength.hasLength ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground/40" />
                          )}
                          <span className={passwordStrength.hasLength ? "text-emerald-500" : "text-muted-foreground/60"}>
                            At least 8 characters
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {passwordStrength.hasUppercase ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground/40" />
                          )}
                          <span className={passwordStrength.hasUppercase ? "text-emerald-500" : "text-muted-foreground/60"}>
                            One uppercase letter
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {passwordStrength.hasLowercase ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground/40" />
                          )}
                          <span className={passwordStrength.hasLowercase ? "text-emerald-500" : "text-muted-foreground/60"}>
                            One lowercase letter
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {passwordStrength.hasNumber ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground/40" />
                          )}
                          <span className={passwordStrength.hasNumber ? "text-emerald-500" : "text-muted-foreground/60"}>
                            One number
                          </span>
                        </div>
                      </div>

                      <FormMessage className="text-[10px] uppercase tracking-widest mt-2" />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-mono text-sm h-11 pr-10"
                            type={showConfirm ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showConfirm ? (
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

                {/* Submit Button */}
                <div className="pt-4 border-t border-border/30">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-sm font-sans tracking-widest uppercase text-xs font-bold h-11"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>

                {/* Login Link */}
                <div className="text-center text-sm font-sans">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => setLocation("/login")}
                    className="text-primary hover:text-primary/80 font-medium tracking-wide transition-colors"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground font-sans tracking-widest uppercase mt-6">
          © 2026 Library Management System
        </p>
      </div>
    </div>
  );
}
