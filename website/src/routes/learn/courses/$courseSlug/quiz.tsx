import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft } from "lucide-react";
import { QuizQuestion } from "@/components/learn/QuizQuestion";

export const Route = createFileRoute("/learn/courses/$courseSlug/quiz")({
  component: QuizPage,
});

function QuizPage() {
  const { courseSlug } = Route.useParams();

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <Link to={`/learn/courses/${courseSlug}`} className="inline-flex items-center gap-1 text-sm text-[#5a7095] hover:text-[#2f6fed]">
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>
        
        <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0e2a4d]">
              Course Quiz
            </h1>
            <span className="text-sm font-semibold text-[#5a7095]">Question 1 of 5</span>
          </div>

          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden mb-8">
            <div className="h-full bg-[#2f6fed] rounded-full transition-all duration-300" style={{ width: "20%" }} />
          </div>

          <QuizQuestion
            question="Which of the following is a valid variable name in Python?"
            options={[
              "1myvar",
              "my_var",
              "my-var",
              "my var"
            ]}
            onAnswer={(index) => {
              console.log("Answered:", index);
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
