import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, BookOpen, ClipboardList, FileText, Award, X, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
    type: (search.type as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Search — StudyHub" },
      { name: "description", content: "Search notes, homework, and past papers." },
    ],
  }),
  component: SearchPage,
});

const KIND_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any; to: string }> = {
  note: { label: "Note", color: "text-[#2f6fed]", bg: "bg-[#2f6fed]/8", icon: BookOpen, to: "/notes" },
  homework: { label: "Homework", color: "text-sky-700", bg: "bg-sky-50", icon: ClipboardList, to: "/homework" },
  pastpaper: { label: "Past Paper", color: "text-indigo-700", bg: "bg-indigo-50", icon: FileText, to: "/past-papers" },
  "TopperNote": { label: "Topper Note", color: "text-amber-700", bg: "bg-amber-50", icon: Award, to: "/topper-notes" },
};

function SearchPage() {
  const { q: initialQ } = Route.useSearch();
  const navigate = useNavigate();

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeType, setActiveType] = useState("");

  const doSearch = async (q: string, type = activeType) => {
    if (!q.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      let url = `/search?q=${encodeURIComponent(q)}`;
      if (type) url += `&type=${type}`;
      const res = await api.get(url);
      setResults(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQ) {
      doSearch(initialQ);
    }
  }, [initialQ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: { q: query, type: activeType } });
    doSearch(query);
  };

  const handleTypeFilter = (type: string) => {
    setActiveType(type);
    doSearch(query, type);
  };

  const grouped: Record<string, any[]> = {};
  results.forEach((r) => {
    const key = r.kind || "note";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f6fed] to-[#5b8def]">
            <Search className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0e2a4d]">Search</h1>
            <p className="text-sm text-[#5a7095]">Find notes, homework, and past papers</p>
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5a7095]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes, subjects, chapters..."
              autoFocus
              className="w-full rounded-xl border border-[#2f6fed]/20 bg-white/80 py-3 pl-11 pr-4 text-sm text-[#0e2a4d] placeholder:text-[#5a7095]/50 outline-none focus:border-[#2f6fed] focus:ring-2 focus:ring-[#2f6fed]/15 shadow-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); setResults([]); setHasSearched(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a7095] hover:text-[#0e2a4d]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:shadow-lg"
          >
            Search
          </button>
        </form>

        {/* Type filters */}
        {hasSearched && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-[#5a7095]">Filter:</span>
            {[{ key: "", label: "All" }, { key: "note", label: "Notes" }, { key: "homework", label: "Homework" }, { key: "pastpaper", label: "Past Papers" }].map((f) => (
              <button
                key={f.key}
                onClick={() => handleTypeFilter(f.key)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${activeType === f.key ? "gradient-primary text-white shadow-md" : "border border-[#2f6fed]/15 bg-white/60 text-[#5a7095] hover:bg-white/80"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#2f6fed]" />
          </div>
        ) : hasSearched ? (
          results.length === 0 ? (
            <div className="py-16 text-center">
              <Search className="mx-auto h-12 w-12 text-[#5a7095]/30 mb-4" />
              <p className="text-lg font-semibold text-[#0e2a4d]">No results found</p>
              <p className="mt-1 text-sm text-[#5a7095]">Try a different search term or change the filter.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-[#5a7095]">{total} result{total !== 1 ? "s" : ""} for <span className="font-semibold text-[#0e2a4d]">"{initialQ || query}"</span></p>
              {Object.entries(grouped).map(([kind, items]) => {
                const cfg = KIND_CONFIG[kind] || KIND_CONFIG.note;
                const KindIcon = cfg.icon;
                return (
                  <div key={kind}>
                    <div className="mb-3 flex items-center gap-2">
                      <KindIcon className={`h-4 w-4 ${cfg.color}`} />
                      <h2 className="font-[family-name:var(--font-heading)] text-base font-bold text-[#0e2a4d]">{cfg.label}s</h2>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-[#5a7095]">{items.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {items.map((item) => (
                        <Link
                          key={item.id}
                          to={cfg.to}
                          className="glass-card group p-4 transition-all duration-300 hover:glass-card-hover block"
                        >
                          <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          <h3 className="mt-2 text-sm font-semibold text-[#0e2a4d] group-hover:text-[#2f6fed] transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="mt-1.5 flex items-center gap-2 text-xs text-[#5a7095]">
                            <span>{item.subject}</span>
                            {item.chapter && <><span>·</span><span>{item.chapter}</span></>}
                            {item.grade && <><span>·</span><span className="font-medium text-[#2f6fed]">Class {item.grade}</span></>}
                          </div>
                          {item.upvotes > 0 && (
                            <div className="mt-2 text-xs font-semibold text-[#5a7095]">↑ {item.upvotes}</div>
                          )}
                          {item.uploader && (
                            <div className="mt-1 text-xs text-[#5a7095]/60">by {item.uploader}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="py-16 text-center">
            <Search className="mx-auto h-12 w-12 text-[#5a7095]/20 mb-4" />
            <p className="text-[#5a7095]">Type something above and press Search</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
