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
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 550);
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
    <div className="bw-page">
      {/* Subtle dot-grid background texture */}
      <div className="bw-bg-grid" />

      <div
        className="bw-wrapper"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.45s ease, transform 0.45s ease",
        }}
      >
        {/* Top accent line */}
        <div className="bw-accent-bar" />

        <div
          className="bw-card"
          style={{ animation: shake ? "bw-shake 0.5s ease" : "none" }}
        >
          {/* Logo */}
          <div className="bw-logo-wrap">
            <div className="bw-logo-box">
              <img
                src="/logo.png?v=12"
                alt="StudyHub"
                width="32"
                height="32"
                loading="eager"
                className="bw-logo-img"
              />
            </div>
            <span className="bw-brand">StudyHub</span>
          </div>

          <div className="bw-divider" />

          <h1 className="bw-title">Welcome back</h1>
          <p className="bw-subtitle">Sign in to access your study materials</p>

          <form onSubmit={handleSubmit} className="bw-form">
            {/* Email */}
            <div className="bw-field">
              <label htmlFor="email" className="bw-label">School email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="bw-input"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>

            {/* Password */}
            <div className="bw-field">
              <label htmlFor="password" className="bw-label">Password</label>
              <div className="bw-input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bw-input bw-input-pr"
                  autoComplete="current-password"
                  aria-invalid={!!error}
                  aria-describedby={error ? "login-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="bw-eye-btn"
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

            {/* Error */}
            {error && (
              <div id="login-error" role="alert" className="bw-error">
                <span className="bw-error-icon">!</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="bw-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <span className="bw-btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <p className="bw-footer">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="bw-link">Sign up</Link>
          </p>
        </div>

        {/* Bottom shadow strip */}
        <div className="bw-shadow-strip" />
      </div>

      <style>{`
        @keyframes bw-shake {
          0%,100%{transform:translateX(0);}
          18%{transform:translateX(-7px);}
          36%{transform:translateX(7px);}
          54%{transform:translateX(-5px);}
          72%{transform:translateX(5px);}
          90%{transform:translateX(-2px);}
        }

        .bw-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: #f8f8f8;
          position: relative;
          font-family: var(--font-sans);
          overflow: hidden;
        }

        /* Subtle dot grid */
        .bw-bg-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #d4d4d4 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.5;
          pointer-events: none;
        }

        .bw-wrapper {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 10;
        }

        /* Top accent bar — thicker, makes the card look anchored */
        .bw-accent-bar {
          height: 3px;
          background: #000;
          width: 100%;
        }

        .bw-card {
          background: #ffffff;
          border: 1px solid #000;
          border-top: none;
          padding: 2.25rem 2rem 2rem;
          position: relative;
        }

        /* 3-px offset shadow strip below card */
        .bw-shadow-strip {
          height: 3px;
          background: #000;
          width: calc(100% - 6px);
          margin-left: 6px;
        }

        /* Logo row */
        .bw-logo-wrap {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 1.25rem;
        }
        .bw-logo-box {
          width: 40px;
          height: 40px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bw-logo-img {
          width: 24px;
          height: 24px;
          filter: brightness(0) invert(1);
        }
        .bw-brand {
          font-size: 1.0625rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #000;
        }

        .bw-divider {
          height: 1px;
          background: #e5e5e5;
          margin-bottom: 1.5rem;
        }

        .bw-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #000;
          letter-spacing: -0.025em;
          margin-bottom: 0.3rem;
        }
        .bw-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 1.75rem;
        }

        .bw-form {
          display: flex;
          flex-direction: column;
          gap: 1.125rem;
        }

        .bw-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .bw-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .bw-input-wrap { position: relative; }

        .bw-input {
          width: 100%;
          background: #fff;
          border: 1.5px solid #d1d5db;
          border-radius: 0;
          padding: 0.6rem 0.875rem;
          font-size: 0.9375rem;
          color: #000;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
          outline: none;
        }
        .bw-input::placeholder { color: #9ca3af; }
        .bw-input:hover { border-color: #9ca3af; }
        .bw-input:focus {
          border-color: #000;
          box-shadow: 3px 3px 0 0 #000;
        }
        .bw-input-pr { padding-right: 2.75rem; }

        .bw-eye-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.15rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s;
        }
        .bw-eye-btn:hover { color: #000; }
        .bw-eye-btn:focus-visible {
          outline: 2px solid #000;
          outline-offset: 2px;
        }

        .bw-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1.5px solid #000;
          background: #fafafa;
          padding: 0.55rem 0.75rem;
          font-size: 0.8125rem;
          color: #000;
          font-weight: 500;
          position: relative;
        }
        /* left red accent */
        .bw-error::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #000;
        }
        .bw-error-icon {
          font-size: 0.75rem;
          font-weight: 900;
          width: 18px;
          height: 18px;
          background: #000;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
        }

        .bw-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.7rem 1.25rem;
          background: #000;
          color: #fff;
          font-weight: 700;
          font-size: 0.9375rem;
          border: 1.5px solid #000;
          border-radius: 0;
          cursor: pointer;
          margin-top: 0.25rem;
          transition: background 0.15s, color 0.15s, box-shadow 0.15s, transform 0.1s;
          letter-spacing: 0.01em;
          position: relative;
          overflow: hidden;
        }
        .bw-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.15s;
        }
        .bw-btn:hover:not(:disabled) {
          background: #fff;
          color: #000;
          box-shadow: 4px 4px 0 0 #000;
          transform: translate(-2px, -2px);
        }
        .bw-btn:active:not(:disabled) {
          transform: translate(0, 0);
          box-shadow: none;
        }
        .bw-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .bw-btn-arrow {
          font-size: 1rem;
          transition: transform 0.15s;
        }
        .bw-btn:hover:not(:disabled) .bw-btn-arrow {
          transform: translateX(3px);
        }

        .bw-footer {
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 1.5rem;
        }
        .bw-link {
          color: #000;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: opacity 0.15s;
        }
        .bw-link:hover { opacity: 0.6; }
      `}</style>
    </div>
  );
}
