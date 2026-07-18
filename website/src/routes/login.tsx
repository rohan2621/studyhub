import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken, setAccessToken, setRefreshToken } = useAuthStore();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });
      const { accessToken, refreshToken, user: backendUser } = res.data;

      // Store tokens immediately so subsequent API calls are authenticated
      setAccessToken(accessToken);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      // Safely resolve role — backend may return PascalCase ("Admin") or camelCase ("admin")
      // depending on serializer settings. Normalise to lowercase string.
      const rawRole: unknown =
        backendUser.role ?? backendUser.Role ?? "student";
      const mappedRole = String(rawRole).toLowerCase() as
        | "admin"
        | "teacher"
        | "student"
        | "toppercontributor";

      // Safely resolve all fields with both camelCase and PascalCase fallbacks
      const mappedUser = {
        id: backendUser.id ?? backendUser.Id ?? "",
        name: backendUser.name ?? backendUser.Name ?? "",
        email: backendUser.email ?? backendUser.Email ?? email,
        role: mappedRole,
        school_id: backendUser.schoolId ?? backendUser.SchoolId ?? undefined,
        grade: parseInt(backendUser.grade ?? backendUser.Grade ?? "0") || 0,
        created_at: new Date().toISOString(),
      };

      setUser(mappedUser);

      // Fetch token info only for students (admins and teachers bypass token check)
      if (mappedRole === "student") {
        try {
          const tokenRes = await api.get("/tokens/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (tokenRes.data.hasActiveToken) {
            setToken({
              id: tokenRes.data.id,
              code: tokenRes.data.code,
              user_id: mappedUser.id,
              plan: tokenRes.data.plan.toLowerCase() as any,
              issued_at: new Date().toISOString(),
              expires_at: tokenRes.data.expiresAt,
              status: "active",
              device_id: tokenRes.data.deviceBound ? "bound" : null,
              is_device_permanent: tokenRes.data.isDevicePermanent,
              can_bind_permanent: tokenRes.data.canBindPermanent,
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

      // Route admin users to the admin panel; everyone else to the dashboard
      if (mappedRole === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      setIsLoading(false);
      // Surface the backend's error message when available; fall back gracefully
      const serverError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message;
      setError(
        serverError && serverError !== "Network Error"
          ? serverError
          : "Invalid email or password. Please try again."
      );
      triggerShake();
    }
  };

  return (
    <div className="auth-page-bg">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      <div
        className="auth-card-wrapper"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div
          className="auth-card"
          style={{ animation: shake ? "auth-shake 0.5s ease" : "none" }}
        >
          <div className="auth-logo-wrap">
            <div className="auth-logo-ring">
              <img
                src="/logo.png?v=12"
                alt="StudyHub"
                width="36"
                height="36"
                loading="eager"
                className="auth-logo-img"
              />
            </div>
          </div>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to access your study materials</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">School email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="auth-input"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="auth-input auth-input-pr"
                  autoComplete="current-password"
                  aria-invalid={!!error}
                  aria-describedby={error ? "login-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-eye-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div id="login-error" role="alert" className="auth-error">
                <span className="auth-error-dot" />
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="auth-submit-btn">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : "Sign in"}
            </button>
          </form>

          <p className="auth-footer-text">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="auth-link">Sign up</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes auth-blob-move {
          0%,100%{transform:translate(0,0) scale(1);}
          33%{transform:translate(30px,-20px) scale(1.05);}
          66%{transform:translate(-20px,15px) scale(0.97);}
        }
        @keyframes auth-shake {
          0%,100%{transform:translateX(0);}
          15%{transform:translateX(-8px);}
          30%{transform:translateX(8px);}
          45%{transform:translateX(-6px);}
          60%{transform:translateX(6px);}
          75%{transform:translateX(-3px);}
          90%{transform:translateX(3px);}
        }
        .auth-page-bg{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:#080810;position:relative;overflow:hidden;font-family:var(--font-sans);}
        .auth-blob{position:absolute;border-radius:50%;filter:blur(80px);animation:auth-blob-move 9s ease-in-out infinite;pointer-events:none;}
        .auth-blob-1{width:440px;height:440px;background:radial-gradient(circle,rgba(99,102,241,0.30) 0%,transparent 70%);top:-120px;left:-120px;animation-delay:0s;}
        .auth-blob-2{width:380px;height:380px;background:radial-gradient(circle,rgba(168,85,247,0.24) 0%,transparent 70%);bottom:-90px;right:-90px;animation-delay:-3.5s;}
        .auth-blob-3{width:300px;height:300px;background:radial-gradient(circle,rgba(59,130,246,0.20) 0%,transparent 70%);top:50%;left:55%;transform:translate(-50%,-50%);animation-delay:-7s;}
        .auth-card-wrapper{width:100%;max-width:420px;position:relative;z-index:10;}
        .auth-card{background:rgba(255,255,255,0.04);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.09);border-radius:20px;padding:2.5rem 2rem;box-shadow:0 0 0 1px rgba(99,102,241,0.07),0 25px 60px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.06);}
        .auth-logo-wrap{display:flex;justify-content:center;margin-bottom:1.5rem;}
        .auth-logo-ring{width:64px;height:64px;border-radius:16px;background:rgba(99,102,241,0.14);border:1px solid rgba(99,102,241,0.28);display:flex;align-items:center;justify-content:center;box-shadow:0 0 22px rgba(99,102,241,0.22);}
        .auth-logo-img{width:36px;height:36px;filter:brightness(0) invert(1);}
        .auth-title{text-align:center;font-size:1.625rem;font-weight:800;color:#ffffff;letter-spacing:-0.02em;margin-bottom:0.375rem;}
        .auth-subtitle{text-align:center;font-size:0.875rem;color:rgba(255,255,255,0.42);margin-bottom:1.75rem;}
        .auth-form{display:flex;flex-direction:column;gap:1.125rem;}
        .auth-field{display:flex;flex-direction:column;gap:0.375rem;}
        .auth-label{font-size:0.8125rem;font-weight:600;color:rgba(255,255,255,0.65);letter-spacing:0.01em;}
        .auth-input-wrap{position:relative;}
        .auth-input{width:100%;background:rgba(255,255,255,0.055);border:1px solid rgba(255,255,255,0.11);border-radius:10px;padding:0.65rem 0.875rem;font-size:0.9375rem;color:#ffffff;transition:border-color 0.2s,box-shadow 0.2s,background 0.2s;box-sizing:border-box;}
        .auth-input::placeholder{color:rgba(255,255,255,0.22);}
        .auth-input:focus{outline:none;border-color:rgba(99,102,241,0.65);background:rgba(99,102,241,0.07);box-shadow:0 0 0 3px rgba(99,102,241,0.14),0 0 14px rgba(99,102,241,0.09);}
        .auth-input-pr{padding-right:2.75rem;}
        .auth-eye-btn{position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.32);background:none;border:none;cursor:pointer;padding:0.2rem;border-radius:6px;transition:color 0.2s;display:flex;align-items:center;justify-content:center;}
        .auth-eye-btn:hover{color:rgba(255,255,255,0.75);}
        .auth-eye-btn:focus-visible{outline:2px solid rgba(99,102,241,0.6);outline-offset:2px;}
        .auth-error{display:flex;align-items:center;gap:0.5rem;background:rgba(239,68,68,0.10);border:1px solid rgba(239,68,68,0.22);border-radius:8px;padding:0.6rem 0.875rem;font-size:0.8125rem;color:#fca5a5;font-weight:500;}
        .auth-error-dot{width:6px;height:6px;border-radius:50%;background:#f87171;flex-shrink:0;}
        .auth-submit-btn{display:flex;align-items:center;justify-content:center;gap:0.5rem;width:100%;padding:0.75rem 1.5rem;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);color:#ffffff;font-weight:700;font-size:0.9375rem;border:none;border-radius:10px;cursor:pointer;margin-top:0.25rem;transition:opacity 0.2s,transform 0.15s,box-shadow 0.2s;box-shadow:0 4px 16px rgba(99,102,241,0.38);letter-spacing:0.01em;}
        .auth-submit-btn:hover:not(:disabled){opacity:0.91;transform:translateY(-1px);box-shadow:0 7px 22px rgba(99,102,241,0.48);}
        .auth-submit-btn:active:not(:disabled){transform:translateY(0);}
        .auth-submit-btn:disabled{opacity:0.52;cursor:not-allowed;}
        .auth-footer-text{text-align:center;font-size:0.875rem;color:rgba(255,255,255,0.38);margin-top:1.5rem;}
        .auth-link{color:#818cf8;font-weight:700;text-decoration:none;transition:color 0.2s;}
        .auth-link:hover{color:#a5b4fc;}
      `}</style>
    </div>
  );
}
