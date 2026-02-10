"use client";

import { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AlertTriangle, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const localizer = momentLocalizer(moment);

interface CalendarTask {
  id: number;
  title: string;
  start: Date;
  end: Date;
  priority: string;
  status: string;
  assigned_to_user?: { name: string };
}

interface CalendarViewProps {
  tasks: any[];
}

export default function CalendarView({ tasks }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Transform tasks to calendar events
  const events: CalendarTask[] = tasks.map((task) => {
    const dueDate = task.due_date ? new Date(task.due_date) : new Date();
    const start = new Date(dueDate);
    const end = new Date(dueDate);
    end.setHours(end.getHours() + 1); // 1 hour duration

    return {
      id: task.id,
      title: task.title,
      start,
      end,
      priority: task.priority,
      status: task.status,
      assigned_to_user: task.assigned_to_user,
    };
  });

  // Event style
  const eventStyleGetter = (event: CalendarTask) => {
    let backgroundColor = "";
    let borderColor = "";
    let color = "white";

    switch (event.priority) {
      case "Critical":
        backgroundColor = "#fef2f2";
        borderColor = "#dc2626";
        color = "#dc2626";
        break;
      case "Urgent":
        backgroundColor = "#fff7ed";
        borderColor = "#ea580c";
        color = "#ea580c";
        break;
      case "High":
        backgroundColor = "#fefce8";
        borderColor = "#d97706";
        color = "#d97706";
        break;
      case "Medium":
        backgroundColor = "#eff6ff";
        borderColor = "#3b82f6";
        color = "#3b82f6";
        break;
      case "Low":
        backgroundColor = "#f8fafc";
        borderColor = "#94a3b8";
        color = "#94a3b8";
        break;
      default:
        backgroundColor = "#f8fafc";
        borderColor = "#94a3b8";
        color = "#94a3b8";
    }

    // Style for done tasks
    if (event.status === "Done") {
      backgroundColor = "#f0fdf4";
      borderColor = "#10b981";
      color = "#10b981";
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        color,
        border: "1px solid #e2e8f0",
        borderRadius: "4px",
        padding: "2px 4px",
        fontSize: "12px",
      },
    };
  };

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarTask }) => {
    const getPriorityIcon = () => {
      switch (event.priority) {
        case "Critical":
          return <AlertTriangle size={12} />;
        case "Urgent":
          return <AlertCircle size={12} />;
        case "High":
          return <AlertTriangle size={12} />;
        case "Medium":
        case "Low":
          return <Clock size={12} />;
        default:
          return null;
      }
    };

    return (
      <div className="flex items-start gap-1">
        <div className="mt-0.5">{getPriorityIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{event.title}</div>
          {event.assigned_to_user && (
            <div className="text-xs opacity-75 truncate">
              {event.assigned_to_user.name}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
        }}
        views={["month", "week", "day"]}
        defaultView="month"
        date={currentDate}
        onNavigate={(date) => setCurrentDate(date)}
        popup
        toolbar
      />
    </div>
  );
}