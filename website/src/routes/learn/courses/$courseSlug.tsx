import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft, BookOpen, Clock, Users, CheckCircle2, Lock } from "lucide-react";

export const Route = createFileRoute("/learn/courses/$courseSlug")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { courseSlug } = Route.useParams();
  
  const isEnrolled = true;
  const progress = 40;

  const lessons = [
    { id: "1", title: "Introduction to Variables", isCompleted: true, isLocked: false, slug: "intro-variables" },
    { id: "2", title: "Data Types", isCompleted: false, isLocked: false, slug: "data-types" },
    { id: "3", title: "Control Flow", isCompleted: false, isLocked: true, slug: "control-flow" },
    { id: "4", title: "Functions", isCompleted: false, isLocked: true, slug: "functions" },
  ];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Link to="/learn" className="inline-flex items-center gap-1 text-sm text-[#5a7095] hover:text-[#2f6fed] mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Hub
          </Link>
          <div className="glass-card p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-4">
                  Beginner
                </div>
                <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0e2a4d] mb-4">
                  Python Programming for Beginners
                </h1>
                <p className="text-[#5a7095] mb-6 line-clamp-3">
                  Master the basics of Python. Learn about variables, data structures, and control flow to start building your own applications from scratch. No prior coding experience required.
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-[#5a7095] mb-8">
                  <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> 5 hours</div>
                  <div className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> 12 Lessons</div>
                  <div className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 1,234 Enrolled</div>
                </div>
                
                {isEnrolled ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-[#0e2a4d]">Progress</span>
                      <span className="text-[#2f6fed]">{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full bg-[#2f6fed] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <Link to={`/learn/courses/${courseSlug}/lessons/data-types`} className="mt-4 inline-block w-full md:w-auto text-center rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl">
                      Continue Learning
                    </Link>
                  </div>
                ) : (
                  <button className="w-full md:w-auto rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl">
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0e2a4d]">Course Syllabus</h2>
            <div className="space-y-3">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className={`glass-card p-4 flex items-center justify-between ${lesson.isLocked ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f6fed]/10 text-sm font-bold text-[#2f6fed]">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0e2a4d]">{lesson.title}</h3>
                      <p className="text-xs text-[#5a7095]">Lesson · 15 mins</p>
                    </div>
                  </div>
                  <div>
                    {lesson.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : lesson.isLocked ? (
                      <Lock className="h-4 w-4 text-[#5a7095]" />
                    ) : (
                      <Link to={`/learn/courses/${courseSlug}/lessons/${lesson.slug}`} className="text-sm font-semibold text-[#2f6fed] hover:underline">
                        Start
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="glass-card p-4 flex items-center justify-between border-l-4 border-l-[#f5b843]">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5b843]/10 text-sm font-bold text-[#f5b843]">
                    Q
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0e2a4d]">Course Final Quiz</h3>
                    <p className="text-xs text-[#5a7095]">Assessment</p>
                  </div>
                </div>
                <Link to={`/learn/courses/${courseSlug}/quiz`} className="text-sm font-semibold text-[#2f6fed] hover:underline">
                  Take Quiz
                </Link>
              </div>

              <div className="glass-card p-4 flex items-center justify-between border-l-4 border-l-[#8b5cf6]">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8b5cf6]/10 text-sm font-bold text-[#8b5cf6]">
                    F
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0e2a4d]">Flashcards Practice</h3>
                    <p className="text-xs text-[#5a7095]">Review & Memorize</p>
                  </div>
                </div>
                <Link to={`/learn/courses/${courseSlug}/flashcards`} className="text-sm font-semibold text-[#2f6fed] hover:underline">
                  Practice
                </Link>
              </div>

            </div>
          </div>
          
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0e2a4d] mb-4">Prerequisites</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-[#5a7095]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  Basic computer literacy
                </li>
                <li className="flex items-start gap-2 text-sm text-[#5a7095]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  Enthusiasm to learn!
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
