import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Search, Brain, Compass, Sparkles } from "lucide-react";
import { DomainCard } from "@/components/learn/DomainCard";
import { CourseCard } from "@/components/learn/CourseCard";
import { RecommendationCard } from "@/components/learn/RecommendationCard";
import { XpBar } from "@/components/learn/XpBar";

export const Route = createFileRoute("/learn/")({
  component: LearnIndexPage,
});

function LearnIndexPage() {
  // Mock data for UI
  const domains = [
    { id: "1", slug: "technology", name: "Technology", description: "Coding, AI, and more.", iconEmoji: "💻", courseCount: 12 },
    { id: "2", slug: "mathematics", name: "Mathematics", description: "Numbers and logic.", iconEmoji: "🔢", courseCount: 8 },
    { id: "3", slug: "science", name: "Science", description: "Biology, Chemistry, Physics.", iconEmoji: "🔬", courseCount: 15 },
    { id: "4", slug: "language-arts", name: "Language Arts", description: "Writing and literature.", iconEmoji: "📚", courseCount: 6 },
    { id: "5", slug: "life-skills", name: "Life Skills", description: "Finance, cooking, etc.", iconEmoji: "🌱", courseCount: 10 },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0e2a4d] flex items-center gap-2">
              <Brain className="h-8 w-8 text-[#2f6fed]" />
              Learning Hub
            </h1>
            <p className="mt-1 text-sm text-[#5a7095]">
              Explore courses, master new skills, and level up your knowledge.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <XpBar currentXp={250} nextLevelXp={500} level={3} levelName="Learner" />
            <form className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5a7095]" />
              <input
                type="text"
                placeholder="What do you want to learn?"
                className="w-full rounded-xl border border-[#2f6fed]/15 bg-white/60 py-2.5 pl-9 pr-4 text-sm text-[#0e2a4d] placeholder:text-[#5a7095]/50 outline-none ring-[#2f6fed] transition-all focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/15"
              />
            </form>
          </div>
        </div>

        {/* Continue Learning */}
        <div className="glass-card p-6 border-l-4 border-l-[#f5b843]">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="h-5 w-5 text-[#f5b843]" />
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0e2a4d]">Continue Learning</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CourseCard
              title="Python Programming for Beginners"
              slug="python-beginners"
              difficulty="Beginner"
              duration="5 hours"
              progress={40}
              isEnrolled={true}
            />
          </div>
        </div>

        {/* Domains Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-[#8b5cf6]" />
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0e2a4d]">Explore Domains</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {domains.map(domain => (
              <DomainCard
                key={domain.id}
                name={domain.name}
                slug={domain.slug}
                emoji={domain.iconEmoji}
                courseCount={domain.courseCount}
              />
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0e2a4d] mb-4">Recommended for you</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RecommendationCard
              title="Review Python Variables"
              reason="You struggled with this in your last quiz."
              actionText="Review Lesson"
              actionUrl="/learn/courses/python-beginners/lessons/variables"
              type="revise"
            />
            <RecommendationCard
              title="Start Data Structures"
              reason="Next up in your Python journey."
              actionText="Start Lesson"
              actionUrl="/learn/courses/python-beginners/lessons/data-structures"
              type="next"
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
