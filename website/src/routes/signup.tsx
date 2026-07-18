import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

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

  // Password strength
  const getPasswordStrength = (p: string) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const pwStrength = getPasswordStrength(password);
  const pwStrengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
  // Black/white/gray palette for strength
  const pwStrengthBg = ["#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280", "#000"][pwStrength];

  return (
    <div className="bw-page">
      <div className="bw-bg-grid" />

      <div
        className="bw-wrapper"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.45s ease, transform 0.45s ease",
          maxWidth: "460px",
        }}
      >
        <div className="bw-accent-bar" />

        <div className="bw-card">
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

          <h1 className="bw-title">Create your account</h1>
          <p className="bw-subtitle">Free for all students. Unlock full access with a token.</p>

          <form onSubmit={handleSubmit} className="bw-form">
            {/* Name */}
            <div className="bw-field">
              <label htmlFor="name" className="bw-label">Full name</label>
              <input id="name" type="text" required value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson" className="bw-input"
                autoComplete="name" aria-invalid={!!error} />
            </div>

            {/* Email */}
            <div className="bw-field">
              <label htmlFor="email" className="bw-label">Email</label>
              <input id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu" className="bw-input"
                autoComplete="email" autoCapitalize="none" spellCheck={false} aria-invalid={!!error} />
            </div>

            {/* School */}
            <div className="bw-field">
              <label htmlFor="schoolId" className="bw-label">School</label>
              <select id="schoolId" required value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="bw-input" aria-invalid={!!error}>
                <option value="">Select your school</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                ))}
              </select>
            </div>

            {/* Grade + Section */}
            <div className="bw-row">
              <div className="bw-field">
                <label htmlFor="grade" className="bw-label">Grade</label>
                <select id="grade" required value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="bw-input" aria-invalid={!!error}>
                  <option value="">Select grade</option>
                  {[8, 9, 10, 11, 12].map((g) => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
              <div className="bw-field">
                <label htmlFor="section" className="bw-label">Section</label>
                <select id="section" required value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="bw-input" aria-invalid={!!error}>
                  <option value="">Section</option>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((s) => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Account type badge */}
            <div className="bw-badge-row">
              <span className="bw-badge">Student</span>
              <span className="bw-badge-note">fixed — teachers are added by admin</span>
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
                  placeholder="Create a strong password"
                  className="bw-input bw-input-pr"
                  autoComplete="new-password"
                  aria-invalid={!!error}
                  aria-describedby={error ? "signup-error" : undefined}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="bw-eye-btn" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                  {showPassword
                    ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                    : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>

              {/* Strength meter — grayscale */}
              {password.length > 0 && (
                <div className="pw-wrap">
                  <div className="pw-bar">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="pw-seg"
                        style={{ background: i <= pwStrength ? pwStrengthBg : "#e5e7eb" }} />
                    ))}
                  </div>
                  <span className="pw-label" style={{ color: pwStrengthBg === "#e5e7eb" ? "#9ca3af" : pwStrengthBg }}>
                    {pwStrengthLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div id="signup-error" role="alert" className="bw-error">
                <span className="bw-error-icon">!</span>
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="bw-btn">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <span className="bw-btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <p className="bw-footer">
            Already have an account?{" "}
            <Link to="/login" className="bw-link">Sign in</Link>
          </p>
        </div>

        <div className="bw-shadow-strip" />
      </div>

      {/* Success modal */}
      {showIntro && (
        <div className="bw-modal-overlay">
          <div
            className="bw-modal"
            style={{
              animation: "bw-modal-in 0.3s ease forwards",
            }}
          >
            <div className="bw-modal-icon-wrap">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="bw-modal-title">Account created!</h2>
            <p className="bw-modal-text">
              Welcome to StudyHub. Browse free previews of notes, homework, and past papers.
            </p>
            <p className="bw-modal-text">
              To unlock full access — downloading notes, submitting homework, viewing past papers — contact us on{" "}
              <a href="https://wa.me/9801829630" target="_blank" rel="noopener noreferrer" className="bw-link">WhatsApp</a>{" "}
              or{" "}
              <a href="https://www.instagram.com/general.nless/?hl=en" target="_blank" rel="noopener noreferrer" className="bw-link">Instagram</a>{" "}
              to choose a plan and receive your access token.
            </p>
            <button onClick={handleCloseIntro} className="bw-btn" style={{ marginTop: "0.5rem" }}>
              Go to dashboard <span className="bw-btn-arrow">→</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bw-modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
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
          position: relative;
          z-index: 10;
        }
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
        }
        .bw-shadow-strip {
          height: 3px;
          background: #000;
          width: calc(100% - 6px);
          margin-left: 6px;
        }
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
          margin-bottom: 1.5rem;
        }
        .bw-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .bw-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }
        .bw-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.875rem;
        }
        .bw-label {
          font-size: 0.75rem;
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
          transition: color 0.15s;
        }
        .bw-eye-btn:hover { color: #000; }
        .bw-eye-btn:focus-visible { outline: 2px solid #000; outline-offset: 2px; }
        .pw-wrap {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-top: 0.5rem;
        }
        .pw-bar { display: flex; gap: 3px; flex: 1; }
        .pw-seg { height: 3px; flex: 1; transition: background 0.25s; }
        .pw-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          min-width: 3rem;
          text-align: right;
          transition: color 0.25s;
        }
        .bw-badge-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          padding: 0.5rem 0.75rem;
        }
        .bw-badge {
          font-size: 0.8rem;
          font-weight: 800;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .bw-badge-note {
          font-size: 0.75rem;
          color: #9ca3af;
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
        .bw-error::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: #000;
        }
        .bw-error-icon {
          font-size: 0.72rem;
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
          transition: background 0.15s, color 0.15s, box-shadow 0.15s, transform 0.1s;
          letter-spacing: 0.01em;
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
        .bw-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .bw-btn-arrow { transition: transform 0.15s; }
        .bw-btn:hover:not(:disabled) .bw-btn-arrow { transform: translateX(3px); }
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
        .bw-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          padding: 1.5rem;
        }
        .bw-modal {
          width: 100%;
          max-width: 380px;
          background: #fff;
          border: 2px solid #000;
          padding: 2rem;
          text-align: center;
          box-shadow: 6px 6px 0 0 #000;
        }
        .bw-modal-icon-wrap {
          width: 52px;
          height: 52px;
          background: #000;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
        }
        .bw-modal-title {
          font-size: 1.375rem;
          font-weight: 800;
          color: #000;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }
        .bw-modal-text {
          font-size: 0.875rem;
          color: #4b5563;
          margin-bottom: 0.875rem;
          line-height: 1.65;
        }
      `}</style>
    </div>
  );
}
