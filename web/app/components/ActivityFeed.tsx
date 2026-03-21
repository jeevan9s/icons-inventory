"use client";

import { useActivity } from "@/services/lib/hooks/useActivity";
import { getIndicatorColor } from "@/services/lib/helpers";
import { ClipboardList, Clock } from "lucide-react";
import { format } from "date-fns";

export default function ActivityFeed() {
  const { data: items = [], isLoading } = useActivity();

  if (isLoading) return <div className="p-4 text-xs text-neutral-400">Loading activity...</div>;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3 items-start border-b border-neutral-50 pb-3 last:border-0">
          <div className="relative mt-1">
            <div className={`p-1.5 rounded-lg ${item.action.includes('completed') ? 'bg-green-50' : 'bg-blue-50'}`}>
              <ClipboardList size={14} className={item.action.includes('completed') ? 'text-green-600' : 'text-blue-600'} />
            </div>
            <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border-2 border-white ${getIndicatorColor(item.status)}`} />
          </div>

          <div className="flex flex-col min-w-0">
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              <span className="font-semibold text-neutral-900 text-[0.9rem]">{item.display_name}</span>
              {" "}<span className="text-[0.9rem]">{item.action}</span>{" "}
              <span className="font-semibold text-neutral-900 text-[0.9rem]">{item.item_name}</span>
              {" for "}<span className="font-semibold text-neutral-900 text-[0.9rem]">{item.student_name}</span>
            </p>
            
            <div className="flex items-center gap-1.5 mt-1 text-neutral-400">
              <Clock size={10} />
              <span className="text-[9px] font-medium uppercase tracking-wider">
                {format(new Date(item.date.getTime() - (4 * 60 * 60 * 1000)), "h:mm aa")}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}