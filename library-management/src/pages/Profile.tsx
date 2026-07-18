import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronLeft, Edit2, Trash2, User, Mail, Phone, LogOut, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrivateRoute } from "@/components/PrivateRoute";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const passwordForm = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`, // Replace with actual token if available
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const updatedUser = await response.json();
      updateUser({ ...user!, ...updatedUser });
      setEditOpen(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id}`, // Replace with actual token if available
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }

      setPasswordOpen(false);
      passwordForm.reset();
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  if (!user) return null;

  return (
    <PrivateRoute>
      <div className="space-y-8 pb-12">
        <div className="flex items-center gap-6 border-b border-border/50 pb-6 relative">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/")}
            className="rounded-sm border-border/50 bg-background/50 hover:bg-primary hover:text-primary-foreground hover:border-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-light leading-tight text-foreground">My Profile</h1>
            <p className="text-muted-foreground text-sm font-sans tracking-widest uppercase mt-2">Manage your account settings</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="md:col-span-2 space-y-8">
            <Card className="glass-panel border-0 shadow-xl rounded-sm">
              <CardHeader className="pb-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-xl font-medium tracking-wide flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    Profile Information
                  </CardTitle>
                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-sm font-sans tracking-widest uppercase text-xs font-bold border-border/50 bg-background/50"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] glass-panel border-border/30 rounded-sm">
                      <DialogHeader className="mb-4 border-b border-border/30 pb-4">
                        <DialogTitle className="font-serif text-2xl font-light">Edit Profile</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-5">
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
                                    className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-serif text-lg h-11"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase tracking-widest" />
                              </FormItem>
                            )}
                          />
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
                                    type="email"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase tracking-widest" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
                                  Phone (Optional)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-mono text-sm h-11"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase tracking-widest" />
                              </FormItem>
                            )}
                          />
                          <div className="pt-4 border-t border-border/30 flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditOpen(false)}
                              className="rounded-sm font-sans tracking-widest uppercase text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={isLoading}
                              className="rounded-sm font-sans tracking-widest uppercase text-xs font-bold"
                            >
                              {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-start gap-4 p-4 rounded-sm bg-background/30 border border-border/40">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground">Full Name</p>
                      <p className="font-serif text-lg text-foreground mt-1">{user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-sm bg-background/30 border border-border/40">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground">Email Address</p>
                      <p className="font-mono text-sm text-foreground mt-1 break-all">{user.email}</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-start gap-4 p-4 rounded-sm bg-background/30 border border-border/40">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground">Phone Number</p>
                        <p className="font-mono text-sm text-foreground mt-1">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card className="glass-panel border-0 shadow-xl rounded-sm">
              <CardHeader className="pb-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-xl font-medium tracking-wide flex items-center gap-3">
                    <Lock className="h-5 w-5 text-primary" />
                    Security
                  </CardTitle>
                  <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-sm font-sans tracking-widest uppercase text-xs font-bold border-border/50 bg-background/50"
                      >
                        <Lock className="h-3.5 w-3.5" /> Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] glass-panel border-border/30 rounded-sm">
                      <DialogHeader className="mb-4 border-b border-border/30 pb-4">
                        <DialogTitle className="font-serif text-2xl font-light">Change Password</DialogTitle>
                      </DialogHeader>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
                                  Current Password
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-mono text-sm h-11"
                                    type="password"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase tracking-widest" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
                                  New Password
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-mono text-sm h-11"
                                    type="password"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase tracking-widest" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
                                  Confirm New Password
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    className="bg-background/50 border-border/50 focus-visible:ring-primary rounded-sm font-mono text-sm h-11"
                                    type="password"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-[10px] uppercase tracking-widest" />
                              </FormItem>
                            )}
                          />
                          <div className="pt-4 border-t border-border/30 flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setPasswordOpen(false)}
                              className="rounded-sm font-sans tracking-widest uppercase text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={isLoading}
                              className="rounded-sm font-sans tracking-widest uppercase text-xs font-bold"
                            >
                              {isLoading ? "Updating..." : "Update Password"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground font-sans mb-4">
                  Your password is encrypted and stored securely. We recommend using a strong, unique password.
                </p>
                <div className="p-4 rounded-sm bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-xs font-sans tracking-widest uppercase text-emerald-600">✓ Password Protected</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-4">
            <Card className="glass-panel border-0 shadow-xl rounded-sm">
              <CardHeader className="pb-4 border-b border-border/30">
                <CardTitle className="font-serif text-lg font-medium">Account</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full gap-2 rounded-sm font-sans tracking-widest uppercase text-xs font-bold border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground justify-start"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-panel border-border/30 rounded-sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-serif text-2xl font-light">Logout</AlertDialogTitle>
                      <AlertDialogDescription className="font-sans">
                        Are you sure you want to logout? You'll need to sign in again to access your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                      <AlertDialogCancel className="rounded-sm font-sans tracking-widest uppercase text-xs">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLogout}
                        className="rounded-sm font-sans tracking-widest uppercase text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            <Card className="glass-panel border-0 shadow-xl rounded-sm">
              <CardHeader className="pb-4 border-b border-border/30">
                <CardTitle className="font-serif text-lg font-medium">Member Info</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <div>
                  <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground">Member ID</p>
                  <p className="font-mono text-sm text-foreground mt-1">{user.id}</p>
                </div>
                {user.membershipType && (
                  <div>
                    <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground">Membership Type</p>
                    <p className="font-sans text-sm text-foreground mt-1 capitalize">{user.membershipType}</p>
                  </div>
                )}
                {user.status && (
                  <div>
                    <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground">Status</p>
                    <p className="font-sans text-sm text-foreground mt-1 capitalize">{user.status}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
}
