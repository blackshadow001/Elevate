import { CareerPath } from "@/types";
import { mockCourses } from "./courses";

export const mockCareerPaths: CareerPath[] = [
  {
    id: "path-1",
    slug: "full-stack-developer",
    title: "Full Stack Developer",
    description: "Learn front-end and back-end development from scratch. Build end-to-end web applications, microservices, databases, and continuous delivery setups.",
    iconName: "Code2",
    coursesCount: 8,
    durationHours: 120,
    projectsCount: 4,
    technologies: ["React", "Next.js", "Node.js", "PostgreSQL", "Docker", "TypeScript"],
    salaryRange: "₹8L - ₹22L / year",
    coursesIncluded: [
      "Full Stack Web Development from Zero to Hero",
      "Modern UI/UX Design & Design Systems in Figma",
      "Cloud & DevOps Engineering: Docker, Kubernetes & AWS",
    ],
  },
  {
    id: "path-2",
    slug: "data-scientist",
    title: "Data Scientist",
    description: "Transform big datasets into business forecasts. Master statistical modeling, exploratory data analysis, machine learning algorithms and neural networks.",
    iconName: "BarChart4",
    coursesCount: 7,
    durationHours: 100,
    projectsCount: 5,
    technologies: ["Python", "Pandas", "NumPy", "Scikit-Learn", "PyTorch", "SQL"],
    salaryRange: "₹9L - ₹25L / year",
    coursesIncluded: [
      "Python Masterclass: Data Science & Machine Learning",
      "Generative AI & LLM Application Engineering",
      "Data Analytics Masterclass in Hindi (हिंदी)",
    ],
  },
  {
    id: "path-3",
    slug: "ui-ux-designer",
    title: "UI/UX Designer",
    description: "Design delightful customer journeys and responsive interfaces. Learn wireframing, design thinking, component tokens, user testing and prototyping.",
    iconName: "Layout",
    coursesCount: 6,
    durationHours: 65,
    projectsCount: 4,
    technologies: ["Figma", "Design Systems", "Prototyping", "User Research", "Wireframing"],
    salaryRange: "₹7L - ₹18L / year",
    coursesIncluded: [
      "Modern UI/UX Design & Design Systems in Figma",
      "Full Stack Web Development from Zero to Hero",
    ],
  },
];

// Reflect the courses and lessons actually present in this frontend prototype.
for (const path of mockCareerPaths) {
  const included = mockCourses.filter((course) => path.coursesIncluded?.includes(course.title));
  path.coursesCount = included.length;
  path.durationHours = Math.round(included.flatMap((course) => course.sections.flatMap((section) => section.lessons)).reduce((minutes, lesson) => minutes + (Number.parseInt(lesson.duration, 10) || 0), 0) / 60);
  path.projectsCount = included.flatMap((course) => course.sections.flatMap((section) => section.lessons)).filter((lesson) => lesson.type === "project").length;
}
