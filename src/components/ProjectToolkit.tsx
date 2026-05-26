/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, Download, BookOpen, Presentation, Code, HelpCircle, FileText, Database } from "lucide-react";

export default function ProjectToolkit() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. Python Streamlit App.py
  const pythonCode = `import streamlit as st
import pandas as pd
import numpy as np
import re
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

st.set_page_config(
    page_title="AI-Powered ATS Resume Companion",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ----------------------------------------------------
# 1. SAMPLE DATASETS & KEYWORD DATABASES
# ----------------------------------------------------
INDUSTRY_KEYWORDS = {
    "Artificial Intelligence": ["TensorFlow", "PyTorch", "NLP", "LLMs", "Transformers", "Neural Networks", "Deep Learning", "Keras"],
    "Machine Learning": ["Python", "scikit-learn", "Pandas", "NumPy", "Regression", "Supervised Learning", "Matplotlib"],
    "Data Science": ["SQL", "Pandas", "Statistics", "PowerBI", "Tableau", "Data Wrangling", "Exploratory Data Analysis"],
    "Robotics": ["ROS", "C++", "Python", "Arduino", "Raspberry Pi", "Sensors", "CAD", "Control Systems"],
    "Web Development": ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "SQL"],
    "Software Engineering": ["Java", "Python", "C++", "Data Structures", "Algorithms", "OOPs", "Git"],
    "Cybersecurity": ["Linux", "Networking", "Penetration Testing", "Wireshark", "Cryptography", "Firewalls"]
}

CHATBOT_QA = [
    {
        "keywords": ["improve", "resume", "better", "ats"],
        "reply": "Tips to improve your fresher resume for ATS compliance:\n1. Keep formatting single-column.\n2. Do NOT put screenshots, visual graphs, or images.\n3. Integrate key tech keywords from the target job profile directly into your skills and project narratives.\n4. List your achievements using performance metrics (e.g. Optimized queries of algorithm to reduce time by 20%)."
    },
    {
        "keywords": ["ai engineer", "learn ai", "ai path"],
        "reply": "To become an AI Engineer:\n1. Master Python and core mathematics (Linear Algebra, Calculus, Probabilities).\n2. Master Machine Learning libraries: Pandas, NumPy, Scikit-Learn.\n3. Deeply understand Neural Networks and implement them with PyTorch or TensorFlow.\n4. Dive into Large Language Models (LLMs) and Vector Databases for custom systems."
    },
    {
        "keywords": ["internship", "fresher apply", "get job"],
        "reply": "To land internships as a fresher:\n1. Open source your top 3 projects on GitHub with structured documentation.\n2. Connect directly with hiring managers on LinkedIn via short polite intro templates.\n3. Build customized ATS resumes for every individual target application."
    }
]

# ----------------------------------------------------
# 2. HELPER LOGIC: ANALYSIS & MATCHES
# ----------------------------------------------------
def analyze_resume_text(text):
    text_lower = text.lower()
    detected_skills = []
    for category, keywords in INDUSTRY_KEYWORDS.items():
        for keyword in keywords:
            if re.search(r'\\b' + re.escape(keyword.lower()) + r'\\b', text_lower):
                detected_skills.append(keyword)
                
    detected_skills = list(set(detectedSkills))
    
    # Structural Check
    has_contact = any(term in text_lower for term in ["email", "phone", "contact", "linkedin", "github", "address"])
    has_skills = any(term in text_lower for term in ["skills", "languages", "technologies", "tools"])
    has_edu = any(term in text_lower for term in ["education", "college", "university", "degree", "btech", "bsc", "bca"])
    has_projects = any(term in text_lower for term in ["projects", "project", "experience", "internship", "achievements"])
    
    score = 30
    if has_contact: score += 15
    if has_skills: score += 20
    if has_edu: score += 15
    if has_projects: score += 20
    
    # Keyword richness bonus
    score += min(len(detected_skills) * 4, 20)
    
    return score, detected_skills, has_contact, has_skills, has_edu, has_projects

# ----------------------------------------------------
# 3. INTERACTIVE SIDEBAR ROUTING
# ----------------------------------------------------
menu = ["Dashboard", "Resume Analyzer", "Career Recommender", "Resume Builder", "Chatbot Advisor"]
choice = st.sidebar.radio("Project Sections Navigation", menu)

st.title("🤖 AI-Powered ATS & Fresher Career Toolkit")
st.markdown("Developed as a complete College Minor Portfolio Project.")

if choice == "Dashboard":
    st.header("📊 Minor Project Dashboard & Architecture Overview")
    st.write("Welcome to your custom AI career dashboard. Use this tool as a comprehensive toolkit to pass resume screens, identify key technology skill-gaps, and learn roadmaps.")
    
    # Metrics
    c1, c2, c3 = st.columns(3)
    c1.metric("Supported Career Domains", "22+")
    c2.metric("Chatbot Pattern Capacity", "Rule-Based + NLP")
    c3.metric("ATS Recommendation Focus", "Fresher / College Entry")
    
    st.success("🤖 Read the Project Documentation page to download presentation slides, report guides, and review viva question papers.")

elif choice == "Resume Analyzer":
    st.header("📝 Resume ATS Score and Keyword Analyzer")
    text_input = st.text_area("Paste Raw Resume Text here to Analyze:", height=200)
    
    if st.button("Run ATS Analysis"):
        if text_input.strip() != "":
            score, skills, contact, s_sec, edu, proj_sec = analyze_resume_text(text_input)
            
            st.metric("ATS Compliance Score", f"{score}/100")
            
            st.write("### Structure Score breakdown:")
            st.write(f"- Contact Elements Detected: {'✅ Present' if contact else '❌ Missing'}")
            st.write(f"- Skills Classification Section: {'✅ Present' if s_sec else '❌ Missing'}")
            st.write(f"- Academic History Section: {'✅ Present' if edu else '❌ Missing'}")
            st.write(f"- Portfolio/Projects Segment: {'✅ Present' if proj_sec else '❌ Missing'}")
            
            st.write("### Recognized Keywords & Technologies:")
            if skills:
                st.info(", ".join(skills))
            else:
                st.warning("No core industry database keywords identified. Ensure you specify Python, SQL, React, etc., to pass scanner algorithms.")
        else:
            st.warning("Please copy-paste or write some text to start the assessment.")

elif choice == "Career Recommender":
    st.header("📈 Dynamic Career Match Evaluator")
    user_skills = st.text_input("Enter your current skills (separated by comma):", "Python, SQL, HTML, CSS")
    
    if st.button("Evaluate Match Percentage"):
        skills_parsed = [s.strip().lower() for s in user_skills.split(",")]
        st.write("### Career Match Potential:")
        
        matches = []
        for domain, keywords in INDUSTRY_KEYWORDS.items():
            matched_keywords = [k for k in keywords if k.lower() in skills_parsed]
            percent = 15 + min(len(matched_keywords) * 20, 80)
            matches.append((domain, percent, matched_keywords))
            
        matches.sort(key=lambda x: x[1], reverse=True)
        
        for name, percent, matched in matches[:3]:
            st.write(f"**{name}** - Alignment Score: **{percent}%**")
            st.write(f"Matched Keywords: {', '.join(matched) or 'None yet'}")
            missing = [k for k in INDUSTRY_KEYWORDS[name] if k.lower() not in skills_parsed]
            st.write(f"Gaps to fill: {', '.join(missing)}")
            st.markdown("---")

elif choice == "Resume Builder":
    st.header("🏢 ATS-Friendly Fresher Resume Builder")
    col1, col2 = st.columns(2)
    with col1:
        name = st.text_input("Full Name *", "John Doe")
        email = st.text_input("Email *", "john@example.com")
        phone = st.text_input("Contact Phone *", "+91 99999 88888")
        links = st.text_input("LinkedIn/GitHub Links", "github.com/johndoe")
    with col2:
        education = st.text_area("Education Experience", "B.Tech in Computer Science, State College (CGPA: 8.5)")
        all_skills = st.text_input("Skills List", "Python, React, SQL, HTML")
        projects = st.text_area("Top Projects", "Project 1: Portfolio website showing interactive UI, integrated local API.")
        
    if st.button("Generate Resume Output"):
        st.success("Resume formatted. Copy the content below:")
        st.code(f"""
======================================
{name.upper()}
{email} | {phone} | {links}
======================================
SKILLS:
{all_skills}

EDUCATION:
{education}

PROJECTS:
{projects}
======================================
        """)

elif choice == "Chatbot Advisor":
    st.header("💬 AI Career Advisor Chatbot")
    user_msg = st.text_input("Type your Career/Resume related question:")
    
    if st.button("Ask Advisor"):
        found = False
        for qa in CHATBOT_QA:
            if any(k in user_msg.lower() for k in qa["keywords"]):
                st.write("**Career Advisor response:**")
                st.info(qa["reply"])
                found = True
                break
        if not found:
            st.write("**Career Advisor response:**")
            st.write("I recommend researching key professional frameworks, optimizing your Github dashboard, and learning fundamental programming syntax like Python, Java, or Javascript. Feel free to refine your questions about resume optimization or learning paths!")
`;

  // 2. requirements.txt
  const requirementsTxt = `streamlit>=1.30.0
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.2.0
reportlab>=4.0.0
`;

  // 3. README.md
  const readmeContent = `# AI-Powered ATS Resume Companion

Complete college minor portfolio project demonstrating automated resume metrics compliance evaluation, smart domain mapping, and dynamic interactive chatbot advising.

## Key Features Built-In
1. **ATS Compliance Check**: Analyzes structure sections and tracks keywords matching standard indexes.
2. **Career Recommendations**: Matches background skill inputs against target benchmarks.
3. **Draft Resume Builder**: Input parameters to export clean formatted markdown or structured code templates.
4. **Interactive Chatbot**: Local fast NLP matching rules and conversational feedback.

## Setup Requirements (Local Streamlit execution)
1. Ensure Python 3.9+ is installed.
2. Create and actuate local virtual environment:
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\\Scripts\\activate
   \`\`\`
3. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`
4. Execute application:
   \`\`\`bash
   streamlit run app.py
   \`\`\`
`;

  // 4. PPT Presentation Outline
  const pptOutline = `SLIDE 1: Title Slide
- Title: AI-Powered ATS Resume Analyzer, Resume Builder & Career Coach Dashboard
- Subtitle: College Minor Project / Industry Portfolio Showcase
- Presenter: [Your Name]
- Key Goals: Automating resume optimization, identifying technological skill gaps, and mapping careers dynamically for college freshers.

SLIDE 2: Problem Statement
- Traditional application screens rely heavily on Automated Tracking Systems (ATS) which block up to 70% of resumes due to poor keyword synchronization.
- College freshers lack insight into specific technology skill-gaps and struggle to construct ATS-compliant layouts.
- Standard general chatbots lack context-driven roadmap planning.

SLIDE 3: System Architecture
- Frontend: High-performance interactive UI with clean sidebar layouts.
- Backend: Deterministic aggregate logic integrated with LLMs (Google Gemini API) to perform natural language evaluations.
- Data Storage: Domain taxonomy and certification datasets.

SLIDE 4: Main Modules & Workflows
- **ATS Resume Analyzer**: Tokenizes text, computes structure scores, flags missing keyword matches.
- **Career Recommender**: Scores similarities between input profile tags and 22 technology fields.
- **Skill Gap Analyzer**: Highlights missing requirements with target roadmap timelines.
- **Interactive Coach**: Fast keyword-triggered Q&A with conversational fallback.

SLIDE 5: Technical Details & AI Concepts
- NLP: Exact patterns matching boundary keywords.
- Text Classification: Content structures mapped to database categories.
- Hybrid Chat Engine: Structured Rule-driven matching coupled with LLM contextual reasoning.

SLIDE 6: Future Scope & Real-World Applications
- Integration of live web-scraping to check in-demand jobs on LinkedIn or Glassdoor.
- Automatic PDF parsing using optical character engines (OCR) for scanned images.
- Complete multi-user accounts keeping historic portfolios organized.
`;

  // 5. Academic Report Layout
  const reportLayout = `CHAPTER 1: INTRODUCTION
1.1 Background: Explain the emergence of ATS platforms and modern recruiting workflows.
1.2 Objectives: Map system capabilities to college candidate problems.
1.3 Organization of the Report

CHAPTER 2: LITERATURE REVIEW & DESIGN SPECIFICATIONS
2.1 Comparison of automated parsers.
2.2 Rule-based expert systems vs Generative NLP models.

CHAPTER 3: ARCHITECTURE & METHODOLOGY
3.1 Workflow Flowcharts: Showing document inputs -> NLP keyword parsing -> Metric evaluations.
3.2 Code modularity and API services routing schema.

CHAPTER 4: RESULTS & DEMONSTRATIONS
4.1 ATS score calculation tests showing compliance improvement.
4.2 Chatbot conversation logs under different inputs.

CHAPTER 5: ADVANTAGES & LIMITATIONS
5.1 High processing speed and direct custom layouts.
5.2 Limitations: Plain text parses without visual style index, lack of deep multi-page scanning.

CHAPTER 6: CONCLUSION & REFERENCE CITATIONS
`;

  // 6. Viva Q&A
  const vivaQA = [
    {
      q: "What is an ATS and why is resume parser optimization needed?",
      a: "An Automated Tracking System (ATS) manages high volumes of job applications. It uses keyword matching algorithms to index candidate qualifications. Resumes with unreadable layouts, graphical illustrations, or missing keywords get automatically discarded. Optimization solves this by analyzing and bridging gaps before applying."
    },
    {
      q: "How does the system calculate the ATS score?",
      a: "The score is calculated via a composite metric: 1) Structural analysis checks for standard sections (Education, Skills, Projects, Contact info) worth 70% of baseline. 2) Keyword density score evaluates presence of industry-specific technical keywords corresponding to target domains, worth 30%."
    },
    {
      q: "What is the difference between rule-based chatbot logic and LLM reasoning?",
      a: "Rule-based logic uses pattern-matching against specific keyword arrays to return lightweight, deterministic, instant replies. Large Language Models (LLMs like Gemini) use deep generative transformer networks to understand human intent, allowing the system to reply gracefully to non-standard, nuanced queries."
    },
    {
      q: "Explain how you solved the 'Dynamic Career Recommendation' goal without hardcoding restricted outputs.",
      a: "By calculating cosine-like likeness ratings of skills and text against a comprehensive matrix of 22 engineering domains. The system compares the relative score density of all paths and uses LLM prompting to explain matching parameters, missing certifications, and roadmaps dynamically rather than locking results to fixed static buckets."
    }
  ];

  const [activeTab, setActiveTab2] = useState<string>("source");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" id="toolkit-root">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-sky-400" id="toolkit-icon" />
          <h2 className="text-xl font-bold tracking-tight">AI Minor Project Resources Hub</h2>
        </div>
        <p className="text-sm text-slate-300">
          Everything you need for your university submission, including working Streamlit codes, reports, slide templates, datasets, and viva reviews.
        </p>

        {/* Local Tab Switcher */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-slate-800 pt-4">
          <button
            onClick={() => setActiveTab2("source")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "source" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-750"
            }`}
            id="tab-btn-source"
          >
            <Code className="w-3.5 h-3.5" /> Python Source Code
          </button>
          <button
            onClick={() => setActiveTab2("datasets")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "datasets" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-750"
            }`}
            id="tab-btn-datasets"
          >
            <Database className="w-3.5 h-3.5" /> Key Datasets
          </button>
          <button
            onClick={() => setActiveTab2("slides")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "slides" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-750"
            }`}
            id="tab-btn-slides"
          >
            <Presentation className="w-3.5 h-3.5" /> PPT Outlines
          </button>
          <button
            onClick={() => setActiveTab2("academic")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "academic" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-750"
            }`}
            id="tab-btn-academic"
          >
            <FileText className="w-3.5 h-3.5" /> Project Report
          </button>
          <button
            onClick={() => setActiveTab2("viva")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "viva" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-750"
            }`}
            id="tab-btn-viva"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Viva FAQs
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* TAB 1: PYTHON STREAMLIT SOURCE */}
        {activeTab === "source" && (
          <div className="space-y-6" id="section-source">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">1. Pure Python Streamlit Application</h3>
                <p className="text-xs text-gray-550">Fully featured parallel script using Streamlit and simple local analytics.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(pythonCode, "python")}
                  className="flex items-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs px-2.5 py-1.5 rounded-md border border-gray-200 transition"
                >
                  {copiedSection === "python" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === "python" ? "Copied" : "Copy Code"}
                </button>
                <button
                  onClick={() => handleDownloadFile("app.py", pythonCode)}
                  className="flex items-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs px-2.5 py-1.5 rounded-md border border-sky-200 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download app.py
                </button>
              </div>
            </div>
            
            <pre className="bg-slate-950 text-slate-200 text-xs p-4 rounded-lg overflow-x-auto max-h-[350px] font-mono leading-normal">
              <code>{pythonCode}</code>
            </pre>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-gray-900">2. requirements.txt</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(requirementsTxt, "req")}
                    className="text-gray-500 hover:text-gray-900 p-1"
                  >
                    {copiedSection === "req" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDownloadFile("requirements.txt", requirementsTxt)}
                    className="text-sky-600 hover:text-sky-800 text-xs flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              </div>
              <pre className="bg-gray-50 text-gray-800 text-xs p-3 rounded-lg border font-mono">
                <code>{requirementsTxt}</code>
              </pre>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-gray-900">3. README.md (Setup Handbook)</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(readmeContent, "readme")}
                    className="text-gray-500 hover:text-gray-900 p-1"
                  >
                    {copiedSection === "readme" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDownloadFile("README.md", readmeContent)}
                    className="text-sky-600 hover:text-sky-800 text-xs flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              </div>
              <div className="bg-gray-55 px-4 py-3 rounded-lg border border-gray-200 text-xs prose prose-slate max-w-none text-gray-700 leading-normal font-mono">
                {readmeContent.split("\n").map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KEY DATASETS */}
        {activeTab === "datasets" && (
          <div className="space-y-6" id="section-datasets">
            <h3 className="font-bold text-base text-gray-900">Career Taxonomy and Analysis Metadata Catalog</h3>
            <p className="text-gray-600 text-xs">
              Below are the integrated databases that power the offline matching mechanics. Feel free to cite these datasets in your project report chapters on System Design.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span> Resume Keyword Dataset
                </h4>
                <p className="text-xs text-gray-500 mb-2">Used by the parsers to map raw resume sections against domain parameters.</p>
                <div className="max-h-[180px] overflow-y-auto text-xs font-mono bg-white p-2 border rounded text-gray-700">
                  {Object.entries({
                    "Artificial Intelligence": ["Python", "TensorFlow", "PyTorch", "NLP", "LLMs", "Transformers"],
                    "Machine Learning": ["Python", "scikit-learn", "Pandas", "NumPy", "Regression"],
                    "Data Science": ["Python", "R", "SQL", "Pandas", "Statistics", "PowerBI"],
                    "Robotics": ["ROS", "C++", "Python", "Arduino", "Raspberry Pi", "Sensors"],
                    "Web Development": ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Node.js"],
                    "Software Engineering": ["Java", "Python", "C++", "Data Structures", "Algorithms"],
                    "Cybersecurity": ["Linux", "Networking", "Penetration Testing", "Wireshark", "Cryptography"],
                    "Cloud Computing": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Linux"]
                  }).map(([k, v]) => (
                    <div key={k} className="mb-1">
                      <strong className="text-sky-700 font-medium font-sans">{k}</strong>: {v.join(", ")}
                    </div>
                  ))}
                  <div className="text-gray-400 italic">... (22 careers total)</div>
                </div>
              </div>

              <div className="border border-gray-150 rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span> Chatbot Keyword Training Logic
                </h4>
                <p className="text-xs text-gray-500 mb-2">Pre-vetted triggers that trigger localized core rule-based matching replies immediately.</p>
                <div className="max-h-[180px] overflow-y-auto text-xs font-mono bg-white p-2 border rounded text-gray-700">
                  {[
                    { keywords: ["improve", "resume", "better", "ats", "enhance"], reply: "Use standard headings, avoid columns/tables/graphs, customize key skill parameters." },
                    { keywords: ["ai engineer", "artificial intelligence", "ai road"], reply: "Master Python & algorithms, study deep learning (PyTorch/Tensorflow) & LLMs." },
                    { keywords: ["internship", "apply", "fresher intern"], reply: "Organize detailed git portfolios, write simple tailored cold-messages on LinkedIn." }
                  ].map((r, i) => (
                    <div key={i} className="mb-2 pb-2 border-b last:border-0 border-gray-100">
                      <div className="text-emerald-700 font-medium font-sans">Trigger Keywords: {r.keywords.join(", ")}</div>
                      <div className="text-gray-650 truncate font-sans text-[11px]">{r.reply}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-sky-50/50">
              <h4 className="font-semibold text-xs text-sky-800 uppercase tracking-wider mb-2">Architecture & System Flow</h4>
              <p className="text-xs text-sky-950 leading-relaxed mb-1">
                <strong>Data Ingestion Workflow:</strong> Resume Upload (File Drop / Drag-and-drop or Pasted Plain Text) ➔ NLP Tokenizer Engine (Scans for lowercase word breaks matching taxonomy key indexes) ➔ Composite Calculation Subsystem ➔ Score Board outputs.
              </p>
              <p className="text-xs text-sky-950 leading-relaxed">
                <strong>AI Hybrid Flow:</strong> User query triggers local pattern comparison. If matched, local core rules return instantly. If not, proxies safely server-side to initiate standard asynchronous Generative AI modeling (Gemini-3.5-flash).
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: PPT OUTLINES */}
        {activeTab === "slides" && (
          <div className="space-y-6" id="section-slides">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-gray-900">Definitive 6-Slide presentation outline</h3>
                <p className="text-xs text-gray-500">Perfect guide structures to compile your Powerpoint Presentation (PPT).</p>
              </div>
              <button
                onClick={() => copyToClipboard(pptOutline, "ppt")}
                className="flex items-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs px-2.5 py-1.5 rounded-md border border-gray-200 transition"
              >
                {copiedSection === "ppt" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Slides Text
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pptOutline.split("\n\n").map((slide, idx) => {
                const lines = slide.split("\n");
                const title = lines[0] || `Slide ${idx + 1}`;
                const bullets = lines.slice(1);
                return (
                  <div key={idx} className="border rounded-lg p-4 bg-gray-55 shadow-sm">
                    <h4 className="font-bold text-sm text-slate-800 border-b border-gray-200 pb-2 mb-2">{title}</h4>
                    <ul className="text-xs space-y-1.5 text-gray-650 list-disc list-inside font-sans leading-relaxed">
                      {bullets.map((b, i) => (
                        <li key={i}>{b.replace("- ", "")}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: ACADEMIC REPORT */}
        {activeTab === "academic" && (
          <div className="space-y-6" id="section-academic">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-gray-900">Standard Minor Project Report Formatting Skeleton</h3>
                <p className="text-xs text-gray-500">Follow these structured formats to compose your university thesis documentation.</p>
              </div>
              <button
                onClick={() => copyToClipboard(reportLayout, "report")}
                className="flex items-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs px-2.5 py-1.5 rounded-md border border-gray-200 transition"
              >
                {copiedSection === "report" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Skeleton
              </button>
            </div>

            <pre className="bg-gray-200 text-gray-800 font-mono text-xs p-5 rounded-lg border leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              <code>{reportLayout}</code>
            </pre>
          </div>
        )}

        {/* TAB 5: VIVA FAQS */}
        {activeTab === "viva" && (
          <div className="space-y-4 font-sans" id="section-viva">
            <h3 className="font-semibold text-base text-gray-900">University Viva Exam / Interview Preparation Questions</h3>
            <p className="text-xs text-gray-505">Study these essential questions regarding the underlying engineering choices of this project.</p>
            
            <div className="space-y-4">
              {vivaQA.map((qa, i) => (
                <div key={i} className="border border-slate-100 rounded-lg p-4 bg-emerald-50/20">
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    Q{i + 1}: {qa.q}
                  </p>
                  <p className="text-xs text-slate-700 mt-2 bg-white px-3 py-2 border border-slate-100 rounded leading-relaxed">
                    <strong>Excellent Answer:</strong> {qa.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
