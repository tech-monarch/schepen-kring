"use client";

import { useState } from "react";
import { Calendar, momentLocalizer, View, SlotInfo } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AlertTriangle, AlertCircle, CheckCircle2, Clock, User, Anchor } from "lucide-react";
import { cn } from "@/lib/utils";

const localizer = momentLocalizer(moment);

interface CalendarTask {
  id: number | string;
  title: string;
  start: Date;
  end: Date;
  priority: "Low" | "Medium" | "High" | "Urgent" | "Critical";
  status: "To Do" | "In Progress" | "Done";
  type?: "assigned" | "personal";
  assigned_to?: string;
  yacht?: string;
  color?: string;
}

interface CalendarViewProps {
  tasks: any[];
  onTaskClick?: (task: any) => void;
}

export default function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>("month");

  // Transform tasks to calendar events
  const events: CalendarTask[] = tasks.map((task) => {
    let dueDate: Date;
    
    if (task.due_date) {
      dueDate = new Date(task.due_date);
    } else if (task.completedAt) {
      dueDate = new Date(task.completedAt);
    } else {
      dueDate = new Date();
    }
    
    const start = new Date(dueDate);
    const end = new Date(dueDate);
    end.setHours(end.getHours() + 2);

    return {
      id: task.id,
      title: task.title,
      start,
      end,
      priority: task.priority || "Medium",
      status: task.status || "To Do",
      type: task.type,
      assigned_to: task.assigned_to_user?.name || task.assignedTo?.name,
      yacht: task.yacht?.name,
      color: getPriorityColor(task.priority),
    };
  });

  // Get priority color
  function getPriorityColor(priority: string): string {
    switch (priority) {
      case "Critical": return "#dc2626";
      case "Urgent": return "#ea580c";
      case "High": return "#d97706";
      case "Medium": return "#3b82f6";
      case "Low": return "#6b7280";
      default: return "#6b7280";
    }
  }

  // Event style
  const eventStyleGetter = (event: CalendarTask) => {
    return {
      style: {
        backgroundColor: `${event.color}20`,
        borderLeft: `4px solid ${event.color}`,
        color: event.color,
        border: "1px solid #e2e8f0",
        borderRadius: "4px",
        padding: "2px 4px",
        fontSize: "12px",
        opacity: event.status === "Done" ? 0.7 : 1,
      },
    };
  };

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarTask }) => {
    const getPriorityIcon = () => {
      switch (event.priority) {
        case "Critical":
          return <AlertTriangle size={12} className="text-red-600" />;
        case "Urgent":
          return <AlertCircle size={12} className="text-orange-500" />;
        case "High":
          return <AlertTriangle size={12} className="text-amber-500" />;
        case "Medium":
        case "Low":
          return <Clock size={12} className="text-blue-500" />;
        default:
          return null;
      }
    };

    const getStatusIcon = () => {
      if (event.status === "Done") {
        return <CheckCircle2 size={12} className="text-emerald-500 ml-1" />;
      }
      return null;
    };

    return (
      <div 
        className="flex items-start gap-1 p-1 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => onTaskClick && onTaskClick(event)}
      >
        <div className="mt-0.5">{getPriorityIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate text-xs">{event.title}</div>
          {event.assigned_to && (
            <div className="text-[10px] opacity-75 truncate flex items-center gap-1">
              <User size={10} />
              {event.assigned_to}
            </div>
          )}
          {event.type === "personal" && (
            <div className="text-[10px] text-indigo-600">Personal</div>
          )}
        </div>
        {getStatusIcon()}
      </div>
    );
  };

  // Custom toolbar
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate("PREV");
    };

    const goToNext = () => {
      toolbar.onNavigate("NEXT");
    };

    const goToCurrent = () => {
      toolbar.onNavigate("TODAY");
    };

    const changeView = (viewName: View) => {
      toolbar.onView(viewName);
      setCurrentView(viewName);
    };

    return (
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 p-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <button
            onClick={goToBack}
            className="px-3 py-1 border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            ‹
          </button>
          <button
            onClick={goToCurrent}
            className="px-3 py-1 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm"
          >
            Today
          </button>
          <button
            onClick={goToNext}
            className="px-3 py-1 border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            ›
          </button>
          <span className="text-lg font-bold text-[#003566] ml-4">
            {toolbar.label}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => changeView("month")}
            className={cn(
              "px-3 py-1 text-sm border",
              currentView === "month" 
                ? "bg-[#003566] text-white border-[#003566]" 
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            Month
          </button>
          <button
            onClick={() => changeView("week")}
            className={cn(
              "px-3 py-1 text-sm border",
              currentView === "week" 
                ? "bg-[#003566] text-white border-[#003566]" 
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            Week
          </button>
          <button
            onClick={() => changeView("day")}
            className={cn(
              "px-3 py-1 text-sm border",
              currentView === "day" 
                ? "bg-[#003566] text-white border-[#003566]" 
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            Day
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[600px] bg-white">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
          toolbar: CustomToolbar,
        }}
        views={["month", "week", "day"]}
        view={currentView}
        date={currentDate}
        onNavigate={setCurrentDate}
        onView={setCurrentView}
        popup
        tooltipAccessor={(event: CalendarTask) => 
          `${event.title}\nPriority: ${event.priority}\nStatus: ${event.status}\n${event.assigned_to ? `Assigned to: ${event.assigned_to}` : ''}\n${event.yacht ? `Yacht: ${event.yacht}` : ''}`
        }
      />
    </div>
  );
}