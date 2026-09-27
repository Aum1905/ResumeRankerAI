import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";
const HEALTH_URL = `${API_BASE_URL}/health`;
const RANK_URL = `${API_BASE_URL}/rank-resumes`;

const TEMPLATE_JOB_DESCRIPTIONS = {
  "Python Developer":
    "We are hiring a Python Developer with experience in Machine Learning, NLP, SQL, FastAPI, Git, Docker, pandas, numpy, and scikit-learn. Required experience is 1-2 years.",
  "Backend Engineer":
    "We need a Backend Engineer with Python, Java, REST API, FastAPI, SQL, PostgreSQL, Git, GitHub, Docker, AWS, communication, teamwork, and problem solving. Required experience is 3+ years.",
  "Data Analyst":
    "We are looking for a Data Analyst with Python, SQL, Excel, Power BI, pandas, numpy, data analysis, data visualization, communication, teamwork, and problem solving. Required experience is 2 years.",
};

const NAV_ITEMS = [
  "Dashboard",
  "Job Description",
  "Resume Upload",
  "Skill Matching",
  "Experience Check",
  "AI Ranking",
  "Final Report",
];

const SCORE_FIELDS = [
  ["Semantic", "semantic_score"],
  ["Skills", "skill_score"],
  ["Experience", "experience_score"],
  ["Education", "education_score"],
];

const CSV_HEADERS = [
  "Rank",
  "Candidate Name",
  "File Name",
  "Final Score",
  "Semantic Score",
  "Skill Score",
  "Experience Score",
  "Education Score",
  "Matched Skills",
  "Missing Skills",
  "Recommendation",
  "Reason",
];

function getInitialTheme() {
  try {
    return localStorage.getItem("smarthire-theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function formatScore(value) {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? "0.00%" : `${numberValue.toFixed(2)}%`;
}

function clampScore(value) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, numberValue));
}

function splitList(value) {
  if (!value || String(value).trim().toLowerCase() === "none") {
    return [];
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeCsvValue(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isSupportedResume(file) {
  const fileName = file.name.toLowerCase();
  return fileName.endsWith(".pdf") || fileName.endsWith(".docx");
}

function getRecommendationClass(recommendation) {
  if (recommendation === "Shortlist") {
    return "status-shortlist";
  }

  if (recommendation === "Maybe Review") {
    return "status-review";
  }

  return "status-reject";
}

function getDisplayName(candidate) {
  return candidate?.candidate_name || candidate?.file_name || "-";
}

function LogoBlock({ compact = false }) {
  return (
    <div className={compact ? "brand compact" : "brand"}>
      <div className="brand-mark">AI</div>
      <div>
        <div className="brand-title">SmartHire AI</div>
        <div className="brand-subtitle">Resume Ranking</div>
      </div>
    </div>
  );
}

function ThemeToggle({ onToggle, theme }) {
  return (
    <button className="theme-toggle" onClick={onToggle} type="button">
      <span className={theme === "dark" ? "toggle-dot dark" : "toggle-dot"} />
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}

function StatusDot({ status }) {
  return <span className={status === "connected" ? "dot connected" : "dot warning"} />;
}

function BackendStatusPill({ status }) {
  const label = {
    checking: "Checking Backend",
    connected: "Backend Connected",
    offline: "Backend Offline",
  }[status];

  return (
    <span className="status-pill">
      <StatusDot status={status} />
      {label}
    </span>
  );
}

function RecommendationBadge({ recommendation }) {
  return (
    <span className={`recommendation-badge ${getRecommendationClass(recommendation)}`}>
      {recommendation || "Not Recommended"}
    </span>
  );
}

function ScorePill({ value }) {
  return <span className="score-pill">{formatScore(value)}</span>;
}

function SkillChips({ limit, type = "matched", value }) {
  const skills = splitList(value);
  const visibleSkills = limit ? skills.slice(0, limit) : skills;
  const hiddenCount = limit ? Math.max(skills.length - visibleSkills.length, 0) : 0;
  const chipClass = type === "missing" ? "skill-chip missing" : "skill-chip";

  if (skills.length === 0) {
    return <span className="skill-chip muted">None</span>;
  }

  return (
    <>
      {visibleSkills.map((skill) => (
        <span className={chipClass} key={`${type}-${skill}`}>
          {skill}
        </span>
      ))}
      {hiddenCount > 0 && <span className="skill-chip muted">+{hiddenCount} more</span>}
    </>
  );
}

function LandingPage({ backendStatus, onOpenDashboard, onToggleTheme, theme }) {
  return (
    <main className="landing-page">
      <div className="landing-orb landing-orb-blue" />
      <div className="landing-orb landing-orb-cyan" />

      <nav className="landing-nav glass-nav">
        <div className="landing-brand">
          <div className="landing-brand-mark">AI</div>
          <span>SMARTHIRE AI</span>
        </div>
        <div className="landing-nav-actions">
          <a href="#features">Features</a>
          <a href="#technology">Technology</a>
          <button className="landing-nav-cta" onClick={onOpenDashboard} type="button">
            Get Started
          </button>
          <BackendStatusPill status={backendStatus} />
          <button className="landing-link-button" onClick={onOpenDashboard} type="button">
            Open Dashboard
          </button>
        </div>
      </nav>

      <section className="hero-grid">
        <div className="hero-copy landing-fade-up">
          <span className="landing-kicker">AI Resume Screening Platform</span>
          <div className="landing-brand-headline">SMART HIRE AI</div>
          <h1>Resume Ranking for Faster Hiring</h1>
          <p>
            Upload resumes, compare them with a job description, and generate
            explainable candidate rankings using a local FastAPI model server.
          </p>
          <div className="hero-actions">
            <button className="landing-primary-button" onClick={onOpenDashboard} type="button">
              RANKING DEMO
            </button>
            <a className="landing-secondary-button" href="#technology">
              EXPLORE ARCHITECTURE
            </a>
          </div>
        </div>

        <div className="preview-card landing-preview-card landing-fade-up" aria-label="Business dashboard preview">
          <div className="preview-header">
            <div>
              <span className="panel-label">Dashboard Preview</span>
              <strong>Candidate ranking overview</strong>
            </div>
            <RecommendationBadge recommendation="Shortlist" />
          </div>
          <div className="preview-metrics">
            <PreviewMetric label="Final Score" value="86.4%" />
            <PreviewMetric label="Semantic" value="79.9%" />
            <PreviewMetric label="Skills" value="100%" />
            <PreviewMetric label="Outcome" value="Rank 1" />
          </div>
          <div className="preview-chart">
            {[78, 92, 64, 84, 73].map((height, index) => (
              <span key={`${height}-${index}`} style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="preview-candidate-row">
            <div>
              <strong>Ananya Sharma</strong>
              <span>Python, FastAPI, SQL, Machine Learning</span>
            </div>
            <ScorePill value={86.4} />
          </div>

          <div className="model-float-card">
            <strong>FastAPI & AI Model Server</strong>
            <div className="neural-mini" aria-hidden="true">
              <span className="node n1" />
              <span className="node n2" />
              <span className="node n3" />
              <span className="node n4" />
              <span className="node n5" />
              <span className="node n6" />
              <span className="node n7" />
              <span className="node n8" />
              <span className="line l1" />
              <span className="line l2" />
              <span className="line l3" />
              <span className="line l4" />
              <span className="line l5" />
              <span className="line l6" />
            </div>
          </div>
        </div>
      </section>

      <section className="feature-grid landing-feature-grid" id="features">
        <FeatureCard icon="DOC" title="Resume Parsing" text="PDF and DOCX resume text extraction." />
        <FeatureCard
          icon="NET"
          title="Semantic Matching"
          text="Sentence Transformer embeddings and cosine similarity."
        />
        <FeatureCard
          icon="SCORE"
          title="Hybrid Scoring"
          text="Semantic, skill, experience, and education scores combined."
        />
        <FeatureCard
          icon="AI"
          title="Explainable Results"
          text="Matched skills, missing skills, recommendation, and CSV export."
        />
      </section>

      <section className="steps-section landing-steps-panel">
        <div>
          <div className="section-kicker">How It Works</div>
          <h2>Screen resumes in four steps</h2>
        </div>
        <div className="steps-grid landing-steps-grid">
          {["Paste Job Description", "Upload Resumes", "Fast AI Matching", "Actionable Insights"].map(
            (step, index) => (
              <div className="step-card" key={step}>
                <span>{index + 1}</span>
                <strong>{step}</strong>
              </div>
            )
          )}
        </div>
      </section>

      <section className="technology-strip" id="technology">
        <div>
          <div className="section-kicker">Tech Stack</div>
          <h2>Local AI resume ranking pipeline</h2>
        </div>
        <div className="tech-stack-grid">
          <ArchitectureNode title="React Frontend" text="Dashboard and CSV export" />
          <ArchitectureNode title="FastAPI Backend" text="Resume upload endpoint" />
          <ArchitectureNode title="Ranking Engine" text="Hybrid scoring logic" />
          <ArchitectureNode title="Sentence Transformers" text="Semantic similarity model" />
        </div>
      </section>

      <footer className="landing-footer">
        <span>&copy; SmartHire AI</span>
        <span>Resume Ranking Framework</span>
        <span>B.Tech AI Lab Project</span>
      </footer>
    </main>
  );
}

function PreviewMetric({ label, value }) {
  return (
    <div className="preview-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <article className="feature-card">
      <span className="feature-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function ArchitectureNode({ title, text }) {
  return (
    <div className="architecture-node">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function DashboardSidebar({ onBackHome, onToggleTheme, theme }) {
  return (
    <aside className="dashboard-sidebar">
      <div>
        <LogoBlock compact />
        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {NAV_ITEMS.map((item, index) => (
            <div className={index === 0 ? "nav-item active" : "nav-item"} key={item}>
              {item}
            </div>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <ThemeToggle onToggle={onToggleTheme} theme={theme} />
        <button className="sidebar-home-button" onClick={onBackHome} type="button">
          Back to Home
        </button>
        <div className="formula-card">
          <h3>Scoring Formula</h3>
          <p>
            60% Semantic Similarity
            <br />
            + 25% Skill Match
            <br />
            + 10% Experience
            <br />
            + 5% Education
          </p>
        </div>
      </div>
    </aside>
  );
}

function DashboardHeader({ backendStatus, onBackHome }) {
  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Resume Ranking Dashboard</h1>
          <p>Compare resumes with a job description and generate explainable AI rankings.</p>
        </div>
        <div className="dashboard-header-actions">
          <div className="status-pills">
            <BackendStatusPill status={backendStatus} />
            <span className="status-pill">FastAPI Backend</span>
            <span className="status-pill">Sentence Transformers</span>
            <span className="status-pill">Hybrid Scoring</span>
          </div>
          <button className="ghost-button compact-button" onClick={onBackHome} type="button">
            Back to Home
          </button>
        </div>
      </header>

      {backendStatus === "offline" && (
        <div className="warning-banner" role="status">
          Backend server is not running. Start it using:
          <code>python -m uvicorn api:app --reload</code>
        </div>
      )}
    </>
  );
}

function FileUpload({ files, onFilesAdded, onRemoveFile }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    onFilesAdded(Array.from(event.dataTransfer.files));
  }

  return (
    <div>
      <button
        className={isDragging ? "upload-card active" : "upload-card"}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        type="button"
      >
        <span className="upload-icon" aria-hidden="true">UP</span>
        <span className="upload-title">Drop resumes here</span>
        <span className="upload-copy">or choose multiple PDF/DOCX files from your device</span>
        <span className="upload-action">Choose files</span>
      </button>

      <input
        accept=".pdf,.docx"
        className="hidden-input"
        multiple
        onChange={(event) => {
          onFilesAdded(Array.from(event.target.files || []));
          event.target.value = "";
        }}
        ref={inputRef}
        type="file"
      />

      <div className="file-list" aria-live="polite">
        {files.length === 0 ? (
          <span className="file-empty">No resumes selected</span>
        ) : (
          files.map((file, index) => (
            <span className="file-chip" key={`${file.name}-${file.size}-${index}`}>
              <span>
                <strong>{file.name}</strong>
                <small>{formatFileSize(file.size)}</small>
              </span>
              <button
                aria-label={`Remove ${file.name}`}
                onClick={() => onRemoveFile(index)}
                type="button"
              >
                x
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function CreateRankingCard({
  backendStatus,
  error,
  files,
  jobDescription,
  loading,
  onFilesAdded,
  onJobDescriptionChange,
  onRank,
  onRemoveFile,
}) {
  return (
    <section className="dashboard-card create-ranking-card">
      <div className="card-title-row">
        <div>
          <h2>Create Ranking</h2>
          <p>Set role requirements, upload resumes, and run AI-based ranking.</p>
        </div>
      </div>

      <div className="input-grid">
        <div className="sub-card">
          <h3>Job Description</h3>
          <p>Paste hiring requirements or choose a template.</p>
          <textarea
            aria-label="Job Description"
            onChange={(event) => onJobDescriptionChange(event.target.value)}
            placeholder="Paste the job description here..."
            value={jobDescription}
          />
        </div>

        <div className="sub-card">
          <h3>Upload Resumes</h3>
          <p>Upload multiple PDF or DOCX resumes.</p>
          <FileUpload files={files} onFilesAdded={onFilesAdded} onRemoveFile={onRemoveFile} />
        </div>
      </div>

      <div className="template-area">
        <span className="panel-label">Templates</span>
        <div className="template-row">
          {Object.keys(TEMPLATE_JOB_DESCRIPTIONS).map((templateName) => (
            <button
              className="secondary-button"
              key={templateName}
              onClick={() => onJobDescriptionChange(TEMPLATE_JOB_DESCRIPTIONS[templateName])}
              type="button"
            >
              {templateName}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}

      <div className="action-row">
        <div className="action-meta">
          <span>
            <StatusDot status={backendStatus} />
            {backendStatus === "connected" ? "Backend connected" : "Backend offline"}
          </span>
          <span>
            {files.length} selected resume{files.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="rank-action">
          {loading && <span className="processing-text">Sending resumes to FastAPI.</span>}
          <button className="primary-button" disabled={loading} onClick={onRank} type="button">
            {loading ? (
              <>
                <span className="spinner" />
                Analyzing resumes...
              </>
            ) : (
              "Rank Resumes"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ action, subtitle, title }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function ResultsSummary({ summary }) {
  return (
    <section>
      <SectionHeader title="Results Summary" />
      <div className="metric-grid">
        <MetricCard label="Total Resumes" value={summary?.total_resumes ?? 0} />
        <MetricCard label="Best Match" value={summary?.best_resume || "-"} />
        <MetricCard label="Highest Score" value={<ScorePill value={summary?.highest_score} />} />
        <MetricCard
          label="Recommendation"
          value={<RecommendationBadge recommendation={summary?.recommendation} />}
        />
      </div>
    </section>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function VisualAnalytics({ results }) {
  const topCandidate = results[0];
  const distribution = results.reduce(
    (counts, result) => {
      if (result.recommendation === "Shortlist") {
        counts.shortlist += 1;
      } else if (result.recommendation === "Maybe Review") {
        counts.review += 1;
      } else {
        counts.reject += 1;
      }

      return counts;
    },
    { shortlist: 0, review: 0, reject: 0 }
  );
  const total = Math.max(results.length, 1);

  return (
    <section>
      <SectionHeader
        title="Visual Analytics"
        subtitle="Charts are generated from the current ranking response."
      />
      <div className="analytics-grid">
        <article className="chart-card">
          <h3>Score Breakdown</h3>
          <p>Top candidate component scores</p>
          <div className="horizontal-bars">
            {SCORE_FIELDS.map(([label, field]) => (
              <div className="bar-row" key={field}>
                <div>
                  <span>{label}</span>
                  <strong>{formatScore(topCandidate?.[field])}</strong>
                </div>
                <div className="bar-track">
                  <span style={{ width: `${clampScore(topCandidate?.[field])}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="chart-card comparison-chart-card">
          <h3>Candidate Score Comparison</h3>
          <p>Final score by ranked candidate</p>
          <div className="vertical-chart">
            {results.map((result) => (
              <div className="vertical-bar-item" key={`${result.rank}-${result.file_name}`}>
                <div className="vertical-bar-shell">
                  <span style={{ height: `${clampScore(result.final_score)}%` }} />
                </div>
                <strong>{formatScore(result.final_score)}</strong>
                <small title={getDisplayName(result)}>{getDisplayName(result)}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="chart-card distribution-chart-card">
          <h3>Recommendation Distribution</h3>
          <p>Current candidate outcomes</p>
          <div className="distribution-bar">
            <span
              className="dist-shortlist"
              style={{ width: `${(distribution.shortlist / total) * 100}%` }}
            />
            <span
              className="dist-review"
              style={{ width: `${(distribution.review / total) * 100}%` }}
            />
            <span
              className="dist-reject"
              style={{ width: `${(distribution.reject / total) * 100}%` }}
            />
          </div>
          <div className="distribution-list">
            <DistributionItem label="Shortlist" value={distribution.shortlist} />
            <DistributionItem label="Maybe Review" value={distribution.review} />
            <DistributionItem label="Not Recommended" value={distribution.reject} />
          </div>
        </article>
      </div>
    </section>
  );
}

function DistributionItem({ label, value }) {
  return (
    <div className="distribution-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TopCandidateInsight({ candidate }) {
  if (!candidate) {
    return null;
  }

  return (
    <section>
      <SectionHeader
        title="Top Candidate Insight"
        subtitle="Highest ranked resume based on the final hybrid score."
      />
      <div className="insight-card">
        <div className="insight-grid">
          <div className="insight-block">
            <span className="panel-label">Candidate</span>
            <strong className="candidate-name">{getDisplayName(candidate)}</strong>
            {candidate.file_name && (
              <span className="candidate-file-name">{candidate.file_name}</span>
            )}
            <div className="inline-wrap">
              <ScorePill value={candidate.final_score} />
              <RecommendationBadge recommendation={candidate.recommendation} />
            </div>
          </div>

          <div className="insight-block">
            <span className="panel-label">Matched Skills</span>
            <div className="chip-wrap">
              <SkillChips limit={5} value={candidate.matched_skills} />
            </div>
          </div>

          <div className="insight-block">
            <span className="panel-label">Missing Skills</span>
            <div className="chip-wrap">
              <SkillChips limit={5} type="missing" value={candidate.missing_skills} />
            </div>
          </div>

          <div className="reason-panel">
            <span className="panel-label">Recommendation Reason</span>
            <div className="reason-box">{candidate.reason}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RankedResultsTable({ onDownloadCsv, results }) {
  return (
    <section>
      <SectionHeader
        action={
          <button className="download-button" onClick={onDownloadCsv} type="button">
            Download CSV
          </button>
        }
        title="Ranked Results"
      />
      <div className="table-card">
        <table className="ranked-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Candidate</th>
              <th>Final Score</th>
              <th>Semantic</th>
              <th>Skills</th>
              <th>Experience</th>
              <th>Education</th>
              <th>Matched Skills</th>
              <th>Missing Skills</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={`${result.rank}-${result.file_name}`}>
                <td>{result.rank}</td>
                <td className="file-name-cell">
                  <strong>{getDisplayName(result)}</strong>
                  <small>{result.file_name}</small>
                </td>
                <td>
                  <ScorePill value={result.final_score} />
                </td>
                <td>{formatScore(result.semantic_score)}</td>
                <td>{formatScore(result.skill_score)}</td>
                <td>{formatScore(result.experience_score)}</td>
                <td>{formatScore(result.education_score)}</td>
                <td className="skills-cell">
                  <SkillChips limit={3} value={result.matched_skills} />
                </td>
                <td className="skills-cell">
                  <SkillChips limit={3} type="missing" value={result.missing_skills} />
                </td>
                <td>
                  <RecommendationBadge recommendation={result.recommendation} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CandidateExplanations({ expandedCandidate, onToggleCandidate, results }) {
  return (
    <section>
      <SectionHeader title="Candidate Explanations" />
      <div className="accordion-list">
        {results.map((result) => (
          <CandidateAccordion
            isOpen={expandedCandidate === result.rank}
            key={`${result.rank}-${result.file_name}`}
            onToggle={() =>
              onToggleCandidate(expandedCandidate === result.rank ? null : result.rank)
            }
            result={result}
          />
        ))}
      </div>
    </section>
  );
}

function CandidateAccordion({ isOpen, onToggle, result }) {
  return (
    <article className={isOpen ? "accordion-card open" : "accordion-card"}>
      <button className="accordion-title" onClick={onToggle} type="button">
        <span>
          Rank {result.rank} &middot; {getDisplayName(result)} &middot;{" "}
          {formatScore(result.final_score)} &middot;{" "}
          {result.recommendation}
        </span>
        <span>{isOpen ? "-" : "+"}</span>
      </button>

      <div className="accordion-panel">
        <div className="score-grid">
          {[["Final Score", "final_score"], ...SCORE_FIELDS].map(([label, field]) => (
            <div className="score-card" key={field}>
              <span>{label}</span>
              <strong>{formatScore(result[field])}</strong>
            </div>
          ))}
        </div>

        <div className="accordion-detail-grid">
          <div>
            <span className="panel-label">File Name</span>
            <div className="reason-box compact-reason">{result.file_name}</div>
          </div>
          <div>
            <span className="panel-label">Matched Skills</span>
            <div className="chip-wrap">
              <SkillChips value={result.matched_skills} />
            </div>
          </div>
          <div>
            <span className="panel-label">Missing Skills</span>
            <div className="chip-wrap">
              <SkillChips type="missing" value={result.missing_skills} />
            </div>
          </div>
          <div>
            <span className="panel-label">Recommendation</span>
            <div className="chip-wrap">
              <RecommendationBadge recommendation={result.recommendation} />
            </div>
          </div>
        </div>

        <div className="accordion-reason">
          <span className="panel-label">Reason</span>
          <div className="reason-box">{result.reason}</div>
        </div>
      </div>
    </article>
  );
}

function DashboardView({
  backendStatus,
  error,
  expandedCandidate,
  files,
  jobDescription,
  loading,
  onBackHome,
  onDownloadCsv,
  onFilesAdded,
  onJobDescriptionChange,
  onRank,
  onRemoveFile,
  onToggleCandidate,
  onToggleTheme,
  results,
  summary,
  successMessage,
  theme,
}) {
  return (
    <div className="dashboard-shell">
      <DashboardSidebar onBackHome={onBackHome} onToggleTheme={onToggleTheme} theme={theme} />

      <main className="dashboard-main">
        <DashboardHeader backendStatus={backendStatus} onBackHome={onBackHome} />
        <CreateRankingCard
          backendStatus={backendStatus}
          error={error}
          files={files}
          jobDescription={jobDescription}
          loading={loading}
          onFilesAdded={onFilesAdded}
          onJobDescriptionChange={onJobDescriptionChange}
          onRank={onRank}
          onRemoveFile={onRemoveFile}
        />

        {successMessage && (
          <div className="notice success" role="status">
            {successMessage}
          </div>
        )}

        {summary && results.length > 0 && (
          <>
            <ResultsSummary summary={summary} />
            <VisualAnalytics results={results} />
            <TopCandidateInsight candidate={results[0]} />
            <RankedResultsTable onDownloadCsv={onDownloadCsv} results={results} />
            <CandidateExplanations
              expandedCandidate={expandedCandidate}
              onToggleCandidate={onToggleCandidate}
              results={results}
            />
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  const [backendStatus, setBackendStatus] = useState("checking");
  const [currentView, setCurrentView] = useState("landing");
  const [error, setError] = useState("");
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [summary, setSummary] = useState(null);
  const [theme, setTheme] = useState(getInitialTheme);

  const appClassName = useMemo(
    () => `product-app ${currentView === "landing" ? "landing-mode" : "dashboard-mode"}`,
    [currentView]
  );

  useEffect(() => {
    try {
      localStorage.setItem("smarthire-theme", theme);
    } catch {
      // Theme persistence is optional.
    }
  }, [theme]);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  useEffect(() => {
    if (currentView === "dashboard") {
      checkBackendHealth();
    }
  }, [currentView]);

  async function checkBackendHealth() {
    setBackendStatus("checking");

    try {
      const response = await fetch(HEALTH_URL);
      setBackendStatus(response.ok ? "connected" : "offline");
    } catch {
      setBackendStatus("offline");
    }
  }

  function addFiles(newFiles) {
    const incomingFiles = Array.isArray(newFiles) ? newFiles : [];
    setError("");

    const unsupportedFiles = incomingFiles.filter((file) => !isSupportedResume(file));
    const supportedFiles = incomingFiles.filter(isSupportedResume);

    if (unsupportedFiles.length > 0) {
      setError("Only PDF and DOCX resume files are supported.");
    }

    if (supportedFiles.length === 0) {
      return;
    }

    setSelectedFiles((currentFiles) => {
      const existingKeys = new Set(
        currentFiles.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
      );
      const uniqueFiles = supportedFiles.filter(
        (file) => !existingKeys.has(`${file.name}-${file.size}-${file.lastModified}`)
      );

      return [...currentFiles, ...uniqueFiles];
    });
  }

  function removeFile(indexToRemove) {
    setSelectedFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== indexToRemove)
    );
  }

  async function rankResumes() {
    setError("");
    setSuccessMessage("");

    if (!jobDescription.trim()) {
      setError("Add a job description before ranking.");
      return;
    }

    if (selectedFiles.length === 0) {
      setError("Upload at least one PDF or DOCX resume.");
      return;
    }

    if (backendStatus !== "connected") {
      setError("Start FastAPI backend before ranking.");
      return;
    }

    const formData = new FormData();
    formData.append("job_description", jobDescription);
    selectedFiles.forEach((file) => formData.append("resumes", file));

    setExpandedCandidate(null);
    setLoading(true);
    setResults([]);
    setSummary(null);

    try {
      const response = await fetch(RANK_URL, {
        body: formData,
        method: "POST",
      });

      if (!response.ok) {
        let detail = "Ranking request failed.";

        try {
          const errorData = await response.json();
          detail = errorData.detail || detail;
        } catch {
          detail = await response.text();
        }

        throw new Error(detail);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.results) || !data.summary) {
        throw new Error("The backend returned an empty or invalid ranking response.");
      }

      if (data.results.length === 0) {
        throw new Error("No readable resume text was found in the uploaded files.");
      }

      setResults(data.results);
      setSummary(data.summary);
      setExpandedCandidate(data.results[0]?.rank ?? null);
      setSuccessMessage("Ranking complete. Results are sorted by final score.");
    } catch (requestError) {
      setError(requestError.message || "Could not rank resumes. Check the backend.");
    } finally {
      setLoading(false);
    }
  }

  function downloadCsv() {
    const rows = results.map((result) => [
      result.rank,
      result.candidate_name || "",
      result.file_name,
      formatScore(result.final_score),
      formatScore(result.semantic_score),
      formatScore(result.skill_score),
      formatScore(result.experience_score),
      formatScore(result.education_score),
      result.matched_skills,
      result.missing_skills,
      result.recommendation,
      result.reason,
    ]);
    const csvContent = [CSV_HEADERS, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "resume_ranking_results.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className={appClassName} data-theme={theme}>
      {currentView === "landing" ? (
        <LandingPage
          backendStatus={backendStatus}
          onOpenDashboard={() => setCurrentView("dashboard")}
          onToggleTheme={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
          theme={theme}
        />
      ) : (
        <DashboardView
          backendStatus={backendStatus}
          error={error}
          expandedCandidate={expandedCandidate}
          files={selectedFiles}
          jobDescription={jobDescription}
          loading={loading}
          onBackHome={() => setCurrentView("landing")}
          onDownloadCsv={downloadCsv}
          onFilesAdded={addFiles}
          onJobDescriptionChange={setJobDescription}
          onRank={rankResumes}
          onRemoveFile={removeFile}
          onToggleCandidate={setExpandedCandidate}
          onToggleTheme={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
          results={results}
          summary={summary}
          successMessage={successMessage}
          theme={theme}
        />
      )}
    </div>
  );
}

export default App;
