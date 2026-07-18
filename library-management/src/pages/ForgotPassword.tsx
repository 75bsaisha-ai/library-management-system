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
import { Library, ChevronLeft, Eye, EyeOff, Check, X, Mail, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain uppercase, lowercase, and numbers"
  ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

type Step = "forgot" | "verify" | "reset" | "success";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("forgot");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const forgotForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = resetForm.watch("password");

  const passwordStrength = {
    hasLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;
  const strengthColor = strengthScore <= 2 ? "text-destructive" : strengthScore === 3 ? "text-amber-500" : "text-emerald-500";

  const onForgotSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send reset code");
      }

      setEmail(data.email);
      setStep("verify");
      toast({
        title: "Verification Code Sent",
        description: `Check your email at ${data.email} for the reset code`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reset code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (!verificationCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Invalid verification code");
      }

      const data = await response.json();
      setResetToken(data.token || verificationCode);
      setStep("reset");
      toast({
        title: "Code Verified",
        description: "You can now reset your password",
      });
    } catch (error) {
      toast({
        title: "Invalid Code",
        description: error instanceof Error ? error.message : "The verification code is incorrect or expired",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token: resetToken,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reset password");
      }

      setStep("success");
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated. Redirecting to login...",
      });

      setTimeout(() => setLocation("/login"), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password. Please try again.",
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

        {/* Card */}
        <Card className="glass-panel border-0 shadow-2xl rounded-sm">
          <CardHeader className="pb-4 border-b border-border/30">
            <div className="flex items-center gap-2">
              {step !== "forgot" && (
                <button
                  onClick={() => step === "verify" ? setStep("forgot") : setStep("verify")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              <div>
                <CardTitle className="font-serif text-2xl font-light">
                  {step === "forgot" && "Reset Password"}
                  {step === "verify" && "Verify Email"}
                  {step === "reset" && "Set New Password"}
                  {step === "success" && "Success!"}
                </CardTitle>
                <CardDescription className="font-sans text-xs tracking-widest uppercase mt-2">
                  {step === "forgot" && "Enter your email to receive a reset code"}
                  {step === "verify" && "Enter the code sent to your email"}
                  {step === "reset" && "Create a strong password"}
                  {step === "success" && "Your password has been reset"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Step 1: Forgot Password */}
            {step === "forgot" && (
              <Form {...forgotForm}>
                <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-5">
                  <FormField
                    control={forgotForm.control}
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
                  <div className="pt-4 border-t border-border/30">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-sm font-sans tracking-widest uppercase text-xs font-bold h-11"
                    >
                      {isLoading ? "Sending..." : "Send Reset Code"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 2: Verification */}
            {step === "verify" && (
              <div className="space-y-5">
                <div className="p-4 rounded-sm bg-background/30 border border-border/40 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Verification sent to</p>
                      <p className="font-mono text-sm text-foreground">{email}</p>
                    </div>
                  </div>
                </div>

                <FormItem>
                  <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
                    Verification Code
                  </FormLabel>
                  <Input
                    className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-mono text-center text-xl h-12 tracking-[0.5em]"
                    placeholder="000000"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                  <p className="text-[10px] text-muted-foreground/60 font-sans mt-2">
                    Didn't receive code? Check spam or request a new one
                  </p>
                </FormItem>

                <div className="pt-4 border-t border-border/30 space-y-2">
                  <Button
                    onClick={handleVerificationSubmit}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full rounded-sm font-sans tracking-widest uppercase text-xs font-bold h-11"
                  >
                    {isLoading ? "Verifying..." : "Verify Code"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setStep("forgot")}
                    className="w-full rounded-sm font-sans tracking-widest uppercase text-xs font-bold h-11"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Reset Password */}
            {step === "reset" && (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5">
                  <FormField
                    control={resetForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
                            New Password
                          </FormLabel>
                          <div className={cn("text-[9px] font-sans font-bold uppercase tracking-widest", strengthColor)}>
                            {strengthScore === 0 ? "—" : strengthScore <= 2 ? "Weak" : strengthScore === 3 ? "Good" : "Strong"}
                          </div>
                        </div>

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

                  <FormField
                    control={resetForm.control}
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

                  <div className="pt-4 border-t border-border/30">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-sm font-sans tracking-widest uppercase text-xs font-bold h-11"
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 4: Success */}
            {step === "success" && (
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-30"></div>
                    <div className="relative bg-emerald-500/10 p-4 rounded-sm border border-emerald-500/20">
                      <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-xl text-foreground mb-2">Password Reset Complete</h3>
                  <p className="text-sm text-muted-foreground font-sans">
                    Your password has been successfully reset. You'll be redirected to the login page shortly.
                  </p>
                </div>

                <Button
                  onClick={() => setLocation("/login")}
                  className="w-full rounded-sm font-sans tracking-widest uppercase text-xs font-bold h-11"
                >
                  Go to Login
                </Button>
              </div>
            )}

            {/* Back to Login */}
            {step === "forgot" && (
              <div className="text-center text-sm font-sans mt-4">
                <span className="text-muted-foreground">Remember your password? </span>
                <button
                  type="button"
                  onClick={() => setLocation("/login")}
                  className="text-primary hover:text-primary/80 font-medium tracking-wide transition-colors"
                >
                  Sign in
                </button>
              </div>
            )}
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
