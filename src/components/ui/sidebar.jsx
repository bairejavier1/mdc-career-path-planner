import React, { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      <div className="flex h-screen">
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

export function Sidebar({ className = "", children }) {
  const { isOpen } = useSidebar();
  return (
    <aside
      className={`transition-all duration-300 ease-in-out ${isOpen ? "w-64" : "w-16"} ${className}`}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function SidebarContent({ children, className = "" }) {
  return <div className={`flex-1 overflow-y-auto ${className}`}>{children}</div>;
}

export function SidebarFooter({ children, className = "" }) {
  return <div className={`p-4 border-t ${className}`}>{children}</div>;
}

export function SidebarGroup({ children, className = "" }) {
  return <div className={`mt-4 space-y-2 ${className}`}>{children}</div>;
}

export function SidebarGroupContent({ children, className = "" }) {
  return (
    <div className={`pl-4 space-y-1 ${className}`}>
      {children}
    </div>
  );
}

export function SidebarMenu({ children, className = "" }) {
  return (
    <nav className={`flex flex-col space-y-1 ${className}`}>
      {children}
    </nav>
  );
}

export function SidebarMenuButton({
  children,
  className = "",
  active = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors ${
        active ? "bg-slate-200 text-slate-900" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}
export function SidebarMenuItem({ children, className = "" }) {
  return (
    <div className={`flex items-center ${className}`}>
      {children}
    </div>
  );
}


export function SidebarTrigger({ className = "" }) {
  const { toggle } = useSidebar();
  return (
    <button
      onClick={toggle}
      className={`absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 transition ${className}`}
      title="Toggle sidebar"
    >
      ☰
    </button>
  );
}
