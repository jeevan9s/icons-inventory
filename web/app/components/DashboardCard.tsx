import { formatCapitalized } from "@/services/lib/helpers";
import { InventoryRow, LoanRow } from "@/services/lib/types"; 

interface DashboardCardProps {
  title: string;
  subtitle: string;
  status: string;
  indicatorColor: string;
  location?: string;
  studentName?: string;
  onClick?: () => void;
  rowData?: InventoryRow | LoanRow;
  
}
export default function DashboardCard({ 
  title, 
  subtitle, 
  status, 
  indicatorColor, 
  location,
  studentName,
  onClick 
}: DashboardCardProps) {
  return (
    <div 
      onClick={onClick}
      className="aspect-square p-3 rounded-lg border border-neutral-100 bg-white flex flex-col justify-between hover:border-neutral-200 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold font-mp uppercase text-neutral-400 tracking-tight">
          {status}
        </span>
        <div className={`w-2 h-2 rounded-full shadow-sm ${indicatorColor}`} />
      </div>
      
      <div className="flex flex-col gap-1">
        <h4 className="text-[14px] font-semibold font-mp text-neutral-900 leading-tight line-clamp-2 group-hover:text-black">
          {formatCapitalized(title)}
        </h4>
        {location && (
          <span className="text-[10px] text-neutral-400 font-mp font-medium">
            {location}
          </span>
        )}
      </div>
      
      <div className="flex flex-col gap-0.5 border-t border-neutral-50 pt-2">
        {studentName ? (
          <>
            <p className="text-[10px] font-mp text-neutral-400 truncate">
              Signee: <span className=" font-mp text-neutral-600 font-medium">{formatCapitalized(subtitle)}</span>
            </p>
            <p className="text-[10px] text-neutral-400 truncate">
              Student: <span className="font-mp text-neutral-600 font-medium">{formatCapitalized(studentName)}</span>
            </p>
          </>
        ) : (
          <p className="text-[11px] font-mp text-neutral-500 truncate font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}