"use client"; // This directive is necessary for Next.js client-side components

import { SignUpInput, signUpSchema } from "@/schemas/signUpSchema"; // Assuming your schema is correct
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce"; // Ensure lodash.debounce is installed (npm install lodash.debounce)
import axios from "axios"; // Ensure axios is installed (npm install axios)
import { toast } from "sonner"; // Ensure sonner is installed (npm install sonner)

// Shadcn UI components - ensure these are correctly set up in your project
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

function SignUpPage() {
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "error"
  >("idle");
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
    },
  });

  // Debounced username availability check
  // Uses useCallback to memoize the function, preventing unnecessary re-creations
  // and ensuring debounce works correctly across renders.
  const checkUsernameAvailability = React.useCallback(
    debounce(async (userName: string) => {
      if (!userName) {
        setUsernameStatus("idle");
        return;
      }
      setUsernameStatus("checking");

      try {
        const response = await axios.get("/api/check-username-unique", {
          params: { userName },
        });

        setUsernameStatus(response.data.success ? "available" : "taken");
      } catch (error) {
        setUsernameStatus("error");
        console.error("Error checking username:", error);
      }
    }, 500),
    [] // Empty dependency array means this function is created once
  );

  // Cleanup the debounced function on component unmount
  useEffect(() => {
    return () => {
      checkUsernameAvailability.cancel();
    };
  }, [checkUsernameAvailability]); // Dependency here ensures cleanup only if the memoized function itself changes (which it won't with [] above)

  const onSubmit = async (data: SignUpInput) => {
    setApiError(null);
    setApiSuccess(null);

    // Prevent submission if username is still being checked or is taken
    if (usernameStatus === "checking" || usernameStatus === "taken") {
      toast.error("Validation Error", {
        description: "Please resolve username issues before submitting.",
        className:
          "bg-orange-600 text-white border-orange-700 backdrop-blur-md bg-opacity-80",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await axios.post("/api/sign-up", data);

      if (response.data.success) {
        setApiSuccess(response.data.message);
        toast.success("Success", {
          description: response.data.message,
          className:
            "bg-green-600 text-white border-green-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
        form.reset(); // Clear form fields
        setUsernameStatus("idle"); // Reset username status
        setTimeout(() => {
          router.replace(`/verify/${encodeURIComponent(data.userName)}`);
        }, 2000);
      } else {
        setApiError(response.data.message);
        toast.error("Error", {
          description: response.data.message,
          className:
            "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
          duration: 4000,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error registering user. Please try again.";
      setApiError(errorMessage);
      toast.error("Error", {
        description: errorMessage,
        className:
          "bg-red-600 text-white border-red-700 backdrop-blur-md bg-opacity-80",
        duration: 4000,
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden bg-white">
        {/* Left Section - Image/Illustration */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-blue-500 to-purple-600 justify-center items-center p-8 relative overflow-hidden">
          {/* Abstract shapes for visual interest */}
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-white opacity-10 rounded-full mix-blend-overlay animate-pulse-slow"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white opacity-10 rounded-full mix-blend-overlay animate-pulse-slow delay-200"></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white opacity-10 rounded-xl transform rotate-45 mix-blend-overlay animate-pulse-slow delay-400"></div>

          <div className="text-center z-10 p-4">
            <h2 className="text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
              UniChat
            </h2>
            <p className="text-xl text-blue-200 drop-shadow">
              Connect & Collaborate with fellow students. Share, learn, and grow together!
            </p>
            {/* Placeholder for a relevant illustration or icon */}
            {/* You can replace this with an actual SVG illustration tailored to student life/communication */}
            <div className="mt-8 text-white text-9xl leading-none">
              🎓💬
            </div>
            <p className="mt-4 text-white text-lg font-medium">
              Your academic social hub.
            </p>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex-1 p-8 md:p-12 flex items-center justify-center">
          <Card className="w-full max-w-md bg-white border-none shadow-none">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-800">Create Your Account</CardTitle>
              <CardDescription className="text-md text-gray-600 mt-2">
                Join the UniChat community today!
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Username Field */}
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Choose a unique username"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e); // Update react-hook-form state
                              checkUsernameAvailability(e.target.value); // Trigger debounced check
                            }}
                            className="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-2.5 w-full transition duration-200 ease-in-out text-gray-800"
                          />
                        </FormControl>
                        {usernameStatus === "checking" && (
                          <p className="text-sm text-gray-500 mt-1 flex items-center">
                            <span className="animate-spin mr-2">🔄</span> Checking username...
                          </p>
                        )}
                        {usernameStatus === "available" && (
                          <p className="text-sm text-green-600 mt-1 flex items-center">
                            <span className="mr-1">✅</span> Username is available!
                          </p>
                        )}
                        {usernameStatus === "taken" && (
                          <p className="text-sm text-red-600 mt-1 flex items-center">
                            <span className="mr-1">❌</span> Username is already taken.
                          </p>
                        )}
                        {usernameStatus === "error" && (
                          <p className="text-sm text-red-600 mt-1">
                            Error checking username. Please try again.
                          </p>
                        )}
                        <FormMessage className="text-red-500 text-sm mt-1" />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your university email"
                            {...field}
                            className="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-2.5 w-full transition duration-200 ease-in-out text-gray-800"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm mt-1" />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Create a strong password"
                            {...field}
                            className="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg p-2.5 w-full transition duration-200 ease-in-out text-gray-800"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm mt-1" />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
                    disabled={
                      form.formState.isSubmitting || usernameStatus === "taken" || usernameStatus === "checking"
                    }
                  >
                    {form.formState.isSubmitting
                      ? "Creating Account..."
                      : "Sign Up"}
                  </Button>

                  {/* API Error/Success Messages */}
                  {apiError && (
                    <p className="mt-4 text-red-600 text-center text-sm font-medium p-2 bg-red-50 rounded-md border border-red-200 animate-fade-in">
                      {apiError}
                    </p>
                  )}
                  {apiSuccess && (
                    <p className="mt-4 text-green-600 text-center text-sm font-medium p-2 bg-green-50 rounded-md border border-green-200 animate-fade-in">
                      {apiSuccess}
                    </p>
                  )}
                </form>
              </Form>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <a href="/sign-in" className="text-blue-600 hover:underline font-semibold">
                    Sign in
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;