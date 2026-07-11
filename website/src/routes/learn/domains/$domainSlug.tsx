import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CourseCard } from "@/components/learn/CourseCard";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/learn/domains/$domainSlug")({
  component: DomainPage,
});

function DomainPage() {
  const { domainSlug } = Route.useParams();
  
  const domainName = domainSlug.charAt(0).toUpperCase() + domainSlug.slice(1).replace("-", " ");

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <Link to="/learn" className="inline-flex items-center gap-1 text-sm text-[#5a7095] hover:text-[#2f6fed] mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Hub
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#2f6fed] to-[#5b8def] flex items-center justify-center text-3xl shadow-lg">
              💻
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0e2a4d]">
                {domainName}
              </h1>
              <p className="mt-1 text-sm text-[#5a7095]">
                Explore all courses in this domain. Build your skills from beginner to expert.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#0e2a4d] mb-4">Available Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CourseCard
              title="Python Programming for Beginners"
              slug="python-beginners"
              difficulty="Beginner"
              duration="5 hours"
              progress={40}
              isEnrolled={true}
            />
            <CourseCard
              title="Advanced Data Structures"
              slug="advanced-data-structures"
              difficulty="Advanced"
              duration="10 hours"
              progress={0}
              isEnrolled={false}
            />
            <CourseCard
              title="Web Development Bootcamp"
              slug="web-dev-bootcamp"
              difficulty="Intermediate"
              duration="20 hours"
              progress={0}
              isEnrolled={false}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
