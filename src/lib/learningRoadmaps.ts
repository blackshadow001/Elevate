import { MICRO_COURSE_TOPICS } from "@/lib/microCourseTopics";
import type { Course } from "@/types";

export type LearningRoadmap = {
  slug: string;
  title: string;
  description: string;
  categoryId: string;
  stepTitles: readonly string[];
};

// An editorial order for existing topic starters. No course is available until published.
export const LEARNING_ROADMAPS: LearningRoadmap[] = [
  {
    slug: "ai-foundations", title: "AI Foundations", categoryId: "ai-generative-ai",
    description: "Start with everyday AI tools, then understand language models, retrieval, agents, and MCP.",
    stepTitles: ["ChatGPT for Beginners", "What is Generative AI?", "What is an LLM?", "What is Prompt Engineering?", "What is RAG?", "What are AI Agents?", "What is MCP?"],
  },
  {
    slug: "digital-growth", title: "Digital Growth", categoryId: "digital-marketing",
    description: "Build a foundation in search, content, advertising, and email marketing.",
    stepTitles: ["Digital Marketing for Beginners", "What is SEO?", "What is Content Marketing?", "What is Google Ads?", "What is Email Marketing?", "What is Affiliate Marketing?"],
  },
  {
    slug: "start-a-business", title: "Start a Business", categoryId: "business-entrepreneurship",
    description: "Research an idea, shape a business model, test an MVP, and learn how to reach customers.",
    stepTitles: ["What is Market Research?", "What is a Business Model?", "What is MVP?", "How to Start a Business?", "What is Customer Acquisition?", "How to Close a Deal?"],
  },
];

export function roadmapSteps(roadmap: LearningRoadmap, courses: Course[]) {
  return roadmap.stepTitles.map((title) => {
    const topic = MICRO_COURSE_TOPICS.find((item) => item.title === title);
    if (!topic) throw new Error(`Unknown roadmap topic: ${title}`);
    const publishedCourse = courses.find((course) => course.title.trim().toLocaleLowerCase() === title.toLocaleLowerCase());
    return { ...topic, publishedCourse };
  });
}
