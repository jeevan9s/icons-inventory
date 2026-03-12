"use client"

import { useState, useEffect, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

type LayoutProps = {
  disableHoverZones?: boolean;
  children: ReactNode;
};

export default function Layout({ disableHoverZones = false, children }: LayoutProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [isHoveredMouse, setIsHoveredMouse] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [sidebarWidth, setSidebarWidth] = useState(224)

  useEffect(() => {
    if (disableHoverZones) return;

    const handleHover = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const centerStart = window.innerWidth * 0.35;
      const centerEnd = window.innerWidth * 0.65;

      // Ignore top-center zone
      if (y <= 25 && x >= centerStart && x <= centerEnd) {
        setIsHoveredMouse(false);
        return;
      }

      // Trigger sidebar if mouse is at the far left edge
      if (!isLocked && x <= 25) {
        setIsHoveredMouse(true);
      } 
      // Note: We don't force false here because the Sidebar's onMouseLeave will handle it better
    };

    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener('mousemove', handleHover);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleHover);
      window.removeEventListener('resize', handleResize);
    };
  }, [disableHoverZones, isLocked]); 

  return (
    <div className="relative min-h-screen select-none">
      <Navbar pageType='main' />

      <Sidebar
        isLocked={isLocked}
        isHovered={isHoveredMouse} 
        setIsHovered={setIsHoveredMouse}
        setIsLocked={setIsLocked}
        disableHoverZones={disableHoverZones}
        onWidthChange={setSidebarWidth}
      />
<main
  className="transition-all duration-300 pt-5 bg-neutral-100"
  style={{
    marginLeft: isLocked ? sidebarWidth : 0,
    transition: 'margin-left 300ms ease',
  }}
>
  {children}
</main>
    </div>
  );
}