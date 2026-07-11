import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import { FlipCard } from "@/components/learn/FlipCard";

export const Route = createFileRoute("/learn/courses/$courseSlug/flashcards")({
  component: FlashcardsPage,
});

function FlashcardsPage() {
  const { courseSlug } = Route.useParams();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center">
        <div className="w-full">
          <Link to={`/learn/courses/${courseSlug}`} className="inline-flex items-center gap-1 text-sm text-[#5a7095] hover:text-[#2f6fed] mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Link>
          <div className="flex justify-between items-center w-full">
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0e2a4d]">
              Flashcards Practice
            </h1>
            <span className="text-sm font-semibold text-[#5a7095]">Card 1 of 10</span>
          </div>
        </div>

        <div className="w-full max-w-2xl aspect-[3/2] my-8 relative perspective-1000">
          <FlipCard
            front="What is the built-in function to print something to the console in Python?"
            back="print()"
          />
        </div>

        <div className="flex gap-4 w-full max-w-sm">
          <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 py-3 font-semibold text-red-600 hover:bg-red-100 transition-colors">
            <RotateCcw className="h-5 w-5" />
            Review Again
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 py-3 font-semibold text-emerald-600 hover:bg-emerald-100 transition-colors">
            <Check className="h-5 w-5" />
            Got It
          </button>
        </div>
      </div>
    </AppShell>
  );
}
