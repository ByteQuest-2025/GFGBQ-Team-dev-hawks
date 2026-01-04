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
import { indianStatesAndDistricts } from "@/lib/indian_states";
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
  // const [regions, setRegions] = useState<any[]>([]); // Deprecated
  const [selectedDepartment, setSelectedDepartment] = useState("");
  // const [selectedRegion, setSelectedRegion] = useState(""); // Deprecated
  
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptRes] = await Promise.all([
          api.get("/metadata/departments"),
          // api.get("/metadata/regions")
        ]);
        setDepartments(deptRes.data);
        // setRegions(regionRes.data);
      } catch (err) {
        console.error("Failed to fetch metadata", err);
      }
    };
    if (role === 'FieldOfficer') {
        fetchMetadata();
    }
  }, [role]);

  useEffect(() => {
    if (selectedState && indianStatesAndDistricts[selectedState as keyof typeof indianStatesAndDistricts]) {
      setAvailableDistricts(indianStatesAndDistricts[selectedState as keyof typeof indianStatesAndDistricts]);
      setSelectedDistrict("");
    } else {
      setAvailableDistricts([]);
    }
  }, [selectedState]);

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
        payload.state = selectedState;
        payload.district = selectedDistrict;
        // Legacy support if needed, map district to region_code or similar
        payload.region_code = selectedDistrict; 
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
      <div className="absolute top-4 right-4">
        <LanguageSelector variant="outline" className="[&_*]:text-white [&_button]:border-white/20 [&_button]:bg-white/10" />
      </div>

      <Card className="w-full max-w-md shadow-2xl shadow-blue-500/10 bg-white/95 backdrop-blur-xl border-white/40">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Join CivicPulse to improve your community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullname"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <Select onValueChange={setRole} defaultValue={role}>
                  <SelectTrigger className="pl-9">
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
                  <Label htmlFor="department">Department</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
                      <SelectTrigger className="pl-9">
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
                  <Label htmlFor="state">State</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    <Select onValueChange={setSelectedState} value={selectedState}>
                      <SelectTrigger className="pl-9">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(indianStatesAndDistricts).map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    <Select onValueChange={setSelectedDistrict} value={selectedDistrict} disabled={!selectedState}>
                      <SelectTrigger className="pl-9">
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDistricts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
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
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
