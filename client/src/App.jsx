import { useCallback, useState } from "react";

// ── Config ────────────────────────────────────────────────────────────────────
// In production on Render, API calls go to the same domain (Render serves both)
// In dev, Vite proxies /api to localhost:4000
const API_BASE = ""; // Empty string means same origin

const PROFILE_SKILLS = [
  "Angular","React","Next.js","TypeScript","JavaScript","RxJS","Node.js",
  "WebSockets","CI/CD","Agile","Scrum","Tailwind","Performance","Frontend","Team Lead","Architect",
];

const QUICK_SEARCHES = [
  "Senior Frontend Engineer",
  "Frontend Team Lead",
  "Angular Developer",
  "React Developer",
  "Frontend Architect",
  "Principal Frontend Engineer",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function scoreJob(job) {
  const text = `${job.job_title} ${job.job_description || ""} ${(job.job_required_skills || []).join(" ")}`.toLowerCase();
  let score = 0;
  const matched = [];
  PROFILE_SKILLS.forEach((s) => {
    if (text.includes(s.toLowerCase())) { score += 8; matched.push(s); }
  });
  if (/senior|lead|principal|staff|architect/i.test(job.job_title)) score += 16;
  if (/dubai|abu dhabi|uae|sharjah|ajman/i.test(job.job_location || "")) score += 10;
  return { score: Math.min(score, 100), matched };
}

const scoreColor = (s) => s >= 80 ? "#00C853" : s >= 60 ? "#FFB300" : "#FF5252";
const scoreBg    = (s) => s >= 80 ? "#E8F5E9" : s >= 60 ? "#FFF8E1" : "#FFEBEE";

// ── Components ────────────────────────────────────────────────────────────────
function Badge({ children, color = "#1565C0", bg = "#E3F2FD" }) {
  return (
    <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, background: bg, color, fontWeight: 600, display: "inline-block" }}>
      {children}
    </span>
  );
}

function JobCard({ job, onSave, onApply, isSaved, isApplied }) {
  const [open, setOpen]     = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [aiLoad, setAiLoad] = useState(false);

  const genNote = async () => {
    setAiLoad(true); setAiNote("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content:
            `Write a punchy 3-sentence cover note. No "Dear Hiring Manager". Start strong.\n\nCandidate: Amr Gamal, 14 years, Senior Frontend Engineer & Team Lead.\nSkills: Angular, React, TypeScript, RxJS, Node.js, CI/CD.\nHighlights: Led Egypt's first corporate online payment platform (Banque Misr). Led national government platforms at ELM Saudi Arabia. Currently Frontend Team Lead at NWC Saudi Arabia.\n\nJob: ${job.job_title} at ${job.employer_name}, ${job.job_city || "UAE"}.\n\nMax 75 words. Confident tone.`
          }],
        }),
      });
      const d = await res.json();
      setAiNote(d.content?.[0]?.text || "Error.");
    } catch { setAiNote("Could not connect to AI."); }
    setAiLoad(false);
  };

  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: open ? "2px solid #1F4E79" : "2px solid transparent", transition: "all .2s", marginBottom: 12 }}>
      {/* Top row */}
      <div onClick={() => setOpen(!open)} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start", cursor: "pointer" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1A2B4A", marginBottom: 3 }}>{job.job_title}</div>
          <div style={{ color: "#555", fontSize: 13, marginBottom: 4 }}>
            <strong>{job.employer_name}</strong>
            {job.job_city ? ` · ${job.job_city}` : ""}
            {job.job_country ? `, ${job.job_country}` : " · UAE"}
          </div>
          {job.job_employment_type && (
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>
              {job.job_employment_type}{job.job_is_remote ? " · Remote eligible" : ""}
            </div>
          )}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 6 }}>
            {job.matched?.slice(0, 6).map((s) => <Badge key={s}>{s}</Badge>)}
            {isApplied && <Badge color="#00695C" bg="#E0F2F1">✅ Applied</Badge>}
            {isSaved && !isApplied && <Badge color="#F57F17" bg="#FFF8E1">🔖 Saved</Badge>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div style={{ background: scoreBg(job.score), color: scoreColor(job.score), fontWeight: 700, fontSize: 20, padding: "8px 14px", borderRadius: 10, fontFamily: "'DM Mono', monospace", minWidth: 64, textAlign: "center" }}>
            {job.score}%
          </div>
          <div style={{ fontSize: 10, color: "#aaa" }}>match</div>
          {job.job_posted_at_datetime_utc && (
            <div style={{ fontSize: 11, color: "#bbb" }}>{new Date(job.job_posted_at_datetime_utc).toLocaleDateString()}</div>
          )}
        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1.5px solid #F0F4F8" }}>
          {job.job_description && (
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.7, marginBottom: 12, maxHeight: 100, overflow: "hidden" }}>
              {job.job_description.slice(0, 400)}…
            </div>
          )}
          {(job.job_min_salary || job.job_max_salary) && (
            <div style={{ fontSize: 13, color: "#1F4E79", fontWeight: 600, marginBottom: 10 }}>
              💰 {job.job_salary_currency || "AED"} {job.job_min_salary?.toLocaleString()} – {job.job_max_salary?.toLocaleString()} / {job.job_salary_period || "year"}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer"
              style={{ padding: "10px 20px", borderRadius: 8, background: "linear-gradient(135deg,#1F4E79,#2196F3)", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
              Apply Now ↗
            </a>
            <button onClick={onSave}
              style={{ padding: "10px 16px", borderRadius: 8, border: "1.5px solid #E0E7EF", background: isSaved ? "#FFF8E1" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#666", fontFamily: "inherit" }}>
              {isSaved ? "🔖 Saved" : "🔖 Save"}
            </button>
            <button onClick={onApply}
              style={{ padding: "10px 16px", borderRadius: 8, border: "1.5px solid #E0E7EF", background: isApplied ? "#E8F5E9" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#666", fontFamily: "inherit" }}>
              {isApplied ? "✅ Applied" : "✅ Mark Applied"}
            </button>
            <button onClick={genNote}
              style={{ padding: "10px 16px", borderRadius: 8, border: "1.5px solid #C5CAE9", background: "#EEF2FF", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#3949AB", fontFamily: "inherit" }}>
              ✨ Cover Note
            </button>
          </div>

          {aiLoad && <div style={{ background: "#EEF2FF", borderRadius: 8, padding: 14, fontSize: 13, color: "#3949AB" }}>Generating cover note…</div>}
          {aiNote && !aiLoad && (
            <div style={{ background: "#F8F9FF", border: "1.5px solid #C5CAE9", borderRadius: 8, padding: 14, fontSize: 13, color: "#1A2B4A", lineHeight: 1.7 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#3949AB", marginBottom: 6, letterSpacing: 1 }}>✨ AI COVER NOTE</div>
              {aiNote}
              <button onClick={() => navigator.clipboard?.writeText(aiNote)}
                style={{ marginTop: 8, padding: "4px 10px", borderRadius: 6, border: "1px solid #C5CAE9", background: "#fff", cursor: "pointer", fontSize: 11, color: "#3949AB", fontFamily: "inherit" }}>
                Copy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [saved, setSaved]     = useState([]);
  const [applied, setApplied] = useState([]);
  const [tab, setTab]         = useState("search");
  const [query, setQuery]     = useState("Senior Frontend Engineer");
  const [minScore, setMinScore] = useState(0);
  const [fetched, setFetched] = useState(false);

  const fetchJobs = useCallback(async (q) => {
    const searchQ = q || query;
    console.log("[Frontend] Fetching with query:", searchQ);
    
    setLoading(true); setError(""); setJobs([]); setFetched(false);
    try {
      const url = `${API_BASE}/api/jobs?query=${encodeURIComponent(searchQ)}`;
      console.log("[Frontend] Request URL:", url);
      
      const res = await fetch(url);
      console.log("[Frontend] Response status:", res.status);
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log("[Frontend] Received data:", data);
      
      if (data.error) throw new Error(data.error);
      if (!data.data) throw new Error("No jobs data in response");
      
      const scored = (data.data || []).map((j) => ({ ...j, ...scoreJob(j) })).sort((a, b) => b.score - a.score);
      setJobs(scored);
      setFetched(true);
    } catch (e) { 
      console.error("[Frontend] Error:", e.message);
      setError(e.message); 
    }
    setLoading(false);
  }, [query]);

  const toggle = (list, setList, job) =>
    setList((prev) => prev.find((j) => j.job_id === job.job_id) ? prev.filter((j) => j.job_id !== job.job_id) : [...prev, job]);

  const filtered = jobs.filter((j) => j.score >= minScore);

  return (
    <div style={{ minHeight: "100vh", background: "#F0F4F8" }}>
      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg,#1A2B4A 0%,#1F4E79 100%)", padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#4FC3F7,#0288D1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 15 }}>AG</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>UAE Live Job Tracker</div>
              <div style={{ color: "#90CAF9", fontSize: 12 }}>Amr Gamal · Senior Frontend Engineer & Team Lead</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["search","🔍 Search"],["saved","🔖 Saved"],["applied","✅ Applied"]].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, background: tab === t ? "#4FC3F7" : "rgba(255,255,255,0.12)", color: tab === t ? "#1A2B4A" : "#fff" }}>
                {label}{t === "saved" && saved.length > 0 ? ` (${saved.length})` : ""}{t === "applied" && applied.length > 0 ? ` (${applied.length})` : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[["Live Results", jobs.length, "#4FC3F7"],["High Match 80+", jobs.filter(j=>j.score>=80).length, "#69F0AE"],["Saved", saved.length, "#FFD740"],["Applied", applied.length, "#FF80AB"]].map(([l, v, c]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 18px", borderLeft: `3px solid ${c}` }}>
              <div style={{ color: c, fontWeight: 700, fontSize: 22, fontFamily: "'DM Mono', monospace" }}>{v}</div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 28px" }}>
        {/* ── Search Tab ── */}
        {tab === "search" && (
          <>
            <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
                placeholder="e.g. Senior Frontend Engineer"
                style={{ flex: 1, minWidth: 200, padding: "10px 14px", borderRadius: 8, border: "1.5px solid #E0E7EF", fontFamily: "inherit", fontSize: 13, outline: "none" }} />
              <button onClick={() => fetchJobs()} disabled={loading}
                style={{ padding: "10px 24px", borderRadius: 8, background: "linear-gradient(135deg,#1F4E79,#2196F3)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Searching…" : "Search Live Jobs"}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#888", whiteSpace: "nowrap" }}>Min: {minScore}%</span>
                <input type="range" min={0} max={80} step={10} value={minScore} onChange={(e) => setMinScore(+e.target.value)} style={{ width: 80 }} />
              </div>
            </div>

            {/* Quick searches */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {QUICK_SEARCHES.map((q) => (
                <button key={q} onClick={() => { setQuery(q); fetchJobs(q); }}
                  style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid #C5D9F1", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#1F4E79", fontFamily: "inherit" }}>
                  {q}
                </button>
              ))}
            </div>

            {error && <div style={{ background: "#FFEBEE", color: "#C62828", padding: 14, borderRadius: 10, marginBottom: 14, fontSize: 13 }}>⚠️ {error}</div>}

            {!fetched && !loading && (
              <div style={{ textAlign: "center", padding: 80, color: "#aaa" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <div style={{ fontWeight: 600, color: "#888", fontSize: 15 }}>Click "Search Live Jobs" to fetch real UAE positions</div>
                <div style={{ fontSize: 13, marginTop: 8 }}>Pulls live data from LinkedIn, Indeed, Glassdoor & more</div>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: "center", padding: 80, color: "#999" }}>
                <div style={{ fontSize: 13, color: "#1F4E79", fontWeight: 600 }}>Scanning live UAE job boards…</div>
              </div>
            )}

            {fetched && !loading && (
              <>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 12, fontWeight: 500 }}>
                  {filtered.length} live positions · sorted by match score
                </div>
                {filtered.length === 0
                  ? <div style={{ textAlign: "center", padding: 40, color: "#bbb" }}>No jobs above {minScore}% match. Lower the filter.</div>
                  : filtered.map((job) => (
                      <JobCard key={job.job_id} job={job}
                        isSaved={!!saved.find(j => j.job_id === job.job_id)}
                        isApplied={!!applied.find(j => j.job_id === job.job_id)}
                        onSave={() => toggle(saved, setSaved, job)}
                        onApply={() => toggle(applied, setApplied, job)} />
                    ))
                }
              </>
            )}
          </>
        )}

        {/* ── Saved Tab ── */}
        {tab === "saved" && (
          <>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 14, fontWeight: 500 }}>{saved.length} saved positions</div>
            {saved.length === 0
              ? <div style={{ textAlign: "center", padding: 60, color: "#bbb" }}>No saved jobs yet. Click 🔖 on any job.</div>
              : saved.map((job) => (
                  <JobCard key={job.job_id} job={job}
                    isSaved={true}
                    isApplied={!!applied.find(j => j.job_id === job.job_id)}
                    onSave={() => toggle(saved, setSaved, job)}
                    onApply={() => toggle(applied, setApplied, job)} />
                ))
            }
          </>
        )}

        {/* ── Applied Tab ── */}
        {tab === "applied" && (
          <>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 14, fontWeight: 500 }}>{applied.length} applications tracked</div>
            {applied.length === 0
              ? <div style={{ textAlign: "center", padding: 60, color: "#bbb" }}>No applications tracked yet. Click ✅ after applying.</div>
              : applied.map((job) => (
                  <div key={job.job_id} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderLeft: "4px solid #00C853", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#1A2B4A", fontSize: 15 }}>{job.job_title}</div>
                      <div style={{ color: "#666", fontSize: 13 }}>{job.employer_name} · {job.job_city || "UAE"}</div>
                      <div style={{ color: "#00897B", fontSize: 12, fontWeight: 600, marginTop: 4 }}>✅ Applied</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ background: scoreBg(job.score), color: scoreColor(job.score), fontWeight: 700, padding: "6px 12px", borderRadius: 8, fontFamily: "'DM Mono', monospace" }}>{job.score}%</div>
                      <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 14px", borderRadius: 8, background: "#1F4E79", color: "#fff", fontWeight: 600, fontSize: 12, textDecoration: "none" }}>View ↗</a>
                      <button onClick={() => toggle(applied, setApplied, job)} style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #FFCDD2", background: "#fff", cursor: "pointer", fontSize: 12, color: "#E53935", fontFamily: "inherit" }}>Remove</button>
                    </div>
                  </div>
                ))
            }
          </>
        )}
      </div>
    </div>
  );
}