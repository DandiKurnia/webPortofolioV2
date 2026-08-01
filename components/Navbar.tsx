"use client";

import { useState, useEffect } from "react";

interface Resume {
  url: string;
  filename: string;
}

interface Portfolio {
  url: string;
  filename: string;
}

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("");
  const [resume, setResume] = useState<Resume | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id], footer[id]");
      let currentSectionId = "";

      // Get current scroll position with an offset
      const scrollY = window.scrollY + window.innerHeight / 3;

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = section.clientHeight;

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          currentSectionId = section.getAttribute("id") || "";
        }
      });

      setActiveSection(currentSectionId);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch("/api/resume");
        if (response.ok) {
          const data = await response.json();
          if (data && data.url) {
            setResume({ url: data.url, filename: data.filename });
          }
        }
      } catch (error) {
        console.error("Error fetching resume:", error);
      }
    };

    fetchResume();
  }, []);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch("/api/portfolio");
        if (response.ok) {
          const data = await response.json();
          if (data && data.url) {
            setPortfolio({ url: data.url, filename: data.filename });
          }
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      }
    };

    fetchPortfolio();
  }, []);

  const getLinkClass = (href: string) => {
    const id = href.replace("#", "");
    if (activeSection === id) {
      return "text-secondary underline decoration-4 underline-offset-8 transition-all";
    }
    return "text-on-surface hover:translate-x-1 hover:translate-y-1 hover:shadow-neubrutalism-hover transition-all";
  };

  const handleView = () => {
    if (!resume) return;
    window.open(resume.url, "_blank", "noopener,noreferrer");
  };

  const handleViewPortfolio = () => {
    if (!portfolio) return;
    window.open(portfolio.url, "_blank", "noopener,noreferrer");
  };

  return (
    <nav className="flex justify-between items-center px-4 md:px-8 lg:px-16 py-3 w-full sticky top-0 z-50 bg-surface border-b-4 border-on-surface shadow-neubrutalism">
      <div className="font-headline text-lg sm:text-xl md:text-2xl lg:text-[32px] font-black leading-[110%] text-on-surface">
        DanBilDad
      </div>

      <div className="hidden md:flex items-center gap-4 lg:gap-8 font-mono text-xs lg:text-sm font-bold">
        <a className={getLinkClass("#hero")} href="#hero">
          Home
        </a>

        <a className={getLinkClass("#skills")} href="#skills">
          Skills
        </a>
        <a className={getLinkClass("#projects")} href="#projects">
          Projects
        </a>
        <a className={getLinkClass("#certifications")} href="#certifications">
          Certifications
        </a>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
        <button
          type="button"
          onClick={handleView}
          disabled={!resume}
          title={resume ? `View ${resume.filename}` : "No CV uploaded yet"}
          className="bg-primary-container text-pure-black font-mono font-bold px-3 py-2 sm:px-4 lg:px-6 lg:py-3 brutal-border brutal-shadow flex items-center gap-1.5 md:gap-2 text-xs lg:text-sm uppercase whitespace-nowrap hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
        >
          {/* Short label on mobile/tablet, full on desktop */}
          <span className="lg:hidden">CV</span>
          <span className="hidden lg:inline">View CV</span>
          <span className="material-symbols-outlined text-sm lg:text-base hidden md:block">
            open_in_new
          </span>
        </button>
        <button
          type="button"
          onClick={handleViewPortfolio}
          disabled={!portfolio}
          title={portfolio ? `View ${portfolio.filename}` : "No portfolio uploaded yet"}
          className="bg-neon-pink text-white font-mono font-bold px-3 py-2 sm:px-4 lg:px-5 lg:py-2.5 brutal-border brutal-shadow flex items-center gap-1.5 md:gap-2 text-xs lg:text-sm uppercase whitespace-nowrap hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
        >
          {/* Short label on mobile/tablet, full on desktop */}
          <span className="lg:hidden">Portfolio</span>
          <span className="hidden lg:inline">Show Portfolio</span>
          <span className="material-symbols-outlined text-sm lg:text-base hidden md:block">
            folder_open
          </span>
        </button>
      </div>
    </nav>
  );
}
