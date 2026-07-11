import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Award, Flame, Target } from "lucide-react";
import { XpBar } from "@/components/learn/XpBar";
import { AchievementBadge } from "@/components/learn/AchievementBadge";
import { CourseCard } from "@/components/learn/CourseCard";

export const Route = createFileRoute("/learn/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  const achievements = [
    { id: "1", title: "First Step", emoji: "👶", isEarned: true },
    { id: "2", title: "Quiz Master", emoji: "👑", isEarned: false },
    { id: "3", title: "Week Warrior", emoji: "⚔️", isEarned: true },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0e2a4d] flex items-center gap-2">
              <Target className="h-8 w-8 text-[#2f6fed]" />
              My Progress
            </h1>
            <p className="mt-1 text-sm text-[#5a7095]">
              Track your learning journey and view your achievements.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
            <div className="mb-4">
              <Flame className="h-12 w-12 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-[#0e2a4d]">7 Days</h3>
            <p className="text-sm text-[#5a7095]">Current Streak</p>
          </div>
          <div className="glass-card p-6 md:col-span-2 flex flex-col justify-center">
            <h3 className="font-bold text-[#0e2a4d] mb-4">Level 3: Learner</h3>
            <XpBar currentXp={250} nextLevelXp={500} level={3} levelName="Learner" />
            <p className="text-xs text-[#5a7095] mt-4">250 XP to Level 4</p>
          </div>
        </div>

        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0e2a4d] mb-4">Enrolled Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0e2a4d]">Recent Achievements</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            {achievements.map((ach) => (
              <AchievementBadge
                key={ach.id}
                title={ach.title}
                emoji={ach.emoji}
                isEarned={ach.isEarned}
              />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
