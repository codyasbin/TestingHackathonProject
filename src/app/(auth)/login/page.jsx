"use client";

import {useForm} from "react-hook-form";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Separator} from "@/components/ui/separator";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]");

      // Find user with matching email and password
      const user = users.find(
        (u) => u.email === data.email && u.password === data.password
      );

      if (!user) {
        // alert("Invalid email or password!");
        toast.error("Invalid email or password!");
        setIsSubmitting(false);
        return;
      }

      // Store the full user object in localStorage
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("id", user.id);
      localStorage.setItem("role", user.role);

      // alert(`Welcome back, ${user.name}!`);

      // Redirect based on user role
      router.push("/")
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mb-4">
            <span className="text-5xl">🔧</span>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">Login to Sahayog and continue saving the planet</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                placeholder="ram@example.com"
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                })}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Remember me
                </Label>
              </div>
              <a href="#" className="text-sm text-green-600 hover:text-green-700 font-medium">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-shadow mt-6" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <Separator />
            <span className="px-2 text-sm text-muted-foreground">OR</span>
            <Separator />
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-gray-700 font-medium">Continue with Google</span>
            </Button>
          </div>

          {/* Signup Link */}
          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{" "}
            <a href="/signup" className="text-green-600 font-semibold hover:underline">
              Sign up
            </a>
          </p>

          {/* Demo Credentials Helper */}
          <Alert className="mt-6 border-blue-200">
            <AlertTitle className="text-xs text-blue-800 font-medium">🔍 For testing purposes:</AlertTitle>
            <AlertDescription className="text-xs text-blue-700">Create an account first via the signup page, then login here with those credentials.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}