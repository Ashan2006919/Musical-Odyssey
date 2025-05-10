"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const FormSchema = z.object({
  pin: z.string().length(6, {
    message: "Your one-time password must be exactly 6 characters.",
  }),
});

export default function OTPComponent() {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { pin: "" },
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";

  const email = searchParams.get("email");
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for the resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const onSubmit = async (data) => {
    if (!email) {
      toast.error("Email is missing. Please try again.");
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verificationCode: data.pin }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        toast.error(responseData.message || "Verification failed.");
        return;
      }

      if (responseData.success) {
        toast.success("Your account has been successfully verified!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(responseData.message || "Unexpected response.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  const resendOTP = async () => {
    if (!email) {
      toast.error("Email is missing. Please try again.");
      return;
    }

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        toast.error(responseData.message || "Failed to resend OTP.");
        return;
      }

      toast.success("A new OTP has been sent to your email.");
      setCooldown(30); // Start the cooldown timer
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="absolute top-10 left-0 w-full h-full">
        <h1 className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-tight tracking-tighter text-center">
          <LineShadowText
            className="italic text-primary ml-3 whitespace-nowrap"
            shadowColor={shadowColor}
          >
            Music Odyssey!
          </LineShadowText>
        </h1>
      </div>

      <div className="w-full max-w-xl bg-white dark:bg-black p-12 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-10 -mt-4">
          OTP Verification
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl pb-10">
                    One-Time Password
                  </FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        {[...Array(6)].map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="w-16 h-16 text-2xl text-center font-semibold"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription className="text-lg">
                    Please enter the one-time password sent to your email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full py-4 text-2xl rounded-lg transition h-10 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            >
              Submit
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center">
          <Button
            onClick={resendOTP}
            disabled={cooldown > 0}
            className="w-full py-2 text-lg rounded-lg transition font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400"
          >
            {cooldown > 0
              ? `Resend OTP in ${cooldown}s`
              : "Resend OTP"}
          </Button>
        </div>
      </div>

      <ToastContainer /> {/* Ensure ToastContainer is in your JSX to display the toast notifications */}
    </div>
  );
}
