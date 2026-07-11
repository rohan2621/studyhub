import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Trophy } from "lucide-react";
import { AchievementBadge } from "@/components/learn/AchievementBadge";

export const Route = createFileRoute("/learn/achievements")({
  component: AchievementsPage,
});

function AchievementsPage() {
  const achievements = [
    { id: "1", title: "First Step", description: "Complete your first lesson.", emoji: "👶", isEarned: true },
    { id: "2", title: "Quiz Master", description: "Score 100% on any quiz.", emoji: "👑", isEarned: false },
    { id: "3", title: "Week Warrior", description: "Maintain a 7-day streak.", emoji: "⚔️", isEarned: true },
    { id: "4", title: "Course Finisher", description: "Complete a full course.", emoji: "🎓", isEarned: false },
    { id: "5", title: "Flashcard Master", description: "Master a full flashcard deck.", emoji: "🧠", isEarned: false },
    { id: "6", title: "Deep Diver", description: "Complete 5 lessons in one day.", emoji: "🤿", isEarned: false },
    { id: "7", title: "Domain Explorer", description: "Enroll in 3 different domains.", emoji: "🗺️", isEarned: true },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0e2a4d] flex items-center gap-2">
              <Trophy className="h-8 w-8 text-[#f5b843]" />
              Achievements
            </h1>
            <p className="mt-1 text-sm text-[#5a7095]">
              View all your unlocked and locked achievements.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {achievements.map((ach) => (
            <div key={ach.id} className="flex flex-col items-center">
              <AchievementBadge
                title={ach.title}
                emoji={ach.emoji}
                isEarned={ach.isEarned}
              />
              <p className="text-center text-xs text-[#5a7095] mt-2 px-2">
                {ach.isEarned ? ach.description : "Keep learning to unlock."}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
