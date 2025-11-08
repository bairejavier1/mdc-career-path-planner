import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Clock, DollarSign, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function PathwayStep({ phase, index, totalPhases }) {
  const isLast = index === totalPhases - 1;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.6 }}
      className="relative"
    >
      <Card className="overflow-hidden border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <Badge className="mb-2 bg-blue-100 text-blue-900 border-blue-200">
                  Step {index + 1}
                </Badge>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  {phase.degree_name}
                </CardTitle>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Credits</p>
                <p className="text-lg font-bold text-slate-900">
                  {phase.total_credits || phase.remaining_credits || "TBD"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Duration</p>
                <p className="text-lg font-bold text-slate-900">
                  {phase.duration_semesters 
                    ? `${phase.duration_semesters} semesters`
                    : phase.duration_years
                    ? `${phase.duration_years} years`
                    : "TBD"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Est. Cost</p>
                <p className="text-lg font-bold text-slate-900">
                  {phase.total_cost 
                    ? `$${phase.total_cost.toLocaleString()}`
                    : phase.funding_available
                    ? "Funded"
                    : "TBD"}
                </p>
              </div>
            </div>
          </div>

          {phase.courses && phase.courses.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Required Courses
              </h4>
              <div className="grid gap-2">
                {phase.courses.slice(0, 5).map((course, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{course.code}</p>
                      <p className="text-sm text-slate-600">{course.name}</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {course.credits} credits
                    </Badge>
                  </div>
                ))}
                {phase.courses.length > 5 && (
                  <p className="text-sm text-slate-500 italic pl-3">
                    + {phase.courses.length - 5} more courses
                  </p>
                )}
              </div>
            </div>
          )}

          {phase.required_courses && phase.required_courses.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                FIU Requirements
              </h4>
              <div className="grid gap-2">
                {phase.required_courses.slice(0, 5).map((course, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{course.code}</p>
                      <p className="text-sm text-slate-600">{course.name}</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {course.credits} credits
                    </Badge>
                  </div>
                ))}
                {phase.required_courses.length > 5 && (
                  <p className="text-sm text-slate-500 italic pl-3">
                    + {phase.required_courses.length - 5} more courses
                  </p>
                )}
              </div>
              {phase.transfer_credits && (
                <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">{phase.transfer_credits} credits</span> will transfer from MDC
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {!isLast && (
        <div className="flex justify-center py-6">
          <div className="w-0.5 h-12 bg-gradient-to-b from-blue-400 to-transparent" />
        </div>
      )}
    </motion.div>
  );
}