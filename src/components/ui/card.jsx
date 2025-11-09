import React from "react";
export function Card({ children, className = "" }) {
  return <div className={`rounded-2xl bg-white ${className}`}>{children}</div>;
}
export function CardContent({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
export function CardHeader({ children, className = "" }) {
  return <div className={`p-4 border-b ${className}`}>{children}</div>;
}
export function CardTitle({ children, className = "" }) {
  return <h3 className={`text-xl font-bold ${className}`}>{children}</h3>;
}
