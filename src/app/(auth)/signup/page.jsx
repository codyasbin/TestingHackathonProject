"use client";

import {useForm} from "react-hook-form";
import {useState} from "react";
import {useRouter} from "next/navigation";

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState("customer"); // customer or provider
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm();

  const password = watch("password");

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

      // Create user object
      const newUser = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password, // In production, NEVER store plain passwords!
        userType: userType,
        ...(userType === "provider" && {
          skills: data.skills,
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
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sahayog</h1>
          <p className="text-gray-600">Fix, don't replace. Save the planet together.</p>
        </div>

        {/* User Type Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setUserType("customer")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${userType === "customer" ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:text-gray-800"}`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setUserType("provider")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${userType === "provider" ? "bg-green-600 text-white shadow-md" : "text-gray-600 hover:text-gray-800"}`}
          >
            Service Provider
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Please enter a valid 10-digit phone number",
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="9876543210"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>
          {/* Provider-specific fields */}
          {userType === "provider" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills/Services</label>
                <select
                  {...register("skills", {
                    required: "Please select a skill or choose Other",
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white"
                >
                  <option value="">Select a skill</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Painting">Painting</option>
                  <option value="Other">Other</option>
                </select>
                {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills.message}</p>}
              </div>

              {/* If "Other" selected, show a text input so user can type their skill */}
              {watch("skills") === "Other" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Please specify your skill</label>
                  <input
                    type="text"
                    {...register("otherSkill", {
                      validate: (value) => watch("skills") !== "Other" || (value && value.trim().length > 0) || "Please enter the skill",
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="e.g. Appliance repair"
                  />
                  {errors.otherSkill && <p className="text-red-500 text-sm mt-1">{errors.otherSkill.message}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  {...register("experience", {
                    required: "Experience is required",
                    min: {value: 0, message: "Experience cannot be negative"},
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="5"
                />
                {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Location</label>
                <input
                  type="text"
                  {...register("location", {
                    required: "Location is required for service providers",
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="Pokhara, Nepal"
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => value === password || "Passwords do not match",
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-green-600 font-semibold hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
