"use client"

import { useState, useEffect, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

type LayoutProps = {
  disableHoverZones?: boolean;
  children: ReactNode;
};

const DEFAULT_SIDEBAR_WIDTH = 224;

export default function Layout({ disableHoverZones = false, children }: LayoutProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [isHoveredMouse, setIsHoveredMouse] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (disableHoverZones) return;

    const handleHover = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const centerStart = window.innerWidth * 0.35;
      const centerEnd = window.innerWidth * 0.65;

      if (y <= 25 && x >= centerStart && x <= centerEnd) {
        setIsHoveredMouse(false);
        return;
      }

      if (!isLocked && x <= 25) {
        setIsHoveredMouse(true);
      }
    };

    window.addEventListener('mousemove', handleHover);
    return () => window.removeEventListener('mousemove', handleHover);
  }, [disableHoverZones, isLocked]);

  const marginLeft = isMobile ? 0 : (isLocked
    ? sidebarWidth
    : isHoveredMouse
    ? DEFAULT_SIDEBAR_WIDTH
    : 0);

  return (
    <div className="min-h-screen bg-neutral-100 select-none">
      {isMobile ? (
        <Sidebar
          isLocked={true}
          isHovered={false}
          setIsHovered={() => {}}
          setIsLocked={() => {}}
          disableHoverZones={true}
          onWidthChange={() => {}}
          isMobile={true}
        />
      ) : (
        <Navbar pageType='main' />
      )}

      {!isMobile && (
        <Sidebar
          isLocked={isLocked}
          isHovered={isHoveredMouse}
          setIsHovered={setIsHoveredMouse}
          setIsLocked={setIsLocked}
          disableHoverZones={disableHoverZones}
          onWidthChange={setSidebarWidth}
          isMobile={false}
        />
      )}

      <main
        style={{
          marginLeft,
          transition: 'margin-left 300ms ease',
        }}
      >
        {children}
      </main>
    </div>
  );
}