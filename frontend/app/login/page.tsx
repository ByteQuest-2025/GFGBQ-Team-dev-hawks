"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, Loader2, ArrowRight, Lock, Mail } from "lucide-react";
import api from "@/lib/api";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/hooks/useLanguage";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/auth/login", formData);
      const { access_token, role } = response.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);
      
      if (role === "Admin") {
          router.push("/admin/dashboard");
      } else if (role === "FieldOfficer") {
          router.push("/field-officer/dashboard");
      } else {
          router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-purple-500/20 blur-[100px]" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-blue-500/20 blur-[100px]" />
      </div>
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector variant="outline" className="[&_*]:text-white [&_button]:border-white/20 [&_button]:bg-white/10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-slate-300">
              Sign in to your CivicPulse account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-200">Password</Label>
                  <Link href="#" className="text-xs text-blue-300 hover:text-blue-200">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-500/20 border border-red-500/50 rounded-md p-3 flex items-center gap-2 text-sm text-red-200"
                >
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-2 rounded-lg transition-all shadow-lg hover:shadow-blue-500/25"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/10 pt-6">
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-300 hover:text-blue-200 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
