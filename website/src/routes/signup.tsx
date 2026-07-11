import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, BookOpen } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { School } from "@/lib/api-types";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — StudyHub" },
      { name: "description", content: "Create your free StudyHub student account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  useEffect(() => {
    api.get("/schools")
      .then(res => setSchools(res.data))
      .catch(err => console.error("Failed to load schools", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.post("/auth/signup", {
        name,
        email,
        password,
        schoolId,
        grade: String(grade),
        section
      });
      setIsLoading(false);
      setShowIntro(true);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.error || err.response?.data?.message || "Signup failed");
    }
  };

  const handleCloseIntro = () => {
    setShowIntro(false);
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 font-[family-name:var(--font-sans)] text-black">
      <div className="w-full max-w-md">
        <div className="border border-black bg-white p-8">
          <div className="mb-6 flex items-center justify-center">
            <img src="/logo.png?v=12" alt="StudyHub" width="61" height="61" loading="eager" className="h-[61px] w-[61px] dark:invert" />
          </div>

          <h1 className="mb-1 text-center font-[family-name:var(--font-heading)] text-2xl font-extrabold">
            Create your account
          </h1>
          <p className="mb-6 text-center text-sm text-gray-500">
            Free for all students. Unlock full access with a token.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">Full name</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                className="w-full saas-input"
                aria-invalid={!!error}
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full saas-input"
                aria-invalid={!!error}
              />
            </div>

            <div>
              <label htmlFor="schoolId" className="mb-1.5 block text-sm font-semibold">School</label>
              <select
                id="schoolId"
                required
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="w-full saas-input"
                aria-invalid={!!error}
              >
                <option value="">Select your school</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="grade" className="mb-1.5 block text-sm font-semibold">Grade</label>
              <select
                id="grade"
                required
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full saas-input"
                aria-invalid={!!error}
              >
                <option value="">Select grade</option>
                {[8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="section" className="mb-1.5 block text-sm font-semibold">Section</label>
              <select
                id="section"
                required
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full saas-input"
                aria-invalid={!!error}
              >
                <option value="">Select section</option>
                {['A', 'B', 'C', 'D', 'E', 'F'].map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Account type
              </label>
              <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500">
                <span className="font-semibold text-black">Student</span>
                <span className="text-xs">(fixed — teachers are added by admin)</span>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full saas-input pr-10"
                  aria-invalid={!!error}
                  aria-describedby={error ? "signup-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 rounded"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {error && <p id="signup-error" role="alert" className="text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="saas-button w-full py-3 disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-medium text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-black underline hover:text-gray-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm border border-black bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-black bg-gray-50 text-black">
              <Check className="h-6 w-6" />
            </div>
            <h2 className="mb-2 font-[family-name:var(--font-heading)] text-xl font-extrabold">
              Account created!
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Welcome to StudyHub. Browse free previews of notes, homework, and past papers.
            </p>
            <p className="mb-6 text-sm text-gray-600">
              To unlock full access — downloading notes, submitting homework, viewing past papers — contact us on{" "}
              <a href="https://wa.me/9801829630" target="_blank" rel="noopener noreferrer" className="font-bold text-black underline hover:text-gray-600">WhatsApp</a>{" "}
              or{" "}
              <a href="https://www.instagram.com/general.nless/?hl=en" target="_blank" rel="noopener noreferrer" className="font-bold text-black underline hover:text-gray-600">Instagram</a>{" "}
              to choose a plan and receive your access token.
            </p>
            <button
              onClick={handleCloseIntro}
              className="saas-button w-full"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}







