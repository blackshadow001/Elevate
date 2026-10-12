export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
}

export const mockJobs: JobPosting[] = [
  {
    id: "job-1",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote (India)",
    type: "Full-Time",
    experience: "4+ years",
    description: "Build exceptional learning interfaces, video interaction engines, and high-performance WebGL/canvas playgrounds with Next.js and TypeScript.",
  },
  {
    id: "job-2",
    title: "Staff Product Designer",
    department: "Design",
    location: "Bengaluru / Hybrid",
    type: "Full-Time",
    experience: "5+ years",
    description: "Lead product UX and design systems for over 100,000+ active learners across web and mobile experiences.",
  },
  {
    id: "job-3",
    title: "Technical Content Creator (Full Stack)",
    department: "Curriculum",
    location: "Remote",
    type: "Contract / Full-Time",
    experience: "3+ years",
    description: "Design real-world project assignments, code challenges, video walk-throughs, and technical architectures for modern developers.",
  },
  {
    id: "job-4",
    title: "Learning Experience Designer",
    department: "Education",
    location: "Chennai / Hybrid",
    type: "Full-Time",
    experience: "3+ years",
    description: "Structure cognitive mastery tracks, skill checkpoints, and interactive project rubrics to boost student completion rates.",
  },
];

export interface FAQItem {
  question: string;
  answer: string;
  category: "General" | "Enrollment" | "Certificates" | "Platform";
}

export const mockFAQs: FAQItem[] = [
  {
    question: "How do I enroll in a course on Elevate?",
    answer: "Simply navigate to any course in our marketplace, preview the syllabus, and click 'Enroll Now'. Once enrolled, the course is permanently added to your student dashboard with instant access.",
    category: "Enrollment",
  },
  {
    question: "How long do I have access to course materials?",
    answer: "All enrolled students receive lifetime access to course videos, downloadable source repositories, future curriculum updates, and discussion forums.",
    category: "General",
  },
  {
    question: "How do verified certificates work?",
    answer: "Upon completing 100% of the course lectures and capstone checkpoints, an official certificate is automatically issued with a unique tamper-evident verification ID. You can download it as a print-ready document or share the verification link on LinkedIn.",
    category: "Certificates",
  },
  {
    question: "Can I learn on mobile devices and tablets?",
    answer: "Yes, Elevate is fully responsive across desktop, tablet, and mobile screens. You can watch videos, take lecture notes, and track your streaks from any browser.",
    category: "Platform",
  },
  {
    question: "Can I download course resources and starter files?",
    answer: "Every video lesson with starter code or PDF lecture notes includes a dedicated 'Resources' tab where you can download zipped assets directly.",
    category: "Platform",
  },
  {
    question: "What happens after completing a career path or course?",
    answer: "In addition to earning your certificate, you will complete hands-on portfolio projects ready to showcase on GitHub and resume submissions for tech interviews.",
    category: "General",
  },
];
