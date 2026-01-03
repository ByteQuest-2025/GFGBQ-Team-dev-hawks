"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, Loader2, ArrowRight, Lock, Mail, User, Shield, Building, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/hooks/useLanguage";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Citizen");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [departments, setDepartments] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptRes, regionRes] = await Promise.all([
          api.get("/metadata/departments"),
          api.get("/metadata/regions")
        ]);
        setDepartments(deptRes.data);
        setRegions(regionRes.data);
      } catch (err) {
        console.error("Failed to fetch metadata", err);
      }
    };
    if (role === 'FieldOfficer') {
        fetchMetadata();
    }
  }, [role]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        email,
        password,
        full_name: fullName,
        role
      };

      if (role === "FieldOfficer") {
        payload.department_id = parseInt(selectedDepartment);
        payload.region_id = parseInt(selectedRegion);
      }

      await api.post("/auth/signup", payload);
      
      router.push("/login");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to create account");
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
            <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
            <CardDescription className="text-slate-300">
              Join CivicPulse to improve your community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullname" className="text-slate-200">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              
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
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-200">I am a</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
                  <Select onValueChange={setRole} defaultValue={role}>
                    <SelectTrigger className="pl-9 bg-black/20 border-white/10 text-white focus:ring-blue-500/20">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Citizen">Citizen</SelectItem>
                      <SelectItem value="FieldOfficer">Field Officer</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {role === "FieldOfficer" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-slate-200">Department</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
                      <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
                        <SelectTrigger className="pl-9 bg-black/20 border-white/10 text-white focus:ring-blue-500/20">
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-slate-200">Region</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
                      <Select onValueChange={setSelectedRegion} value={selectedRegion}>
                        <SelectTrigger className="pl-9 bg-black/20 border-white/10 text-white focus:ring-blue-500/20">
                          <SelectValue placeholder="Select Region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region.id} value={region.id.toString()}>
                              {region.name} ({region.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/10 pt-6">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-300 hover:text-blue-200 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
