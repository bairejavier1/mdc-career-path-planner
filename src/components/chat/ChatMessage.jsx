import React from "react";
import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-amber-400" />
        </div>
      )}
      
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white"
            : "bg-white border border-slate-200 text-slate-900"
        }`}
      >
        <div className="prose prose-sm max-w-none">
          {isUser ? (
            <p className="text-white mb-0">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="mb-2 pl-4">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 pl-4">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-amber-900" />
        </div>
      )}
    </motion.div>
  );
}