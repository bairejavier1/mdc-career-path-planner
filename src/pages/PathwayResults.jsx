import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { invokeLLM } from "@/api/geminiClient";
import * as store from "@/api/localPathwayStore";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Share2, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import PathwayStep from "../components/pathway/PathwayStep";
import SummaryCard from "../components/pathway/SummaryCard";
import ChatMessage from "../components/chat/ChatMessage";
import ChatInput from "../components/chat/ChatInput";

const AVAILABLE_COLLEGES = {
  twoYear: [
    "Miami Dade College (MDC)", "Broward College", "Palm Beach State College",
    "Valencia College", "Seminole State College", "St. Petersburg College",
    "Hillsborough Community College", "Santa Fe College",
    "Tallahassee Community College", "State College of Florida"
  ],
  fourYear: [
    "Florida International University (FIU)", "University of Florida (UF)",
    "Florida State University (FSU)", "University of Central Florida (UCF)",
    "University of South Florida (USF)", "Florida Atlantic University (FAU)",
    "University of Miami (UM)", "University of North Florida (UNF)",
    "Florida Gulf Coast University (FGCU)", "Florida A&M University (FAMU)"
  ]
};

export default function PathwayResults() {
  const navigate = useNavigate();
  const [pathway, setPathway] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [pathway?.conversation]);

  useEffect(() => {
    const loadPathway = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const pathwayId = urlParams.get("id");

      if (!pathwayId) {
        navigate(createPageUrl("Home"));
        return;
      }

      try {
        const pathways = await store.filterPathways({ id: pathwayId });
        if (pathways.length > 0) {
          setPathway(pathways[0]);
        } else {
          navigate(createPageUrl("Home"));
        }
      } catch (error) {
        console.error("Error loading pathway:", error);
        navigate(createPageUrl("Home"));
      } finally {
        setLoading(false);
      }
    };

    loadPathway();
  }, [navigate]);

  const handleSendMessage = async (userMessage) => {
    if (!pathway) return;

    const newConversation = [
      ...(pathway.conversation || []),
      {
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString()
      }
    ];

    setPathway({ ...pathway, conversation: newConversation });
    setIsProcessing(true);

    try {
      // Extract updated information
      const extractionPrompt = `You are an academic advisor assistant. The user wants to UPDATE their existing educational pathway. Analyze the conversation and extract any NEW or CHANGED information.

Current pathway information:
- Career: ${pathway.career_goal || 'Not set'}
- Current Education: ${pathway.current_education || 'Not set'}
- Target Education: ${pathway.target_education || 'Not set'}
- 2-Year College: ${pathway.two_year_college || 'Not set'}
- 4-Year College: ${pathway.four_year_college || 'Not set'}

Full conversation history:
${newConversation.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Extract ONLY the fields the user wants to CHANGE. If they mention keeping something the same or don't mention a field, do NOT include it.

Available Florida 2-year colleges: ${AVAILABLE_COLLEGES.twoYear.join(', ')}
Available Florida 4-year universities: ${AVAILABLE_COLLEGES.fourYear.join(', ')}

Return only the fields that should be UPDATED.`;

      const extractedChanges = await await invokeLLM({
        prompt: extractionPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            career_goal: { type: "string" },
            current_education: { type: "string" },
            target_education: { type: "string" },
            two_year_college: { type: "string" },
            four_year_college: { type: "string" }
          }
        }
      });

      // Merge changes with existing info
      const updatedInfo = { ...pathway, ...extractedChanges };
      const hasChanges = Object.keys(extractedChanges).length > 0;

      let assistantResponse;
      let shouldRegeneratePathway = false;

      if (hasChanges) {
        // Generate confirmation message
        const changedFields = Object.entries(extractedChanges)
          .map(([key, value]) => {
            const fieldNames = {
              career_goal: "career goal",
              current_education: "current education",
              target_education: "target education",
              two_year_college: "2-year college",
              four_year_college: "4-year university"
            };
            return `- ${fieldNames[key]}: **${value}**`;
          })
          .join('\n');

        assistantResponse = `Great! I've updated your pathway with the following changes:\n\n${changedFields}\n\nLet me regenerate your personalized pathway with these updates...`;
        shouldRegeneratePathway = true;
      } else {
        // No changes detected - respond conversationally
        const responsePrompt = `You are a friendly academic advisor. The user sent a message about their educational pathway but didn't request any changes.

Current pathway:
- Career: ${pathway.career_goal}
- Current Education: ${pathway.current_education}
- Target Education: ${pathway.target_education}
- Colleges: ${pathway.two_year_college || 'N/A'}, ${pathway.four_year_college || 'N/A'}

User's message: "${userMessage}"

Respond naturally. Answer any questions they have or provide encouragement. If they seem unsure about what they can change, let them know they can update their career goal, education levels, or college choices anytime.`;

        assistantResponse = await await invokeLLM({
          prompt: responsePrompt
        });
      }

      const updatedConversation = [
        ...newConversation,
        {
          role: "assistant",
          content: assistantResponse,
          timestamp: new Date().toISOString()
        }
      ];

      if (shouldRegeneratePathway) {
        // Regenerate pathway with updated info
        await regeneratePathway(updatedInfo, updatedConversation);
      } else {
        // Just update conversation
        await store.updatePathway(pathway.id, {
          conversation: updatedConversation
        });
        setPathway({ ...pathway, conversation: updatedConversation });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorConversation = [
        ...newConversation,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
          timestamp: new Date().toISOString()
        }
      ];
      setPathway({ ...pathway, conversation: errorConversation });
      setIsProcessing(false);
    }
  };

  const regeneratePathway = async (info, conversationHistory) => {
    try {
      const educationLevels = {
        "High School Diploma/GED": 1,
        "Some College Credits": 2,
        "Associate Degree": 3,
        "Bachelor's Degree": 4,
        "Master's Degree": 5
      };

      const currentOrder = educationLevels[info.current_education];
      const targetOrder = educationLevels[info.target_education];

      let prompt = `You are an academic pathway advisor for Florida colleges. Create a detailed educational pathway for someone who wants to become a ${info.career_goal}.

Current education level: ${info.current_education}
Target education level: ${info.target_education}
`;

      if (info.two_year_college) {
        prompt += `2-year college: ${info.two_year_college}\n`;
      }
      if (info.four_year_college) {
        prompt += `4-year college: ${info.four_year_college}\n`;
      }

      prompt += `\nIMPORTANT: The user ALREADY HAS "${info.current_education}". DO NOT include this degree in the pathway. Start from the NEXT degree level they need to achieve "${info.target_education}".

Generate ONLY the educational steps needed between their current level and target level with actual courses from the specified colleges.`;

      if (currentOrder < 3 && targetOrder >= 3) {
        prompt += `\n\nAssociate's Degree phase at ${info.two_year_college}: Include 5-8 actual courses, duration, cost (~$3,000-4,000/year), and total credits (60).`;
      }

      if (currentOrder < 4 && targetOrder >= 4) {
        prompt += `\n\nBachelor's Degree phase at ${info.four_year_college}: Include 5-8 actual courses, transfer credits, duration, cost, and remaining credits.`;
      }

      if (currentOrder < 5 && targetOrder >= 5) {
        prompt += `\n\nMaster's Degree phase at ${info.four_year_college}: Include duration (years), cost, and credits.`;
      }

      prompt += `\n\nAlso provide total time, total cost, and career outlook for ${info.career_goal}.`;

      const pathwayData = await await invokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            mdc_phase: {
              type: "object",
              properties: {
                degree_name: { type: "string" },
                courses: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      code: { type: "string" },
                      name: { type: "string" },
                      credits: { type: "number" }
                    }
                  }
                },
                duration_semesters: { type: "number" },
                total_cost: { type: "number" },
                total_credits: { type: "number" }
              }
            },
            fiu_phase: {
              type: "object",
              properties: {
                degree_name: { type: "string" },
                transfer_credits: { type: "number" },
                required_courses: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      code: { type: "string" },
                      name: { type: "string" },
                      credits: { type: "number" }
                    }
                  }
                },
                duration_semesters: { type: "number" },
                total_cost: { type: "number" },
                remaining_credits: { type: "number" }
              }
            },
            advanced_phase: {
              type: "object",
              properties: {
                masters: {
                  type: "object",
                  properties: {
                    degree_name: { type: "string" },
                    duration_years: { type: "number" },
                    total_cost: { type: "number" },
                    total_credits: { type: "number" }
                  }
                }
              }
            },
            total_summary: {
              type: "object",
              properties: {
                total_years: { type: "number" },
                total_cost: { type: "number" },
                career_outlook: { type: "string" }
              }
            }
          }
        }
      });

      // Update the pathway
      await store.updatePathway(pathway.id, {
        career_goal: info.career_goal,
        current_education: info.current_education,
        target_education: info.target_education,
        two_year_college: info.two_year_college,
        four_year_college: info.four_year_college,
        conversation: conversationHistory,
        pathway_data: pathwayData
      });

      // Reload the page to show updated pathway
      window.location.reload();
    } catch (error) {
      console.error("Error regenerating pathway:", error);
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your pathway...</p>
        </div>
      </div>
    );
  }

  if (!pathway) {
    return null;
  }

  const data = pathway.pathway_data || {};
  const phases = [];

  if (data.mdc_phase && data.mdc_phase.degree_name) phases.push(data.mdc_phase);
  if (data.fiu_phase && data.fiu_phase.degree_name) phases.push(data.fiu_phase);
  if (data.advanced_phase) {
    if (data.advanced_phase.masters && data.advanced_phase.masters.degree_name) {
      phases.push(data.advanced_phase.masters);
    }
    if (data.advanced_phase.phd && data.advanced_phase.phd.degree_name) {
      phases.push(data.advanced_phase.phd);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Button
                variant="ghost"
                onClick={() => navigate(createPageUrl("Home"))}
                className="mb-6 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>

              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
                    {pathway.career_goal ? `Your Pathway to ${pathway.career_goal}` : 'Your Academic Pathway'}
                  </h1>
                  {pathway.current_education && pathway.target_education && (
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-900 border-blue-200 px-3 py-1">
                        From: {pathway.current_education}
                      </Badge>
                      <span className="text-slate-400">→</span>
                      <Badge variant="outline" className="bg-green-50 text-green-900 border-green-200 px-3 py-1">
                        To: {pathway.target_education}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChat(!showChat)}
                    className="gap-2 lg:hidden"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {showChat ? 'Hide Chat' : 'Update Pathway'}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>
            </motion.div>

            <div className="space-y-8">
              {phases.length > 0 ? (
                <>
                  {phases.map((phase, index) => (
                    <PathwayStep
                      key={index}
                      phase={phase}
                      index={index}
                      totalPhases={phases.length}
                    />
                  ))}

                  {data.total_summary && (
                    <SummaryCard summary={data.total_summary} />
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-slate-600">
                      Start chatting to generate your pathway!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className={`lg:block ${showChat ? 'block' : 'hidden'}`}>
            <div className="sticky top-6">
              <Card className="border-slate-200 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">Update Your Pathway</h3>
                  </div>

                  <div className="h-[600px] flex flex-col">
                    <div className="flex-1 overflow-y-auto mb-4 space-y-2 pr-2">
                      {(pathway.conversation || []).map((message, index) => (
                        <ChatMessage key={index} message={message} />
                      ))}
                      {isProcessing && (
                        <div className="flex gap-2 mb-4">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center flex-shrink-0">
                            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                          </div>
                          <div className="bg-white border border-slate-200 rounded-2xl px-3 py-2">
                            <p className="text-sm text-slate-600">Updating...</p>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-slate-200 pt-3">
                      <ChatInput
                        onSend={handleSendMessage}
                        disabled={isProcessing}
                        placeholder="Ask to change anything..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}