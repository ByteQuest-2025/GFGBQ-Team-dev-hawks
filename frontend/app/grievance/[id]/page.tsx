"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { Loader2, MapPin, Calendar, AlertTriangle, ArrowLeft, CheckCircle2, XCircle, Clock, Star, Image as ImageIcon, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Grievance {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  ai_summary: string;
  created_at: string;
  image_url?: string;
  location?: string;
  state?: string;
  district?: string;
  media?: {
      url: string;
      type: string;
  }[];
  feedback?: {
      rating: number;
      comment: string;
  };
  timeline?: {
      status: string;
      remark: string;
      created_at: string;
  }[];
}

export default function GrievanceDetails() {
  const params = useParams();
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
    setUserRole(role);
    fetchGrievance();
    const interval = setInterval(fetchGrievance, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [params.id]);

  const fetchGrievance = async () => {
      try {
        const response = await api.get(`/grievance/${params.id}`);
        setGrievance(response.data);
      } catch (err) {
        setError("Failed to load grievance details.");
      } finally {
        setLoading(false);
      }
    };

  const handleFeedbackSubmit = async () => {
      if (!grievance) return;
      setSubmittingFeedback(true);
      try {
          await api.post(`/grievance/${grievance.id}/feedback`, {
              rating,
              comment,
              grievance_id: grievance.id
          });
          fetchGrievance(); // Refresh to show feedback
      } catch (error) {
          console.error("Failed to submit feedback", error);
      } finally {
          setSubmittingFeedback(false);
      }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Loader2 className="animate-spin h-12 w-12 text-white" />
    </div>
  );

  if (error || !grievance) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">{error || "Grievance not found"}</h2>
        <Link href="/" className="mt-4 inline-block text-blue-400 hover:text-blue-300 underline">Return Home</Link>
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-blue-500/20 text-blue-300 border-blue-500/50";
      case "Resolved": return "bg-green-500/20 text-green-300 border-green-500/50";
      case "Critical": return "bg-red-500/20 text-red-300 border-red-500/50";
      case "Escalated": return "bg-orange-500/20 text-orange-300 border-orange-500/50";
      case "Rejected": return "bg-red-900/20 text-red-400 border-red-900/50";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/50";
    }
  };

  const getPriorityColor = (priority: string) => {
      switch (priority) {
          case "High": return "text-red-400";
          case "Medium": return "text-yellow-400";
          case "Low": return "text-green-400";
          default: return "text-gray-400";
      }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
        >
            <Link href="/" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Grievance Details
            </h1>
        </motion.div>
        
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
        >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-slate-50 overflow-hidden">
            <CardHeader className="border-b border-white/10 pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <motion.div variants={item}>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="border-white/30 text-white/80">{grievance.category}</Badge>
                            <span className={`text-sm font-medium ${getPriorityColor(grievance.priority)}`}>
                                {grievance.priority} Priority
                            </span>
                        </div>
                    </motion.div>
                    <motion.div variants={item}>
                        <CardTitle className="text-3xl font-bold text-white">{grievance.title}</CardTitle>
                    </motion.div>
                    <motion.div variants={item}>
                        <CardDescription className="flex flex-wrap items-center gap-4 text-slate-300 mt-2">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" /> {new Date(grievance.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" /> {new Date(grievance.created_at).toLocaleTimeString()}
                            </span>
                            {grievance.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" /> {grievance.location}
                                </span>
                            )}
                        </CardDescription>
                    </motion.div>
                </div>
                <motion.div variants={item}>
                    <Badge className={`text-lg px-4 py-1 border ${getStatusColor(grievance.status)}`}>
                        {grievance.status}
                    </Badge>
                </motion.div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
                {/* Image Section - Display prominently at the top */}
                {(grievance.image_url || (grievance.media && grievance.media.length > 0)) && (
                <motion.div variants={item} className="space-y-3">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <span className="p-1 bg-purple-500/20 rounded-md"><ImageIcon className="h-5 w-5 text-purple-400" /></span>
                        Evidence Photo
                    </h3>
                    <div className="rounded-xl overflow-hidden border border-white/20 bg-black/40 relative group">
                        <img 
                            src={`http://127.0.0.1:8000${grievance.image_url || (grievance.media && grievance.media[0]?.url) || ''}`} 
                            alt="Grievance Evidence" 
                            className="w-full max-h-[600px] object-contain bg-black/20 transition-transform duration-500 group-hover:scale-[1.02]"
                            onError={(e) => {
                                console.error("Image failed to load:", e);
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 pointer-events-none">
                            <p className="text-white font-medium">Uploaded Evidence</p>
                        </div>
                    </div>
                </motion.div>
                )}

                {/* Description Section */}
                <motion.div variants={item} className="space-y-3">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <span className="p-1 bg-blue-500/20 rounded-md"><CheckCircle2 className="h-5 w-5 text-blue-400" /></span>
                        Description
                    </h3>
                    <div className="bg-black/20 p-6 rounded-xl border border-white/5 text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {grievance.description}
                    </div>
                </motion.div>

                {/* Location Information */}
                {(grievance.location || grievance.state || grievance.district) && (
                <motion.div variants={item} className="space-y-3">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <span className="p-1 bg-green-500/20 rounded-md"><MapPin className="h-5 w-5 text-green-400" /></span>
                        Location Details
                    </h3>
                    <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-2">
                        {grievance.location && (
                            <div className="flex items-center gap-2 text-slate-300">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Address:</span>
                                <span>{grievance.location}</span>
                            </div>
                        )}
                        {(grievance.state || grievance.district) && (
                            <div className="flex items-center gap-2 text-slate-300">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">Area:</span>
                                <span>{grievance.district && grievance.state ? `${grievance.district}, ${grievance.state}` : grievance.district || grievance.state}</span>
                            </div>
                        )}
                    </div>
                </motion.div>
                )}

                {/* Resolution Proof Section - Show when resolved or pending verification */}
                {(grievance.status === "Resolved" || grievance.status === "Pending Verification") && 
                 grievance.media && grievance.media.find(m => m.type === "resolution_image") && (
                <motion.div variants={item} className="space-y-3">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <span className="p-1 bg-green-500/20 rounded-md"><CheckCircle className="h-5 w-5 text-green-400" /></span>
                        Resolution Proof
                    </h3>
                    <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-4 space-y-3">
                        <p className="text-sm text-green-300 font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Field Officer has uploaded proof of resolution
                        </p>
                        <div className="rounded-xl overflow-hidden border border-white/20 bg-black/40 relative group">
                            <img 
                                src={`http://127.0.0.1:8000${grievance.media.find(m => m.type === "resolution_image")?.url}`} 
                                alt="Resolution Proof" 
                                className="w-full max-h-[600px] object-contain bg-black/20 transition-transform duration-500 group-hover:scale-[1.02]"
                                onError={(e) => {
                                    console.error("Resolution image failed to load:", e);
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 pointer-events-none">
                                <p className="text-white font-medium">Resolution Proof by Field Officer</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
                )}

                <motion.div variants={item}>
                    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-6 rounded-xl border border-blue-500/30 space-y-4">
                        <div className="flex items-center gap-2 text-blue-300 font-bold text-lg">
                            <AlertTriangle className="h-5 w-5" />
                            AI Analysis & Insights
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Priority Assessment</p>
                                <p className={`text-lg font-medium ${getPriorityColor(grievance.priority)}`}>{grievance.priority}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Summary</p>
                                <p className="text-slate-200">{grievance.ai_summary}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {grievance.timeline && grievance.timeline.length > 0 && (
                <motion.div variants={item} className="space-y-3">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <span className="p-1 bg-blue-500/20 rounded-md"><Clock className="h-5 w-5 text-blue-400" /></span>
                        Timeline
                    </h3>
                    <div className="relative border-l-2 border-white/10 ml-3 space-y-6 pl-6 py-2">
                        {grievance.timeline.map((event, index) => (
                            <div key={index} className="relative">
                                <div className="absolute -left-[31px] bg-slate-900 p-1 rounded-full border border-white/10">
                                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-400">{new Date(event.created_at).toLocaleString()}</p>
                                    <p className="text-white font-medium">{event.status}</p>
                                    {event.remark && <p className="text-sm text-slate-400">{event.remark}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
                )}
                
                {/* Feedback Section */}
                {grievance.status === "Resolved" && (grievance.feedback || (userRole !== "Admin" && userRole !== "FieldOfficer")) && (
                    <motion.div variants={item} className="border-t border-white/10 pt-8 mt-8">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <span className="p-1 bg-green-500/20 rounded-md"><Star className="h-5 w-5 text-green-400" /></span>
                            Citizen Feedback
                        </h3>
                        {grievance.feedback ? (
                            <div className="bg-green-900/20 p-6 rounded-xl border border-green-500/30">
                                <div className="flex items-center mb-4">
                                    <span className="font-bold mr-3 text-green-300">Rating:</span>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={`h-5 w-5 ${i < grievance.feedback!.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Comment</p>
                                    <p className="text-slate-200 italic">"{grievance.feedback.comment}"</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-6">
                                <div className="space-y-2 text-center">
                                    <h4 className="text-lg font-medium text-white">How was your experience?</h4>
                                    <p className="text-sm text-slate-400">Please rate the resolution of your grievance.</p>
                                </div>
                                
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star} 
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star 
                                                className={`h-8 w-8 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600 hover:text-yellow-400/50"}`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                                
                                <textarea 
                                    className="w-full p-4 bg-black/30 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none min-h-[100px]" 
                                    placeholder="Share your thoughts on the resolution process..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                
                                <div className="flex justify-end">
                                    <button 
                                        onClick={handleFeedbackSubmit}
                                        disabled={rating === 0 || submittingFeedback}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {submittingFeedback ? (
                                            <>
                                                <Loader2 className="animate-spin h-4 w-4" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Feedback"
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

            </CardContent>
            </Card>
        </motion.div>
      </div>
    </div>
  );
}
