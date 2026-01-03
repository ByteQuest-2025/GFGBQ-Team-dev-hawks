"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { Loader2, Filter, CheckCircle, UserPlus, MapPin, ArrowLeft, User } from "lucide-react";
import { indianStatesAndDistricts } from "@/lib/indian_states";

interface Grievance {
  id: number;
  title: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  department_id?: number;
  region_id?: number;
  region_code?: string;
  state?: string;
  district?: string;
  assignee_id?: number;
  image_url?: string;
  media?: {
      url: string;
      type: string;
  }[];
}

interface Officer {
  id: number;
  full_name: string;
  email: string;
  department_id: number;
  region_code: string;
  state?: string;
  district?: string;
}

type ViewState = "states" | "districts" | "dashboard";

export default function AdminGrievances() {
  const [view, setView] = useState<ViewState>("states");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  useEffect(() => {
    if (view === "dashboard" && selectedDistrict) {
      fetchDashboardData();
    }
  }, [view, selectedDistrict, filterStatus]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Grievances
      let gUrl = `/grievance/?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`;
      if (filterStatus !== "All") gUrl += `&status=${filterStatus}`;
      const gResponse = await api.get(gUrl);
      setGrievances(gResponse.data);

      // Fetch Officers
      const oResponse = await api.get(`/admin/officers?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(selectedDistrict)}`);
      setOfficers(oResponse.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStateClick = (state: string) => {
    setSelectedState(state);
    setView("districts");
  };

  const handleDistrictClick = (district: string) => {
    setSelectedDistrict(district);
    setView("dashboard");
  };

  const handleBack = () => {
    if (view === "dashboard") {
      setView("districts");
      setGrievances([]);
      setOfficers([]);
    } else if (view === "districts") {
      setView("states");
      setSelectedState("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-100 text-blue-800";
      case "Assigned": return "bg-purple-100 text-purple-800";
      case "Resolved": return "bg-green-100 text-green-800";
      case "Pending Verification": return "bg-orange-100 text-orange-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      case "Critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
     switch (priority) {
      case "Critical": return "text-red-600 font-bold";
      case "High": return "text-orange-600 font-semibold";
      default: return "text-gray-600";
    }
  };

  const handleVerify = async (id: number) => {
      try {
          await api.patch(`/admin/grievance/${id}/verify`);
          fetchDashboardData();
      } catch (error) {
          console.error("Verification failed", error);
          alert("Failed to verify grievance");
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Grievance Management</h1>
            <p className="text-gray-500">
              {view === "states" && "Select a State to view districts"}
              {view === "districts" && `Select a District in ${selectedState}`}
              {view === "dashboard" && `Dashboard for ${selectedDistrict}, ${selectedState}`}
            </p>
          </div>
          <div className="flex gap-4 items-center">
             {view !== "states" && (
                 <Button variant="outline" onClick={handleBack} className="mr-4">
                     <ArrowLeft className="w-4 h-4 mr-2" />
                     Back
                 </Button>
             )}
             <a href="/admin/dashboard" className="text-sm text-blue-600 hover:underline">Back to Dashboard</a>
          </div>
        </div>

        {/* View: States Grid */}
        {view === "states" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.keys(indianStatesAndDistricts).map((state) => (
                    <Card 
                        key={state} 
                        className="hover:shadow-lg transition-all cursor-pointer hover:border-blue-500 group"
                        onClick={() => handleStateClick(state)}
                    >
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                            <MapPin className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-lg">{state}</span>
                            <span className="text-xs text-gray-500">{indianStatesAndDistricts[state].length} Districts</span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}

        {/* View: Districts Grid */}
        {view === "districts" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {indianStatesAndDistricts[selectedState]?.map((district) => (
                    <Card 
                        key={district} 
                        className="hover:shadow-lg transition-all cursor-pointer hover:border-blue-500 group"
                        onClick={() => handleDistrictClick(district)}
                    >
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                            <MapPin className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-lg">{district}</span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}

        {/* View: Dashboard (Grievances + Officers) */}
        {view === "dashboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Grievances (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Grievances
                        </h2>
                        <Select onValueChange={setFilterStatus} defaultValue="All">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Statuses</SelectItem>
                                <SelectItem value="New">New</SelectItem>
                                <SelectItem value="Assigned">Assigned</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Pending Verification">Pending Verification</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : grievances.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-gray-500">
                                No grievances found in {selectedDistrict}.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {grievances.map((g) => (
                                <Card key={g.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-lg">#{g.id} {g.title}</span>
                                                    <Badge variant="outline">{g.category}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    Created on {new Date(g.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge className={getStatusColor(g.status)}>{g.status}</Badge>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-4">
                                            <div className={`text-sm ${getPriorityColor(g.priority)}`}>
                                                {g.priority} Priority
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                {g.image_url && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                View Evidence
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-3xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Grievance Evidence</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="mt-4">
                                                                <img 
                                                                    src={`http://127.0.0.1:8000${g.image_url}`} 
                                                                    alt="Grievance Evidence" 
                                                                    className="w-full rounded-lg border max-h-[600px] object-contain"
                                                                />
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}

                                                {g.status === "Pending Verification" && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                Verify
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-3xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Verify Grievance Resolution</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <p className="font-medium">Resolution Proof:</p>
                                                                {g.media && g.media.find(m => m.type === "resolution_image") ? (
                                                                    <img 
                                                                        src={`http://127.0.0.1:8000${g.media.find(m => m.type === "resolution_image")?.url}`} 
                                                                        alt="Resolution Proof" 
                                                                        className="w-full rounded-lg border max-h-[500px] object-contain"
                                                                    />
                                                                ) : (
                                                                    <div className="p-8 bg-gray-100 rounded-lg text-center text-gray-500">
                                                                        No resolution proof uploaded.
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-end gap-2 pt-4">
                                                                    <Button onClick={() => handleVerify(g.id)} className="w-full sm:w-auto">
                                                                        Confirm Verification
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}

                                                {(g.status === "New" || g.status === "Assigned") && (
                                                    <AssignDialog grievance={g} onAssign={fetchDashboardData} />
                                                )}

                                                <Button variant="outline" asChild size="sm">
                                                    <a href={`/grievance/${g.id}`}>View Details</a>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Field Officers (1/3 width) */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Field Officers
                    </h2>
                    
                    {officers.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-gray-500">
                                No officers registered in {selectedDistrict}.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {officers.map((officer) => (
                                <Card key={officer.id}>
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                            {officer.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{officer.full_name}</p>
                                            <p className="text-xs text-gray-500">{officer.email}</p>
                                            <Badge variant="secondary" className="mt-1 text-xs">
                                                {officer.district ? `${officer.district}, ${officer.state}` : officer.region_code}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

function AssignDialog({ grievance, onAssign }: { grievance: Grievance; onAssign: () => void }) {
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [selectedOfficer, setSelectedOfficer] = useState<string>("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchOfficers();
        }
    }, [open]);

    const fetchOfficers = async () => {
        setLoading(true);
        try {
            // Fetch officers matching department and region
            let url = `/admin/officers?`;
            if (grievance.department_id) url += `department_id=${grievance.department_id}&`;
            
            // Prefer state/district if available
            if (grievance.state && grievance.district) {
                url += `state=${encodeURIComponent(grievance.state)}&district=${encodeURIComponent(grievance.district)}`;
            } else if (grievance.region_code) {
                url += `region_code=${encodeURIComponent(grievance.region_code)}`;
            } else if (grievance.region_id) {
                url += `region_id=${grievance.region_id}`;
            }
            
            const response = await api.get(url);
            setOfficers(response.data);
        } catch (error) {
            console.error("Failed to fetch officers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedOfficer) return;
        try {
            await api.patch(`/admin/grievance/${grievance.id}/assign`, {
                officer_id: parseInt(selectedOfficer)
            });
            setOpen(false);
            onAssign();
        } catch (error) {
            console.error("Assignment failed", error);
            alert("Failed to assign officer. Check if department/region matches.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    {grievance.status === "Assigned" ? "Reassign" : "Assign"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Field Officer</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Label>Select Officer</Label>
                    <Select onValueChange={setSelectedOfficer}>
                        <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select an officer" />
                        </SelectTrigger>
                        <SelectContent>
                            {loading ? (
                                <div className="p-2 text-center text-sm">Loading...</div>
                            ) : officers.length === 0 ? (
                                <div className="p-2 text-center text-sm">No matching officers found</div>
                            ) : (
                                officers.map((officer) => (
                                    <SelectItem key={officer.id} value={officer.id.toString()}>
                                        {officer.full_name} ({officer.district ? `${officer.district}, ${officer.state}` : officer.region_code || "No Region"})
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">
                        Only officers matching Department and Region are shown.
                    </p>
                </div>
                <DialogFooter>
                    <Button onClick={handleAssign} disabled={!selectedOfficer}>
                        Assign
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
