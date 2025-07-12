"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

// Define schema for verification code
const verifyCodeSchema = z.object({
  verificationCode: z
    .string()
    .length(6, { message: "Verification code must be 6 digits" })
    .regex(/^\d+$/, { message: "Verification code must be numeric" }),
});

type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;

// Interface for API response
interface ApiResponse {
  success: boolean;
  message?: string;
}

export default function VerifyCodePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60); // 60 seconds cooldown
  const router = useRouter();
  const params = useParams<{ userName: string }>(); // Get userName from URL params

  const form = useForm<VerifyCodeInput>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      verificationCode: "",
    },
  });

  // Effect for the resend code timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0 && resendLoading) {
      timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0 && resendLoading) {
      setResendLoading(false); // Enable resend button
    }
    return () => clearTimeout(timer); // Cleanup timer
  }, [resendTimer, resendLoading]);

  // Function to handle resending the verification code
  const handleResendCode = async () => {
    setResendLoading(true);
    setResendTimer(60); // Reset timer
    try {
      const response = await axios.post<ApiResponse>("/api/resend-code", {
        userName: decodeURIComponent(params.userName),
      });

      if (response.data.success) {
        toast.success("Code Resent!", {
          description:
            response.data.message ||
            "A new verification code has been sent to your email.",
          className:
            "bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      } else {
        toast.error("Resend Failed", {
          description:
            response.data.message || "Failed to resend code. Please try again.",
          className:
            "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
        setResendLoading(false); // Keep button enabled if resend fails immediately
        setResendTimer(0); // Reset timer if resend failed
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error.response as { data?: { message?: string } })?.data?.message || "Error resending code."
          : "Error resending code.";
      console.error(errorMessage);
      toast.error("Resend Error", {
        description: errorMessage,
        className:
          "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
      setResendLoading(false); // Keep button enabled if resend fails immediately
      setResendTimer(0); // Reset timer if resend failed
    }
  };

  // Function to handle verification form submission
  const onSubmit = async (data: VerifyCodeInput) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/verify-code", {
        userName: params.userName,
        code: data.verificationCode,
      });

      if (response.data.success) {
        toast.success("Success", {
          description: response.data.message,
          className:
            "bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
        setTimeout(() => {
          router.replace("/sign-in"); // Redirect to sign-in page after successful verification
        }, 2000);
      } else {
        toast.error("Error", {
          description: response.data.message,
          className:
            "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error.response as { data?: { message?: string } })?.data?.message || "Error verifying code. Please try again."
          : "Error verifying code. Please try again.";
      console.error(errorMessage);
      toast.error("Error", {
        description: errorMessage,
        className:
          "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retrieve username from URL params, provide a fallback if not available
  const username = params.userName || "user"; // Fallback if userName isn't in params

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <CardHeader className="text-center space-y-3">
            <CardTitle className="text-3xl font-bold text-gray-800">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              A 6-digit verification code has been sent to your email address.
              Please check your inbox (and spam folder) and enter it below.
              <br />
              <span className="font-semibold text-blue-600">
                {username ? `for ${username}` : ""}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="verificationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Verification Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="______" // Visual placeholder for 6 digits
                          {...field}
                          className="text-center text-lg font-mono tracking-widest border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-3 w-full transition duration-200 ease-in-out text-gray-800"
                          maxLength={6} // Enforce max length in UI
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying..." : "Verify Account"}
                </Button>
              </form>
            </Form>

            {/* Resend Code Section */}
            <div className="text-center pt-4 border-t border-gray-100 mt-6">
              <p className="text-gray-600 text-sm mb-2">
                Didn&apos;t receive the code?
              </p>
              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="w-full sm:w-auto px-6 py-2 rounded-lg text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-500 transition-all duration-300"
              >
                {resendLoading ? `Resend in ${resendTimer}s` : "Resend Code"}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-4">
            <p className="text-sm text-gray-600">
              Back to{" "}
              <a
                href="/sign-in"
                className="text-blue-600 hover:underline font-semibold"
              >
                Sign in
              </a>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}