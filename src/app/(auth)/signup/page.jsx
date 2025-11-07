"use client";

import {useForm, Controller} from "react-hook-form";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {authService} from "@/services/authservices";

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState("customer"); // customer or provider
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: {errors},
  } = useForm();

  const password = watch("password");
  const skills = watch("skills");

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Get existing users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");

      // Check if email already exists
      const emailExists = existingUsers.some((user) => user.email === data.email);

      if (emailExists) {
        alert("Email already registered! Please login.");
        setIsSubmitting(false);
        return;
      }

      // Handle "Other" skill
      let finalSkills = data.skills;
      if (userType === "provider" && data.skills === "Other") {
        finalSkills = data.otherSkill || "Other";
      }

      // Create user object
      const newUser = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password, // In production, NEVER store plain passwords!
        userType: userType,
        ...(userType === "provider" && {
          skills: finalSkills,
          experience: data.experience,
          location: data.location,
        }),
        createdAt: new Date().toISOString(),
      };

      // Add new user to array
      existingUsers.push(newUser);

      // Save to localStorage
      localStorage.setItem("users", JSON.stringify(existingUsers));

      // Set current user
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      alert("Account created successfully!");

      // Redirect based on user type
      if (userType === "customer") {
        router.push("/dashboard");
      } else {
        router.push("/provider-dashboard");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen  from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold text-gray-800">Sahayog</CardTitle>
          <CardDescription className="text-gray-600">Fix, don't replace. Save the planet together.</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {/* User Type Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={userType === "customer" ? "default" : "outline"}
              className={`flex-1 transition-all ${userType === "customer" ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}`}
              onClick={() => setUserType("customer")}
            >
              Customer
            </Button>
            <Button
              variant={userType === "provider" ? "default" : "outline"}
              className={`flex-1 transition-all ${userType === "provider" ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}`}
              onClick={() => setUserType("provider")}
            >
              Service Provider
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
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
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit phone number",
                  },
                })}
                placeholder="9876543210"
              />
              {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
            </div>

            {/* Provider-specific fields */}
            {userType === "provider" && (
              <>
                {/* Skills */}
                <div className="space-y-1">
                  <Label htmlFor="skills">Skills/Services</Label>
                  <Controller
                    name="skills"
                    control={control}
                    rules={{
                      required: "Please select a skill or choose Other",
                    }}
                    render={({field}) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a skill" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Plumbing">Plumbing</SelectItem>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                          <SelectItem value="Carpentry">Carpentry</SelectItem>
                          <SelectItem value="Painting">Painting</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.skills && <p className="text-destructive text-sm">{errors.skills.message}</p>}
                </div>

                {/* If "Other" selected, show text input */}
                {skills === "Other" && (
                  <div className="space-y-1">
                    <Label htmlFor="otherSkill">Please specify your skill</Label>
                    <Input
                      id="otherSkill"
                      type="text"
                      {...register("otherSkill", {
                        validate: (value) => skills !== "Other" || (value && value.trim().length > 0) || "Please enter the skill",
                      })}
                      placeholder="e.g. Appliance repair"
                    />
                    {errors.otherSkill && <p className="text-destructive text-sm">{errors.otherSkill.message}</p>}
                  </div>
                )}

                {/* Experience */}
                <div className="space-y-1">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    {...register("experience", {
                      required: "Experience is required",
                      min: {value: 0, message: "Experience cannot be negative"},
                    })}
                    placeholder="5"
                  />
                  {errors.experience && <p className="text-destructive text-sm">{errors.experience.message}</p>}
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <Label htmlFor="location">Service Location</Label>
                  <Input
                    id="location"
                    type="text"
                    {...register("location", {
                      required: "Location is required for service providers",
                    })}
                    placeholder="Pokhara, Nepal"
                  />
                  {errors.location && <p className="text-destructive text-sm">{errors.location.message}</p>}
                </div>
              </>
            )}

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match",
                })}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-shadow" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-green-600 font-semibold hover:underline">
              Login
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
