/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-loaded Gemini Client as per Guidelines
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// ==========================================
// DATASETS & KNOWLEDGE MAPPING
// ==========================================

const INDUSTRY_SKILL_DATABASE: Record<string, string[]> = {
  "Artificial Intelligence": ["Python", "TensorFlow", "PyTorch", "NLP", "LLMs", "Transformers", "Neural Networks", "Deep Learning", "Supervised Learning"],
  "Machine Learning": ["Python", "scikit-learn", "Pandas", "NumPy", "Regression", "Classification", "Matplotlib", "SQL", "Feature Engineering"],
  "Data Science": ["Python", "R", "SQL", "Pandas", "Statistics", "PowerBI", "Tableau", "Data Wrangling", "Exploratory Data Analysis"],
  "Robotics": ["ROS", "C++", "Python", "Arduino", "Raspberry Pi", "Sensors", "CAD", "SolidWorks", "Control Systems", "Kinematics"],
  "Web Development": ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "SQL", "Tailwind CSS", "Git"],
  "Software Engineering": ["Java", "Python", "C++", "Data Structures", "Algorithms", "Object Oriented Programming", "SQL", "Software Architecture"],
  "Cybersecurity": ["Linux", "Networking", "Penetration Testing", "Wireshark", "Cryptography", "OWASP", "Firewalls", "Ethical Hacking"],
  "Cloud Computing": ["AWS", "Azure", "Google Cloud Platform", "Docker", "Kubernetes", "Linux", "IAM", "Serverless", "CloudFormation"],
  "UI/UX Design": ["Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping", "Design Systems", "User Personas", "Usability Testing"],
  "DevOps": ["Docker", "Kubernetes", "Jenkins", "CI/CD", "Ansible", "Terraform", "Linux", "Git", "Shell Scripting", "Prometheus"],
  "Embedded Systems": ["C", "Assembly", "Microcontrollers", "RTOS", "SPI/I2C/UART", "Oscilloscope", "Firmware", "Verilog", "FPGA"],
  "IoT": ["MQTT", "Arduino", "Raspberry Pi", "Sensors", "Node-RED", "ESP32", "Wireless Protocols", "Firmware", "Cloud Integrations"],
  "Mobile App Development": ["Kotlin", "Swift", "Flutter", "React Native", "Android SDK", "iOS SDK", "Firebase", "App Store Guidelines"],
  "Game Development": ["Unity", "Unreal Engine", "C#", "C++", "Shader", "3D Modeling", "Physics Engine", "Blender", "Game Design"],
  "Business Analytics": ["Excel", "SQL", "PowerBI", "Tableau", "Business Intelligence", "Statistcs", "Financial Modeling", "Communication"],
  "Product Management": ["Agile", "Scrum", "Product Roadmap", "User Stories", "Market Research", "Jira", "A/B Testing", "Analytics"],
  "Networking": ["CCNA", "TCP/IP", "Subnetting", "DNS", "DHCP", "Routing Protocols", "Switches", "SDN", "VPN"],
  "Database Administration": ["SQL Server", "PostgreSQL", "MySQL", "Oracle", "NoSQL", "DB Tuning", "Backup & Recovery", "Replication"],
  "Digital Marketing": ["SEO", "Google Analytics", "SEM", "Content Writing", "Copywriting", "Social Media Ads", "Email Marketing"],
  "Technical Support": ["Troubleshooting", "Active Directory", "ITIL", "Linux OS", "Windows OS", "Ticketing Systems", "Customer Service"],
  "Research and Development": ["Academic Writing", "Matlab", "Python", "LaTeX", "Data Analysis", "Research Methodologies", "Literature Review"],
  "Mechanical Automation": ["PLC Programming", "SCADA", "Pneumatics", "Hydraulics", "CAD", "CNC Programming", "Industrial Robotics", "HMS"]
};

const SUGGESTED_CERTIFICATIONS: Record<string, string[]> = {
  "Artificial Intelligence": ["Google Professional Machine Learning Engineer", "DeepLearning.AI TensorFlow Developer Cert"],
  "Machine Learning": ["Professional Machine Learning Engineer", "AWS Certified Machine Learning - Specialty"],
  "Data Science": ["IBM Data Science Professional Certificate", "Microsoft Certified: Power BI Data Analyst Associate"],
  "Robotics": ["ROS Industrial Basics", "Fundamentals of Robot Kinematics (Coursera)"],
  "Web Development": ["Meta Front-End/Back-End Developer", "AWS Certified Developer - Associate"],
  "Software Engineering": ["Oracle Instructor Certified Java Expert", "Meta Software Engineer Professional Certificate"],
  "Cybersecurity": ["CompTIA Security+", "CEH (Certified Ethical Hacker)"],
  "Cloud Computing": ["AWS Cloud Practitioner", "Google Cloud Associate Cloud Engineer"],
  "UI/UX Design": ["Google UX Design Professional Certificate", "Interaction Design Foundation Certificate"],
  "DevOps": ["AWS Certified DevOps Engineer", "Docker Certified Associate", "CKA (Certified Kubernetes Administrator)"],
  "Embedded Systems": ["Embedded Systems Certificate (University of Colorado)", "ARM Accredited Engineer"],
} as any;

const DOMAIN_COURSES: Record<string, string[]> = {
  "Artificial Intelligence": ["DeepLearning.AI Deep Learning Specialization", "Stanford CS224N (NLP)"],
  "Machine Learning": ["Andrew Ng's Machine Learning Specialization", "Kaggle Micro-courses"],
  "Data Science": ["Google Data Analytics Professional", "SQL for Data Science Course (Coursera)"],
  "Robotics": ["Modern Robotics Course (Northwestern)", "ROS Basics (ConstructSim)"],
  "Web Development": ["The Web Developer Bootcamp (Udemy)", "FullStackOpen (University of Helsinki)"]
};

// ==========================================
// CHATBOT DOMAIN RULES (PATTERN MATCHING)
// ==========================================
const RULE_BASED_RESPONSES = [
  {
    keywords: ["improve", "resume", "better", "ats", "enhance"],
    reply: "To improve your fresher resume for ATS compliance:\n1. **Use standard headings** like Education, Professional Skills, Projects, and Certifications.\n2. **Avoid double columns, graphics, or complex tables** as they confuse core parsers.\n3. **Integrate exact technical skills** directly related to the internship or job role.\n4. **Add metrics or outcomes**: Instead of 'Learned Python', write 'Developed a predictive analytics pipeline using Pandas resulting in 15% better accuracy'.\n5. **Export in standard format** (PDF or DOCX)."
  },
  {
    keywords: ["ai engineer", "artificial intelligence", "ai road", "artificial"],
    reply: "Learning roadmap to become an **AI Engineer**:\n- **Prerequisites**: Master Python thoroughly, basic linear algebra (matrices), probability, and calculus.\n- **Basics**: Learn Pandas, NumPy, and scikit-learn for supervised/unsupervised machine learning.\n- **Deep Learning**: Focus on Neural Networks, CNNs, and RNNs using PyTorch or TensorFlow.\n- **Modern AI**: Deeply understand attention mechanisms, Transformers, LLM fine-tuning, and Retrieval-Augmented Generation (RAG).\n- **Key Projects**: Build text summarizes, chatbot agents, or semantic search modules.\n- **Certifications**: Google Cloud ML Professional or Microsoft Azure AI Associate."
  },
  {
    keywords: ["internship", "apply", "fresher intern", "job fresher"],
    reply: "Actionable tips for freshers to land **internships**:\n1. **Optimize GitHub**: Ensure you have 3 polished projects with highly detailed README files detailing technologies, outcomes, and screenshots.\n2. **Create a targeted resume**: Use our built-in ATS Resume Builder to customize for every role.\n3. **Cold Networking**: Send highly personalized notes to founders/leads on LinkedIn explaining your customized value fit.\n4. **Use Aggregators**: Check LinkedIn jobs, Wellfound (AngelList), Internshala, and Glassdoor daily."
  },
  {
    keywords: ["data science", "data scientist", "data math", "analytics"],
    reply: "Roadmap for **Data Science** as a fresher:\n- **Step 1**: SQL (Advanced aggregate functions, subqueries, joins).\n- **Step 2**: Python core libraries: NumPy, Pandas, Seaborn for Exploratory Data Analysis (EDA).\n- **Step 3**: Essential Statistics (Hypothesis testing, variance, bell curves, correlation).\n- **Step 4**: Scikit-Learn (Linear regression, Decision Trees, clustering models).\n- **Step 5**: Direct Visualization: Tableau, PowerBI, or Streamlit dashboards.\n- **Projects**: Build a Sales forecasting tool, or customer segmentation algorithm using RFM analytics."
  },
  {
    keywords: ["robotics", "embedded", "iot", "arduino"],
    reply: "Essential learning to be a **Robotics / Embedded Systems Engineer**:\n1. **Programming**: Solid C/C++ foundation and Python.\n2. **Operating System**: ROS 1 / ROS 2 (Robot Operating System) which is standard in industry.\n3. **Hardware Basics**: Microcontrollers (STM32, ESP32, Arduino) and single-board computers (Raspberry Pi).\n4. **Robotics Concepts**: Forward and Inverse Kinematics, Path-finding algorithms (A*, Dijkstra), Kalman filters.\n5. **Tools**: CAD (SolidWorks/Fusion 360) and physics stimulators (Gazebo, Webots)."
  }
];

// ==========================================
// ENDPOINT: ATS RESUME ANALYZER
// ==========================================
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: "Resume text content is empty or invalid." });
    }

    const trimmedText = resumeText.trim();
    
    // Perform LOCAL parsing (deterministic baseline NLP)
    const detectedSkills: string[] = [];
    const allIndustrySkills = Array.from(new Set(Object.values(INDUSTRY_SKILL_DATABASE).flat()));
    
    // Basic word-by-word tokenization and case-insensitive check
    const textLower = trimmedText.toLowerCase();
    allIndustrySkills.forEach(skill => {
      // Avoid partial word matching, use simpler boundary-like checking
      const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      if (regex.test(textLower)) {
        detectedSkills.push(skill);
      }
    });

    // Structure tests
    const hasContactInfo = /email|phone|contact|linkedin|github|gmail/i.test(textLower);
    const hasSkillsSection = /skills|technologies|tools|competencies/i.test(textLower);
    const hasEducation = /education|college|university|degree|btech|bsc|bca|gpa|cgpa/i.test(textLower);
    const hasExperienceOrProjects = /experience|internship|projects|project|work/i.test(textLower);
    const wordCount = trimmedText.split(/\s+/).length;
    const isWordCountHealthy = wordCount >= 100 && wordCount <= 600;

    // Baseline calculation
    let score = 40;
    if (hasContactInfo) score += 10;
    if (hasSkillsSection) score += 10;
    if (hasEducation) score += 10;
    if (hasExperienceOrProjects) score += 15;
    if (isWordCountHealthy) score += 5;
    if (detectedSkills.length > 5) score += 10;

    // Missing key industry terms (keywords related to technical skills missing)
    const allPossibleSkillsSet = new Set(allIndustrySkills);
    const currentSkills = new Set(detectedSkills);
    const missingCandidates = [...allPossibleSkillsSet].filter(s => !currentSkills.has(s));
    
    // Select top missing keywords based on detected domain
    const missingKeywords = missingCandidates.slice(0, 6);

    const grade = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Needs Improvement" : "Poor";
    const isAtsFriendly = score >= 70 && hasContactInfo && hasSkillsSection;

    const baseImprovementSuggestions = [
      "Add direct contact credentials (such as GitHub & LinkedIn) at the absolute top.",
      "Expand project achievements using measurable metrics - (e.g., 'saved 25% execution time' rather than 'implemented automation').",
      "Ensure technical skills are clearly classified into subsets like Languages, Frameworks, and Tools.",
      "Avoid multi-column tables, colored graphs, and images which block parsing indexing.",
      "Optimize keyword density by linking your certification tags directly to job descriptions."
    ];

    const optimizedBulletPoints = [
      "Designed and deployed a serverless Python scraper returning live industry data, reducing pipeline ingestion overheads by 22%.",
      "Engineered an interactive dashboard using React, Tailwind CSS, and Recharts, improving visual data audit rates by 40%.",
      "Constructed a localized Machine Learning classification algorithm achieving a 94.3% F1-score accuracy against core market features."
    ];

    // Check if AI studio key is active to refine recommendations using Gemini LLM
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const prompt = `
          Analyze this fresher resume text for ATS friendliness and structure. 
          Respond ONLY with a JSON object that satisfies this TypeScript interface:
          interface ResumeReport {
            score: number; // out of 100
            detectedSkills: string[];
            missingKeywords: string[];
            structureAnalysis: {
              hasContactInfo: boolean;
              hasSkillsSection: boolean;
              hasEducation: boolean;
              hasExperienceOrProjects: boolean;
              isWordCountHealthy: boolean;
            };
            recommendations: string[];
            optimizedBulletPoints: string[]; // 3 industry-grade resume builder bullet points inspired/augmented by their content
          }
          
          Resume Text:
          """${trimmedText.slice(0, 4000)}"""
        `;

        const response = await gemini.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        if (response.text) {
          const aiReport = JSON.parse(response.text.trim());
          const unifiedScore = aiReport.score || score;
          const finalGrade = unifiedScore >= 85 ? "Excellent" : unifiedScore >= 70 ? "Good" : unifiedScore >= 50 ? "Needs Improvement" : "Poor";
          
          return res.json({
            score: unifiedScore,
            grade: finalGrade,
            isAtsFriendly: unifiedScore >= 70 && (aiReport.structureAnalysis?.hasContactInfo ?? hasContactInfo),
            detectedSkills: aiReport.detectedSkills || detectedSkills,
            missingKeywords: aiReport.missingKeywords || missingKeywords,
            structureAnalysis: aiReport.structureAnalysis || {
              hasContactInfo,
              hasSkillsSection,
              hasEducation,
              hasExperienceOrProjects,
              isWordCountHealthy
            },
            recommendations: aiReport.recommendations || baseImprovementSuggestions,
            optimizedBulletPoints: aiReport.optimizedBulletPoints || optimizedBulletPoints
          });
        }
      } catch (gemError) {
        console.error("Gemini optimization error, processing locally:", gemError);
        // Fail-safe flow: continues to return processed local stats
      }
    }

    // Default return
    return res.json({
      score,
      grade,
      isAtsFriendly,
      detectedSkills,
      missingKeywords,
      structureAnalysis: {
        hasContactInfo,
        hasSkillsSection,
        hasEducation,
        hasExperienceOrProjects,
        isWordCountHealthy
      },
      recommendations: baseImprovementSuggestions,
      optimizedBulletPoints
    });

  } catch (error: any) {
    console.error("Analysis route error:", error);
    res.status(500).json({ error: "External Server encountered an issue processing resume analysis." });
  }
});

// ==========================================
// ENDPOINT: CAREER ADVICE CHATBOT
// ==========================================
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message input content is empty." });
    }

    const textLower = message.toLowerCase().trim();

    // 1. NLP Trigger: Check deterministically against rule patterns
    for (const rule of RULE_BASED_RESPONSES) {
      if (rule.keywords.some(keyword => textLower.includes(keyword))) {
        return res.json({
          response: rule.reply,
          byRuleMatch: true
        });
      }
    }

    // 2. Hybrid AI Call: Fall back to Google Gemini Coach
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const formattedHistory = (history || []).map((h: any) => {
          return `${h.sender === "user" ? "User" : "Advisor"}: ${h.text}`;
        }).join("\n");

        const prompt = `
          You are an expert Career Guidance Advisor chatbot for freshers.
          Answer the user's career query comprehensively, offering supportive, professional, and actionable steps.
          If applicable, provide details of roadmaps, learning courses, and skills.
          Keep answers concise (around 150-250 words), formatting outputs with neat lists, markdown bold keywords, and structural divisions.
          
          Context History:
          ${formattedHistory}
          
          User's Question:
          "${message}"
        `;

        const response = await gemini.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        if (response.text) {
          return res.json({
            response: response.text.trim(),
            byRuleMatch: false
          });
        }
      } catch (gemError) {
        console.error("Gemini chatbot error, using default fallback:", gemError);
      }
    }

    // Default Fail-Safe Answer if offline / chatbot failed to query
    return res.json({
      response: "Thank you for asking! I recommend detailing your technical skills, focusing heavily on modern engineering stacks like Python, SQL, or Node.js. Always back up your skill items with neat git-tracked projects and clear certifications. What specific technical job domain are you looking to target?",
      byRuleMatch: false,
      isOfflineFallback: true
    });

  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ error: "Failed to compile response for chat query." });
  }
});

// ==========================================
// ENDPOINT: DYNAMIC CAREER RECOMMENDER
// ==========================================
app.post("/api/career-recommend", async (req, res) => {
  try {
    const { skills, education, projects, certifications, interests } = req.body;
    
    // Fallback/Default Local logic:
    // Scoring alignments for 22 domains based on core keyword triggers
    const joinedInfo = `${skills || ""} ${projects || ""} ${certifications || ""} ${interests || ""}`.toLowerCase();
    
    const recommendationsList: any[] = [];

    Object.keys(INDUSTRY_SKILL_DATABASE).forEach(domain => {
      const keywords = INDUSTRY_SKILL_DATABASE[domain];
      let matches = 0;
      keywords.forEach(keyword => {
        if (joinedInfo.includes(keyword.toLowerCase())) {
          matches += 1;
        }
      });

      // Calculate matching factor
      let baseMatch = 15; // default base match percentage
      if (matches > 0) {
        baseMatch += Math.min(matches * 15, 75);
      }
      
      // Fine tune matching based on interest match in title
      if (interests && interests.toLowerCase().includes(domain.toLowerCase())) {
        baseMatch += 15;
      }

      baseMatch = Math.min(baseMatch, 98);

      // Identify missing skills
      const missingSkills = keywords.filter(s => !joinedInfo.includes(s.toLowerCase())).slice(0, 4);
      const suggestedCerts = SUGGESTED_CERTIFICATIONS[domain] || [
        `Google Professional ${domain} Specialist`,
        `${domain} Core Certification (Coursera)`
      ];
      const roadmaps = DOMAIN_COURSES[domain] || [
        `Learn basics of ${domain}`,
        `Build 2-3 GitHub portfolio projects demonstrating specialized solutions`,
        `Obtain professional job certifications and apply for targeted internships`
      ];

      recommendationsList.push({
        domain,
        matchPercentage: baseMatch,
        reason: `Based on your profile, we identified matching skills & terms supporting ${domain}: including ${keywords.filter(s => joinedInfo.includes(s.toLowerCase())).slice(0, 3).join(", ") || "fundamental engineering interest"}.`,
        missingSkills,
        suggestedCertifications: suggestedCerts,
        learningRoadmap: roadmaps
      });
    });

    // Sort by matches desc
    recommendationsList.sort((a, b) => b.matchPercentage - a.matchPercentage);
    const topRecommendations = recommendationsList.slice(0, 4);

    // If Gemini key is setup, rewrite and make them hyper-dynamic and precise!
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const prompt = `
          Analyze the user's technical background, skills, projects, certifications, and interests.
          Determine and match the top 3-4 most suitable career domains (from technical topics like AI, ML, Data Science, Software Engineering, DevOps, Cybersecurity, UI/UX Design, IoT, etc.)
          Make the recommendations hyper-personalized and dynamic, NOT limited to generic presets.
          
          User Inputs:
          - Skills: ${skills || "None provided"}
          - Projects: ${projects || "None provided"}
          - Education: ${education || "None provided"}
          - Certifications: ${certifications || "None"}
          - Interests: ${interests || "None"}

          Respond strictly with a JSON array that satisfies this TypeScript schema:
          Array<{
            domain: string;
            matchPercentage: number; // 0-100
            reason: string; // personalized sentence explaining exactly why matches
            missingSkills: string[];
            suggestedCertifications: string[];
            learningRoadmap: string[]; // step-by-step 3 action points
          }>
        `;

        const response = await gemini.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        if (response.text) {
          const aiRecommendations = JSON.parse(response.text.trim());
          if (Array.isArray(aiRecommendations)) {
            return res.json(aiRecommendations);
          }
        }
      } catch (gemError) {
        console.error("Gemini recommender failed, returning local match scores:", gemError);
      }
    }

    return res.json(topRecommendations);

  } catch (error) {
    console.error("Career recommend error:", error);
    res.status(500).json({ error: "Failed to generate dynamic career suggestions." });
  }
});

// ==========================================
// ENDPOINT: SKILL GAP ANALYZER
// ==========================================
app.post("/api/skill-gap", async (req, res) => {
  try {
    const { userSkills, targetDomain } = req.body;
    
    if (!targetDomain) {
      return res.status(400).json({ error: "Target domain is required for skill gap analysis." });
    }

    const industryRequiredSkills = INDUSTRY_SKILL_DATABASE[targetDomain] || ["Core Engineering", "Problem Solving", "Version Control", "Analytics"];
    const userSkillsUpper = (userSkills || "").toUpperCase();

    const gappedData = industryRequiredSkills.map(skill => {
      const isAcquired = userSkillsUpper.includes(skill.toUpperCase());
      const userLevel = isAcquired ? 80 : 15;
      const industryRequired = 85;
      const gap = industryRequired - userLevel;
      const status = isAcquired ? "Acquired" : gap > 40 ? "Critical Need" : "Gap Identifer";
      
      const course = `Advanced ${skill} Specialization Bootcamp`;

      return {
        skillName: skill,
        userLevel,
        industryRequired,
        gap: gap > 0 ? gap : 0,
        status,
        recommendedCourse: course
      };
    });

    const hasCriticalNeed = gappedData.some(g => g.status === "Critical Need");
    const recommendationSummary = hasCriticalNeed 
      ? `You have critical gaps in ${targetDomain} required fields. Focus on core requirements like ${gappedData.filter(g => g.status === "Critical Need").map(g => g.skillName).slice(0, 2).join(", ")} immediately.`
      : `Outstanding! Your current profile aligns very well with standard ${targetDomain} roles. Just fine-tune minor credentials.`;

    // Try Gemini if available
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const prompt = `
          Analyze the skill gaps between the user's current skills and the industry benchmarks for "${targetDomain}".
          User Skills: "${userSkills || 'None input'}"

          Provide a detailed, structure-accurate comparison of 5 important skills.
          Respond strictly with a JSON object of this structure:
          {
            gaps: Array<{
              skillName: string;
              userLevel: number; // 0-100 estimate
              industryRequired: number; // 0-100 benchmark
              gap: number; // industryRequired - userLevel
              status: "Acquired" | "Gap Identifer" | "Critical Need";
              recommendedCourse: string;
            }>,
            summary: string; // 1-2 sentence recommendation audit
          }
        `;

        const response = await gemini.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        if (response.text) {
          const aiGaps = JSON.parse(response.text.trim());
          if (aiGaps.gaps) {
            return res.json(aiGaps);
          }
        }
      } catch (gemError) {
        console.error("Gemini skill gap error, using local fallback results:", gemError);
      }
    }

    return res.json({
      gaps: gappedData,
      summary: recommendationSummary
    });

  } catch (error) {
    console.error("Skill gap error:", error);
    res.status(500).json({ error: "Failed to load skill gap measurements." });
  }
});

// ==========================================
// DEVELOPMENT SERVER VS PRODUCTION BUILDS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK CONTAINER] Running client + server on http://localhost:${PORT}`);
  });
}

startServer();
