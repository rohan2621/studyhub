import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Bot, Sparkles } from "lucide-react";
import { AiStatusBadge } from "@/components/learn/AiStatusBadge";

export const Route = createFileRoute("/learn/ai-tutor")({
  component: AiTutorPage,
});

function AiTutorPage() {
  const isAiAvailable = false; // Graceful placeholder

  return (
    <AppShell>
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center shadow-lg">
            <Bot className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0e2a4d] flex items-center gap-2">
            AI Tutor
            <AiStatusBadge isAvailable={isAiAvailable} />
          </h1>
          
          {!isAiAvailable ? (
            <div className="glass-card p-8 mt-6">
              <Sparkles className="h-8 w-8 text-[#8b5cf6] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#0e2a4d] mb-2">Coming Soon!</h2>
              <p className="text-[#5a7095] mb-6">
                Your personalized AI tutor is currently resting. Check back later for instant concept explanations, custom quizzes, and personalized learning roadmaps.
              </p>
            </div>
          ) : (
            <div className="glass-card p-8 mt-6 w-full text-left flex flex-col h-[500px]">
              <div className="flex-1 overflow-y-auto mb-4 border border-[#2f6fed]/10 rounded-xl p-4 bg-white/50">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#8b5cf6] flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white border border-[#2f6fed]/15 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-[#0e2a4d]">
                    Hello! I'm your AI tutor. What would you like to learn about today?
                  </div>
                </div>
              </div>
              <form className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask me to explain a concept..."
                  className="flex-1 rounded-xl border border-[#2f6fed]/15 bg-white py-2.5 px-4 text-sm outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/15"
                />
                <button type="submit" className="rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white">
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
