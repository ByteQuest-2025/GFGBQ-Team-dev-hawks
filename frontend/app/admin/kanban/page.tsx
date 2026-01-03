"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { Loader2, ArrowLeft, LayoutDashboard, ListTodo, Map, LogOut, MoreHorizontal, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Grievance {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
}

export default function KanbanBoard() {
  const router = useRouter();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
        router.push("/login");
        return;
    }

    const fetchGrievances = async () => {
      try {
        const response = await api.get("/grievance/?skip=0&limit=100");
        setGrievances(response.data);
      } catch (error) {
        console.error("Failed to fetch grievances", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Find the grievance
    const grievanceId = parseInt(draggableId);
    const grievance = grievances.find(g => g.id === grievanceId);
    if (!grievance) return;

    // Determine new status based on destination column
    let newStatus = grievance.status;
    if (destination.droppableId === "todo") newStatus = "New"; // Default to New if moved to To Do
    else if (destination.droppableId === "inprogress") newStatus = "In Progress";
    else if (destination.droppableId === "verification") newStatus = "Pending Verification";
    else if (destination.droppableId === "done") newStatus = "Resolved";

    // Optimistic update
    const previousGrievances = [...grievances];
    setGrievances(prev => prev.map(g => 
        g.id === grievanceId ? { ...g, status: newStatus } : g
    ));

    try {
        await api.patch(`/grievance/${grievanceId}/status`, { status: newStatus });
    } catch (error) {
        console.error("Failed to update status", error);
        // Revert on failure
        setGrievances(previousGrievances);
    }
  };

  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const columns = [
    { id: "todo", title: "To Do", status: ["New", "Assigned"], color: "bg-slate-100", border: "border-slate-200" },
    { id: "inprogress", title: "In Progress", status: ["In Progress"], color: "bg-blue-50", border: "border-blue-200" },
    { id: "verification", title: "Verification", status: ["Pending Verification"], color: "bg-orange-50", border: "border-orange-200" },
    { id: "done", title: "Done", status: ["Resolved"], color: "bg-green-50", border: "border-green-200" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-700 hover:bg-red-100";
      case "High": return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      case "Medium": return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
      default: return "bg-slate-100 text-slate-700 hover:bg-slate-100";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const Sidebar = () => (
    <div className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 hidden md:flex flex-col">
        <div className="p-6">
            <h1 className="text-2xl font-bold tracking-tight">CivicPulse<span className="text-blue-400">.</span></h1>
            <p className="text-xs text-slate-400 mt-1">Admin Console</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
            <a href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                <LayoutDashboard size={20} />
                Dashboard
            </a>
            <a href="/admin/grievances" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                <ListTodo size={20} />
                Grievances
            </a>
            <a href="/admin/kanban" className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg text-white font-medium transition-all shadow-lg shadow-blue-900/20">
                <Map size={20} />
                Kanban Board
            </a>
        </nav>
        <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-all">
                <LogOut size={18} />
                Logout
            </button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-8 overflow-x-auto">
        <div className="max-w-[1600px] mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Grievance Board</h1>
                    <p className="text-slate-500 mt-1">Manage tasks and track resolution progress.</p>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 h-full items-start overflow-x-auto pb-4">
                    {columns.map((column) => {
                        const columnItems = grievances.filter(g => column.status.includes(g.status));
                        
                        return (
                            <div key={column.id} className={`flex-shrink-0 w-80 md:w-96 flex flex-col rounded-xl border ${column.border} ${column.color} h-full max-h-[calc(100vh-12rem)]`}>
                                <div className="p-4 border-b border-black/5 flex justify-between items-center bg-white/50 backdrop-blur rounded-t-xl">
                                    <h3 className="font-semibold text-slate-900">{column.title}</h3>
                                    <Badge variant="secondary" className="bg-white text-slate-600 shadow-sm">{columnItems.length}</Badge>
                                </div>
                                <Droppable droppableId={column.id}>
                                    {(provided) => (
                                        <div 
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar min-h-[100px]"
                                        >
                                            {columnItems.map((item, index) => (
                                                <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{ ...provided.draggableProps.style }}
                                                            className={`bg-white p-4 rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-all ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500/20 rotate-1' : ''}`}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <Badge className={getPriorityColor(item.priority)} variant="outline">{item.priority}</Badge>
                                                                <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
                                                            </div>
                                                            <h4 className="font-medium text-slate-900 mb-1 line-clamp-2">{item.title}</h4>
                                                            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{item.description}</p>
                                                            
                                                            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                                    <Calendar size={12} />
                                                                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600" title={`ID: ${item.id}`}>
                                                                    #{item.id}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            {columnItems.length === 0 && (
                                                <div className="h-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                                                    <p className="text-sm">No items</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
      </div>
    </div>
  );
}

