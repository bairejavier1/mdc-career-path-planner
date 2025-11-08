import React from "react";
export function Badge({ children, className = "", variant = "default" }) {
  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${className}`}
    >
      {children}
    </span>
  );
}
