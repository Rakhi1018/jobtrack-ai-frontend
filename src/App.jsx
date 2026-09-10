import { useEffect, useMemo, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
import mammoth from "mammoth";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Lightbulb,
  MapPin,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  X,
  Zap,
} from "lucide-react";
import "./App.css";

const API_URL
    = "http://localhost:8080/api/jobs";

const initialResume= `Java Backend Developer

Skills
Java, Spring Boot, SQL, MySQL, REST API, Git, HTML, CSS, JavaScript

Projects
Built a JobTrack AI application using React, Spring Boot and MySQL.
    Created REST APIs for creating, reading, updating and deleting job applications.

    Education
Bachelor's degree in Computer Science.`;

const initialJobDescription = "";

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "applications", label: "Applications", icon: BriefcaseBusiness },
  { id: "resume", label: "Resume Analyzer", icon: FileText, badge: "84 ATS" },
  { id: "matcher", label: "Job Matcher", icon: Target, badge: "Match" },
  { id: "builder", label: "Resume Builder", icon: FileText },
  { id: "interviews", label: "Interviews", icon: CalendarDays, badge: "3" },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
];

const keywords = [
  // Programming languages
  "java",
  "python",
  "javascript",
  "typescript",
  "c++",
  "c#",

  // Backend
  "spring boot",
  "spring mvc",
  "hibernate",
  "node.js",
  "express",
  "rest api",
  "microservices",

  // Databases
  "sql",
  "mysql",
  "postgresql",
  "mongodb",
  "oracle",

  // Core concepts
  "oop",
  "data structures",
  "algorithms",
  "dsa",
  "problem solving",
  "object oriented",

  // Tools & development
  "git",
  "github",
  "gitlab",
  "maven",
  "gradle",
  "junit",
  "docker",
  "aws",
  "azure",

  // Frontend
  "react",
  "angular",
  "html",
  "css",
  "bootstrap",
  "tailwind",

  // Professional skills
  "debugging",
  "testing",
  "unit testing",
  "communication",
  "leadership",
  "teamwork",

  // Job titles
  "software engineer",
  "software developer",
  "backend developer",
  "full stack developer"
];

function containsKeyword(text, keyword) {
  const normalizedText = text
      .toLowerCase()
      .replace(/[-_/]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const normalizedKeyword = keyword
      .toLowerCase()
      .replace(/[-_/]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  if (!normalizedKeyword) {
    return false;
  }

  if (normalizedText.includes(normalizedKeyword)) {
    return true;
  }

  // Handle common plural forms such as API/APIs, developer/developers
  const singularKeyword = normalizedKeyword.replace(/s$/, "");

  if (
      singularKeyword.length >= 4 &&
      normalizedText.includes(singularKeyword)
  ) {
    return true;
  }

  // Handle common word variations
  const variations = {
    development: ["develop", "developer", "developers", "developing"],
    developer: ["development", "develop", "developers", "developing"],
    api: ["apis"],
    database: ["databases"],
    test: ["testing", "tests", "tested"],
    testing: ["test", "tests", "tested"],
    engineer: ["engineering", "engineers"],
    engineering: ["engineer", "engineers"],
  };

  const keywordVariations = variations[normalizedKeyword] || [];

  return keywordVariations.some((variation) =>
      normalizedText.includes(variation)
  );
}

function App() {
  const [page, setPage] = useState("dashboard");
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [resumeText, setResumeText] = useState(initialResume);
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [resumeScore, setResumeScore] = useState(0);
  const [analyzed, setAnalyzed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("jobtrack-dark-mode") !== "false";
  });
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem("jobtrack-notifications") !== "false";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("light-mode", !darkMode);
    localStorage.setItem("jobtrack-dark-mode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("jobtrack-notifications", String(notifications));
  }, [notifications]);

  const [form, setForm] = useState({
    company: "",
    role: "",
    location: "",
    jobType: "Full-time",
    appliedDate: new Date().toISOString().split("T")[0],
    status: "Applied",
    salary: "",
    jobUrl: "",
    recruiterName: "",
    recruiterEmail: "",
    notes: "",
    jobDescription: "",
    atsMatch: 0,
  });

  async function fetchJobs() {
    try {

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load applications");
      }

      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoadingJobs(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchJobs();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  async function addApplication(event) {
    event.preventDefault();

    if (!form.company.trim() || !form.role.trim()) {
      alert("Please enter Company Name and Job Role.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          atsMatch: Number(form.atsMatch) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add application");
      }

      const savedJob = await response.json();

      setJobs((current) => [...current, savedJob]);
      setShowAddForm(false);

      setForm({
        company: "",
        role: "",
        location: "",
        jobType: "Full-time",
        appliedDate: new Date().toISOString().split("T")[0],
        status: "Applied",
        salary: "",
        jobUrl: "",
        recruiterName: "",
        recruiterEmail: "",
        notes: "",
        jobDescription: "",
        atsMatch: 0,
      });

      alert("Application added successfully!");
    } catch (error) {
      console.error(error);
      alert(
          "Could not add application. Please make sure Spring Boot is running."
      );
    }
  }

  async function deleteApplication(id) {
    if (!window.confirm("Delete this application?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete application");
      }

      setJobs((current) => current.filter((job) => job.id !== id));
    } catch (error) {
      console.error(error);
      alert("Could not delete the application.");
    }
  }

  async function updateApplicationStatus(job, newStatus) {
    try {
      const response = await fetch(`${API_URL}/${job.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...job,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update application status");
      }

      const updatedJob = await response.json();

      setJobs((current) =>
          current.map((item) =>
              item.id === updatedJob.id ? updatedJob : item
          )
      );
    } catch (error) {
      console.error(error);
      alert("Could not update application status.");
    }
  }

  function getResumeAnalysis() {
    const resume = resumeText || "";
    const jd = jobDescription || "";

    // Only keywords that actually appear in the job description
    // are counted in the ATS calculation.
    const jdKeywords = keywords.filter((keyword) =>
        containsKeyword(jd, keyword)
    );

    const matched = jdKeywords.filter((keyword) =>
        containsKeyword(resume, keyword)
    );

    const missing = jdKeywords.filter(
        (keyword) => !containsKeyword(resume, keyword)
    );

    const score =
        jdKeywords.length > 0
            ? Math.round((matched.length / jdKeywords.length) * 100)
            : 0;

    return {
      jdKeywords,
      matched,
      missing,
      score: Math.max(0, Math.min(score, 100)),
    };
  }

  function analyzeResume() {
    if (!resumeText.trim()) {
      alert("Please upload or paste your resume first.");
      setAnalyzed(false);
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please paste a job description before analyzing.");
      setAnalyzed(false);
      return;
    }

    const analysis = getResumeAnalysis();

    setResumeScore(analysis.score);
    setAnalyzed(true);
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  const filteredJobs = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (!search) {
      return jobs;
    }

    return jobs.filter((job) =>
        [
          job.company,
          job.role,
          job.location,
          job.status,
          job.jobType,
        ].some((value) => String(value || "").toLowerCase().includes(search))
    );
  }, [jobs, searchText]);

  const counts = useMemo(() => {
    return {
      total: jobs.length,
      applied: jobs.filter((job) => job.status === "Applied").length,
      assessment: jobs.filter((job) => job.status === "Assessment").length,
      interview: jobs.filter((job) => job.status === "Interview").length,
      offers: jobs.filter((job) => job.status === "Offer").length,
      rejected: jobs.filter((job) => job.status === "Rejected").length,
    };
  }, [jobs]);

  // Keep the displayed matched/missing counts identical to the
  // keywords used by analyzeResume().
  const resumeAnalysis = getResumeAnalysis();
  const matchedKeywords = resumeAnalysis.matched;
  const missingKeywords = resumeAnalysis.missing;

  function renderPage() {
    if (page === "dashboard") {
      return (
          <Dashboard
              jobs={jobs}
              counts={counts}
              setPage={setPage}
              setShowAddForm={setShowAddForm}
          />
      );
    }

    if (page === "applications") {
      return (
          <ApplicationsPage
              jobs={filteredJobs}
              counts={counts}
              searchText={searchText}
              setSearchText={setSearchText}
              setShowAddForm={setShowAddForm}
              deleteApplication={deleteApplication}
              updateApplicationStatus={updateApplicationStatus}
              loadingJobs={loadingJobs}
          />
      );
    }

    if (page === "resume") {
      return (
          <ResumeAnalyzer
              resumeText={resumeText}
              setResumeText={setResumeText}
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              resumeScore={resumeScore}
              analyzeResume={analyzeResume}
              analyzed={analyzed}
              setAnalyzed={setAnalyzed}
              matchedKeywords={matchedKeywords}
              missingKeywords={missingKeywords}
          />
      );
    }

    if (page === "matcher") {
      return <JobMatcher jobs={jobs} resumeText={resumeText} />;
    }

    if (page === "builder") {
      return <ResumeBuilder />;
    }

    if (page === "interviews") {
      return <InterviewsPage jobs={jobs} setPage={setPage} />;
    }

    if (page === "analytics") {
      return <AnalyticsPage counts={counts} jobs={jobs} />;
    }

    if (page === "settings") {
      return (
          <SettingsPage
              notifications={notifications}
              setNotifications={setNotifications}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
          />
      );
    }

    return null;
  }

  return (
      <div className={`app ${darkMode ? "dark-mode" : "light-mode"}`}>
        <Sidebar
            page={page}
            setPage={setPage}
            applicationCount={jobs.length}
        />

        <main className="main">
          <TopBar
              page={page}
              setShowAddForm={setShowAddForm}
          />

          {renderPage()}
        </main>

        {showAddForm && (
            <AddApplicationModal
                form={form}
                updateForm={updateForm}
                onSubmit={addApplication}
                onClose={() => setShowAddForm(false)}
            />
        )}
      </div>
  );
}

/* =========================================================
   SIDEBAR
   ========================================================= */

function Sidebar({
                   page,
                   setPage,
                   applicationCount,
                   interviewCount,
                 }) {
  return (
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">J</div>

          <div>
            <h2>JobTrack AI</h2>
            <span>PRO</span>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-label">WORKSPACE</div>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
                <button
                    key={item.id}
                    className={`nav-item ${page === item.id ? "active" : ""}`}
                    onClick={() => setPage(item.id)}
                >
                  <Icon size={18} />

                  <span>{item.label}</span>

                  {item.id === "applications" && applicationCount > 0 && (
                      <small className="nav-count">{applicationCount}</small>
                  )}

                  {item.id === "interviews" ? (
                      interviewCount > 0 && (
                          <small className="nav-count">{interviewCount}</small>
                      )
                  ) : (
                      item.badge && item.id !== "applications" && (
                          <small className="nav-count">{item.badge}</small>
                      )
                  )}
                </button>
            );
          })}

          <div className="nav-label settings-label">ACCOUNT</div>

          <button
              className={`nav-item ${page === "settings" ? "active" : ""}`}
              onClick={() => setPage("settings")}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">RV</div>

            <div>
              <strong>Rakesh Vynala</strong>
              <span>Job Seeker</span>
            </div>
          </div>
        </div>
      </aside>
  );
}

/* =========================================================
   TOP BAR
   ========================================================= */

function TopBar({ setShowAddForm }) {
  const [location, setLocation] = useState("Detecting...");

  useEffect(() => {
    let cancelled = false;

    function showFallbackLocation() {
      if (!cancelled) {
        setLocation("Location unavailable");
      }
    }

    if (!navigator.geolocation) {
      showFallbackLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );

            if (!response.ok) {
              throw new Error("Reverse geocoding failed");
            }

            const data = await response.json();
            const detectedLocation =
                data.city ||
                data.locality ||
                data.principalSubdivision ||
                data.countryName ||
                "Location unavailable";

            if (!cancelled) {
              setLocation(detectedLocation);
            }
          } catch (error) {
            console.error("Could not detect location name:", error);
            showFallbackLocation();
          }
        },
        (error) => {
          console.warn("Location permission/error:", error.message);
          showFallbackLocation();
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return (
      <div className="top-navigation">
        <div className="target-role">
          <span>Target role</span>
          <strong>Java Backend Developer</strong>
          <span className="target-location">
          <MapPin size={12} />
            {location}
        </span>
        </div>

        <div className="top-actions">
          <button className="icon-button" type="button">
            <Activity size={17} />
          </button>

          <button className="icon-button notification" type="button">
            <span />
            <Zap size={17} />
          </button>

          <button
              className="add-button"
              onClick={() => setShowAddForm(true)}
              type="button"
          >
            <Plus size={16} />
            Add Application
          </button>
        </div>
      </div>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */
function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good evening";
  }

  return "Good night";
}
function Dashboard({ jobs, counts, setPage, setShowAddForm }) {
  return (
      <div className="page-container">
        <section className="welcome-card">
          <div className="welcome-text">
            <div className="welcome-title">
              <h1>{getGreeting()}, Rakesh 👋</h1>

              <span className="streak-badge">
              🔥 Job Search Streak
            </span>
            </div>

            <p>
              Your job search at a glance. Track applications, optimize your
              resume for ATS bots, and prepare for interviews.
            </p>
          </div>

          <div className="welcome-actions">
            <button
                className="add-button"
                onClick={() => setShowAddForm(true)}
            >
              <Plus size={15} />
              Add Application
            </button>

            <button
                className="outline-button"
                onClick={() => setPage("resume")}
            >
              <FileText size={15} />
              Analyze Resume
            </button>
          </div>
        </section>

        <div className="stats-grid">
          <StatCard
              icon={<BriefcaseBusiness size={17} />}
              number={counts.total}
              title="Applications"
              subtitle="Your applications"
          />

          <StatCard
              icon={<FileText size={17} />}
              number={counts.assessment}
              title="Assessments"
              subtitle="Pending assessments"
          />

          <StatCard
              icon={<CalendarDays size={17} />}
              number={counts.interview}
              title="Interviews"
              subtitle="Upcoming interviews"
          />

          <StatCard
              icon={<CheckCircle2 size={17} />}
              number={counts.offers}
              title="Offers"
              subtitle="Great progress"
          />

          <div className="ats-card">
            <div className="ats-header">
              <div>
                <span>Resume ATS Score</span>
                <strong>
                  84<span>/100</span>
                </strong>
              </div>

              <div className="ats-circle">84%</div>
            </div>

            <div className="progress">
              <div style={{ width: "84%" }} />
            </div>

            <p>Excellent! Your resume is job-ready.</p>
          </div>
        </div>

        <div className="dashboard-grid">
          <section className="panel pipeline-panel">
            <div className="panel-header">
              <div>
                <h2>Job Application Pipeline</h2>
                <p>Real-time progress across all active applications.</p>
              </div>

              <button
                  className="view-button"
                  onClick={() => setPage("applications")}
              >
                View all
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="pipeline">
              <PipelineItem
                  number={counts.applied}
                  label="Applied"
                  type="applied"
              />

              <div className="pipeline-line" />

              <PipelineItem
                  number={counts.assessment}
                  label="Assessment"
                  type="assessment"
              />

              <div className="pipeline-line" />

              <PipelineItem
                  number={counts.interview}
                  label="Interview"
                  type="interview"
              />

              <div className="pipeline-line" />

              <PipelineItem
                  number={counts.offers}
                  label="Offer"
                  type="offer"
              />

              <div className="pipeline-line" />

              <PipelineItem
                  number={counts.rejected}
                  label="Rejected"
                  type="rejected"
              />
            </div>
          </section>

          <section className="panel quick-panel">
            <div className="panel-header">
              <div>
                <h2>Quick Actions</h2>
                <p>Speed up your job search.</p>
              </div>
            </div>

            <div className="quick-actions">
              <button onClick={() => setShowAddForm(true)}>
                <div className="quick-icon purple">
                  <Plus size={17} />
                </div>

                <div>
                  <strong>Add Application</strong>
                  <span>Track a new job</span>
                </div>

                <ArrowRight size={14} />
              </button>

              <button onClick={() => setPage("resume")}>
                <div className="quick-icon blue">
                  <FileText size={17} />
                </div>

                <div>
                  <strong>Analyze Resume</strong>
                  <span>Check your ATS score</span>
                </div>

                <ArrowRight size={14} />
              </button>

              <button onClick={() => setPage("matcher")}>
                <div className="quick-icon green">
                  <Target size={17} />
                </div>

                <div>
                  <strong>Match a Job</strong>
                  <span>Compare your resume</span>
                </div>

                <ArrowRight size={14} />
              </button>
            </div>
          </section>
        </div>

        <section className="panel applications-panel">
          <div className="panel-header">
            <div>
              <h2>Recent Applications</h2>
              <p>Latest jobs added to your tracker.</p>
            </div>

            <button
                className="view-button"
                onClick={() => setPage("applications")}
            >
              View all
              <ArrowRight size={12} />
            </button>
          </div>

          {jobs.length === 0 ? (
              <EmptyState
                  title="No applications yet"
                  text="Add your first job application to start tracking."
              />
          ) : (
              <ApplicationTable jobs={jobs.slice(-5).reverse()} />
          )}
        </section>
      </div>
  );
}

function StatCard({ icon, number, title, subtitle }) {
  return (
      <div className="stat-card">
        <div className="stat-top">
          <div className="stat-icon">{icon}</div>
          <TrendingUp className="trend" size={15} />
        </div>

        <h3>{number}</h3>
        <p>{title}</p>
        <small>{subtitle}</small>
      </div>
  );
}

function PipelineItem({ number, label, type }) {
  return (
      <div className="pipeline-item">
        <div className={`pipeline-number ${type}`}>{number}</div>
        <span>{label}</span>
      </div>
  );
}

/* =========================================================
   APPLICATIONS PAGE
   ========================================================= */

function ApplicationsPage({
                            jobs,
                            counts,
                            searchText,
                            setSearchText,
                            setShowAddForm,
                            deleteApplication,
                            updateApplicationStatus,
                            loadingJobs,
                          }) {
  return (
      <div className="applications-page">
        <div className="applications-title">
          <div>
            <h1>Applications</h1>
            <p>Track and manage all your job applications.</p>
          </div>

          <button
              className="add-button"
              onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} />
            Add Application
          </button>
        </div>

        <div className="application-summary">
          <SummaryCard number={counts.total} label="Total Applications" />
          <SummaryCard number={counts.applied} label="Applied" />
          <SummaryCard number={counts.assessment} label="Assessment" />
          <SummaryCard number={counts.interview} label="Interview" />
          <SummaryCard number={counts.offers} label="Offers" />
        </div>

        <div className="applications-toolbar">
          <div className="application-search">
            <Search size={17} />

            <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search company, role, location..."
            />
          </div>

          <button className="filter-button">
            All Applications
            <ChevronDown size={14} />
          </button>
        </div>

        {loadingJobs ? (
            <div className="loading-state">Loading applications...</div>
        ) : jobs.length === 0 ? (
            <EmptyState
                title="No applications found"
                text="Add your first job application."
            />
        ) : (
            <div className="applications-list">
              {jobs.map((job) => (
                  <ApplicationCard
                      key={job.id}
                      job={job}
                      deleteApplication={deleteApplication}
                      updateApplicationStatus={updateApplicationStatus}
                  />
              ))}
            </div>
        )}
      </div>
  );
}

function SummaryCard({ number, label }) {
  return (
      <div>
        <strong>{number}</strong>
        <span>{label}</span>
      </div>
  );
}

function ApplicationTable({ jobs }) {
  return (
      <div className="table">
        <div className="table-header">
          <span>COMPANY & ROLE</span>
          <span>LOCATION & TYPE</span>
          <span>APPLIED DATE</span>
          <span>STATUS</span>
          <span>ATS MATCH</span>
        </div>

        {jobs.map((job) => (
            <div className="table-row" key={job.id}>
              <div className="company-cell">
                <div className="company-logo">
                  {(job.company || "J").charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{job.company}</strong>
                  <span>{job.role}</span>
                </div>
              </div>

              <div className="location-cell">
            <span>
              <MapPin size={11} />
              {job.location || "Not specified"}
            </span>

                <small>
                  <Clock3 size={11} />
                  {job.jobType || "Full-time"}
                </small>
              </div>

              <span className="date">
            {formatDate(job.appliedDate)}
          </span>

              <span
                  className={`status ${String(
                      job.status || "Applied"
                  ).toLowerCase()}`}
              >
            {job.status || "Applied"}
          </span>

              <div className="ats-match">
                <strong>{job.atsMatch || 0}%</strong>

                <div>
              <span
                  style={{
                    width: `${Math.min(Number(job.atsMatch) || 0, 100)}%`,
                  }}
              />
                </div>
              </div>
            </div>
        ))}
      </div>
  );
}

function ApplicationCard({ job, deleteApplication, updateApplicationStatus }) {
  return (
      <div className="application-card">

        <div className="application-company">
          <div className="company-logo">
            {(job.company || "J").charAt(0).toUpperCase()}
          </div>

          <div>
            <h3>{job.company}</h3>
            <p>{job.role}</p>
          </div>
        </div>

        <div className="application-info">
        <span>
          <MapPin size={13} />
          {job.location || "Not specified"}
        </span>

          <span>
          <Clock3 size={13} />
            {job.jobType || "Full-time"}
        </span>

          <span>
          Applied {formatDate(job.appliedDate)}
        </span>
        </div>

        <div className="application-status">
          <strong>{job.atsMatch || 0}% ATS Match</strong>

          <select
              className={`status-select ${String(
                  job.status || "Applied"
              ).toLowerCase()}`}
              value={job.status || "Applied"}
              onChange={(event) =>
                  updateApplicationStatus(job, event.target.value)
              }
          >
            <option value="Applied">Applied</option>
            <option value="Assessment">Assessment</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <button
            className="delete-button"
            onClick={() => deleteApplication(job.id)}
            title="Delete application"
        >
          <Trash2 size={15} />
        </button>

      </div>
  );
}
/* =========================================================
   RESUME ANALYZER
   ========================================================= */

function ResumeAnalyzer({
                          resumeText,
                          setResumeText,
                          jobDescription,
                          setJobDescription,
                          resumeScore,
                          analyzeResume,
                          analyzed,
                          setAnalyzed,
                          matchedKeywords,
                          missingKeywords,
                        }) {
  return (
      <div className="resume-analyzer-page">
        <div className="resume-analyzer-header">
          <div className="page-icon">
            <FileText size={25} />
          </div>

          <h1>Resume Analyzer</h1>

          <p>
            Analyze your resume and improve your ATS compatibility.
          </p>
        </div>

        <>
          <input
              type="file"
              id="resume-upload"
              accept=".txt,.pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={async (event) => {
                const file = event.target.files?.[0];

                if (!file) return;

                if (file.type === "application/pdf") {
                  const arrayBuffer = await file.arrayBuffer();

                  const pdf = await pdfjsLib.getDocument({
                    data: arrayBuffer,
                  }).promise;

                  let extractedText = "";

                  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
                    const page = await pdf.getPage(pageNumber);
                    const textContent = await page.getTextContent();

                    const pageText = textContent.items
                        .map((item) => item.str)
                        .join(" ");

                    extractedText += pageText + "\n";
                  }

                  setResumeText(extractedText.trim());
                  setAnalyzed(false);

                } else if (
                    file.type ===
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ) {
                  const arrayBuffer = await file.arrayBuffer();

                  const result = await mammoth.extractRawText({
                    arrayBuffer,
                  });

                  setResumeText(result.value.trim());
                  setAnalyzed(false);

                } else {
                  const reader = new FileReader();

                  reader.onload = (e) => {
                    setResumeText(e.target.result);
                    setAnalyzed(false);
                  };

                  reader.readAsText(file);
                }
              }}
          />

          <label htmlFor="resume-upload" className="resume-upload-button">
            <Upload size={17} />
            Upload Resume
          </label>
        </>

        <div className="resume-analyzer-grid">
          <section className="resume-analyzer-card">
            <h2>Your Resume</h2>

            <p>Paste your resume text or upload a PDF, DOC, DOCX, or TXT file.</p>
            <textarea
                className="resume-textarea"
                value={resumeText}
                onChange={(event) => {
                  setResumeText(event.target.value);
                  setAnalyzed(false);
                }}
                placeholder="Paste your resume text here..."
            />
          </section>

          <section className="resume-analyzer-card">
            <h2>Job Description</h2>

            <p>Paste the job description you want to target.</p>

            <textarea
                className="job-description-textarea"
                value={jobDescription}
                onChange={(event) => {
                  setJobDescription(event.target.value);
                  setAnalyzed(false);
                }}
                placeholder="Paste the job description here..."
            />

            <button
                className="analyze-resume-button"
                onClick={analyzeResume}
            >
              <Sparkles size={16} />
              Analyze Resume
            </button>
          </section>
        </div>

        {analyzed && (
            <>
              <section className="ats-result-card">
                <div className="ats-result-header">
                  <div>
                    <div className="ats-result-title">
                      ATS Compatibility
                    </div>

                    <div className="ats-result-score">
                      {resumeScore}
                      <span>/100</span>
                    </div>

                    <div className="ats-result-status">
                      {resumeScore >= 80
                          ? "Excellent match"
                          : resumeScore >= 60
                              ? "Good match"
                              : "Needs improvement"}
                    </div>
                  </div>

                  <div className="ats-result-circle">
                    {resumeScore}%
                  </div>
                </div>

                <div className="ats-result-progress">
                  <div style={{ width: `${resumeScore}%` }} />
                </div>

                <p className="ats-result-description">
                  Your resume matches {matchedKeywords.length} of{" "}
                  {matchedKeywords.length + missingKeywords.length} important
                  job keywords.
                </p>
              </section>

              <div className="analyzer-details">
                <KeywordCard
                    icon={<CheckCircle2 size={18} />}
                    title="Matched Skills"
                    count={matchedKeywords.length}
                    type="matched"
                    keywords={matchedKeywords}
                />

                <KeywordCard
                    icon={<Target size={18} />}
                    title="Missing Keywords"
                    count={missingKeywords.length}
                    type="missing"
                    keywords={missingKeywords}
                />

                <div className="analyzer-detail-card suggestions-card">
                  <div className="detail-heading">
                    <Lightbulb size={18} />
                    <h3>Improvement Suggestions</h3>
                  </div>

                  <ul>
                    <li>
                      Add relevant keywords where they honestly describe your
                      skills.
                    </li>
                    <li>
                      Use simple headings and achievement-focused bullet points.
                    </li>
                    <li>
                      Match your resume wording with important job requirements.
                    </li>
                  </ul>
                </div>
              </div>
            </>
        )}
      </div>
  );
}

function KeywordCard({ icon, title, count, type, keywords: list }) {
  return (
      <div className="analyzer-detail-card keyword-card">
        <div className={`detail-heading ${type}`}>
          {icon}
          <h3>{title}</h3>
        </div>

        <strong className="keyword-count">{count}</strong>

        <div className="keyword-list">
          {list.length === 0 ? (
              <span className="keyword empty">None</span>
          ) : (
              list.map((keyword) => (
                  <span className={`keyword ${type}`} key={keyword}>
              {keyword}
            </span>
              ))
          )}
        </div>
      </div>
  );
}

/* =========================================================
   JOB MATCHER
   ========================================================= */

function JobMatcher({ jobs, resumeText }) {
  const [jd, setJd] = useState(
      "Associate Software Engineer with Java, Spring Boot, SQL, REST API, Git, MySQL, problem solving and testing skills."
  );
  const [matched, setMatched] = useState([]);
  const [missing, setMissing] = useState([]);
  const [analyzed, setAnalyzed] = useState(false);

  function analyzeMatch() {
    if (!resumeText.trim()) {
      alert("Please add or upload your resume in Resume Analyzer first.");
      return;
    }

    if (!jd.trim()) {
      alert("Please paste a job description first.");
      return;
    }

    const jdKeywords = keywords.filter((keyword) =>
        containsKeyword(jd, keyword)
    );

    const resumeMatches = jdKeywords.filter((keyword) =>
        containsKeyword(resumeText, keyword)
    );

    const missingKeywords = jdKeywords.filter(
        (keyword) => !containsKeyword(resumeText, keyword)
    );

    setMatched(resumeMatches);
    setMissing(missingKeywords);
    setAnalyzed(true);
  }

  const score = analyzed
      ? matched.length + missing.length > 0
          ? Math.round((matched.length / (matched.length + missing.length)) * 100)
          : 0
      : 0;

  const status =
      score >= 80
          ? "Excellent match"
          : score >= 60
              ? "Good match"
              : "Needs improvement";

  return (
      <div className="page-container">
        <div className="page-header">
          <div className="page-icon">
            <Target size={25} />
          </div>

          <h1>Job Matcher</h1>

          <p>Compare your resume with a job description and find your match score.</p>
        </div>

        <div className="matcher-grid">
          <section className="form-card">
            <h2>Target Job</h2>

            <p>Paste the job description you want to match.</p>

            <textarea
                className="matcher-textarea"
                value={jd}
                onChange={(event) => {
                  setJd(event.target.value);
                  setAnalyzed(false);
                }}
                placeholder="Paste the job description here..."
            />

            <button
                className="analyze-resume-button"
                onClick={analyzeMatch}
                type="button"
            >
              <Target size={16} />
              Analyze Job Match
            </button>
          </section>

          <section className="match-score-card">
            <Target size={30} />

            <span>JOB MATCH SCORE</span>

            <strong>{analyzed ? `${score}%` : "--"}</strong>

            <p>
              {analyzed
                  ? status
                  : "Analyze the job description to compare it with your resume."}
            </p>

            <div className="progress large">
              <div style={{ width: `${score}%` }} />
            </div>

            {analyzed && (
                <small>
                  {matched.length} matched · {missing.length} missing
                </small>
            )}
          </section>
        </div>

        {analyzed && (
            <div className="analyzer-details">
              <KeywordCard
                  icon={<CheckCircle2 size={18} />}
                  title="Matched Skills"
                  count={matched.length}
                  type="matched"
                  keywords={matched}
              />

              <KeywordCard
                  icon={<Target size={18} />}
                  title="Missing Keywords"
                  count={missing.length}
                  type="missing"
                  keywords={missing}
              />

              <div className="analyzer-detail-card suggestions-card">
                <div className="detail-heading">
                  <Lightbulb size={18} />
                  <h3>Match Suggestions</h3>
                </div>

                <ul>
                  <li>
                    Add missing keywords only when they genuinely describe your
                    skills or experience.
                  </li>
                  <li>
                    Update your project bullets to demonstrate the required
                    technologies.
                  </li>
                  <li>
                    Use the same terminology as the job description when it is
                    accurate for your background.
                  </li>
                </ul>
              </div>
            </div>
        )}

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Tracked Applications</h2>
              <p>Use your saved applications as another reference.</p>
            </div>
          </div>

          <div className="matcher-list">
            {jobs.length === 0 ? (
                <EmptyState
                    title="No saved applications"
                    text="Add an application first."
                />
            ) : (
                jobs.map((job) => (
                    <div className="matcher-row" key={job.id}>
                      <div className="company-logo">
                        {(job.company || "J").charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <strong>{job.company}</strong>
                        <span>{job.role}</span>
                      </div>

                      <b>{job.atsMatch || 0}% ATS</b>
                    </div>
                ))
            )}
          </div>
        </section>
      </div>
  );
}

/* =========================================================
   RESUME BUILDER
   ========================================================= */

function ResumeBuilder() {
  const [name, setName] = useState("Rakesh Vynala");
  const [phone, setPhone] = useState("+91 7675906300");
  const [email, setEmail] = useState("rakeshvynala10@gmail.com");
  const [linkedin, setLinkedin] = useState(
      "linkedin.com/in/rakesh-vynala"
  );
  const [github, setGithub] = useState("github.com/Rakesh-Vynala");

  const [role, setRole] = useState(
      "Java Backend / Full Stack Developer"
  );

  const [summary, setSummary] = useState(
      "Aspiring Software Developer with a strong foundation in frontend, core programming, and backend development. Familiar with building clean and responsive web interfaces using HTML, CSS, and JavaScript, along with a solid understanding of programming fundamentals and problem-solving. Familiar with backend development using Spring Boot, with knowledge of Java."
  );

  const [skills, setSkills] = useState(
      "Java, JavaScript, SQL, OOP, Collections, Data Structures, Spring Boot, Spring MVC, Hibernate, JPA, JDBC, REST APIs, HTTP, JSON, MySQL, DBMS, CRUD Operations, Joins, Subqueries, HTML5, CSS3, React JS, Git, GitHub, Maven, Debugging, Testing, Troubleshooting, Problem Solving"
  );

  const [education, setEducation] = useState(
      "Vaagdevi Engineering College | 2022 – 2026 | B.Tech in Computer Science & Engineering — CGPA: 7.6\nSigma Junior College | 2020 – 2022 | Intermediate — MPC — 66%\nMudra High School | 2016 – 2020 | Secondary School Certificate (SSC) — 97%"
  );

  const [projects, setProjects] = useState(
      "Zepto Clone – Frontend Web Application\nDeveloped a responsive e-commerce web application using HTML, CSS, and JavaScript. Integrated the DummyJSON REST API to retrieve and display dynamic product data. Implemented product filtering, price sorting, stock checking, and category-based browsing. Tested and debugged frontend functionality and API integration issues.\n\nFirewallEye – Real-Time Packet Inspection & Threat Classification\nDeveloped a machine learning-based solution for real-time network packet inspection and threat classification. Processed and analyzed network traffic data to identify suspicious activities and malicious patterns. Implemented anomaly detection and threat classification techniques for cybersecurity monitoring. Performed testing, debugging, and troubleshooting to improve application reliability and system performance."
  );

  const [training, setTraining] = useState(
      "Java Full Stack Development – QSpiders, Hyderabad — Ongoing\nLearning Core Java, Object-Oriented Programming, Collections, Exception Handling, SQL, JDBC, Data Structures, Spring Boot, Spring MVC, Spring Data JPA, Hibernate/JPA, REST API development, MySQL database operations, CRUD functionality, Maven and Git/GitHub."
  );

  const [achievements, setAchievements] = useState(
      "Chairperson, IEEE Computer Society Student Chapter – 2025.\nSpeaker, IEEE SRET Student Branch – Delivered a technical session on “IEEE Graphic Designer” – 2025.\nBest Ambassador, IEEE Computer Society India Symposium (CSIS) – 2025.\nIEEE Xtreme 19.0 Ambassador.\nStudent Network (SN) Member, IEEE Hyderabad Section – 2025.\nPhase 1 Winner, Indian Council – 2025."
  );

  const [additional, setAdditional] = useState(
      "Strong written and verbal communication skills with effective teamwork and collaboration abilities. Quick learner with an interest in backend development, full stack development, technical support, and emerging technologies."
  );

  function printResume() {
    window.print();
  }

  return (
      <div className="page-container">
        <div className="page-header">
          <div className="page-icon">
            <FileText size={25} />
          </div>

          <h1>Resume Builder</h1>
          <p>Create a professional, ATS-friendly resume.</p>
        </div>

        <div className="builder-grid">

          {/* LEFT SIDE - EDITOR */}
          <section className="form-card">

            <h2>Personal Information</h2>

            <div className="form-grid">

              <div className="form-group">
                <label>Full Name</label>
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Target Role</label>
                <input
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>LinkedIn</label>
                <input
                    value={linkedin}
                    onChange={(event) => setLinkedin(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>GitHub</label>
                <input
                    value={github}
                    onChange={(event) => setGithub(event.target.value)}
                />
              </div>

              <div className="form-group full">
                <label>Professional Summary</label>
                <textarea
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                />
              </div>

              <div className="form-group full">
                <label>Technical Skills</label>
                <textarea
                    value={skills}
                    onChange={(event) => setSkills(event.target.value)}
                />
              </div>

              <div className="form-group full">
                <label>Education</label>
                <textarea
                    value={education}
                    onChange={(event) => setEducation(event.target.value)}
                />
              </div>

              <div className="form-group full">
                <label>Projects</label>
                <textarea
                    value={projects}
                    onChange={(event) => setProjects(event.target.value)}
                />
              </div>

              <div className="form-group full">
                <label>Training</label>
                <textarea
                    value={training}
                    onChange={(event) => setTraining(event.target.value)}
                />
              </div>

              <div className="form-group full">
                <label>Leadership & Achievements</label>
                <textarea
                    value={achievements}
                    onChange={(event) => setAchievements(event.target.value)}
                />
              </div>

              <div className="form-group full">
                <label>Additional Information</label>
                <textarea
                    value={additional}
                    onChange={(event) => setAdditional(event.target.value)}
                />
              </div>

            </div>

            <button
                className="analyze-resume-button"
                onClick={printResume}
                type="button"
            >
              Download / Print Resume
            </button>

          </section>


          {/* RIGHT SIDE - LIVE RESUME */}
          <section className="resume-preview">

            <div className="resume-paper">

              <div className="resume-contact">
                <h2>{name}</h2>

                <h3>{role}</h3>

                <p>
                  {phone} | {email}
                </p>

                <p>
                  {linkedin} | {github}
                </p>
              </div>

              <hr />

              <h4>PROFESSIONAL SUMMARY</h4>
              <p>{summary}</p>


              <h4>EDUCATION</h4>

              <div className="resume-multiline">
                {education.split("\n").map((item, index) => (
                    <p key={index}>{item}</p>
                ))}
              </div>


              <h4>TECHNICAL SKILLS</h4>
              <p>{skills}</p>


              <h4>PROJECTS</h4>

              <div className="resume-multiline">
                {projects.split("\n").map((item, index) => (
                    <p key={index}>{item}</p>
                ))}
              </div>


              <h4>TRAINING</h4>
              <p>{training}</p>


              <h4>LEADERSHIP & ACHIEVEMENTS</h4>

              <div className="resume-multiline">
                {achievements.split("\n").map((item, index) => (
                    <p key={index}>• {item}</p>
                ))}
              </div>


              <h4>ADDITIONAL INFORMATION</h4>
              <p>{additional}</p>

            </div>

          </section>

        </div>
      </div>
  );
}
/* =========================================================
   INTERVIEWS
   ========================================================= */

function InterviewsPage({ jobs, setPage }) {
  const interviewJobs = jobs.filter(
      (job) => job.status === "Interview" || job.status === "Assessment"
  );

  const handleViewApplication = () => {
    setPage("applications");
  };

  return (
      <div className="page-container">
        <div className="page-header">
          <div className="page-icon">
            <CalendarDays size={25} />
          </div>

          <h1>Interviews</h1>

          <p>Prepare for your upcoming interviews.</p>
        </div>

        {interviewJobs.length === 0 ? (
            <section className="panel interview-empty-panel">
              <div className="empty-state">
                <CalendarDays size={38} />
                <h2>No interviews yet</h2>
                <p>
                  Move an application to Interview or Assessment status to see
                  it here automatically.
                </p>
                <button
                    className="add-button"
                    onClick={handleViewApplication}
                    type="button"
                >
                  View Applications
                  <ArrowRight size={14} />
                </button>
              </div>
            </section>
        ) : (
            <div className="interview-grid">
              {interviewJobs.map((job) => (
                  <InterviewCard
                      key={job.id}
                      title={
                        job.status === "Assessment"
                            ? "Assessment"
                            : "Technical Interview"
                      }
                      company={job.company || "Company"}
                      role={job.role || "Role not specified"}
                      date={
                        job.status === "Interview"
                            ? "Upcoming"
                            : "Assessment pending"
                      }
                      type={
                        job.status === "Assessment"
                            ? "Assessment"
                            : "Technical"
                      }
                      onView={handleViewApplication}
                  />
              ))}
            </div>
        )}

        <section className="panel interview-info-panel">
          <div className="panel-header">
            <div>
              <h2>Interview Preparation</h2>
              <p>Use your tracked applications to prepare for the next stage.</p>
            </div>
          </div>

          <div className="quick-actions">
            <button onClick={() => setPage("resume")} type="button">
              <div className="quick-icon blue">
                <FileText size={17} />
              </div>
              <div>
                <strong>Check Resume</strong>
                <span>Review your ATS compatibility</span>
              </div>
              <ArrowRight size={14} />
            </button>

            <button onClick={() => setPage("matcher")} type="button">
              <div className="quick-icon green">
                <Target size={17} />
              </div>
              <div>
                <strong>Match the Job</strong>
                <span>Compare your resume with the JD</span>
              </div>
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
      </div>
  );
}

function InterviewCard({
                         title,
                         company,
                         role,
                         date,
                         type,
                         onView,
                       }) {
  return (
      <div className="interview-card">
        <div className="interview-icon">
          <CalendarDays size={20} />
        </div>

        <span className="interview-type">{type}</span>

        <h2>{title}</h2>

        <strong>{company}</strong>
        <p>{role}</p>

        <div className="interview-date">
          <Clock3 size={14} />
          {date}
        </div>

        <button
            className="interview-action"
            onClick={onView}
            type="button"
        >
          View Application
          <ArrowRight size={14} />
        </button>
      </div>
  );
}


/* =========================================================
   ANALYTICS
   ========================================================= */

function AnalyticsPage({ counts, jobs }) {
  const conversion =
      counts.total > 0
          ? Math.round((counts.interview / counts.total) * 100)
          : 0;

  return (
      <div className="page-container">
        <div className="page-header">
          <div className="page-icon">
            <BarChart3 size={25} />
          </div>

          <h1>Analytics</h1>

          <p>Understand your job search performance.</p>
        </div>

        <div className="analytics-grid">
          <AnalyticsCard
              title="Total Applications"
              value={counts.total}
              icon={<BriefcaseBusiness size={20} />}
          />

          <AnalyticsCard
              title="Interview Rate"
              value={`${conversion}%`}
              icon={<CalendarDays size={20} />}
          />

          <AnalyticsCard
              title="Offers"
              value={counts.offers}
              icon={<CheckCircle2 size={20} />}
          />

          <AnalyticsCard
              title="Rejected"
              value={counts.rejected}
              icon={<Activity size={20} />}
          />
        </div>

        <section className="panel analytics-panel">
          <div className="panel-header">
            <div>
              <h2>Application Performance</h2>
              <p>Current status distribution.</p>
            </div>
          </div>

          <div className="analytics-bars">
            <AnalyticsBar
                label="Applied"
                value={counts.applied}
                total={Math.max(counts.total, 1)}
            />

            <AnalyticsBar
                label="Assessment"
                value={counts.assessment}
                total={Math.max(counts.total, 1)}
            />

            <AnalyticsBar
                label="Interview"
                value={counts.interview}
                total={Math.max(counts.total, 1)}
            />

            <AnalyticsBar
                label="Offer"
                value={counts.offers}
                total={Math.max(counts.total, 1)}
            />

            <AnalyticsBar
                label="Rejected"
                value={counts.rejected}
                total={Math.max(counts.total, 1)}
            />
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Tracked Companies</h2>
              <p>{jobs.length} applications currently stored.</p>
            </div>
          </div>
        </section>
      </div>
  );
}

function AnalyticsCard({ title, value, icon }) {
  return (
      <div className="analytics-card">
        <div className="analytics-icon">{icon}</div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
  );
}

function AnalyticsBar({ label, value, total }) {
  const percentage = Math.round((value / total) * 100);

  return (
      <div className="analytics-bar-row">
        <div>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>

        <div className="progress">
          <div style={{ width: `${percentage}%` }} />
        </div>
      </div>
  );
}

/* =========================================================
   SETTINGS
   ========================================================= */

function SettingsPage({
                        notifications,
                        setNotifications,
                        darkMode,
                        setDarkMode,
                      }) {
  return (
      <div className="page-container">
        <div className="page-header">
          <div className="page-icon">
            <Settings size={25} />
          </div>

          <h1>Settings</h1>

          <p>Manage your JobTrack AI preferences.</p>
        </div>

        <section className="settings-card">
          <SettingRow
              title="Email Notifications"
              description={
                notifications
                    ? "Application and interview reminders are enabled."
                    : "Application and interview reminders are disabled."
              }
              enabled={notifications}
              setEnabled={setNotifications}
          />

          <SettingRow
              title="Dark Mode"
              description={
                darkMode
                    ? "Dark interface is currently enabled."
                    : "Light interface is currently enabled."
              }
              enabled={darkMode}
              setEnabled={setDarkMode}
          />

          <div className="profile-setting">
            <div className="avatar large-avatar">RV</div>

            <div>
              <strong>Rakesh Vynala</strong>
              <span>Job Seeker</span>
            </div>
          </div>
        </section>
      </div>
  );
}


function SettingRow({
                      title,
                      description,
                      enabled,
                      setEnabled,
                    }) {
  function handleToggle() {
    setEnabled((current) => !current);
  }

  return (
      <div className="setting-row">
        <div>
          <strong>{title}</strong>
          <span>{description}</span>
        </div>

        <button
            type="button"
            className={`toggle ${enabled ? "on" : ""}`}
            onClick={handleToggle}
            aria-pressed={enabled}
            aria-label={`Toggle ${title}`}
        >
          <span />
        </button>
      </div>
  );
}

/* =========================================================
   ADD APPLICATION MODAL
   ========================================================= */

function AddApplicationModal({
                               form,
                               updateForm,
                               onSubmit,
                               onClose,
                             }) {
  return (
      <div className="modal-overlay">
        <div className="modal-card">
          <div className="modal-header">
            <div>
              <h2>Add New Job Application</h2>
              <p>Save your application to JobTrack AI.</p>
            </div>

            <button className="close-button" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="form-grid">
              <FormField
                  label="Company Name *"
                  value={form.company}
                  onChange={(value) => updateForm("company", value)}
                  placeholder="e.g. Deloitte"
              />

              <FormField
                  label="Job Role *"
                  value={form.role}
                  onChange={(value) => updateForm("role", value)}
                  placeholder="e.g. Associate Software Engineer"
              />

              <FormField
                  label="Location"
                  value={form.location}
                  onChange={(value) => updateForm("location", value)}
                  placeholder="e.g. Bengaluru"
              />

              <div className="form-group">
                <label>Job Type</label>

                <select
                    value={form.jobType}
                    onChange={(event) =>
                        updateForm("jobType", event.target.value)
                    }
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
              </div>

              <div className="form-group">
                <label>Application Date</label>

                <input
                    type="date"
                    value={form.appliedDate}
                    onChange={(event) =>
                        updateForm("appliedDate", event.target.value)
                    }
                />
              </div>

              <div className="form-group">
                <label>Status</label>

                <select
                    value={form.status}
                    onChange={(event) =>
                        updateForm("status", event.target.value)
                    }
                >
                  <option>Applied</option>
                  <option>Assessment</option>
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>
              </div>

              <FormField
                  label="Salary / CTC"
                  value={form.salary}
                  onChange={(value) => updateForm("salary", value)}
                  placeholder="e.g. 7.5 LPA"
              />

              <div className="form-group">
                <label>ATS Match %</label>

                <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.atsMatch}
                    onChange={(event) =>
                        updateForm("atsMatch", event.target.value)
                    }
                />
              </div>

              <FormField
                  label="Job Posting URL"
                  value={form.jobUrl}
                  onChange={(value) => updateForm("jobUrl", value)}
                  placeholder="https://..."
                  full
              />

              <FormField
                  label="Recruiter Name"
                  value={form.recruiterName}
                  onChange={(value) =>
                      updateForm("recruiterName", value)
                  }
                  placeholder="Recruiter name"
              />

              <FormField
                  label="Recruiter Email"
                  value={form.recruiterEmail}
                  onChange={(value) =>
                      updateForm("recruiterEmail", value)
                  }
                  placeholder="recruiter@example.com"
              />

              <FormField
                  label="Notes & Preparation Plan"
                  value={form.notes}
                  onChange={(value) => updateForm("notes", value)}
                  placeholder="Prepare Java, Spring Boot, SQL and DSA..."
                  full
                  textarea
              />

              <FormField
                  label="Job Description"
                  value={form.jobDescription}
                  onChange={(value) =>
                      updateForm("jobDescription", value)
                  }
                  placeholder="Paste the job description here..."
                  full
                  textarea
              />
            </div>

            <div className="form-actions">
              <button
                  type="button"
                  className="secondary-button"
                  onClick={onClose}
              >
                Cancel
              </button>

              <button type="submit" className="primary-button">
                <Plus size={15} />
                Add Application
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}

function FormField({
                     label,
                     value,
                     onChange,
                     placeholder,
                     full,
                     textarea,
                   }) {
  return (
      <div className={`form-group ${full ? "full" : ""}`}>
        <label>{label}</label>

        {textarea ? (
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
            />
        ) : (
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
            />
        )}
      </div>
  );
}

/* =========================================================
   COMMON
   ========================================================= */

function EmptyState({ title, text }) {
  return (
      <div className="empty-state">
        <BriefcaseBusiness size={38} />

        <h2>{title}</h2>

        <p>{text}</p>
      </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default App;

