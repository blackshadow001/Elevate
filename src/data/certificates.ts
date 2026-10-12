export interface Certificate {
  id: string;
  certificateId: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  studentName: string;
  instructorName: string;
  instructorRole: string;
  completedAt: string;
  skillsAcquired: string[];
  grade: string;
}

export const mockCertificates: Certificate[] = [
  {
    id: "cert-1",
    certificateId: "LRN-2026-001842",
    courseId: "course-1",
    courseSlug: "full-stack-web-development",
    courseTitle: "Full Stack Web Development from Zero to Hero",
    studentName: "Alex Johnson",
    instructorName: "John Doe",
    instructorRole: "Senior Software Architect & Ex-Google",
    completedAt: "October 8, 2026",
    skillsAcquired: ["React", "Next.js", "Node.js", "PostgreSQL", "REST APIs", "TypeScript"],
    grade: "Distinction (98%)",
  },
  {
    id: "cert-2",
    certificateId: "LRN-2026-002491",
    courseId: "course-2",
    courseSlug: "python-masterclass-data-science",
    courseTitle: "Python Masterclass: Data Science & Machine Learning",
    studentName: "Alex Johnson",
    instructorName: "Priya Sundaram",
    instructorRole: "Lead AI Researcher & ML Consultant",
    completedAt: "September 24, 2026",
    skillsAcquired: ["Python", "Pandas", "NumPy", "Scikit-Learn", "Data Analytics"],
    grade: "Excellence (94%)",
  },
];
