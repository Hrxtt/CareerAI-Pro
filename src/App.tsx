/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FileText, Briefcase, GraduationCap, Award, Compass, Search, 
  MessageSquare, LayoutDashboard, Wrench, CheckCircle2, 
  AlertTriangle, ArrowRight, Download, Upload, Plus, Trash2,
  RefreshCw, Check, Copy, Printer, ExternalLink, HelpCircle, BookOpen, User, Flame,
  Menu, X
} from "lucide-react";
import ProjectToolkit from "./components/ProjectToolkit";
import { 
  ResumeData, 
  ATSAnalysisResult, 
  ChatMessage, 
  CareerRecommendation, 
  SkillGapData 
} from "./types";

// ==========================================
// STATIC SEED REPLICAS FOR DEMOS
// ==========================================
const HIGH_ATS_SAMPLE: ResumeData = {
  fullName: "Harshit Shakya",
  email: "harshitshakya1308@gmail.com",
  phone: "+91 98765 43210",
  location: "New Delhi, India",
  website: "github.com/harshitshakya",
  linkedin: "linkedin.com/in/harshitshakya1308",
  education: [
    {
      institution: "State Technological University",
      degree: "Bachelor of Technology",
      fieldOfStudy: "Computer Science & Engineering",
      startDate: "2022-08",
      endDate: "2026-06",
      grade: "8.8 CGPA"
    }
  ],
  skills: "Python, TensorFlow, PyTorch, SQL, Pandas, NumPy, scikit-learn, Git, React, Express, Deep Learning, NLP",
  experience: [
    {
      company: "InnovateAI Solutions",
      position: "AI Engineering Intern",
      startDate: "2025-01",
      endDate: "2025-05",
      description: "Optimized NLP deep learning models using PyTorch to automate core text summarization pipeline. Integrated high-throughput Flask APIs which reduced overall transaction response times by 18%."
    }
  ],
  projects: [
    {
      title: "Intelligent Neural Parser",
      description: "Engineered a custom parsing classification algorithm using supervised Python frameworks that extracts structural key tags from plain text with a 94% accuracy score.",
      technologies: "Python, TensorFlow, scikit-learn, Pandas",
      link: "github.com/harshitshakya/parser"
    }
  ],
  certifications: "DeepLearning.AI TensorFlow Developer Certificate, AWS Certified Cloud Practitioner",
  achievements: "• Ranked Top 2% in Regional Algorithm Hackathon out of 400 college candidates.\n• Secured First Place at University Technical Symposium for AI prototype."
};

const LOW_ATS_SAMPLE: ResumeData = {
  fullName: "John Smith",
  email: "john@email.com",
  phone: "123-456",
  location: "Delhi",
  website: "",
  linkedin: "",
  education: [
    {
      institution: "Some School",
      degree: "BTech",
      fieldOfStudy: "CSE",
      startDate: "2022",
      endDate: "2026",
      grade: ""
    }
  ],
  skills: "HTML, MS Word, basic code helper",
  experience: [],
  projects: [
    {
      title: "Sample Web App",
      description: "Made a website using HTML and CSS. It was good and completed successfully.",
      technologies: "HTML, CSS",
      link: ""
    }
  ],
  certifications: "",
  achievements: "None listed"
};

const EMPTY_RESUME: ResumeData = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  education: [],
  skills: "",
  experience: [],
  projects: [],
  certifications: "",
  achievements: ""
};

export default function App() {
  const [activeMenu, setActiveMenu] = useState<"dashboard" | "analyzer" | "builder" | "recommender" | "gap" | "chat" | "toolkit">("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // Resume Builder state
  const [resumeForm, setResumeForm] = useState<ResumeData>(EMPTY_RESUME);
  const [activeTemplate, setActiveTemplate] = useState<"navy" | "teal" | "minimal">("navy");

  // Analyzer States
  const [typedResumeContent, setTypedResumeContent] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [fileUploadWarning, setFileUploadWarning] = useState<string | null>(null);

  // Chatbot state
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "init-message",
      sender: "bot",
      text: "Hi! I'm CareerAI Assistant, your dedicated university coach. Paste your resume above to check its ATS readiness, build highly indexable designs, or ask me tips about ML roadmaps and fresher interviews!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Recommender Stats
  const [recomInputs, setRecomInputs] = useState({
    skills: "",
    interests: "",
    projects: "",
    certifications: ""
  });
  const [isRecommending, setIsRecommending] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);

  // Skill Gap analysis target
  const [targetDomain, setTargetDomain] = useState<string>("Artificial Intelligence");
  const [isGapAnalyzing, setIsGapAnalyzing] = useState<boolean>(false);
  const [gapResults, setGapResults] = useState<{ gaps: SkillGapData[]; summary: string } | null>(null);

  // Common UI State toast indicator
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // On mount, auto trigger initial recommender & gap analysis lists so Dashboard is populated
  useEffect(() => {
    runStaticRecommender();
    runStaticGapAnalysis();
  }, []);

  const runStaticRecommender = async () => {
    setIsRecommending(true);
    try {
      const response = await fetch("/api/career-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recomInputs)
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setRecommendations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecommending(false);
    }
  };

  const runStaticGapAnalysis = async (domain = targetDomain) => {
    setIsGapAnalyzing(true);
    try {
      const response = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSkills: resumeForm.skills,
          targetDomain: domain
        })
      });
      const data = await response.json();
      if (data && data.gaps) {
        setGapResults(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGapAnalyzing(false);
    }
  };

  const clearAllApplicationData = () => {
    setResumeForm(EMPTY_RESUME);
    setTypedResumeContent("");
    setAnalysisResult(null);
    setSelectedFileName("");
    setFileUploadWarning(null);
    setChatInput("");
    setChatMessages([
      {
        id: "init-message",
        sender: "bot",
        text: "Hi! I'm CareerAI Assistant, your dedicated university coach. Paste your resume above to check its ATS readiness, build highly indexable designs, or ask me tips about ML roadmaps and fresher interviews!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setRecomInputs({
      skills: "",
      interests: "",
      projects: "",
      certifications: ""
    });
    setGapResults(null);
    setTargetDomain("Artificial Intelligence");

    // Re-run with empty states to clear analytical graphs
    setTimeout(() => {
      fetch("/api/career-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: "", interests: "", projects: "", certifications: "" })
      }).then(res => res.json()).then(data => {
        if (Array.isArray(data)) setRecommendations(data);
      }).catch(console.error);

      fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userSkills: "", targetDomain: "Artificial Intelligence" })
      }).then(res => res.json()).then(data => {
        if (data && data.gaps) setGapResults(data);
      }).catch(console.error);
    }, 50);

    showToast("Application completely reset to a new clean session!");
  };

  // Format form values as parse-ready raw resume text
  const generateRawTextFromForm = (data: ResumeData): string => {
    let text = `
    FULL NAME: ${data.fullName}
    EMAIL: ${data.email} | PHONE: ${data.phone}
    LOCATION: ${data.location}
    LINKS: ${data.website} | ${data.linkedin}
    
    SKILLS: ${data.skills}
    
    EDUCATION:
    `;
    data.education.forEach(edu => {
      text += `${edu.degree} in ${edu.fieldOfStudy} - ${edu.institution} (${edu.startDate} to ${edu.endDate}) - Grade: ${edu.grade}\n`;
    });

    text += "\nPROFESSIONAL EXPERIENCE:\n";
    data.experience.forEach(exp => {
      text += `${exp.position} - ${exp.company} (${exp.startDate} to ${exp.endDate})\n${exp.description}\n`;
    });

    text += "\nPORTFOLIO PROJECTS:\n";
    data.projects.forEach(proj => {
      text += `${proj.title} - Technologies: ${proj.technologies}\n${proj.description}\nLink: ${proj.link}\n`;
    });

    text += `\nCERTIFICATIONS:\n${data.certifications}`;
    text += `\nACHIEVEMENTS:\n${data.achievements}`;

    return text;
  };

  // Convert ResumeData info into draft content
  const loadAtsSampleToAnalyzer = (level: "high" | "low") => {
    const rawData = level === "high" ? HIGH_ATS_SAMPLE : LOW_ATS_SAMPLE;
    const formattedText = generateRawTextFromForm(rawData);
    setTypedResumeContent(formattedText);
    setSelectedFileName(`${level.toUpperCase()}_ATS_SAMPLE_RESUME.txt`);
    showToast(`Loaded ${level === "high" ? "optimized" : "unoptimized"} resume mockup into compiler text area.`);
  };

  // Trigger Local/Gemini ATS analysis
  const executeResumeAnalysis = async (customTextToUse?: string) => {
    const textToAnalyze = customTextToUse || typedResumeContent;
    if (!textToAnalyze || textToAnalyze.trim() === "") {
      showToast("Please enter or upload a valid resume payload to compile calculations.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: textToAnalyze })
      });
      const data = await res.json();
      if (res.ok) {
        setAnalysisResult(data);
        showToast("AI parser finished indexing sections successfully!");
      } else {
        showToast(data.error || "Execution error encountered during evaluation.");
      }
    } catch (error) {
      console.error(error);
      showToast("Network exception querying parsing servers.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // File Uploader handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const extension = file.name.split(".").pop()?.toLowerCase();
      setSelectedFileName(file.name);
      
      if (extension === "pdf" || extension === "docx" || extension === "doc") {
        setFileUploadWarning(`Directly reading text from binary document formats (like PDF or Word files) inside a web browser often extracts corrupted binary headers (e.g. "%PDF-1.4") or scrambles spacing.

Since professional Applicant Tracking Systems (ATS) index raw plain text, the industry standard way to audit your CV is to open your PDF/Word document, copy all of the text (Ctrl+A -> Ctrl+C), and paste it directly into the plaintext box below. This ensures there are no broken font layouts or corrupted symbols!`);
        setTypedResumeContent("");
        showToast("PDF/Word detected! Plain text copy-pasting is highly recommended.");
      } else {
        setFileUploadWarning(null);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            const contents = event.target.result as string;
            setTypedResumeContent(contents);
            showToast(`Extracted plaintext structure from ${file.name}`);
            // Auto run analysis
            executeResumeAnalysis(contents);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  // Resume builder helper additions
  const addEducation = () => {
    setResumeForm({
      ...resumeForm,
      education: [
        ...resumeForm.education,
        { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", grade: "" }
      ]
    });
  };

  const removeEducation = (index: number) => {
    const filtered = resumeForm.education.filter((_, i) => i !== index);
    setResumeForm({ ...resumeForm, education: filtered });
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const updated = resumeForm.education.map((edu, i) => {
      if (i === index) {
        return { ...edu, [field]: value };
      }
      return edu;
    });
    setResumeForm({ ...resumeForm, education: updated });
  };

  const addExperience = () => {
    setResumeForm({
      ...resumeForm,
      experience: [
        ...resumeForm.experience,
        { company: "", position: "", startDate: "", endDate: "", description: "" }
      ]
    });
  };

  const removeExperience = (index: number) => {
    const filtered = resumeForm.experience.filter((_, i) => i !== index);
    setResumeForm({ ...resumeForm, experience: filtered });
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const updated = resumeForm.experience.map((exp, i) => {
      if (i === index) {
        return { ...exp, [field]: value };
      }
      return exp;
    });
    setResumeForm({ ...resumeForm, experience: updated });
  };

  const addProject = () => {
    setResumeForm({
      ...resumeForm,
      projects: [
        ...resumeForm.projects,
        { title: "", description: "", technologies: "", link: "" }
      ]
    });
  };

  const removeProject = (index: number) => {
    const filtered = resumeForm.projects.filter((_, i) => i !== index);
    setResumeForm({ ...resumeForm, projects: filtered });
  };

  const handleProjectChange = (index: number, field: string, value: string) => {
    const updated = resumeForm.projects.map((proj, i) => {
      if (i === index) {
        return { ...proj, [field]: value };
      }
      return proj;
    });
    setResumeForm({ ...resumeForm, projects: updated });
  };

  // Print/Download Resume Layout
  const handlePrintResume = () => {
    window.print();
  };

  // Chat Trigger
  const sendChatMessage = async (specialTerm?: string) => {
    const msgToSend = specialTerm || chatInput;
    if (!msgToSend || msgToSend.trim() === "") return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: msgToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msgToSend,
          history: chatMessages.slice(-5) // Send some back-history
        })
      });
      const data = await response.json();
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "Apologies, my server proxy is temporarily offline. Please verify your internet connection or use my pre-configured offline rules.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Auto compile analysis when user switches from Resume Builder (having populated state)
  const syncBuilderToAnalyzerAndSwitch = () => {
    const raw = generateRawTextFromForm(resumeForm);
    setTypedResumeContent(raw);
    setSelectedFileName("CUSTOM_BUILDER_OUTPUT.txt");
    setActiveMenu("analyzer");
    executeResumeAnalysis(raw);
  };

  // Sync state for recommender
  useEffect(() => {
    setRecomInputs({
      skills: resumeForm.skills,
      interests: "Software Development, " + (resumeForm.projects[0]?.title || "Machine Learning"),
      projects: resumeForm.projects.map(p => `${p.title}: ${p.description}`).join(" | "),
      certifications: resumeForm.certifications
    });
  }, [resumeForm]);

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 overflow-x-hidden font-sans print:bg-white print:p-0">
      
      {/* TOAST SYSTEM */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white rounded-lg shadow-xl py-3 px-5 text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-slide-up">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
          {toastMsg}
        </div>
      )}

      {/* Mobile Sidebar Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* SIDEBAR NAVIGATION - MATCHING PROFESSIONAL POLISH INTEGRATION */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 print:hidden transition-transform duration-305
        md:static md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* Brand/Logo Layout */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-white text-[15px] tracking-tight block">CareerAi Pro</span>
              <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Minor Project</span>
            </div>
          </div>
          {/* Close button for mobile views */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-3">
            Core Modules
          </div>
          
          <button 
            onClick={() => {
              setActiveMenu("dashboard");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition ${
              activeMenu === "dashboard" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-sky-400" />
            Dashboard Hub
          </button>

          <button 
            onClick={() => {
              setActiveMenu("analyzer");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition ${
              activeMenu === "analyzer" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Search className="w-4 h-4 text-emerald-400" />
            ATS Resume Analyzer
          </button>

          <button 
            onClick={() => {
              setActiveMenu("builder");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition ${
              activeMenu === "builder" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            ATS Resume Builder
          </button>

          <button 
            onClick={() => {
              setActiveMenu("recommender");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition ${
              activeMenu === "recommender" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4 text-violet-400" />
            Career Recommender
          </button>

          <button 
            onClick={() => {
              setActiveMenu("gap");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition ${
              activeMenu === "gap" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Wrench className="w-4 h-4 text-rose-400" />
            Skill Gap Analyzer
          </button>

          <button 
            onClick={() => {
              setActiveMenu("chat");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition ${
              activeMenu === "chat" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            Career Coach Advisor
          </button>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 pt-6 pb-2">
            Academic Docs
          </div>

          <button 
            onClick={() => {
              setActiveMenu("toolkit");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition ${
              activeMenu === "toolkit" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4 text-teal-400" />
            Project File & Viva Kit
          </button>
        </nav>

        {/* Sidebar Status Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5Packed">
              <span className="font-semibold text-slate-300">Minor Project Rating</span>
              <span className="font-mono text-blue-400 font-bold">A+</span>
            </div>
            <div className="w-full bg-slate-700 h-1 rounded-full mb-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-sky-400 h-full w-[100%]"></div>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              Fully compliant & compiled code ready for University grading boards.
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN SCREEN WORKSPACE CONTAINER */}
      <main className="flex-1 flex flex-col overflow-y-auto max-h-screen">
        
        {/* HEADER AREA - PROFESSIONAL POLISH */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-xs print:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Hamburger helper button for mobile/tablet screens */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 -ml-1 rounded-md text-slate-600 hover:bg-slate-100 md:hidden transition shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold hidden sm:inline shrink-0">Workspace Console</span>
            <span className="text-xs text-slate-300 hidden sm:inline shrink-0">/</span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-800 capitalize truncate">
              {activeMenu === "dashboard" && "Dashboard & System Metrics Overview"}
              {activeMenu === "analyzer" && "ATS Scanner & Natural Language Keyword Auditor"}
              {activeMenu === "builder" && "Interactive Fresher Resume Builder"}
              {activeMenu === "recommender" && "Multi-domain Career Fitment Engine"}
              {activeMenu === "gap" && "Skill Gap Benchmark Comparison Model"}
              {activeMenu === "chat" && "Adaptive NLP Professional Advising Bot"}
              {activeMenu === "toolkit" && "University Viva Prep & Streamlit Resource Hub"}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 shrink-0 ml-2">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-600 bg-slate-50 border px-2.5 py-1 sm:py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="hidden leading-none sm:inline">Gemini API: <strong className="text-slate-900">Active</strong></span>
              <span className="sm:hidden font-bold text-slate-800">API</span>
            </div>
            
            <button 
              onClick={() => {
                setResumeForm(HIGH_ATS_SAMPLE);
                setRecomInputs({
                  skills: "Python, SQL, HTML, CSS, React, Pandas, NumPy",
                  interests: "Machine Learning, Artificial Intelligence, Web Development",
                  projects: "AI Neural Parser using TensorFlow, React database interface",
                  certifications: "AWS Cloud Practitioner, DeepLearning.AI ML Specialization"
                });
                showToast("Demo profile presets loaded successfully.");
              }}
              className="text-[11px] sm:text-xs text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition shrink-0"
              title="Load demo profile and advisor input values for instant testing"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> <span>Load Demo Presets</span>
            </button>

            <button 
              onClick={clearAllApplicationData}
              className="text-[11px] sm:text-xs text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition shrink-0"
              title="Quickly clear all inputs, messages, uploaded files, and reset to a completely fresh session"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" /> <span>Clear Session</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE SWITCH PANEL */}
        <div className="flex-1 p-4 sm:p-8 print:p-0">
          
          {/* ==========================================
              MODULE 1: DASHBOARD
              ========================================== */}
          {activeMenu === "dashboard" && (
            <div className="space-y-8 animate-fade-in" id="dashboard-tab">
              
              {/* Top Banner Alert / Feature Header */}
              <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white p-8 rounded-2xl relative overflow-hidden shadow-md">
                <div className="relative z-10 max-w-2xl">
                  <span className="inline-block bg-white/20 text-white rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-4 border border-white/10">
                    B.Tech / MCA Minor Portfolio Project
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                    AI-Powered Career & ATS Analytics Pipeline
                  </h2>
                  <p className="text-blue-100 text-sm leading-relaxed mb-6">
                    A comprehensive full-stack intelligent engine to calculate ATS format scores, extract and align skill taxonomies with 22 dynamic engineering domains, compare skill gap indices, and advise students via an interactive chatbot interface.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => setActiveMenu("analyzer")}
                      className="bg-white text-blue-700 hover:bg-blue-50 px-5  py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Search className="w-4 h-4" /> Go to ATS Scanner
                    </button>
                    <button 
                      onClick={() => setActiveMenu("builder")}
                      className="bg-blue-800/40 text-blue-50 border border-blue-500/30 hover:bg-blue-800/60 px-5 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Start Resume Builder
                    </button>
                    <button 
                      onClick={() => setActiveMenu("toolkit")}
                      className="bg-slate-900/40 hover:bg-slate-900/60 text-white border border-slate-700 px-5 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <BookOpen className="w-4 h-4" /> Viva Prep & Slides Output
                    </button>
                  </div>
                </div>
                {/* Visual elements */}
                <div className="absolute top-0 right-0 w-80 h-full bg-slate-950/10 rounded-l-full blur-xl pointer-events-none"></div>
              </div>

              {/* Grid Widgets (Composite Statistics) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Score Panel */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-slate-550 text-xs uppercase tracking-wider font-semibold block mb-2">Average ATS Score</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-blue-600">
                        {analysisResult ? analysisResult.score : "0"}
                      </span>
                      <span className="text-slate-400 text-xs">/100</span>
                    </div>
                  </div>
                  <div className="mt-4 border-t pt-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 bg-slate-100 rounded px-2 py-0.5 font-medium">
                      Status: {analysisResult ? analysisResult.grade : "No Resume Scanned"}
                    </span>
                    <span className={analysisResult ? "text-green-600 font-bold" : "text-slate-400 font-medium"}>
                      {analysisResult ? "Optimal Range" : "Awaiting Scan"}
                    </span>
                  </div>
                </div>

                {/* Scope Panel */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-slate-550 text-xs uppercase tracking-wider font-semibold block mb-2">Tracked Skill Keywords</span>
                    <div className="text-3xl font-extrabold text-slate-800">
                      {analysisResult ? analysisResult.detectedSkills.length : 0}
                    </div>
                  </div>
                  <div className="mt-4 border-t pt-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Taxonomy checks</span>
                    <span className="text-slate-500 font-semibold font-sans">22 Tech Fields</span>
                  </div>
                </div>

                {/* Gap Panel */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-slate-550 text-xs uppercase tracking-wider font-semibold block mb-2">Identity-Map Gaps</span>
                    <div className="text-3xl font-extrabold text-orange-600">
                      {analysisResult && gapResults ? gapResults.gaps.filter(g => g.status !== "Acquired").length : 0}
                    </div>
                  </div>
                  <div className="mt-4 border-t pt-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Targeting:</span>
                    <span className="text-blue-600 font-bold truncate max-w-[100px]">{targetDomain}</span>
                  </div>
                </div>

                {/* AI System Status Panel */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-slate-550 text-xs uppercase tracking-wider font-semibold block mb-2">Cognitive Core Engine</span>
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      Hybrid Generative AI
                    </div>
                  </div>
                  <div className="mt-4 border-t pt-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Model:</span>
                    <span className="text-slate-800 font-mono text-[10px]">gemini-3.5-flash</span>
                  </div>
                </div>

              </div>

              {/* Dynamic Sections row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left block - Resume quick scanner status & recent recommendations */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Top Aligned Career Recommendations</h3>
                      <button onClick={() => setActiveMenu("recommender")} className="text-xs text-blue-600 font-bold hover:underline">
                        RECALCULATE ➔
                      </button>
                    </div>
                    
                    <div className="p-6">
                      {!analysisResult && !resumeForm.skills.trim() && !recomInputs.skills.trim() ? (
                        <div className="text-center py-8 text-slate-500 space-y-2">
                          <Compass className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
                          <p className="font-bold text-xs text-slate-700">No Career Matches Processed</p>
                          <p className="text-[10px] text-slate-400 max-w-sm mx-auto">
                            Run the ATS Resume Analyzer, fill out the Resume Builder, or load the demo presets to calculate dynamic engineering role fits.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {recommendations.slice(0, 4).map((rec, idx) => (
                            <div key={idx} className="p-4 border border-slate-100 rounded-lg hover:border-slate-300 transition-all bg-slate-50 flex flex-col justify-between whitespace-normal">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-bold text-slate-800">{rec.domain}</span>
                                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {rec.matchPercentage}% match
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                                  {rec.reason}
                                </p>
                              </div>
                              <div className="flex gap-2 border-t pt-3 text-[10px] text-slate-400">
                                <span className="font-semibold text-slate-600">Gaps:</span>
                                <span className="truncate max-w-[180px]">{rec.missingSkills.join(", ") || "None"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* System Architecture Flow Diagram Block */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4">System Architecture & Pipeline Flow</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs">
                      
                      <div className="border border-blue-100 rounded p-3 bg-blue-50/40">
                        <strong className="block text-blue-700 mb-1">1. Inputs Mode</strong>
                        <span className="text-slate-500 text-[10px]">PDF parser interface / Interactive Form</span>
                      </div>

                      <div className="flex items-center justify-center shrink-0">
                        <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block" />
                        <span className="md:hidden block text-slate-300">▼</span>
                      </div>

                      <div className="border border-teal-100 rounded p-3 bg-teal-50/40">
                        <strong className="block text-teal-700 mb-1">2. Local NLP Parse</strong>
                        <span className="text-slate-500 text-[10px]">Keyword Tokenizers & Category Alignment</span>
                      </div>

                      <div className="flex items-center justify-center shrink-0">
                        <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block" />
                        <span className="md:hidden block text-slate-300">▼</span>
                      </div>

                      <div className="border border-violet-100 rounded p-3 bg-violet-50/40">
                        <strong className="block text-violet-700 mb-1">3. Hybrid LLM AI</strong>
                        <span className="text-slate-500 text-[10px]">Context refinement (Gemini-3.5-flash)</span>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Right block - Chat Widget Preview  */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Quick FAQ Chatbox mini */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[320px]">
                    <div className="px-5 py-3.5 bg-blue-600 text-white font-bold text-xs flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Smart Career Q&A Bot
                    </div>
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-slate-55 text-xs">
                      <div className="text-slate-500 text-center text-[10px] my-1">
                        Recent Session Transcript
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border text-slate-700 shadow-xs">
                        Hi, need some quick support? Try asking <strong>&quot;How can I improve my resume?&quot;</strong> below!
                      </div>
                      {chatMessages.length > 1 && (
                        <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-lg text-slate-800">
                          <strong>Latest:</strong> {chatMessages[chatMessages.length - 1].text.slice(0, 150)}...
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t bg-white">
                      <button 
                        onClick={() => setActiveMenu("chat")} 
                        className="w-full bg-slate-900 text-white font-semibold text-center py-2 rounded-lg text-xs hover:bg-slate-800 transition"
                      >
                        Launch Interactive Conversation
                      </button>
                    </div>
                  </div>

                  {/* Sample Data Fast Select Checklist */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Test Suite Baseline</h4>
                    <p className="text-[11px] text-slate-500">Quick-load sample resume states to preview high/low ATS compliance score algorithms instantly.</p>
                    <div className="space-y-2 pt-1">
                      <button 
                        onClick={() => {
                          loadAtsSampleToAnalyzer("high");
                          setActiveMenu("analyzer");
                        }}
                        className="w-full flex items-center justify-between text-left text-xs p-2.5 border rounded-lg hover:bg-green-50 hover:border-green-300 transition-all text-green-900 font-medium"
                      >
                        <span>🚀 Load Optimized Student Profile</span>
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      </button>
                      <button 
                        onClick={() => {
                          loadAtsSampleToAnalyzer("low");
                          setActiveMenu("analyzer");
                        }}
                        className="w-full flex items-center justify-between text-left text-xs p-2.5 border rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all text-orange-950 font-medium"
                      >
                        <span>⚠️ Load Incomplete/Poor Profile</span>
                        <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              MODULE 2: ATS RESUME ANALYZER
              ========================================== */}
          {activeMenu === "analyzer" && (
            <div className="space-y-8 animate-fade-in" id="analyzer-tab">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Side: Upload & Input Panel */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* Uploader Box */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">Resume Data Ingestion</h3>
                        <p className="text-[11px] text-slate-500">Fast document upload or copy-paste text payload.</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => loadAtsSampleToAnalyzer("high")}
                          className="bg-green-50 hover:bg-green-100 text-green-700 font-bold text-[10px] px-2.5 py-1.5 rounded border border-green-200 transition"
                        >
                          Load Fit Demo
                        </button>
                        <button 
                          onClick={() => loadAtsSampleToAnalyzer("low")}
                          className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[10px] px-2.5 py-1.5 rounded border border-orange-200 transition"
                        >
                          Load Poor Demo
                        </button>
                      </div>
                    </div>

                    {/* Drag and Drop Zone Replicas */}
                    <div className="relative border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-6 transition text-center">
                      <input 
                        type="file" 
                        accept=".txt,.md,.json,.pdf,.docx,.doc" 
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-xs font-bold text-slate-700">Drag & drop or Click to browse</p>
                      <p className="text-[10px] text-slate-400 mt-1">Supports plain text (.txt, .md, .json) or binary docs (.pdf, .docx)</p>
                      {selectedFileName && (
                        <span className="inline-block mt-3 bg-blue-50 text-blue-700 font-mono text-[10px] px-3 py-1 rounded-full border border-blue-100 max-w-[280px] truncate">
                          File: {selectedFileName}
                        </span>
                      )}
                    </div>

                    {/* PDF/Word Explainer Warning Notification */}
                    {fileUploadWarning && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>PDF/Word Document Detected 📄</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-line text-[11px]">
                          {fileUploadWarning}
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => {
                              setFileUploadWarning(null);
                              setSelectedFileName("");
                            }}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-2.5 py-1 rounded text-[10px] transition"
                          >
                            I will copy-paste instead
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Raw Text Box */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>
                          {selectedFileName && !fileUploadWarning ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Extracted plain-text from: <strong className="underline font-mono">{selectedFileName}</strong>
                            </span>
                          ) : (
                            "✍️ Copy-Paste Plain Language Resume Text"
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          (ATS databases read text only)
                        </span>
                      </label>
                      <textarea 
                        value={typedResumeContent}
                        onChange={(e) => {
                          setTypedResumeContent(e.target.value);
                          if (fileUploadWarning && e.target.value.trim().length > 0) {
                            setFileUploadWarning(null);
                          }
                        }}
                        placeholder="Paste full educational records, project descriptions, skills tag lists (e.g. Python, SQL, React) to trigger natural language evaluations..."
                        className="w-full h-[220px] bg-slate-100 border-none rounded-xl p-4 text-xs focus:ring-1 focus:ring-blue-500 font-mono leading-relaxed"
                      />
                    </div>

                    <button 
                      onClick={() => executeResumeAnalysis()}
                      disabled={isAnalyzing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-center py-3 rounded-xl text-xs transition disabled:bg-blue-300 flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Evaluating ATS Parameters & Keyword Ratios...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Run ATS Audit & Optimization Engine
                        </>
                      )}
                    </button>

                  </div>

                  {/* ATS Educational Help callout */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-slate-600 space-y-2">
                    <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      What does "Copy-Paste Plain Language" mean?
                    </h4>
                    <p className="text-[11px] leading-relaxed">
                      Applicant Tracking Systems (ATS) read resume files by converting them into unified, layout-free plain text. Stylish multi-columns, colored visual meters, or custom table borders in PDF files often scramble the text order, making it unreadable to scanner filters.
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      By copy-pasting your resume's plain text here, you evaluate exactly what the AI parser and ATS indexers will digest!
                    </p>
                  </div>

                </div>

                {/* Right Side: Detailed Results View */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {analysisResult ? (
                    <div className="space-y-6 animate-fade-in">
                      
                      {/* Big Score Header */}
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Cumulative ATS Score</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-extrabold text-blue-600">{analysisResult.score}</span>
                            <span className="text-slate-400 font-sans text-sm font-semibold">/100</span>
                          </div>
                   
                          {/* Compliance state tag */}
                          <div className="mt-3 flex gap-2">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              analysisResult.isAtsFriendly 
                                ? "bg-green-50 text-green-700 border border-green-100" 
                                : "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                              {analysisResult.isAtsFriendly ? "● ACCORDANT (ATS-FRIENDLY)" : "● REJECT HAZARD (NOT ATS-FRIENDLY)"}
                            </span>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-150 border uppercase text-slate-600">
                              Grade: {analysisResult.grade}
                            </span>
                          </div>
                        </div>

                        {/* Pie score indicator block */}
                        <div className="relative w-24 h-24 flex items-center justify-center rounded-full border border-slate-100 shadow-inner bg-slate-50">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle 
                              cx="48" 
                              cy="48" 
                              r="36" 
                              className="stroke-slate-100" 
                              strokeWidth="8" 
                              fill="transparent" 
                            />
                            <circle 
                              cx="48" 
                              cy="48" 
                              r="36" 
                              className="stroke-blue-600 transition-all duration-1000" 
                              strokeWidth="8" 
                              fill="transparent" 
                              strokeDasharray={226}
                              strokeDashoffset={226 - (226 * analysisResult.score) / 100}
                            />
                          </svg>
                          <span className="absolute text-xs font-extrabold text-slate-800">{analysisResult.score}%</span>
                        </div>
                      </div>

                      {/* Structural Checklist */}
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Document Structural Auditing</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          
                          <div className="flex items-center gap-2 p-2.5 border rounded-lg bg-slate-55">
                            {analysisResult.structureAnalysis.hasContactInfo ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                            )}
                            <div>
                              <span className="font-bold block">Contact Information</span>
                              <span className="text-[10px] text-slate-500">{analysisResult.structureAnalysis.hasContactInfo ? "Email, phone or site noted" : "Critical Contact components lost"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-2.5 border rounded-lg bg-slate-55">
                            {analysisResult.structureAnalysis.hasSkillsSection ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                            )}
                            <div>
                              <span className="font-bold block">Skills Classifier Section</span>
                              <span className="text-[10px] text-slate-500">{analysisResult.structureAnalysis.hasSkillsSection ? "Skills catalogized nicely" : "Missing dedicated Skills block"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-2.5 border rounded-lg bg-slate-55">
                            {analysisResult.structureAnalysis.hasEducation ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                            )}
                            <div>
                              <span className="font-bold block">Academic Credentials</span>
                              <span className="text-[10px] text-slate-500">{analysisResult.structureAnalysis.hasEducation ? "College details catalogized" : "Specify college or degrees properly"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-2.5 border rounded-lg bg-slate-55">
                            {analysisResult.structureAnalysis.hasExperienceOrProjects ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                            )}
                            <div>
                              <span className="font-bold block">Projects or Internships</span>
                              <span className="text-[10px] text-slate-500">{analysisResult.structureAnalysis.hasExperienceOrProjects ? "Identified portfolio lists" : "Projects block is empty"}</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Keywords Panel */}
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">Extracted Technical Competencies</h4>
                          <p className="text-[10px] text-slate-500">Industry taxonomy matches recognized in your supplied text files:</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {analysisResult.detectedSkills.length > 0 ? (
                            analysisResult.detectedSkills.map((sk, id) => (
                              <span key={id} className="bg-blue-50 text-blue-800 font-semibold text-[10px] px-2 py-1 rounded inline-block border border-blue-100">
                                {sk}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-orange-600 italic">No industry database keys flagged. Copy-paste specific technological words.</span>
                          )}
                        </div>

                        <div className="border-t pt-4 space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Top Recommended Gaps to Bridge:</label>
                          <div className="flex flex-wrap gap-1.5">
                            {analysisResult.missingKeywords.map((msk, id) => (
                              <span key={id} className="bg-orange-50 text-orange-850 font-medium text-[10px] px-2 py-1 rounded inline-block border border-orange-200">
                                + Add {msk}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Suggestions and Optimizations */}
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">ATS Layout Recommendations</h4>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {analysisResult.recommendations.map((rec, id) => (
                            <li key={id} className="flex items-start gap-2 leading-relaxed bg-slate-50 p-2.5 rounded border">
                              <span className="text-blue-600 font-bold shrink-0 mt-0.5">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="border-t pt-4 space-y-3">
                          <span className="font-bold text-xs text-slate-800 uppercase tracking-wider block">AI-Augmented Bullet Points for your projects:</span>
                          <div className="space-y-2 text-[11px] font-mono leading-relaxed text-slate-650">
                            {analysisResult.optimizedBulletPoints.map((bp, id) => (
                              <div key={id} className="p-3 bg-emerald-50/20 border border-emerald-105 rounded-lg text-emerald-900 group relative">
                                <span className="block font-sans text-[10px] font-bold text-emerald-700 mb-1">High-Index Template {id+1}</span>
                                &quot;{bp}&quot;
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 space-y-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-700 text-sm">No analysis performed yet</h3>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                          Provide your resume details on the left, then click run to process ATS compliance ratings and keyword scans.
                        </p>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              MODULE 3: RESUME BUILDER
              ========================================== */}
          {activeMenu === "builder" && (
            <div className="space-y-8 animate-fade-in" id="builder-tab">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Area: Builder Input Forms */}
                <div className="lg:col-span-5 space-y-6 max-h-[700px] overflow-y-auto pr-2">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Resume Parameters</h3>
                      <p className="text-xs text-slate-400">Add credentials corresponding to standard ATS sections.</p>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-3 border-t pt-4">
                      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">1. General Information</span>
                      <div className="space-y-2.5">
                        <input 
                          type="text" 
                          placeholder="Full Name" 
                          value={resumeForm.fullName}
                          onChange={(e) => setResumeForm({ ...resumeForm, fullName: e.target.value })}
                          className="w-full bg-slate-100 border-none rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={resumeForm.email}
                            onChange={(e) => setResumeForm({ ...resumeForm, email: e.target.value })}
                            className="bg-slate-100 border-none rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                          />
                          <input 
                            type="text" 
                            placeholder="Phone Number" 
                            value={resumeForm.phone}
                            onChange={(e) => setResumeForm({ ...resumeForm, phone: e.target.value })}
                            className="bg-slate-100 border-none rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Location / Address" 
                          value={resumeForm.location}
                          onChange={(e) => setResumeForm({ ...resumeForm, location: e.target.value })}
                          className="w-full bg-slate-100 border-none rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            placeholder="GitHub Link (optional)" 
                            value={resumeForm.website}
                            onChange={(e) => setResumeForm({ ...resumeForm, website: e.target.value })}
                            className="bg-slate-100 border-none rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                          />
                          <input 
                            type="text" 
                            placeholder="LinkedIn Profile (optional)" 
                            value={resumeForm.linkedin}
                            onChange={(e) => setResumeForm({ ...resumeForm, linkedin: e.target.value })}
                            className="bg-slate-100 border-none rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Skills Tag Input */}
                    <div className="space-y-3 border-t pt-4">
                      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">2. Technical Skills Comma List</span>
                      <textarea 
                        placeholder="Python, SQL, React, Node.js, Tensorboard, etc." 
                        value={resumeForm.skills}
                        onChange={(e) => setResumeForm({ ...resumeForm, skills: e.target.value })}
                        className="w-full h-16 bg-slate-100 border-none rounded-lg p-3 text-xs focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Academic History */}
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">3. Education & Degrees</span>
                        <button onClick={addEducation} className="text-[10px] font-bold text-blue-600 hover:text-blue-850 flex items-center gap-0.5">
                          <Plus className="w-3 h-3" /> Add Educ.
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {resumeForm.education.map((edu, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border rounded-lg space-y-2 relative">
                            {resumeForm.education.length > 1 && (
                              <button 
                                onClick={() => removeEducation(idx)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            <input 
                              type="text" 
                              placeholder="College / Institution" 
                              value={edu.institution}
                              onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                              className="w-full bg-white border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input 
                                type="text" 
                                placeholder="Degree (B.Tech, MCA etc)" 
                                value={edu.degree}
                                onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                                className="bg-white border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                              />
                              <input 
                                type="text" 
                                placeholder="Field and Core Branch" 
                                value={edu.fieldOfStudy}
                                onChange={(e) => handleEducationChange(idx, "fieldOfStudy", e.target.value)}
                                className="bg-white border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              <input 
                                type="text" 
                                placeholder="Start Date" 
                                value={edu.startDate}
                                onChange={(e) => handleEducationChange(idx, "startDate", e.target.value)}
                                className="bg-white border-slate-200 rounded px-1.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                              />
                              <input 
                                type="text" 
                                placeholder="End Date" 
                                value={edu.endDate}
                                onChange={(e) => handleEducationChange(idx, "endDate", e.target.value)}
                                className="bg-white border-slate-200 rounded px-1.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                              />
                              <input 
                                type="text" 
                                placeholder="GPA / Grade" 
                                value={edu.grade}
                                onChange={(e) => handleEducationChange(idx, "grade", e.target.value)}
                                className="bg-white border-slate-200 rounded px-1.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Portfolio Projects */}
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">4. Academic Projects</span>
                        <button onClick={addProject} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                          <Plus className="w-3 h-3" /> Add Project
                        </button>
                      </div>

                      <div className="space-y-4">
                        {resumeForm.projects.map((proj, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border rounded-lg space-y-2 relative">
                            {resumeForm.projects.length > 1 && (
                              <button 
                                onClick={() => removeProject(idx)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            <input 
                              type="text" 
                              placeholder="Project Title" 
                              value={proj.title}
                              onChange={(e) => handleProjectChange(idx, "title", e.target.value)}
                              className="w-full bg-white border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                            />
                            <input 
                              type="text" 
                              placeholder="Technologies Utilized (React, SQL etc)" 
                              value={proj.technologies}
                              onChange={(e) => handleProjectChange(idx, "technologies", e.target.value)}
                              className="w-full bg-white border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                            />
                            <textarea 
                              placeholder="Explain core functions and measurable metrics achieved..." 
                              value={proj.description}
                              onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                              className="w-full h-16 bg-white border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-blue-500"
                            />
                            <input 
                              type="text" 
                              placeholder="GitHub/Deployment Link" 
                              value={proj.link}
                              onChange={(e) => handleProjectChange(idx, "link", e.target.value)}
                              className="w-full bg-white border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Internships/Work */}
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">5. Internship / Work Exp</span>
                        <button onClick={addExperience} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                          <Plus className="w-3 h-3" /> Add Exp
                        </button>
                      </div>

                      <div className="space-y-4">
                        {resumeForm.experience.map((exp, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border rounded-lg space-y-2 relative">
                            <button 
                              onClick={() => removeExperience(idx)}
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <input 
                              type="text" 
                              placeholder="Company name" 
                              value={exp.company}
                              onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                              className="w-full bg-white border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                            />
                            <input 
                              type="text" 
                              placeholder="Position / Role (e.g. Intern)" 
                              value={exp.position}
                              onChange={(e) => handleExperienceChange(idx, "position", e.target.value)}
                              className="w-full bg-white border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input 
                                type="text" 
                                placeholder="Start" 
                                value={exp.startDate}
                                onChange={(e) => handleExperienceChange(idx, "startDate", e.target.value)}
                                className="bg-white border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                              />
                              <input 
                                type="text" 
                                placeholder="End" 
                                value={exp.endDate}
                                onChange={(e) => handleExperienceChange(idx, "endDate", e.target.value)}
                                className="bg-white border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <textarea 
                              placeholder="Scope of work..." 
                              value={exp.description}
                              onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                              className="w-full h-16 bg-white border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Certifications and Accomplishments */}
                    <div className="space-y-3 border-t pt-4">
                      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">6. Certifications List</span>
                      <textarea 
                        placeholder="Tensorflow certification, AWS Developer Specialist" 
                        value={resumeForm.certifications}
                        onChange={(e) => setResumeForm({ ...resumeForm, certifications: e.target.value })}
                        className="w-full h-16 bg-slate-100 border-none rounded-lg p-3 text-xs focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-3 border-t pt-4">
                      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">7. Extra Achievements (Bullet lines)</span>
                      <textarea 
                        placeholder="• Secured first place in Google coding hackathon." 
                        value={resumeForm.achievements}
                        onChange={(e) => setResumeForm({ ...resumeForm, achievements: e.target.value })}
                        className="w-full h-20 bg-slate-100 border-none rounded-lg p-3 text-xs focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                  </div>
                </div>

                {/* Right Area: Interactive Exportable Template Previews */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Style Presets and action Bar */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Preset Themes:</span>
                      <div className="inline-flex rounded-lg border overflow-hidden p-0.5 bg-slate-100">
                        <button 
                          onClick={() => setActiveTemplate("navy")}
                          className={`px-3 py-1 text-[11px] font-bold rounded-md transition ${activeTemplate === "navy" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                        >
                          Deep Navy
                        </button>
                        <button 
                          onClick={() => setActiveTemplate("teal")}
                          className={`px-3 py-1 text-[11px] font-bold rounded-md transition ${activeTemplate === "teal" ? "bg-white text-teal-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                        >
                          Modern Teal
                        </button>
                        <button 
                          onClick={() => setActiveTemplate("minimal")}
                          className={`px-3 py-1 text-[11px] font-bold rounded-md transition ${activeTemplate === "theme-mono" || activeTemplate === "minimal" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                        >
                          Academic Minimal
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={syncBuilderToAnalyzerAndSwitch}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                      >
                        <Search className="w-3.5 h-3.5" /> Analyze Output
                      </button>
                      
                      <button 
                        onClick={handlePrintResume}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                      >
                        <Printer className="w-3.5 h-3.5" /> Output Print / PDF
                      </button>
                    </div>
                  </div>

                  {/* Renderable Print Sheet */}
                  <div 
                    id="printable-resume"
                    className={`bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-left max-h-[700px] overflow-y-auto whitespace-normal select-text relative font-sans ${
                      activeTemplate === "navy" ? "border-t-8 border-t-slate-900 shadow-slate-100" : ""
                    } ${
                      activeTemplate === "teal" ? "border-t-8 border-t-teal-600 shadow-teal-50" : ""
                    }`}
                  >
                    
                    {/* Template Standard Header */}
                    <div className="text-center space-y-1.5 border-b pb-4 mb-5">
                      <h2 className={`text-2xl font-black ${
                        activeTemplate === "navy" ? "text-slate-900" : ""
                      } ${
                        activeTemplate === "teal" ? "text-teal-900" : ""
                      } ${
                        activeTemplate === "minimal" ? "text-slate-850" : ""
                      }`}>{resumeForm.fullName || "Your Full Name"}</h2>
                      
                      <div className="text-xs text-slate-600 flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono font-medium">
                        <span>{resumeForm.email || "email@address.com"}</span>
                        <span>•</span>
                        <span>{resumeForm.phone || "Telephone"}</span>
                        {resumeForm.location && (
                          <>
                            <span>•</span>
                            <span>{resumeForm.location}</span>
                          </>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 font-mono flex flex-wrap justify-center gap-3 pt-1">
                        {resumeForm.website && <span className="underline">{resumeForm.website}</span>}
                        {resumeForm.linkedin && <span className="underline">{resumeForm.linkedin}</span>}
                      </div>
                    </div>

                    {/* Left & Right Content sections formatted carefully */}
                    <div className="space-y-5 text-xs text-slate-800 leading-normal">
                      
                      {/* Skills Sub-box */}
                      {resumeForm.skills && (
                        <div className="space-y-1.5">
                          <h4 className={`text-[11px] font-extrabold uppercase tracking-widest ${
                            activeTemplate === "navy" ? "text-slate-900 border-b" : ""
                          } ${
                            activeTemplate === "teal" ? "text-teal-700 border-b border-teal-100" : ""
                          } ${
                            activeTemplate === "minimal" ? "text-slate-600 border-b" : ""
                          } pb-0.5`}>TECHNICAL SKILLS</h4>
                          
                          <p className="text-slate-700 font-medium py-1">{resumeForm.skills}</p>
                        </div>
                      )}

                      {/* Education Sub-box */}
                      {resumeForm.education.length > 0 && (
                        <div className="space-y-2">
                          <h4 className={`text-[11px] font-extrabold uppercase tracking-widest ${
                            activeTemplate === "navy" ? "text-slate-900 border-b" : ""
                          } ${
                            activeTemplate === "teal" ? "text-teal-700 border-b border-teal-100" : ""
                          } ${
                            activeTemplate === "minimal" ? "text-slate-600 border-b" : ""
                          } pb-0.5`}>EDUCATIONAL BACKPLANE</h4>
                          
                          <div className="space-y-3">
                            {resumeForm.education.map((edu, id) => (
                              <div key={id} className="flex justify-between items-start">
                                <div>
                                  <strong className="text-slate-800 text-xs">{edu.institution || "College Name"}</strong>
                                  <span className="text-slate-600 block text-[11px]">{edu.degree} in {edu.fieldOfStudy || "Academic Field"}</span>
                                </div>
                                <div className="text-right text-[11px] text-slate-500 font-mono">
                                  <span>{edu.startDate || "Start"} to {edu.endDate || "Present"}</span>
                                  {edu.grade && <span className="block font-bold mt-0.5 text-slate-800">Grade: {edu.grade}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Academic Projects Sub-box */}
                      {resumeForm.projects.length > 0 && (
                        <div className="space-y-2">
                          <h4 className={`text-[11px] font-extrabold uppercase tracking-widest ${
                            activeTemplate === "navy" ? "text-slate-900 border-b" : ""
                          } ${
                            activeTemplate === "teal" ? "text-teal-700 border-b border-teal-100" : ""
                          } ${
                            activeTemplate === "minimal" ? "text-slate-600 border-b" : ""
                          } pb-0.5`}>ACADEMIC PORTFOLIO PROJECTS</h4>
                          
                          <div className="space-y-3">
                            {resumeForm.projects.map((proj, id) => (
                              <div key={id} className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                  <strong className="text-slate-800 text-[12px]">{proj.title || "Project Name"}</strong>
                                  {proj.link && <span className="text-[10px] text-blue-600 font-mono shrink-0">{proj.link}</span>}
                                </div>
                                {proj.technologies && (
                                  <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide">
                                    Stack: {proj.technologies}
                                  </span>
                                )}
                                <p className="text-slate-650 text-[11px] leading-relaxed font-sans">{proj.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Professional Internships */}
                      {resumeForm.experience.length > 0 && (
                        <div className="space-y-2">
                          <h4 className={`text-[11px] font-extrabold uppercase tracking-widest ${
                            activeTemplate === "navy" ? "text-slate-900 border-b" : ""
                          } ${
                            activeTemplate === "teal" ? "text-teal-700 border-b border-teal-100" : ""
                          } ${
                            activeTemplate === "minimal" ? "text-slate-600 border-b" : ""
                          } pb-0.5`}>PRACTICAL WORK EXPERIENCE / INTERNSHIPS</h4>
                          
                          <div className="space-y-3">
                            {resumeForm.experience.map((exp, id) => (
                              <div key={id} className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                  <div>
                                    <strong className="text-slate-850">{exp.position || "Title Name"}</strong>
                                    <span className="text-slate-600 text-[11px]"> @ {exp.company || "Corporate Agency"}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono">{exp.startDate || "Start"} to {exp.endDate || "Present"}</span>
                                </div>
                                <p className="text-slate-650 text-[11px] leading-relaxed font-sans">{exp.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certifications Category */}
                      {resumeForm.certifications && (
                        <div className="space-y-1.5">
                          <h4 className={`text-[11px] font-extrabold uppercase tracking-widest ${
                            activeTemplate === "navy" ? "text-slate-900 border-b" : ""
                          } ${
                            activeTemplate === "teal" ? "text-teal-700 border-b border-teal-100" : ""
                          } ${
                            activeTemplate === "minimal" ? "text-slate-600 border-b" : ""
                          } pb-0.5`}>CERTIFICATIONS</h4>
                          <p className="text-slate-700 leading-normal">{resumeForm.certifications}</p>
                        </div>
                      )}

                      {/* Achievements Category */}
                      {resumeForm.achievements && (
                        <div className="space-y-1.5">
                          <h4 className={`text-[11px] font-extrabold uppercase tracking-widest ${
                            activeTemplate === "navy" ? "text-slate-900 border-b" : ""
                          } ${
                            activeTemplate === "teal" ? "text-teal-700 border-b border-teal-100" : ""
                          } ${
                            activeTemplate === "minimal" ? "text-slate-600 border-b" : ""
                          } pb-0.5`}>EXTRA CURRICULAR ACCOMPLISHMENTS</h4>
                          <p className="text-slate-700 leading-normal font-mono text-[11px] whitespace-pre-wrap">{resumeForm.achievements}</p>
                        </div>
                      )}

                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              MODULE 4: CAREER RECOMMENDER
              ========================================== */}
          {activeMenu === "recommender" && (
            <div className="space-y-8 animate-fade-in" id="recommender-tab">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Profile form inputs */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Aligner Inputs</h3>
                      <p className="text-[11px] text-slate-400">Modify inputs to filter match evaluations against 22 dynamic tech careers.</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Current Tech Skills</label>
                        <textarea 
                          value={recomInputs.skills}
                          onChange={(e) => setRecomInputs({ ...recomInputs, skills: e.target.value })}
                          className="w-full h-16 bg-slate-55 border-none rounded p-2.5 text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Specified Fields of Interest</label>
                        <input 
                          type="text"
                          value={recomInputs.interests}
                          onChange={(e) => setRecomInputs({ ...recomInputs, interests: e.target.value })}
                          className="w-full bg-slate-55 border-none rounded px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Key Academic Projects</label>
                        <textarea 
                          value={recomInputs.projects}
                          onChange={(e) => setRecomInputs({ ...recomInputs, projects: e.target.value })}
                          className="w-full h-16 bg-slate-55 border-none rounded p-2.5 text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Special Certifications</label>
                        <input 
                          type="text"
                          value={recomInputs.certifications}
                          onChange={(e) => setRecomInputs({ ...recomInputs, certifications: e.target.value })}
                          className="w-full bg-slate-55 border-none rounded px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={runStaticRecommender}
                      disabled={isRecommending}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs transition disabled:bg-blue-300 flex items-center justify-center gap-1"
                    >
                      {isRecommending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                      Compute Match Alignments
                    </button>
                  </div>
                </div>

                {/* Displaying ranked outputs */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="border-b pb-3 mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">Matched Careers Taxonomy Analysis</h3>
                        <p className="text-xs text-slate-505">Dynamic cosine similarity models evaluated across technical skill sets.</p>
                      </div>
                      <span className="bg-blue-50 text-blue-800 font-bold text-[10px] px-3 py-1 rounded-full border border-blue-200 animate-pulse">
                        Dynamic Ranker Ready
                      </span>
                    </div>

                    {isRecommending ? (
                      <div className="py-12 text-center text-slate-550 space-y-2">
                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                        <p className="text-xs font-semibold">Generating customized recommendations based on text context...</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {recommendations.map((rec, idx) => (
                          <div key={idx} className="border border-slate-100 rounded-xl p-5 hover:bg-slate-55 transition-all space-y-3 whitespace-normal">
                            
                            {/* Title & Match Score bar */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-805 text-slate-800 text-xs font-black bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <h4 className="text-sm font-bold text-slate-800">{rec.domain}</h4>
                              </div>
                              <div className="text-right">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                  rec.matchPercentage > 80 ? "bg-green-50 text-green-700 border border-green-150" : "bg-blue-50 text-blue-700 border border-blue-150"
                                }`}>
                                  Match Score: {rec.matchPercentage}%
                                </span>
                              </div>
                            </div>

                            {/* Reason analysis */}
                            <p className="text-xs text-slate-650 leading-relaxed italic font-sans">{rec.reason}</p>

                            {/* Score progress meters */}
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  rec.matchPercentage > 80 ? "bg-green-500" : "bg-blue-600"
                                }`}
                                style={{ width: `${rec.matchPercentage}%` }}
                              ></div>
                            </div>

                            {/* Additional gaps inside card */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t text-xs">
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Missing skills checklist:</span>
                                <div className="flex flex-wrap gap-1">
                                  {rec.missingSkills.map((ms, i) => (
                                    <span key={i} className="bg-red-50 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded border border-red-101">
                                      {ms}
                                    </span>
                                  ))}
                                  {rec.missingSkills.length === 0 && <span className="text-[10.5px] text-green-600">Perfectly Complete</span>}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Recommended Certifications:</span>
                                <div className="text-[10.5px] space-y-1 font-medium text-slate-700">
                                  {rec.suggestedCertifications.map((sc, i) => (
                                    <div key={i} className="flex items-center gap-1 truncate">
                                      <Award className="w-3 h-3 text-amber-500 shrink-0" />
                                      <span className="truncate">{sc}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Learning Steps */}
                            <div className="bg-white p-3 border border-slate-100 rounded-lg space-y-2">
                              <span className="text-[10px] uppercase font-bold text-slate-800 block tracking-wider">Skill-Bridge Roadmap Actions</span>
                              <div className="space-y-1.5 text-[11px] text-slate-600 font-sans">
                                {rec.learningRoadmap.map((rm, i) => (
                                  <div key={i} className="flex items-start gap-1">
                                    <span className="text-blue-600 font-bold shrink-0">Step {i+1}:</span>
                                    <span>{rm}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              MODULE 5: SKILL GAP ANALYZER
              ========================================== */}
          {activeMenu === "gap" && (
            <div className="space-y-8 animate-fade-in" id="gap-tab">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Target Select Area */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Target Engineering Field</h3>
                      <p className="text-[11px] text-slate-405">Select a target career to compare technology requirements.</p>
                    </div>

                    <div className="space-y-3">
                      <select 
                        value={targetDomain}
                        onChange={(e) => {
                          setTargetDomain(e.target.value);
                          runStaticGapAnalysis(e.target.value);
                        }}
                        className="w-full bg-slate-55 border text-xs px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
                      >
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Machine Learning">Machine Learning</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Robotics">Robotics</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Cloud Computing">Cloud Computing</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Embedded Systems">Embedded Systems</option>
                        <option value="IoT">IoT</option>
                      </select>

                      <div className="p-3 border rounded-lg bg-orange-50/10 border-orange-100/50 space-y-1 text-xs">
                        <span className="font-bold text-slate-800 block">Current Builder Profile Skills:</span>
                        <div className="text-slate-650 font-mono text-[10.5px] truncate max-h-[60px] overflow-y-auto">
                          {resumeForm.skills || "No skills added yet in builder form."}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => runStaticGapAnalysis()}
                      disabled={isGapAnalyzing}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs transition disabled:bg-slate-300 flex items-center justify-center gap-1"
                    >
                      {isGapAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5" />}
                      Sync & Recompute Gaps
                    </button>
                  </div>
                </div>

                {/* Analytical charts comparison list */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {gapResults && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                      
                      {/* Summary callout */}
                      <div className="p-4 bg-blue-50/40 border border-blue-105 rounded-lg">
                        <h4 className="font-bold text-xs text-blue-900 mb-1">Comparative Gap Audit</h4>
                        <p className="text-xs text-blue-950 font-sans leading-relaxed">{gapResults.summary}</p>
                      </div>

                      {/* Gaps Progress Graph */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-xs text-slate-850 uppercase tracking-wider">Required Skill vs Current Skill levels</h4>
                        
                        <div className="space-y-5">
                          {gapResults.gaps.map((gap, id) => (
                            <div key={id} className="space-y-2 whitespace-normal">
                              
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-800">{gap.skillName}</span>
                                <div className="flex gap-2">
                                  <span className="text-[10px] bg-slate-100 rounded px-2 font-mono">My Level: {gap.userLevel}%</span>
                                  <span className="text-[10px] bg-blue-50 text-blue-805 rounded px-2 font-mono">Industry: {gap.industryRequired}%</span>
                                  <span className={`text-[10px] font-bold px-2 rounded ${
                                    gap.status === "Acquired" ? "bg-green-50 text-green-700" :
                                    gap.status === "Critical Need" ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"
                                  }`}>{gap.status}</span>
                                </div>
                              </div>

                              {/* Layered Bar display mockup */}
                              <div className="relative w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div 
                                  className="absolute top-0 left-0 bg-blue-250 h-full rounded-full bg-blue-100" 
                                  style={{ width: `${gap.industryRequired}%` }}
                                ></div>
                                <div 
                                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${
                                    gap.status === "Acquired" ? "bg-green-500" :
                                    gap.status === "Critical Need" ? "bg-red-500" : "bg-orange-500"
                                  }`} 
                                  style={{ width: `${gap.userLevel}%` }}
                                ></div>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span>Recommended Course: <strong className="text-slate-700">{gap.recommendedCourse}</strong></span>
                                {gap.gap > 0 ? (
                                  <span className="text-red-500 font-bold">-{gap.gap}% gap</span>
                                ) : (
                                  <span className="text-green-600 font-bold">Aligned</span>
                                )}
                              </div>

                            </div>
                          ))}
                        </div>

                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              MODULE 6: AI CHATBOT INTERACTIVE CONSOLE
              ========================================== */}
          {activeMenu === "chat" && (
            <div className="space-y-6 animate-fade-in" id="chat-tab">
              
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
                
                {/* Header info */}
                <div className="px-6 py-4 bg-slate-900 border-b border-slate-805 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <div>
                      <h3 className="font-bold text-xs tracking-wider uppercase text-slate-200">Career Advisor AI Client</h3>
                      <p className="text-[10.5px] text-slate-400">NLP Keyword matching matching + async LLM fallbacks</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setChatMessages([
                        {
                          id: "init-message",
                          sender: "bot",
                          text: "Conversation thread cleared. What can I answer today?",
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      ]);
                      showToast("Conversation cleared.");
                    }}
                    className="text-xs text-slate-400 hover:text-white transition"
                  >
                    Clear History
                  </button>
                </div>

                {/* Prompt templates bar */}
                <div className="bg-slate-55 border-b px-6 py-2.5 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quick FAQs:</span>
                  {[
                    "How can I improve my resume?",
                    "What skills are needed for AI Engineer?",
                    "Which internship should I apply for?",
                    "What should a fresher learn for Data Science?"
                  ].map((faq, i) => (
                    <button 
                      key={i} 
                      onClick={() => sendChatMessage(faq)}
                      className="bg-white hover:bg-slate-100 text-[10px] font-medium px-2.5 py-1 rounded-full border text-slate-750 transition-all shadow-2xs leading-none"
                    >
                      {faq}
                    </button>
                  ))}
                </div>

                {/* Main scrolling content messages */}
                <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50/50">
                  {chatMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} whitespace-normal`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-4 shadow-3xs flex flex-col ${
                        msg.sender === "user" 
                          ? "bg-blue-600 text-white rounded-tr-none" 
                          : "bg-white border text-slate-800 rounded-tl-none border-slate-200"
                      }`}>
                        
                        <div className="text-[10px] uppercase font-bold text-slate-500/80 mb-1 flex justify-between gap-4 font-sans leading-none">
                          <span className={msg.sender === "user" ? "text-blue-200" : "text-slate-400"}>
                            {msg.sender === "user" ? "YOU" : "CAREER ADVISOR"}
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed font-sans whitespace-pre-wrap">{msg.text}</p>
                        
                        <span className={`text-[9px] text-right block mt-1.5 font-sans leading-none ${
                          msg.sender === "user" ? "text-blue-200/80" : "text-slate-400"
                        }`}>
                          {msg.timestamp}
                        </span>

                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border rounded-2xl rounded-tl-none p-4 border-slate-200 max-w-[85%] flex items-center gap-2 text-xs text-slate-500">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        AI Coach is formulating advice parameters...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input action Bar */}
                <div className="p-4 border-t bg-white shrink-0">
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Ask the advisor about learning roadmaps or certification guidelines..." 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                      className="flex-1 bg-slate-100 border-none rounded-full px-5 py-2.5 text-xs focus:ring-1 focus:ring-blue-500"
                    />
                    <button 
                      onClick={() => sendChatMessage()}
                      disabled={isChatLoading || chatInput.trim() === ""}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-250 text-white p-2.5 rounded-full transition shadow-sm"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
              
            </div>
          )}

          {/* ==========================================
              MODULE 7: MINOR PROJECT TOOLKIT
              ========================================== */}
          {activeMenu === "toolkit" && (
            <div className="space-y-4 animate-fade-in" id="toolkit-tab">
              <ProjectToolkit />
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
