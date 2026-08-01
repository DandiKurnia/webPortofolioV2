"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DocumentManager, {
  type DocItem,
} from "@/components/admin/DocumentManager";

interface Counts {
  projects: number;
  skills: number;
  certifications: number;
}

interface ProjectPreview {
  id: string;
  title: string;
  image: string | null;
  technologies: string[];
  updatedAt: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

async function uploadDocument(
  file: File,
  kind: "resume" | "portfolio",
  setUploading: (v: boolean) => void,
  setDoc: (doc: DocItem) => void
) {
  if (file.type !== "application/pdf") {
    alert(`${kind === "resume" ? "Resume" : "Portfolio"} must be a PDF.`);
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    alert("File too large. Max 10MB.");
    return;
  }

  setUploading(true);
  try {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("kind", kind);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: uploadData,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      alert(err.error || "Upload failed");
      return;
    }

    const uploaded = await uploadRes.json();

    const saveRes = await fetch(`/api/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: uploaded.url,
        filename: uploaded.filename,
        size: uploaded.size,
      }),
    });

    if (saveRes.ok) {
      const saved = await saveRes.json();
      setDoc(saved);
    } else {
      const err = await saveRes.json();
      alert(err.error || `Failed to save ${kind}`);
    }
  } catch (error) {
    console.error(`Error uploading ${kind}:`, error);
    alert("An error occurred while uploading");
  } finally {
    setUploading(false);
  }
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts>({
    projects: 0,
    skills: 0,
    certifications: 0,
  });
  const [resume, setResume] = useState<DocItem | null>(null);
  const [portfolio, setPortfolio] = useState<DocItem | null>(null);
  const [recentProjects, setRecentProjects] = useState<ProjectPreview[]>([]);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = async () => {
    try {
      const [projectsRes, skillsRes, certsRes, resumeRes, portfolioRes] =
        await Promise.all([
          fetch("/api/projects"),
          fetch("/api/skills"),
          fetch("/api/certifications"),
          fetch("/api/resume"),
          fetch("/api/portfolio"),
        ]);

      const projectsData: ProjectPreview[] = projectsRes.ok
        ? await projectsRes.json()
        : [];
      const skillsData = skillsRes.ok ? await skillsRes.json() : [];
      const certsData = certsRes.ok ? await certsRes.json() : [];
      const resumeData: DocItem | null = resumeRes.ok
        ? await resumeRes.json()
        : null;
      const portfolioData: DocItem | null = portfolioRes.ok
        ? await portfolioRes.json()
        : null;

      setCounts({
        projects: projectsData.length,
        skills: skillsData.length,
        certifications: certsData.length,
      });
      setRecentProjects(projectsData.slice(0, 5));
      setResume(resumeData);
      setPortfolio(portfolioData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleResumeRemove = async () => {
    if (!confirm("Remove the current resume?")) return;

    try {
      const res = await fetch("/api/resume", { method: "DELETE" });
      if (res.ok) {
        setResume(null);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to remove resume");
      }
    } catch (error) {
      console.error("Error removing resume:", error);
      alert("An error occurred while removing");
    }
  };

  const handlePortfolioRemove = async () => {
    if (!confirm("Remove the current portfolio?")) return;

    try {
      const res = await fetch("/api/portfolio", { method: "DELETE" });
      if (res.ok) {
        setPortfolio(null);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to remove portfolio");
      }
    } catch (error) {
      console.error("Error removing portfolio:", error);
      alert("An error occurred while removing");
    }
  };

  const statCards = [
    {
      label: "Projects",
      value: counts.projects,
      href: "/admin/project",
      bg: "bg-primary-container",
      icon: "folder_open",
    },
    {
      label: "Skills",
      value: counts.skills,
      href: "/admin/skills",
      bg: "bg-secondary",
      icon: "bolt",
    },
    {
      label: "Certificates",
      value: counts.certifications,
      href: "/admin/certificates",
      bg: "bg-tertiary-fixed",
      icon: "verified",
    },
  ];

  return (
    <>
      <header className="mb-12">
        <h1 className="font-headline text-[48px] leading-[110%] tracking-[-0.02em] font-black text-on-surface mb-2">
          Dashboard Operations
        </h1>
        <p className="font-body text-[18px] leading-[150%] font-medium text-on-surface-variant">
          High-signal view of your portfolio content.
        </p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`${card.bg} border-4 border-on-surface brutal-shadow p-6 flex flex-col gap-3 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all`}
          >
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[32px] text-on-surface">
                {card.icon}
              </span>
              <span className="font-mono text-[12px] font-bold uppercase text-on-surface-variant">
                {card.label}
              </span>
            </div>
            <div className="font-headline text-[64px] leading-[100%] font-black text-on-surface">
              {isLoading ? "—" : card.value}
            </div>
            <div className="font-mono text-[12px] font-bold uppercase text-on-surface flex items-center gap-1">
              Manage
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-12">
        {/* Resume Manager */}
        <DocumentManager
          windowTitle="Resume_Vault.exe"
          title="Resume"
          description="One active PDF, stored in MinIO."
          doc={resume}
          isUploading={isUploadingResume}
          onFileSelected={(file) =>
            uploadDocument(file, "resume", setIsUploadingResume, setResume)
          }
          onRemove={handleResumeRemove}
        />

        {/* Portfolio Manager */}
        <DocumentManager
          windowTitle="Portfolio_Vault.exe"
          title="Portfolio"
          description="One active PDF, stored in MinIO."
          doc={portfolio}
          isUploading={isUploadingPortfolio}
          onFileSelected={(file) =>
            uploadDocument(
              file,
              "portfolio",
              setIsUploadingPortfolio,
              setPortfolio
            )
          }
          onRemove={handlePortfolioRemove}
        />

        {/* Recent Projects */}
        <section>
          <div className="border-4 border-on-surface bg-surface-container-lowest brutal-shadow overflow-hidden">
            <div className="bg-on-surface p-3 flex items-center gap-2 border-b-4 border-on-surface">
              <div className="w-4 h-4 rounded-full bg-error border-2 border-on-surface"></div>
              <div className="w-4 h-4 rounded-full bg-[#FFBD2E] border-2 border-on-surface"></div>
              <div className="w-4 h-4 rounded-full bg-[#27C93F] border-2 border-on-surface"></div>
              <span className="ml-4 font-mono text-[14px] leading-[120%] font-bold text-surface">
                Recent_Projects.log
              </span>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="font-headline text-[32px] leading-[110%] font-black text-on-surface">
                  Recent Projects
                </h2>
                <Link
                  href="/admin/project"
                  className="font-mono text-[12px] font-bold uppercase flex items-center gap-1 border-b-4 border-on-surface pb-0.5 hover:text-primary transition-colors"
                >
                  Manage all
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                </Link>
              </div>

              {isLoading ? (
                <p className="font-mono text-on-surface-variant text-center py-8">
                  Loading...
                </p>
              ) : recentProjects.length === 0 ? (
                <p className="font-mono text-on-surface-variant text-center py-8">
                  No projects yet.
                </p>
              ) : (
                <ul className="flex flex-col divide-y-4 divide-on-surface border-4 border-on-surface">
                  {recentProjects.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-4 p-3 hover:bg-surface-container transition-colors"
                    >
                      <div className="w-12 h-12 border-2 border-on-surface bg-surface-container overflow-hidden shrink-0 flex items-center justify-center">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant">
                            image
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-bold uppercase text-on-surface truncate">
                          {p.title}
                        </p>
                        <p className="font-mono text-xs text-on-surface-variant truncate">
                          {p.technologies.slice(0, 4).join(" · ") || "—"}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-on-surface-variant hidden sm:block shrink-0">
                        {formatDate(p.updatedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
