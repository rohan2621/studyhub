import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyHub — Learn and Excel Together" },
      { name: "description", content: "Access premium notes, submit homework, view past papers, and learn directly from toppers. The complete digital ecosystem built for students." },
    ]
  }),
  component: LandingPage,
});

function LandingPage() {
  const { user } = useAuthStore();
  const [latestRelease, setLatestRelease] = useState<any>(null);

  useEffect(() => {
    api.get("/api/appreleases/latest")
      .then(res => setLatestRelease(res.data))
      .catch(() => {});
  }, []);
  
  return (
    <div className="min-h-screen bg-white text-black font-[family-name:var(--font-sans)]">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-white px-6 py-4">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png?v=12" alt="StudyHub" className="h-[28px] w-auto dark:invert" />
            <span className="font-extrabold text-xl tracking-tight">StudyHub</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 font-bold text-sm">
            {latestRelease && (
              <a href={latestRelease.downloadUrl} className="hidden sm:flex items-center gap-2 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                App (v{latestRelease.version})
              </a>
            )}
            {user ? (
              <Link to="/dashboard" className="px-4 py-2 sm:px-5 sm:py-2.5 bg-black text-white hover:bg-gray-800 transition-colors text-xs sm:text-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="hover:text-gray-600 transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="px-4 py-2 sm:px-6 sm:py-2.5 bg-black text-white hover:bg-gray-800 transition-colors text-xs sm:text-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <hr className="fixed top-[72px] z-50 w-full border-t border-black/20 m-0" />

      {/* Hero Section */}
      <main id="main-content" className="pt-[73px]">
        <div className="mx-auto max-w-[1400px] px-6 lg:flex lg:items-center lg:gap-x-12 py-16 lg:py-24">
          
          {/* Left Column */}
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto lg:w-1/2 lg:pr-8">
            <div className="inline-flex items-center gap-2 border border-black px-3 py-1.5 text-xs font-bold mb-6 sm:mb-8 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] bg-white">
              <Sparkles className="h-3.5 w-3.5" />
              Modern E-Learning Platform
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-[80px] font-black tracking-tight font-[family-name:var(--font-heading)] leading-[1.05] mb-6 sm:mb-8">
              Master your <br/> studies.
            </h1>
            
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl leading-relaxed text-gray-600 max-w-xl mb-8 sm:mb-10 font-medium">
              Access premium notes, submit homework, view past papers, and learn directly from toppers. The complete digital ecosystem built for students.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link to={user ? "/dashboard" : "/signup"} className="border border-black bg-black text-white px-8 py-3.5 font-bold hover:bg-white hover:text-black transition-colors text-base text-center">
                Start for free
              </Link>
              <Link to="/search" className="border border-black bg-white text-black px-8 py-3.5 font-bold hover:bg-gray-50 transition-colors text-base text-center">
                Book a demo
              </Link>
            </div>
          </div>

          {/* Right Column (Dashboard Mockup) */}
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:w-1/2 lg:flex-shrink-0">
            <div className="relative border border-black bg-white p-6 sm:p-10 mx-auto max-w-3xl">
              {/* Grid background effect */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              
              {/* Mockup Window */}
              <div className="relative border-2 border-black bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[480px]">
                {/* Mockup Header */}
                <div className="border-b-2 border-black flex items-center justify-between px-4 py-3 bg-white">
                  <div className="text-[11px] font-black tracking-widest uppercase">Student Portal</div>
                  <div className="flex gap-4 items-center text-[10px] font-bold text-gray-600">
                    <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-gray-200 block border-2 border-black"></span> Welcome, Sarah J.</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 block border-2 border-black bg-white"></span> Logout</div>
                  </div>
                </div>
                
                {/* Mockup Body */}
                <div className="flex flex-1 overflow-hidden bg-white">
                  {/* Mockup Sidebar */}
                  <div className="hidden sm:flex w-32 border-r-2 border-black p-3 space-y-4 flex-col pt-6">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-black rounded-full"></div><div className="h-2 w-16 bg-gray-200"></div></div>
                    <div className="flex items-center gap-2 bg-gray-100 p-1 -ml-1 border-2 border-black"><div className="w-3 h-3 border-2 border-black"></div><div className="font-black text-[9px] uppercase tracking-wider">Subjects</div></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-black"></div><div className="h-2 w-14 bg-gray-200"></div></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-black rounded-full"></div><div className="h-2 w-12 bg-gray-200"></div></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-black"></div><div className="h-2 w-16 bg-gray-200"></div></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-black"></div><div className="h-2 w-14 bg-gray-200"></div></div>
                    <div className="mt-auto flex items-center gap-2"><div className="w-3 h-3 border-2 border-black rounded-full"></div><div className="h-2 w-12 bg-gray-200"></div></div>
                  </div>
                  
                  {/* Mockup Content */}
                  <div className="flex-1 p-4 sm:p-6 bg-white flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start mb-6 sm:mb-8">
                      <div>
                        <h2 className="font-black text-xl sm:text-2xl leading-none">Subjects Overview</h2>
                        <p className="text-[10px] text-gray-500 mt-1 font-semibold">Class 10 Sec A</p>
                      </div>
                      <div className="hidden sm:flex border-2 border-gray-200 rounded-full px-3 py-1.5 text-[10px] text-gray-400 w-40 items-center gap-2">
                        <span className="w-2.5 h-2.5 border-2 border-gray-300 rounded-full block"></span> Search subjects...
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      {/* Folder 1 */}
                      <div className="border-2 border-black rounded-xl p-4 pt-5 relative bg-white transition-transform hover:-translate-y-1">
                        {/* Folder Tab */}
                        <div className="absolute top-0 left-6 -mt-[2px] h-3 w-16 border-t-2 border-l-2 border-r-2 border-black bg-white rounded-t-md z-10"></div>
                        <div className="absolute top-[8px] left-0 w-full h-[2px] bg-black"></div>
                        
                        <div className="font-black text-[11px] uppercase bg-black text-white inline-block px-2 py-1 rounded mt-1 mb-3">Physics Notes</div>
                        <div className="text-[9px] font-bold text-gray-600 mb-1">Item Count - 18</div>
                        <div className="text-[9px] font-bold text-gray-600">Latest Update: 2 days ago</div>
                        <div className="text-[9px] font-black mt-3">Status - Active</div>
                      </div>
                      
                      {/* Folder 2 */}
                      <div className="border-2 border-black rounded-xl p-4 pt-5 relative bg-white transition-transform hover:-translate-y-1">
                        <div className="absolute top-0 left-6 -mt-[2px] h-3 w-16 border-t-2 border-l-2 border-r-2 border-black bg-white rounded-t-md z-10"></div>
                        <div className="absolute top-[8px] left-0 w-full h-[2px] bg-black"></div>
                        
                        <div className="font-black text-[11px] uppercase bg-black text-white inline-block px-2 py-1 rounded mt-1 mb-3">Chemistry Notes</div>
                        <div className="text-[9px] font-bold text-gray-600 mb-1">Item Count - 22</div>
                        <div className="text-[9px] font-bold text-gray-600">Latest Update: Yesterday</div>
                        <div className="text-[9px] font-black mt-3 text-gray-500">Status - Yesterday</div>
                      </div>

                      {/* Folder 3 */}
                      <div className="border-2 border-black rounded-xl p-4 pt-5 relative bg-white transition-transform hover:-translate-y-1">
                        <div className="absolute top-0 left-6 -mt-[2px] h-3 w-16 border-t-2 border-l-2 border-r-2 border-black bg-white rounded-t-md z-10"></div>
                        <div className="absolute top-[8px] left-0 w-full h-[2px] bg-black"></div>
                        
                        <div className="font-black text-[11px] uppercase bg-black text-white inline-block px-2 py-1 rounded mt-1 mb-3">Biology</div>
                        <div className="text-[9px] font-bold text-gray-600 mb-1">Item Count - 25</div>
                        <div className="text-[9px] font-bold text-gray-600">Latest Update: 5 days ago</div>
                        <div className="text-[9px] font-black mt-3">Status - Active</div>
                      </div>

                      {/* Folder 4 (Different style inside) */}
                      <div className="border-2 border-black rounded-xl p-4 pt-5 relative bg-white transition-transform hover:-translate-y-1">
                        <div className="absolute top-0 left-6 -mt-[2px] h-3 w-16 border-t-2 border-l-2 border-r-2 border-black bg-white rounded-t-md z-10"></div>
                        <div className="absolute top-[8px] left-0 w-full h-[2px] bg-black"></div>
                        
                        <div className="font-black text-[11px] uppercase bg-white border-2 border-black text-black inline-block px-2 py-0.5 rounded mt-1 mb-3">Class 10 Sec A</div>
                        <div className="text-[10px] font-black mt-1">All Subjects</div>
                        <div className="text-[9px] font-bold text-gray-500 mt-1">4 folders inside</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-black"></div>

        {/* Feature Section */}
        <div className="mx-auto max-w-[1400px] px-6 py-20 lg:py-28">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl font-[family-name:var(--font-heading)] mb-6">
              Everything you need to excel.
            </h2>
            <p className="text-xl leading-relaxed text-gray-600 font-medium">
              A powerful, no-nonsense suite of tools built specifically for students who want to optimize their learning and save time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
              <div className="h-12 w-12 border-2 border-black flex items-center justify-center mb-6 bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <h3 className="text-xl font-black font-[family-name:var(--font-heading)] mb-3">Premium Notes</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Access highly curated, subject-wise study notes prepared by expert teachers and top students.
              </p>
            </div>

            <div className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
              <div className="h-12 w-12 border-2 border-black flex items-center justify-center mb-6 bg-gray-50">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black font-[family-name:var(--font-heading)] mb-3">Topper Insights</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Learn the secrets of success with exclusive content and strategies directly from school toppers.
              </p>
            </div>

            <div className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
              <div className="h-12 w-12 border-2 border-black flex items-center justify-center mb-6 bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
              </div>
              <h3 className="text-xl font-black font-[family-name:var(--font-heading)] mb-3">Past Papers</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Practice with a massive library of past examination papers and detailed marking schemes.
              </p>
            </div>
            
            <div className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 md:col-span-3 lg:col-span-1">
              <div className="h-12 w-12 border-2 border-black flex items-center justify-center mb-6 bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-graduation-cap"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <h3 className="text-xl font-black font-[family-name:var(--font-heading)] mb-3">Homework Help</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Stuck on a problem? Submit your homework questions and get detailed, step-by-step solutions.
              </p>
            </div>

            <div className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 md:col-span-3 lg:col-span-2 bg-[#f8f9fa] relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black font-[family-name:var(--font-heading)] mb-4">Study seamlessly across all your devices.</h3>
                <p className="text-gray-700 font-medium leading-relaxed max-w-xl mb-6">
                  StudyHub syncs your notes and progress instantly. Start reading on your laptop, continue on your tablet, and review on your phone during your commute.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 font-bold text-sm bg-white border-2 border-black px-3 py-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg> Desktop</div>
                  <div className="flex items-center gap-2 font-bold text-sm bg-white border-2 border-black px-3 py-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg> Mobile Apps</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* App Download Section */}
        <div className="mx-auto max-w-[1400px] px-6 py-20 lg:py-32">
          <div className="border-4 border-black bg-[#ff90e8] p-8 md:p-16 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
            
            {/* Background decoration */}
            <div className="absolute -right-20 -top-20 opacity-20 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            </div>

            <div className="relative z-10 max-w-2xl">
              <div className="inline-block bg-black text-white font-bold px-4 py-1.5 text-sm uppercase tracking-widest mb-6">
                Mobile App
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight font-[family-name:var(--font-heading)] mb-6 leading-tight">
                Take your study materials anywhere.
              </h2>
              <p className="text-xl font-medium text-black/80 mb-8 max-w-xl">
                We distribute our Android app directly to you, bypassing the Play Store to keep things 100% free. 
                Get offline access, instant notifications, and a distraction-free environment.
              </p>
              
              <Link 
                to="/download" 
                className="inline-flex justify-center items-center gap-3 border-2 border-black bg-white text-black px-6 py-3 sm:px-8 sm:py-4 font-black text-base sm:text-lg transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none w-full sm:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download APK Now
              </Link>
            </div>
            
            <div className="relative z-10 hidden lg:block shrink-0">
              <div className="border-4 border-black bg-white w-[280px] h-[580px] rounded-[2rem] p-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-3">
                <div className="w-full h-full border-2 border-black rounded-[1.25rem] bg-gray-50 flex flex-col overflow-hidden relative">
                  {/* Mock App Header */}
                  <div className="bg-black text-white p-4 flex items-center justify-between">
                    <span className="font-bold">StudyHub</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-white/50" />
                      <div className="w-2 h-2 rounded-full bg-white/50" />
                      <div className="w-2 h-2 rounded-full bg-white/50" />
                    </div>
                  </div>
                  {/* Mock App Content */}
                  <div className="p-4 space-y-4">
                    <div className="h-8 w-3/4 bg-gray-200 rounded border border-gray-300" />
                    <div className="h-32 w-full bg-[#f8f9fa] rounded-xl border-2 border-black flex items-center justify-center">
                      <div className="text-gray-400 font-bold">Latest Notes</div>
                    </div>
                    <div className="h-32 w-full bg-[#f8f9fa] rounded-xl border-2 border-black flex items-center justify-center">
                      <div className="text-gray-400 font-bold">Homework</div>
                    </div>
                  </div>
                  {/* Mock Update Notification popup */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="font-bold text-sm mb-1 text-emerald-600">Update Available</div>
                    <div className="text-xs text-gray-600">v1.0.5 is ready to install!</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-black"></div>

        {/* Final CTA Section */}
        <div className="mx-auto max-w-[1400px] px-6 py-20 lg:py-32 text-center">
          <h2 className="text-5xl font-black tracking-tight sm:text-7xl font-[family-name:var(--font-heading)] mb-8">
            Ready to ace your exams?
          </h2>
          <p className="mx-auto text-xl leading-relaxed text-gray-600 font-medium max-w-2xl mb-12">
            Join thousands of students who are already using StudyHub to get better grades in less time.
          </p>
          <Link to={user ? "/dashboard" : "/signup"} className="inline-block border-2 border-black bg-black text-white px-10 py-5 font-black text-lg hover:bg-white hover:text-black transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px]">
            Create your free account
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-white py-12 px-6 mt-10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png?v=12" alt="StudyHub" width="32" height="32" loading="lazy" className="h-[32px] w-[32px] dark:invert" />
            <span className="font-extrabold text-xl font-[family-name:var(--font-heading)]">StudyHub</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-sm text-gray-500 font-bold tracking-wide">
              &copy; {new Date().getFullYear()} StudyHub. All rights reserved.
            </p>
            <p className="text-sm text-gray-600 font-bold">
              Made by <a href="https://rohantimalsina.lovable.app/" target="_blank" rel="noopener noreferrer" className="text-black hover:underline underline-offset-4 decoration-2 decoration-[#ff90e8]">Rohan Timalsina</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
