"use client";

import {useForm} from "react-hook-form";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {CheckCircle2, ArrowLeft} from "lucide-react";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: new password, 3: success
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: {errors},
    reset,
  } = useForm();

  const newPassword = watch("newPassword");

  // Step 1: Verify email exists
  const onSubmitEmail = async (data) => {
    setIsSubmitting(true);

    try {
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]");

      // Check if email exists
      const userExists = users.find((u) => u.email === data.email);

      if (!userExists) {
        alert("No account found with this email address.");
        setIsSubmitting(false);
        return;
      }

      // Store email and move to next step
      setUserEmail(data.email);
      setStep(2);
      reset();
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Reset password
  const onSubmitNewPassword = async (data) => {
    setIsSubmitting(true);

    try {
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]");

      // Find user and update password
      const updatedUsers = users.map((user) => {
        if (user.email === userEmail) {
          return {...user, password: data.newPassword};
        }
        return user;
      });

      // Save updated users back to localStorage
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      // Move to success step
      setStep(3);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mb-4">
            <span className="text-5xl">🔐</span>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Reset Password"}
            {step === 3 && "Password Reset!"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {step === 1 && "Enter your email address to reset your password"}
            {step === 2 && "Enter your new password"}
            {step === 3 && "Your password has been successfully reset"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {/* Step 1: Email Form */}
          {step === 1 && (
            <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-5">
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
                {errors.email && (
                  <p className="text-destructive text-sm">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-shadow"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Verifying..." : "Continue"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/login")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </form>
          )}

          {/* Step 2: New Password Form */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmitNewPassword)} className="space-y-5">
              <Alert className="border-blue-200">
                <AlertDescription className="text-sm text-blue-700">
                  Resetting password for: <strong>{userEmail}</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-1">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...register("newPassword", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  placeholder="••••••••"
                />
                {errors.newPassword && (
                  <p className="text-destructive text-sm">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  })}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-shadow"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep(1);
                  setUserEmail("");
                  reset();
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </form>
          )}

          {/* Step 3: Success Message */}
          {step === 3 && (
            <div className="space-y-5 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>

              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-sm text-green-800">
                  Your password has been successfully reset. You can now login with
                  your new password.
                </AlertDescription>
              </Alert>

              <Button
                className="w-full bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-shadow"
                onClick={() => router.push("/login")}
              >
                Go to Login
              </Button>
            </div>
          )}

          {/* Info Alert */}
          {step === 1 && (
            <Alert className="mt-6 border-blue-200">
              <AlertDescription className="text-xs text-blue-700">
                💡 Enter the email address associated with your account to reset your
                password.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}