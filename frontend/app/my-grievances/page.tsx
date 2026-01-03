"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { Loader2, CheckCircle, MapPin, LogOut, Calendar, Plus, Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/hooks/useLanguage";
import { Chatbot } from "@/components/Chatbot";

interface Grievance {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  location: string;
  image_url: string;
  created_at: string;
  category: string;
}

export default function MyGrievances() {
  const router = useRouter();
  const { t } = useLanguage();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
        router.push("/login");
        return;
    }
    fetchMyGrievances();

    const intervalId = setInterval(fetchMyGrievances, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const fetchMyGrievances = async () => {
    try {
      const response = await api.get("/grievance/my");
      setGrievances(response.data);
    } catch (error) {
      console.error("Failed to fetch my grievances", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Resolved": return "bg-green-100 text-green-700 border-green-200";
      case "Critical": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
              <div className="flex items-center gap-2">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">C</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">CivicPulse</span>
                  </Link>
                  <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
                  <h1 className="text-sm font-medium text-slate-500 hidden sm:block">My Grievances</h1>
              </div>
              <div className="flex items-center gap-4">
                  <LanguageSelector variant="ghost" className="hidden sm:flex" />
                  <Button variant="default" size="sm" asChild className="hidden sm:flex bg-blue-600 hover:bg-blue-700">
                      <Link href="/"><Plus className="h-4 w-4 mr-2" /> {t("reportTitle")}</Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">{t("logout")}</span>
                  </Button>
              </div>
          </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Your Reports</h2>
                <p className="text-slate-500">Track the status of issues you've reported.</p>
            </div>
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search reports..." 
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>
        </div>

        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4"
        >
          {grievances.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-300 shadow-none bg-slate-50">
                <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No reports yet</h3>
                    <p className="text-slate-500 mt-1 mb-6">You haven't submitted any grievances yet.</p>
                    <Button asChild>
                        <Link href="/">Submit your first report</Link>
                    </Button>
                </CardContent>
            </Card>
          ) : (
            grievances.map((g) => (
              <motion.div variants={item} key={g.id}>
                  <Link href={`/grievance/${g.id}`}>
                    <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-blue-300 group cursor-pointer">
                        <div className="p-6 sm:flex items-center gap-6">
                            {g.image_url ? (
                                <div className="w-full sm:w-32 h-32 sm:h-24 rounded-lg overflow-hidden shrink-0 mb-4 sm:mb-0 relative">
                                    <img 
                                        src={`http://localhost:8000${g.image_url}`} 
                                        alt="Evidence" 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                            ) : (
                                <div className="w-full sm:w-32 h-32 sm:h-24 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mb-4 sm:mb-0 text-slate-400">
                                    <MapPin className="h-8 w-8" />
                                </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className={getStatusColor(g.status)} variant="outline">{g.status}</Badge>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(g.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{g.title}</h3>
                                <p className="text-slate-500 text-sm line-clamp-1 mt-1">{g.description}</p>
                            </div>

                            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <ArrowRight className="h-5 w-5" />
                            </div>
                        </div>
                    </Card>
                  </Link>
              </motion.div>
            ))
          )}
        </motion.div>
      </main>
      <Chatbot />
    </div>
  );
}
