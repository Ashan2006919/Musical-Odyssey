"use client";
export const dynamic = "force-dynamic"; // Prevent static rendering issues on Vercel

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export default function OTPComponent() {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { pin: "" },
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";

  const sentOtpCode = searchParams.get("otp");
  const email = searchParams.get("email");

  const onSubmit = (data) => {
    setErrorMessage("");
    setSuccessMessage("");

    fetch("/api/auth/register", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, verificationCode: data.pin }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message.includes("verified")) {
          setSuccessMessage("Your account has been successfully verified.");
          router.push("/home");
        } else {
          setErrorMessage(data.message);
        }
      })
      .catch(() =>
        setErrorMessage("Something went wrong. Please try again later.")
      );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 dark:bg-gray-900">
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

            {errorMessage && (
              <div className="text-red-600 text-center text-xl mt-4">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="text-green-600 text-center text-xl mt-4">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-4 text-2xl rounded-lg transition h-10 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            >
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
