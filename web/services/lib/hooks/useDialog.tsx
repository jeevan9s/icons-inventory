"use client"

import { useState, ComponentType, useCallback } from "react";

// generic hook to render a dialog component
export function useDialog<T extends { isOpen: boolean; onClose: () => void }>(
  Component: ComponentType<T>
) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const Dialog = useCallback(
    (props: Omit<T, "isOpen" | "onClose">) =>
      <Component 
        {...(props as T)} 
        isOpen={isOpen} 
        onClose={close} 
      />,
    [Component, isOpen, close]
  );

  return { Dialog, open, close, isOpen };
}