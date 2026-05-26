/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string; // GitHub/Portfolio
  linkedin: string;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    grade: string;
  }>;
  skills: string; // Comma separated or tags
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string;
    link: string;
  }>;
  certifications: string; // Comma separated
  achievements: string;  // Bullet points
}

export interface ATSAnalysisResult {
  score: number;
  grade: "Excellent" | "Good" | "Needs Improvement" | "Poor";
  isAtsFriendly: boolean;
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
  optimizedBulletPoints: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface CareerRecommendation {
  domain: string;
  matchPercentage: number;
  reason: string;
  missingSkills: string[];
  suggestedCertifications: string[];
  learningRoadmap: string[];
}

export interface SkillGapData {
  skillName: string;
  userLevel: number; // 0 to 100
  industryRequired: number; // 0 to 100
  gap: number;
  status: "Acquired" | "Gap Identifer" | "Critical Need";
  recommendedCourse: string;
}
