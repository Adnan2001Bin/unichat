"use client";

import { signInSchema } from "@/schemas/signInSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Loader from "@/components/Loader";
import { useSession } from "next-auth/react";

export default function SignInPage() {
  const router = useRouter();
  const { status } = useSession();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        toast.error("Login Failed", {
          description: "Incorrect email or password. Please try again.",
          className:
            "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      } else {
        toast.error("Login Error", {
          description: result.error,
          className:
            "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      }
    } else {
      if (result?.url) {
        toast.success("Success", {
          description: "Logged in successfully!",
          className:
            "bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80",
          duration: 2000,
        });
        setTimeout(() => {
          router.replace("/"); // Redirect to sign-in page after successful verification
        }, 2000);
      } else {
        toast.success("Success", {
          description: "Logged in successfully! Redirecting...",
          className:
            "bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80",
          duration: 2000,
        });
        router.replace("/dashboard");
      }
    }
  };

  if (status === "loading") {
    return <Loader message="Checking authentication..." />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden bg-white">
        {/* Left Section - Image/Illustration */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-blue-500 to-purple-600 justify-center items-center p-8 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-white opacity-10 rounded-full mix-blend-overlay animate-pulse-slow"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white opacity-10 rounded-full mix-blend-overlay animate-pulse-slow delay-200"></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white opacity-10 rounded-xl transform rotate-45 mix-blend-overlay animate-pulse-slow delay-400"></div>

          <div className="text-center z-10 p-4">
            <h2 className="text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
              Welcome Back to UniChat!
            </h2>
            <p className="text-xl text-blue-200 drop-shadow">
              Sign in to continue connecting with fellow students and explore
              your academic hub.
            </p>
            <div className="mt-8 text-white text-9xl leading-none">👋💬</div>
            <p className="mt-4 text-white text-lg font-medium">
              Your conversations await.
            </p>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex-1 p-8 md:p-12 flex items-center justify-center">
          <Card className="w-full max-w-md bg-white border-none shadow-none">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-800">
                Sign In
              </CardTitle>
              <CardDescription className="text-md text-gray-600 mt-2">
                Welcome back to the UniChat community!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                            className="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-2.5 w-full transition duration-200 ease-in-out text-gray-800"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                            className="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-2.5 w-full transition duration-200 ease-in-out text-gray-800"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </Form>
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Don’t have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <style jsx global>{`
        @keyframes pulse-slow {
          0% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.15;
          }
          100% {
            transform: scale(1);
            opacity: 0.1;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        .delay-200 {
          animation-delay: 2s;
        }
        .delay-400 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
