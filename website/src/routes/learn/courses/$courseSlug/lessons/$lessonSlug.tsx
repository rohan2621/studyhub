import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { LessonSidebar } from "@/components/learn/LessonSidebar";

export const Route = createFileRoute("/learn/courses/$courseSlug/lessons/$lessonSlug")({
  component: LessonPage,
});

function LessonPage() {
  const { courseSlug, lessonSlug } = Route.useParams();

  const mockLessons = [
    { id: "1", title: "Introduction to Variables", isCompleted: true, isLocked: false, slug: "intro-variables" },
    { id: "2", title: "Data Types", isCompleted: false, isLocked: false, slug: "data-types" },
    { id: "3", title: "Control Flow", isCompleted: false, isLocked: true, slug: "control-flow" },
    { id: "4", title: "Functions", isCompleted: false, isLocked: true, slug: "functions" },
  ];

  return (
    <AppShell>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-80 shrink-0">
          <Link to={`/learn/courses/${courseSlug}`} className="inline-flex items-center gap-1 text-sm text-[#5a7095] hover:text-[#2f6fed] mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Link>
          <LessonSidebar
            lessons={mockLessons}
            activeLessonSlug={lessonSlug}
            courseSlug={courseSlug}
            progress={25}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
          <div className="glass-card p-8">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0e2a4d] mb-6">
              Data Types in Python
            </h1>
            
            <div className="prose prose-blue max-w-none text-[#0e2a4d] mb-12">
              <p>In programming, data type is an important concept. Variables can store data of different types, and different types can do different things.</p>
              
              <h3>Built-in Data Types</h3>
              <p>Python has the following data types built-in by default, in these categories:</p>
              <ul>
                <li>Text Type: <code>str</code></li>
                <li>Numeric Types: <code>int</code>, <code>float</code>, <code>complex</code></li>
                <li>Sequence Types: <code>list</code>, <code>tuple</code>, <code>range</code></li>
              </ul>

              <div className="bg-[#0e2a4d] text-white p-4 rounded-lg my-6 overflow-x-auto">
                <pre><code>
{`x = 5           # int
y = "Hello"     # str
z = 20.5        # float`}
                </code></pre>
              </div>
            </div>

            <div className="border-t border-[#2f6fed]/15 pt-8 flex justify-between items-center">
              <button className="text-sm font-semibold text-[#5a7095] hover:text-[#0e2a4d]">
                Previous Lesson
              </button>
              <button className="rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Mark as Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
