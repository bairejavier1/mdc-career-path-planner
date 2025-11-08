import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, DollarSign, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function SummaryCard({ summary }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      <Card className="overflow-hidden border-amber-200 shadow-xl bg-gradient-to-br from-amber-50 to-white">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-amber-600" />
        
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Your Complete Journey
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Time</p>
                <p className="text-2xl font-bold text-slate-900">
                  {summary.total_years} years
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Investment</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${summary.total_cost?.toLocaleString() || "TBD"}
                </p>
              </div>
            </div>
          </div>

          {summary.career_outlook && (
            <div className="p-5 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Career Outlook</h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {summary.career_outlook}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}