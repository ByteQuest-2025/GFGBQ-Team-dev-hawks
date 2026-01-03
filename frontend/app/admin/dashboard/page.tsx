"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Loader2, ArrowRight, LayoutDashboard, ListTodo, Map, Settings, LogOut, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/hooks/useLanguage";
import { GoogleMapsHeatmap } from "@/components/GoogleMapsHeatmap";

interface DashboardStats {
  total_grievances: number;
  open_grievances: number;
  resolved_grievances: number;
  critical_grievances: number;
}

interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
  count: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
        router.push("/login");
        return;
    }

    const fetchStats = async () => {
      try {
        const [statsResponse, heatmapResponse] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/heatmap").catch(() => ({ data: [] }))
        ]);
        setStats(statsResponse.data);
        setHeatmapData(heatmapResponse.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const Sidebar = () => (
    <div className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 hidden md:flex flex-col">
        <div className="p-6">
            <h1 className="text-2xl font-bold tracking-tight">CivicPulse<span className="text-blue-400">.</span></h1>
            <p className="text-xs text-slate-400 mt-1">{t("adminConsole")}</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
            <a href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg text-white font-medium transition-all shadow-lg shadow-blue-900/20">
                <LayoutDashboard size={20} />
                {t("dashboard")}
            </a>
            <a href="/admin/grievances" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                <ListTodo size={20} />
                {t("grievances")}
            </a>
            <a href="/admin/kanban" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                <Map size={20} />
                {t("kanbanBoard")}
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                <Settings size={20} />
                {t("settings")}
            </a>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
            <div className="px-4 py-2">
                <LanguageSelector variant="ghost" className="w-full [&_*]:text-white [&_button]:border-slate-700 [&_button]:text-slate-300 [&_button:hover]:bg-slate-800" />
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-all">
                <LogOut size={18} />
                {t("logout")}
            </button>
        </div>
    </div>
  );

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
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-8">
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-7xl mx-auto space-y-8"
        >
            {/* Header */}
            <motion.div variants={item} className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("dashboard")}</h1>
                    <p className="text-slate-500 mt-1">Real-time insights into city grievance management.</p>
                </div>
                <div className="flex gap-3 items-center">
                    <LanguageSelector variant="outline" className="hidden md:flex" />
                    <Button variant="outline" className="bg-white" asChild>
                        <a href="/admin/grievances">
                             {t("grievances")}
                        </a>
                    </Button>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                        <a href="/admin/kanban">
                        {t("kanbanBoard")} <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">{t("totalGrievances")}</CardTitle>
                        <ListTodo className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats?.total_grievances || 0}</div>
                        <p className="text-xs text-slate-500 mt-1">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">{t("openGrievances")}</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats?.open_grievances || 0}</div>
                        <p className="text-xs text-slate-500 mt-1">Requires attention</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">{t("resolvedGrievances")}</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.resolved_grievances || 0}</div>
                        <p className="text-xs text-slate-500 mt-1">94% completion rate</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">{t("criticalGrievances")}</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats?.critical_grievances || 0}</div>
                        <p className="text-xs text-slate-500 mt-1">High priority</p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Geo & Hotspots */}
            <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-md border-slate-200 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Map className="h-5 w-5 text-blue-500" />
                            Geospatial Intelligence
                        </CardTitle>
                        <CardDescription>Live heatmap of reported issues across the city.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {googleMapsApiKey && heatmapData.length > 0 ? (
                            <div className="h-[350px] w-full">
                                <GoogleMapsHeatmap
                                    heatmapData={heatmapData}
                                    apiKey={googleMapsApiKey}
                                />
                            </div>
                        ) : (
                            <div className="h-[350px] w-full bg-slate-100 relative overflow-hidden group flex items-center justify-center">
                                <div className="text-center text-slate-500">
                                    {!googleMapsApiKey ? (
                                        <p>Google Maps API key not configured</p>
                                    ) : (
                                        <p>Loading heatmap data...</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-md border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-orange-500" />
                            Top Hotspots
                        </CardTitle>
                        <CardDescription>Areas requiring immediate attention.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[
                                { name: "Downtown Market", count: 12, color: "bg-red-500", text: "text-red-500" },
                                { name: "Industrial Area", count: 8, color: "bg-orange-500", text: "text-orange-500" },
                                { name: "North Avenue", count: 5, color: "bg-yellow-500", text: "text-yellow-500" },
                                { name: "Central Park", count: 3, color: "bg-blue-500", text: "text-blue-500" },
                            ].map((spot, i) => (
                                <motion.div 
                                    key={spot.name} 
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                    className="flex items-center group cursor-pointer"
                                >
                                    <div className="w-full space-y-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="group-hover:text-slate-900 text-slate-700 transition-colors">{spot.name}</span>
                                            <span className={`${spot.text} font-bold`}>{spot.count}</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(spot.count / 15) * 100}%` }}
                                                transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                                className={`h-full rounded-full ${spot.color}`} 
                                            ></motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
