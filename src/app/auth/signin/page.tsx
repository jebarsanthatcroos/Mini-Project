"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  FcGoogle,  
  FcUnlock, 
  FcHighPriority
} from "react-icons/fc";
import { 
  FaGithub, 
  FaEye, 
  FaEyeSlash, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner
} from "react-icons/fa";
import { MdEmail, MdPassword, MdArrowBack, MdCheck } from "react-icons/md";
import Logo from "@/components/Logo";

// Zod validation schema
const signInSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isValid },
    setError,
    clearErrors  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const watchEmail = watch("email");
  const watchPassword = watch("password");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && isMounted) {
      router.push(callbackUrl);
    }
  }, [user, callbackUrl, router, isMounted]);

  // Show error from URL params (OAuth errors)
  useEffect(() => {
    if (error && isMounted) {
      setError("root", {
        type: "manual",
        message: getErrorMessage(error)
      });
    }
  }, [error, isMounted, setError]);

  // Show success message
  useEffect(() => {
    if (message && isMounted) {
      setSuccess(message);
    }
  }, [message, isMounted]);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "OAuthAccountNotLinked":
        return "This email is already associated with another account";
      case "CredentialsSignin":
        return "Invalid email or password";
      case "Configuration":
        return "There is a problem with the server configuration";
      case "AccessDenied":
        return "Access denied. Please contact support.";
      case "Verification":
        return "Verification required. Please check your email.";
      default:
        return "An error occurred during sign in";
    }
  };

  const onSubmit = async (data: SignInFormData) => {
    setLoading(true);
    setSuccess("");
    clearErrors();

    try {
      const result = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("root", {
          type: "manual",
          message: getErrorMessage(result.error)
        });
      } else {
        setSuccess("Sign in successful! Redirecting...");
        setTimeout(() => {
          router.push(callbackUrl);
        }, 1000);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("root", {
        type: "manual",
        message: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    clearErrors();
    setSuccess("");
    await signIn(provider, { callbackUrl });
  };

  // Show loading skeleton during SSR
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="animate-pulse mb-6">
            <div className="h-4 w-20 bg-gray-300 rounded"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-gray-300 rounded-full mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-300 rounded-xl"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="h-12 bg-gray-300 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <MdArrowBack className="mr-2" />
          Back to home
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100">
          {/* Header */}
          <div className="text-center">
            <Logo />
            <h2 className="mt-6 text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error/Success Messages */}
          {errors.root && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start space-x-3 animate-pulse">
              <FcHighPriority className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-800 text-sm">{errors.root.message}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 p-4 border border-green-200 flex items-start space-x-3">
              <FaCheckCircle className="text-green-500 mt-0.5 shrink-0" />
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuthSignIn("google")}
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
            >
              <FcGoogle className="text-lg mr-3" />
              Continue with Google
            </button>

            <button
              onClick={() => handleOAuthSignIn("github")}
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-all duration-200"
            >
              <FaGithub className="text-lg mr-3" />
              Continue with GitHub
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Credentials Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdEmail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Enter your email"
                  suppressHydrationWarning
                  {...register("email")}
                />
                {!errors.email && watchEmail && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <MdCheck className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FaExclamationTriangle className="mr-1 text-xs" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link 
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdPassword className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`block w-full pl-10 pr-10 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Enter your password"
                  suppressHydrationWarning
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
                {!errors.password && watchPassword && (
                  <div className="absolute inset-y-0 right-8 pr-3 flex items-center">
                    <MdCheck className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FaExclamationTriangle className="mr-1 text-xs" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isDirty || !isValid}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin -ml-1 mr-3 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                <>
                  <FcUnlock className="mr-2" />
                  Sign in
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link 
                  href="/auth/signup" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign up now
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}