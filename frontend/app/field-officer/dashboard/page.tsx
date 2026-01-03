"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { Loader2, CheckCircle, MapPin, LogOut, HardHat, Calendar, Clock, LayoutDashboard, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/hooks/useLanguage";

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

export default function FieldOfficerDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [resolutionImage, setResolutionImage] = useState<File | null>(null);
  const [resolving, setResolving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
        router.push("/login");
        return;
    }
    fetchAssignedGrievances();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const fetchAssignedGrievances = async () => {
    try {
      const response = await api.get("/grievance/assigned/me");
      setGrievances(response.data);
    } catch (error) {
      console.error("Failed to fetch assigned grievances", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartProgress = async (grievanceId: number) => {
    try {
      await api.patch(`/grievance/${grievanceId}/status`, { status: "In Progress" });
      fetchAssignedGrievances();
    } catch (error) {
      console.error("Failed to start progress", error);
    }
  };

  const handleResolve = async () => {
    if (!selectedGrievance) return;
    setResolving(true);

    const formData = new FormData();
    if (resolutionImage) {
        formData.append("image", resolutionImage);
    }

    try {
      await api.put(`/grievance/${selectedGrievance.id}/resolve`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setDialogOpen(false);
      fetchAssignedGrievances(); // Refresh list
    } catch (error) {
      console.error("Failed to submit resolution", error);
    } finally {
      setResolving(false);
      setResolutionImage(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
      case "High": return "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200";
      case "Low": return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
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
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
              <div className="flex items-center gap-2">
                  <div className="bg-blue-600 p-1.5 rounded-lg">
                      <HardHat className="text-white h-5 w-5" />
                  </div>
                  <div>
                      <h1 className="text-lg font-bold text-slate-900 leading-tight">Field Officer</h1>
                      <p className="text-xs text-slate-500">Task Management</p>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <LanguageSelector variant="ghost" />
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" /> {t("logout")}
                  </Button>
              </div>
          </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">{t("myTasks")}</h2>
            <p className="text-slate-500">Prioritize critical issues and upload proof of resolution.</p>
        </div>

        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6"
        >
          {grievances.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-300 shadow-none bg-slate-50">
                <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
                    <p className="text-slate-500 mt-1">No pending grievances assigned to you.</p>
                </CardContent>
            </Card>
          ) : (
            grievances.map((g) => (
              <motion.div variants={item} key={g.id}>
                  <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="md:flex">
                        {g.image_url && (
                            <div className="md:w-64 h-48 md:h-auto relative shrink-0">
                                 {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={`http://localhost:8000${g.image_url}`} 
                                    alt="Evidence" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden"></div>
                            </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-2">
                                        <Badge className={getPriorityColor(g.priority)} variant="outline">{g.priority}</Badge>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">{g.category}</Badge>
                                    </div>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(g.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-slate-900">{g.title}</h3>
                                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{g.description}</p>
                                {g.location && (
                                    <div className="flex items-center text-xs font-medium text-slate-500 mb-4 bg-slate-50 w-fit px-2 py-1 rounded">
                                        <MapPin className="h-3 w-3 mr-1 text-blue-500" /> {g.location}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end items-center mt-4 pt-4 border-t border-slate-100">
                                 {g.status === "Resolved" ? (
                                     <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium">
                                         <CheckCircle className="h-4 w-4" /> Resolved
                                     </div>
                                 ) : g.status === "Pending Verification" ? (
                                     <div className="flex items-center gap-2 text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full text-sm font-medium">
                                         <Clock className="h-4 w-4" /> Pending Verification
                                     </div>
                                 ) : g.status === "Assigned" || g.status === "New" ? (
                                    <Button onClick={() => handleStartProgress(g.id)} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                                        Start Work
                                    </Button>
                                 ) : (
                                    <Dialog open={dialogOpen && selectedGrievance?.id === g.id} onOpenChange={(open) => {
                                        setDialogOpen(open);
                                        if(open) setSelectedGrievance(g);
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                                                Submit Resolution
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Resolve Grievance #{g.id}</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <p className="text-sm text-slate-500">
                                                    Upload a photo of the completed work to mark this issue as resolved.
                                                </p>
                                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                                    <Label htmlFor="picture">Resolution Proof</Label>
                                                    <Input id="picture" type="file" onChange={(e) => setResolutionImage(e.target.files?.[0] || null)} />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleResolve} disabled={resolving} className="w-full sm:w-auto">
                                                    {resolving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Submit for Verification
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                 )}
                            </div>
                        </div>
                    </div>
                  </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </main>
    </div>
  );
}
