import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — StudyHub" },
      { name: "description", content: "Sign in to your StudyHub account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken, setAccessToken, setRefreshToken } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user: backendUser } = res.data;


      // Store user and access token in auth store
      setAccessToken(accessToken);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      // Map user role properly
      const mappedRole = backendUser.role.toLowerCase() as "admin" | "teacher" | "student";

      const mappedUser = {
        id: backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        role: mappedRole,
        school_id: backendUser.schoolId,
        grade: parseInt(backendUser.grade) || 0,
        created_at: new Date().toISOString()
      };

      setUser(mappedUser);


      // If user is a student, fetch their active token info
      if (mappedRole === "student") {
        try {
          const tokenRes = await api.get("/tokens/me", {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          if (tokenRes.data.hasActiveToken) {
            setToken({
              id: tokenRes.data.id,
              code: tokenRes.data.code,
              user_id: backendUser.id,
              plan: tokenRes.data.plan.toLowerCase() as any,
              issued_at: new Date().toISOString(),
              expires_at: tokenRes.data.expiresAt,
              status: "active",
              device_id: tokenRes.data.deviceBound ? "bound" : null,
              is_device_permanent: tokenRes.data.isDevicePermanent,
              can_bind_permanent: tokenRes.data.canBindPermanent
            });
          } else {
            setToken(null);
          }
        } catch {
          setToken(null);
        }
      } else {
        setToken(null);
      }

      setIsLoading(false);

      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setIsLoading(false);


      setError(err.response?.data?.error || err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 font-[family-name:var(--font-sans)] text-black">
      <div className="w-full max-w-md">
        <div className="border border-black bg-white p-8">
          <div className="mb-6 flex items-center justify-center">
            <img src="/logo.png?v=12" alt="StudyHub" width="61" height="61" loading="eager" className="h-[61px] w-[61px] dark:invert" />
          </div>

          <h1 className="mb-1 text-center font-[family-name:var(--font-heading)] text-2xl font-extrabold">
            Welcome back
          </h1>
          <p className="mb-6 text-center text-sm text-gray-500">
            Sign in to access your study materials
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
                School email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full saas-input"
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full saas-input pr-10"
                  aria-invalid={!!error}
                  aria-describedby={error ? "login-error" : undefined}
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

            {error && <p id="login-error" role="alert" className="text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="saas-button w-full py-3 disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-medium text-gray-500">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-bold text-black underline hover:text-gray-600">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}







