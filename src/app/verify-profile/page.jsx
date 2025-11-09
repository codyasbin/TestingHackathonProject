"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Header from "../components/header"
import Footer from "../components/footer"



import { 
  CheckCircle, 
  Upload, 
  X, 
  Shield, 
  FileText, 
  Award,
  AlertCircle,
  Info,
  Loader2
} from "lucide-react"
import Head from "next/head"

export default function VerificationPage() {
  const [uploadedFiles, setUploadedFiles] = useState({
    idProof: null,
    certification: null,
    businessLicense: null,
    insurance: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationSubmitted, setVerificationSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm()

  const verificationStatus = watch("verificationStatus") || "pending"

  const handleFileUpload = (fileType, event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPG, PNG, and PDF files are allowed")
        return
      }

      setUploadedFiles({
        ...uploadedFiles,
        [fileType]: {
          name: file.name,
          size: (file.size / 1024).toFixed(2) + " KB",
          type: file.type,
          url: URL.createObjectURL(file),
        },
      })
    }
  }

  const removeFile = (fileType) => {
    setUploadedFiles({
      ...uploadedFiles,
      [fileType]: null,
    })
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    setTimeout(() => {
      const verificationData = {
        ...data,
        files: uploadedFiles,
        submittedAt: new Date().toISOString(),
        status: "pending",
      }

      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
      currentUser.verification = verificationData
      currentUser.verificationStatus = "pending"
      localStorage.setItem("currentUser", JSON.stringify(currentUser))

      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userIndex = users.findIndex((u) => u.email === currentUser.email)
      if (userIndex !== -1) {
        users[userIndex] = currentUser
        localStorage.setItem("users", JSON.stringify(users))
      }

      setIsSubmitting(false)
      setVerificationSubmitted(true)
    }, 2000)
  }

  const verificationSteps = [
    {
      number: 1,
      title: "Personal Information",
      description: "Provide your legal name and business details",
      icon: FileText,
    },
    {
      number: 2,
      title: "Upload Documents",
      description: "Submit required certificates and ID proof",
      icon: Upload,
    },
    {
      number: 3,
      title: "Review & Submit",
      description: "Review your information and submit for verification",
      icon: CheckCircle,
    },
  ]

  const documentRequirements = [
    {
      type: "idProof",
      title: "Government ID Proof",
      description: "Driver's License, Passport, or National ID",
      required: true,
      icon: "🪪",
    },
    {
      type: "certification",
      title: "Professional Certification",
      description: "Trade license, skill certification, or diploma",
      required: true,
      icon: "📜",
    },
    {
      type: "businessLicense",
      title: "Business License",
      description: "Business registration or operating license",
      required: false,
      icon: "🏢",
    },
    {
      type: "insurance",
      title: "Insurance Certificate",
      description: "Liability insurance or worker's compensation",
      required: false,
      icon: "🛡️",
    },
  ]

  if (verificationSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center bg-white">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Verification Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Your verification request has been successfully submitted. Our team will review your
            documents within 24-48 hours and notify you via email.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold text-blue-900 mb-1">What's Next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• We'll verify your documents and credentials</li>
                  <li>• You'll receive an email update about your status</li>
                  <li>• Once verified, you'll get a badge on your profile</li>
                  <li>• You can start receiving bookings immediately</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => (window.location.href = "/profile/service-provider")}
              className="bg-green-600 hover:bg-green-700"
            >
              Go to Profile
            </Button>
            <Button
              onClick={() => (window.location.href = "/provider-dashboard")}
              variant="outline"
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Account Verification</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get Verified</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Verify your identity and credentials to build trust with customers
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {verificationSteps.map((step) => (
            <Card key={step.number} className="p-6 bg-white shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-green-600 mb-1">
                    Step {step.number}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 bg-white shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
              </div>

              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Legal First Name *
                    </label>
                    <input
                      type="text"
                      {...register("firstName", {
                        required: "First name is required",
                        minLength: {
                          value: 2,
                          message: "First name must be at least 2 characters",
                        },
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Legal Last Name *
                    </label>
                    <input
                      type="text"
                      {...register("lastName", {
                        required: "Last name is required",
                        minLength: {
                          value: 2,
                          message: "Last name must be at least 2 characters",
                        },
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    {...register("dateOfBirth", {
                      required: "Date of birth is required",
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name (Optional)
                  </label>
                  <input
                    type="text"
                    {...register("businessName")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="John's Plumbing Services"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    {...register("experience", {
                      required: "Experience is required",
                      min: { value: 1, message: "Minimum 1 year required" },
                      max: { value: 50, message: "Maximum 50 years" },
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="5"
                  />
                  {errors.experience && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.experience.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Bio *
                  </label>
                  <textarea
                    {...register("professionalBio", {
                      required: "Bio is required",
                      minLength: {
                        value: 50,
                        message: "Bio must be at least 50 characters",
                      },
                      maxLength: {
                        value: 500,
                        message: "Bio must not exceed 500 characters",
                      },
                    })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                    placeholder="Tell us about your experience, specializations, and what makes you a great service provider..."
                  />
                  {errors.professionalBio && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.professionalBio.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {watch("professionalBio")?.length || 0}/500 characters
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-white shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Upload Documents</h2>
              </div>

              <div className="space-y-6">
                {documentRequirements.map((doc) => (
                  <div key={doc.type} className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{doc.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            {doc.title}
                            {doc.required && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                Required
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">{doc.description}</p>
                        </div>
                      </div>
                    </div>

                    {uploadedFiles[doc.type] ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                              <FileText className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">
                                {uploadedFiles[doc.type].name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {uploadedFiles[doc.type].size}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(doc.type)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, JPG, PNG (max 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(doc.type, e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("agreeTerms", {
                    required: "You must accept the terms and conditions",
                  })}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 mt-0.5"
                />
                <div>
                  <span className="text-gray-700">
                    I agree to the{" "}
                    <a href="#" className="text-green-600 hover:underline font-medium">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-green-600 hover:underline font-medium">
                      Privacy Policy
                    </a>
                  </span>
                  {errors.agreeTerms && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.agreeTerms.message}
                    </p>
                  )}
                </div>
              </label>
            </Card>

            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 text-lg font-semibold shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting Verification...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Submit for Verification
                </>
              )}
            </Button>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-white shadow-lg sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-6 h-6 text-yellow-500" />
                <h3 className="text-lg font-bold text-gray-800">Why Get Verified?</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Build trust and credibility with customers
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Get a verified badge on your profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Appear higher in search results
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Access to premium features
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Receive more booking requests
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Important Notes</h3>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• All documents must be clear and legible</li>
                    <li>• Verification usually takes 24-48 hours</li>
                    <li>• Documents are securely encrypted</li>
                    <li>• You'll be notified via email about status</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-purple-50 border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">Need Help?</h3>
              <p className="text-sm text-purple-800 mb-3">
                Our support team is here to assist you with the verification process.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                Contact Support
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <div className="h-16" />
    </div>
  )
}