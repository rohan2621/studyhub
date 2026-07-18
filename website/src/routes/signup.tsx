import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
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
    const t = setTimeout(() => setMounted(true), 50);
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

  // Password strength calculator
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
  const pwStrengthColor = ["#374151", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][pwStrength];

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
        <div className="auth-card">
          <div className="auth-logo-wrap">
            <div className="auth-logo-ring">
              <img src="/logo.png?v=12" alt="StudyHub" width="36" height="36" loading="eager" className="auth-logo-img" />
            </div>
          </div>

          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Free for all students. Unlock full access with a token.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="name" className="auth-label">Full name</label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson" className="auth-input" autoComplete="name" aria-invalid={!!error} />
            </div>

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu" className="auth-input" autoComplete="email"
                autoCapitalize="none" spellCheck={false} aria-invalid={!!error} />
            </div>

            <div className="auth-field">
              <label htmlFor="schoolId" className="auth-label">School</label>
              <select id="schoolId" required value={schoolId} onChange={(e) => setSchoolId(e.target.value)}
                className="auth-input" aria-invalid={!!error}>
                <option value="">Select your school</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                ))}
              </select>
            </div>

            <div className="auth-signup-row">
              <div className="auth-field">
                <label htmlFor="grade" className="auth-label">Grade</label>
                <select id="grade" required value={grade} onChange={(e) => setGrade(e.target.value)}
                  className="auth-input" aria-invalid={!!error}>
                  <option value="">Select grade</option>
                  {[8, 9, 10, 11, 12].map((g) => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
              <div className="auth-field">
                <label htmlFor="section" className="auth-label">Section</label>
                <select id="section" required value={section} onChange={(e) => setSection(e.target.value)}
                  className="auth-input" aria-invalid={!!error}>
                  <option value="">Select section</option>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((s) => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>
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
                  placeholder="Create a strong password"
                  className="auth-input auth-input-pr"
                  autoComplete="new-password"
                  aria-invalid={!!error}
                  aria-describedby={error ? "signup-error" : undefined}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="auth-eye-btn" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="pw-strength-wrap">
                  <div className="pw-strength-bar">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="pw-strength-seg"
                        style={{ background: i <= pwStrength ? pwStrengthColor : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                  <span className="pw-strength-label" style={{ color: pwStrengthColor }}>{pwStrengthLabel}</span>
                </div>
              )}
            </div>

            <div className="auth-account-type">
              <span className="auth-account-type-badge">Student</span>
              <span className="auth-account-type-note">Fixed — teachers are added by admin</span>
            </div>

            {error && (
              <div id="signup-error" role="alert" className="auth-error">
                <span className="auth-error-dot" />
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="auth-submit-btn">
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Creating account…</>
              ) : "Create account"}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>

      {showIntro && (
        <div className="auth-modal-overlay">
          <div className="auth-modal">
            <div className="auth-modal-icon">
              <ShieldCheck className="h-7 w-7" style={{ color: "#6366f1" }} />
            </div>
            <h2 className="auth-modal-title">Account created!</h2>
            <p className="auth-modal-text">
              Welcome to StudyHub. Browse free previews of notes, homework, and past papers.
            </p>
            <p className="auth-modal-text">
              To unlock full access — downloading notes, submitting homework, viewing past papers — contact us on{" "}
              <a href="https://wa.me/9801829630" target="_blank" rel="noopener noreferrer" className="auth-link">WhatsApp</a>{" "}
              or{" "}
              <a href="https://www.instagram.com/general.nless/?hl=en" target="_blank" rel="noopener noreferrer" className="auth-link">Instagram</a>{" "}
              to choose a plan and receive your access token.
            </p>
            <button onClick={handleCloseIntro} className="auth-submit-btn" style={{ marginTop: "0.5rem" }}>
              Go to dashboard
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes auth-blob-move {
          0%,100%{transform:translate(0,0) scale(1);}
          33%{transform:translate(30px,-20px) scale(1.05);}
          66%{transform:translate(-20px,15px) scale(0.97);}
        }
        .auth-page-bg{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:#080810;position:relative;overflow:hidden;font-family:var(--font-sans);}
        .auth-blob{position:absolute;border-radius:50%;filter:blur(80px);animation:auth-blob-move 9s ease-in-out infinite;pointer-events:none;}
        .auth-blob-1{width:440px;height:440px;background:radial-gradient(circle,rgba(99,102,241,0.30) 0%,transparent 70%);top:-120px;left:-120px;animation-delay:0s;}
        .auth-blob-2{width:380px;height:380px;background:radial-gradient(circle,rgba(168,85,247,0.24) 0%,transparent 70%);bottom:-90px;right:-90px;animation-delay:-3.5s;}
        .auth-blob-3{width:300px;height:300px;background:radial-gradient(circle,rgba(59,130,246,0.20) 0%,transparent 70%);top:50%;left:55%;transform:translate(-50%,-50%);animation-delay:-7s;}
        .auth-card-wrapper{width:100%;max-width:460px;position:relative;z-index:10;}
        .auth-card{background:rgba(255,255,255,0.04);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.09);border-radius:20px;padding:2.5rem 2rem;box-shadow:0 0 0 1px rgba(99,102,241,0.07),0 25px 60px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.06);}
        .auth-logo-wrap{display:flex;justify-content:center;margin-bottom:1.5rem;}
        .auth-logo-ring{width:64px;height:64px;border-radius:16px;background:rgba(99,102,241,0.14);border:1px solid rgba(99,102,241,0.28);display:flex;align-items:center;justify-content:center;box-shadow:0 0 22px rgba(99,102,241,0.22);}
        .auth-logo-img{width:36px;height:36px;filter:brightness(0) invert(1);}
        .auth-title{text-align:center;font-size:1.625rem;font-weight:800;color:#ffffff;letter-spacing:-0.02em;margin-bottom:0.375rem;}
        .auth-subtitle{text-align:center;font-size:0.875rem;color:rgba(255,255,255,0.42);margin-bottom:1.75rem;}
        .auth-form{display:flex;flex-direction:column;gap:1rem;}
        .auth-field{display:flex;flex-direction:column;gap:0.375rem;flex:1;}
        .auth-signup-row{display:grid;grid-template-columns:1fr 1fr;gap:0.875rem;}
        .auth-label{font-size:0.8125rem;font-weight:600;color:rgba(255,255,255,0.65);letter-spacing:0.01em;}
        .auth-input-wrap{position:relative;}
        .auth-input{width:100%;background:rgba(255,255,255,0.055);border:1px solid rgba(255,255,255,0.11);border-radius:10px;padding:0.65rem 0.875rem;font-size:0.9375rem;color:#ffffff;transition:border-color 0.2s,box-shadow 0.2s,background 0.2s;box-sizing:border-box;}
        .auth-input::placeholder{color:rgba(255,255,255,0.22);}
        .auth-input:focus{outline:none;border-color:rgba(99,102,241,0.65);background:rgba(99,102,241,0.07);box-shadow:0 0 0 3px rgba(99,102,241,0.14),0 0 14px rgba(99,102,241,0.09);}
        .auth-input-pr{padding-right:2.75rem;}
        .auth-input option{background:#1a1a2e;color:#ffffff;}
        .auth-eye-btn{position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.32);background:none;border:none;cursor:pointer;padding:0.2rem;border-radius:6px;transition:color 0.2s;display:flex;align-items:center;justify-content:center;}
        .auth-eye-btn:hover{color:rgba(255,255,255,0.75);}
        .pw-strength-wrap{display:flex;align-items:center;gap:0.625rem;margin-top:0.5rem;}
        .pw-strength-bar{display:flex;gap:4px;flex:1;}
        .pw-strength-seg{height:4px;flex:1;border-radius:2px;transition:background 0.3s;}
        .pw-strength-label{font-size:0.75rem;font-weight:600;min-width:3rem;text-align:right;transition:color 0.3s;}
        .auth-account-type{display:flex;align-items:center;gap:0.5rem;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.18);border-radius:8px;padding:0.55rem 0.875rem;}
        .auth-account-type-badge{font-size:0.8125rem;font-weight:700;color:#818cf8;}
        .auth-account-type-note{font-size:0.75rem;color:rgba(255,255,255,0.35);}
        .auth-error{display:flex;align-items:center;gap:0.5rem;background:rgba(239,68,68,0.10);border:1px solid rgba(239,68,68,0.22);border-radius:8px;padding:0.6rem 0.875rem;font-size:0.8125rem;color:#fca5a5;font-weight:500;}
        .auth-error-dot{width:6px;height:6px;border-radius:50%;background:#f87171;flex-shrink:0;}
        .auth-submit-btn{display:flex;align-items:center;justify-content:center;gap:0.5rem;width:100%;padding:0.75rem 1.5rem;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);color:#ffffff;font-weight:700;font-size:0.9375rem;border:none;border-radius:10px;cursor:pointer;transition:opacity 0.2s,transform 0.15s,box-shadow 0.2s;box-shadow:0 4px 16px rgba(99,102,241,0.38);letter-spacing:0.01em;}
        .auth-submit-btn:hover:not(:disabled){opacity:0.91;transform:translateY(-1px);box-shadow:0 7px 22px rgba(99,102,241,0.48);}
        .auth-submit-btn:active:not(:disabled){transform:translateY(0);}
        .auth-submit-btn:disabled{opacity:0.52;cursor:not-allowed;}
        .auth-footer-text{text-align:center;font-size:0.875rem;color:rgba(255,255,255,0.38);margin-top:1.5rem;}
        .auth-link{color:#818cf8;font-weight:700;text-decoration:none;transition:color 0.2s;}
        .auth-link:hover{color:#a5b4fc;}
        .auth-modal-overlay{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.65);backdrop-filter:blur(10px);padding:1.5rem;}
        .auth-modal{width:100%;max-width:380px;background:rgba(12,12,24,0.98);border:1px solid rgba(99,102,241,0.2);border-radius:20px;padding:2rem;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.7),0 0 0 1px rgba(99,102,241,0.08);}
        .auth-modal-icon{width:56px;height:56px;border-radius:14px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;box-shadow:0 0 20px rgba(99,102,241,0.2);}
        .auth-modal-title{font-size:1.375rem;font-weight:800;color:#ffffff;letter-spacing:-0.02em;margin-bottom:0.75rem;}
        .auth-modal-text{font-size:0.875rem;color:rgba(255,255,255,0.5);margin-bottom:0.875rem;line-height:1.65;}
      `}</style>
    </div>
  );
}
