"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleButton, AppleButton, MicrosoftButton } from "@/components/ui/oauth-buttons";
import { LocalDB } from "@/lib/booking/storage";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    confirmPassword: "",
    parentName: "",
    childName: "",
    schoolYear: "",
  });
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
      }

      const existing = LocalDB.getParentByEmail(formData.email);
      if (existing) {
        setError("An account with this email already exists.");
        setIsLoading(false);
        return;
      }

      const user = LocalDB.upsertParent({
        email: formData.email,
        name: formData.parentName,
        childName: formData.childName,
        schoolYear: formData.schoolYear,
        password: formData.password,
        verified: true,
      });

      localStorage.setItem("currentUser", JSON.stringify(user));
      router.push("/manage");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white px-6 py-12 dark:bg-black lg:px-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#4586F7] to-[#570DF8]">
            <span className="text-lg font-bold text-white">L</span>
          </div>
          <span className="text-lg font-bold text-black dark:text-white">LessonsUK</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Get started with quality tutoring for your child</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="parentName">Your name</Label>
                  <Input
                    id="parentName"
                    type="text"
                    placeholder="John Doe"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childName">Child's name</Label>
                  <Input
                    id="childName"
                    type="text"
                    placeholder="Jane Doe"
                    name="childName"
                    value={formData.childName}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolYear">School year</Label>
                <Input
                  id="schoolYear"
                  type="text"
                  placeholder="e.g. Year 6"
                  name="schoolYear"
                  value={formData.schoolYear}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-zinc-500 dark:bg-black dark:text-zinc-400">Or sign up with</span>
              </div>
            </div>

            <div className="space-y-2">
              <GoogleButton />
              <AppleButton />
              <MicrosoftButton />
            </div>

            <div className="text-center text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Already have an account? </span>
              <Link href="/login" className="font-medium text-[#570DF8] hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-zinc-600 dark:text-zinc-400">
          By signing up, you agree to our{" "}
          <a href="#" className="hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
