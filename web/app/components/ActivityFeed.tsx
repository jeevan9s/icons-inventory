import { ActivityItem } from "@/services/lib/types";
import { Package, ClipboardList, Clock } from "lucide-react";

export default function ActivityFeed({ items, getIndicatorColor }: { items: ActivityItem[], getIndicatorColor: (s: string) => string }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      {items.map((item) => (
        <div key={`${item.type}-${item.id}`} className="flex gap-3 items-start border-b border-neutral-50 pb-3 last:border-0">
          <div className="relative mt-1">
            <div className={`p-1.5 rounded-lg ${item.type === 'loan' ? 'bg-blue-50' : 'bg-neutral-50'}`}>
              {item.type === 'loan' ? (
                <ClipboardList size={14} className="text-blue-600" />
              ) : (
                <Package size={14} className="text-neutral-400" />
              )}
            </div>
            <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border-2 border-white ${getIndicatorColor(item.status)}`} />
          </div>

          <div className="flex flex-col min-w-0">
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              {item.type === 'loan' ? (
                <>
                  <span className="font-semibold text-neutral-900">{item.display_name}</span>
                  {" "}{item.action}{" "}
                  loan of <span className="font-semibold text-neutral-900">{item.item_name}</span>
                  {" "}for <span className="font-semibold text-neutral-900">{item.student_name}</span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-neutral-900  mr-1">Inventory:</span>
                  <span className="font-semibold text-neutral-900">{item.item_name}</span>
                  {" "}was updated
                </>
              )}
            </p>
            
            {item.type === 'loan' && item.date.getTime() > 0 && (
              <div className="flex items-center gap-1.5 mt-1 text-neutral-400">
                <Clock size={10} />
                <span className="text-[9px] font-medium uppercase tracking-wider">
                  {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}