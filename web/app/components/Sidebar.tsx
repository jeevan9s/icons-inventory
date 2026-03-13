import { useState, useRef, useCallback, useEffect } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  Search,
  Download,
  Settings,
  LogOut,
  PanelLeft,
  ShelvingUnit,
  BookCheck,
  ChevronsLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/services/lib/hooks/useAuth";
import Link from "next/link";


type sbProps = {
  isLocked: boolean;
  isHovered: boolean;
  setIsHovered: (hovering: boolean) => void;
  setIsLocked: (locked: boolean) => void;
  disableHoverZones?: boolean;
  onWidthChange?: (width: number) => void;
};

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: PlusCircle, label: "Add" },
  { icon: Search, label: "Search" },
  { icon: Download, label: "Export" },
];

const tableItems = [
  { icon: BookCheck, label: "Loans" },
  { icon: ShelvingUnit, label: "Inventory" },
];

const generalItems = [
  { icon: Settings, label: "Settings" },
  { icon: LogOut, label: "Sign Out" },
];

const ICON_ONLY_WIDTH = 56;
const MIN_WIDTH = 160;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 224;
const NAVBAR_HEIGHT = 128;

export default function Sidebar({
  isLocked,
  isHovered,
  setIsLocked,
  setIsHovered,
  disableHoverZones,
  onWidthChange,
}: sbProps) {
  const [active, setActive] = useState("Dashboard");
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isResizing = useRef(false);
  const [, forceUpdate] = useState(0);

  const iconOnly = isLocked && width <= ICON_ONLY_WIDTH + 10;
  const showLabels = !iconOnly;

  useEffect(() => {
    onWidthChange?.(DEFAULT_WIDTH);
  }, []);

 const {user} = useAuth();

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isResizing.current = true;
      forceUpdate((n) => n + 1);

      const onMouseMove = (e: MouseEvent) => {
        if (!isResizing.current) return;
        const newWidth =
          e.clientX < ICON_ONLY_WIDTH + 20
            ? ICON_ONLY_WIDTH
            : Math.min(Math.max(e.clientX, MIN_WIDTH), MAX_WIDTH);
        setWidth(newWidth);
        onWidthChange?.(newWidth);
      };

      const onMouseUp = () => {
        isResizing.current = false;
        forceUpdate((n) => n + 1);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [onWidthChange],
  );

  return (
    <>
      <motion.aside
        onMouseEnter={() => !disableHoverZones && setIsHovered(true)}
        onMouseLeave={() =>
          !disableHoverZones && !isLocked && setIsHovered(false)
        }
        className={`fixed z-[60] flex flex-col left-0 bottom-0 rounded-tr-xl ${isLocked ? "border-r border-neutral-200" : ""}`}
        style={{
          top: NAVBAR_HEIGHT,
          backgroundColor: "rgb(255, 255, 255)",
          width: isLocked ? width : isHovered ? DEFAULT_WIDTH : 0,
          transition: isResizing.current ? "none" : "width 300ms ease",
          overflow: "hidden",
        }}
      >
        <div className="flex flex-col h-full py-5 whitespace-nowrap px-2">
          <div className={`flex mb-6 ${iconOnly ? "justify-center" : "justify-end"}`}>
            <button
              onClick={() => {
                setIsLocked(!isLocked);
                onWidthChange?.(!isLocked ? width : 0);
              }}
              className="p-1 rounded hover:bg-neutral-100 hover:cursor-pointer transition-all duration-200 ease-in-out hover:scale-105"
            >
              {isLocked ? (
                <ChevronsLeft size={18} className="md:w-5 md:h-5 text-black/70" />
              ) : (
                <PanelLeft size={18} className="md:w-5 md:h-5" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {showLabels && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="font-mp text-xs md:text-sm text-neutral-400 uppercase tracking-widest mb-2 px-1"
              >
                Menu
              </motion.p>
            )}
          </AnimatePresence>

          <nav className="flex flex-col gap-1 mb-6">
            {menuItems.map(({ icon: Icon, label }) => (
              <motion.button
                layout
                key={label}
                onClick={() => setActive(label)}
                className={`flex items-center rounded-lg font-mp transition-colors text-sm md:text-base
                  ${iconOnly ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"}
                  ${active === label ? "bg-[#d4e6c3] text-neutral-800" : "text-neutral-600 hover:bg-neutral-100"}`}
              >
                <Icon size={18} className="md:w-5 md:h-5 shrink-0" />
                <AnimatePresence mode="wait">
                  {showLabels && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </nav>

          <AnimatePresence>
            {showLabels && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="font-mp text-xs md:text-sm text-neutral-400 uppercase tracking-widest mb-2 px-1"
              >
                Data
              </motion.p>
            )}
          </AnimatePresence>

          <nav className="flex flex-col gap-1 mb-5">
            {tableItems.map(({ icon: Icon, label }) => {
              const href = label === "Loans" ? "/data/loans" : "/data/inventory";
              return (
              <Link href={href}>
              <motion.button
                layout
                key={label}
                className={`flex items-center rounded-lg font-mp text-sm md:text-base text-neutral-600 hover:bg-neutral-100 transition-colors
                  ${iconOnly ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"}`}
              >
                <Icon size={18} className="md:w-5 md:h-5 shrink-0" />
                <AnimatePresence mode="wait">
                  {showLabels && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              </Link>
              );
            })}
          </nav>

          <AnimatePresence>
            {showLabels && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="font-mp text-xs md:text-sm text-neutral-400 uppercase tracking-widest mb-2 px-1"
              >
                General
              </motion.p>
            )}
          </AnimatePresence>

          <nav className="flex flex-col gap-1">
            {generalItems.map(({ icon: Icon, label }) => (
              <motion.button
                layout
                key={label}
                className={`flex items-center rounded-lg font-mp text-sm md:text-base text-neutral-600 hover:bg-neutral-100 transition-colors
                  ${iconOnly ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"}`}
              >
                <Icon size={18} className="md:w-5 md:h-5 shrink-0" />
                <AnimatePresence mode="wait">
                  {showLabels && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </nav>

                    <AnimatePresence>
            {showLabels && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="font-mp text-xs md:text-sm text-neutral-400 uppercase tracking-widest mt-78 px-1"
              >
                User
              </motion.p>
            )}
          </AnimatePresence>


          <div className="mt-auto pt-4 border-t border-neutral-100">
            <AnimatePresence>
              {showLabels ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <p className="font-mp text-sm font-medium text-neutral-800 truncate">{user?.name ?? '—'}</p>
                  <p className="font-mp text-xs text-neutral-400 truncate">{user?.email ?? '—'}</p>
                  { <p className="font-mp text-xs text-neutral-300 truncate mt-0.5">{user?.role ?? '—'}</p> }
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-center py-2"
                >
                  <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center">
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </motion.aside>

      {isLocked && (
        <div
          onMouseDown={startResize}
          className="fixed bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors z-[70]"
          style={{ left: width, top: NAVBAR_HEIGHT }}
        />
      )}
    </>
  );
}