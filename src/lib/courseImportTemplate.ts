import type { LessonActivity } from "@/lib/lessonActivities";

export type ImportedLesson = {
  title: string;
  type: "Video" | "Text" | "Quiz" | "Assignment" | "Resource";
  duration: string;
  content?: string;
  videoPath?: string;
  isPreview?: boolean;
  activity?: LessonActivity;
};

export type CourseImportTemplate = {
  version: 1;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  subcategory: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  language: "English" | "Tamil" | "Hindi";
  price: 29 | 39 | 49 | 59;
  thumbnailPath: string;
  whatYouWillLearn: string[];
  requirements: string[];
  sections: Array<{ title: string; lessons: ImportedLesson[] }>;
};

export const COURSE_IMPORT_EXAMPLE: CourseImportTemplate = {
  version: 1,
  title: "Introduction to Your Topic",
  shortDescription: "A short description of what learners will study.",
  fullDescription: "Explain the course, its audience, and what each lesson teaches. Replace this example text before importing.",
  category: "Technology & Programming",
  subcategory: "APIs & Data",
  level: "Beginner",
  language: "English",
  price: 29,
  thumbnailPath: "images/thumbnail.png",
  whatYouWillLearn: ["Explain the core concept", "Apply the idea in a practical example"],
  requirements: ["No prior experience required"],
  sections: [{
    title: "Getting started",
    lessons: [
      { title: "Introduction", type: "Video", duration: "5 mins", videoPath: "videos/introduction.mp4" },
      { title: "Knowledge check", type: "Quiz", duration: "2 mins", activity: { kind: "quiz", passingPercent: 70,
        questions: [{ type: "fill_blank", prompt: "Complete the key term: ____", answer: "answer" }] } },
    ],
  }],
};

const record = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("The template must contain an object.");
  return value as Record<string, unknown>;
};
const required = (value: unknown, label: string, max = 500): string => {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) throw new Error(`${label} is required (up to ${max} characters).`);
  return value.trim();
};
const list = (value: unknown, label: string): string[] => {
  if (!Array.isArray(value) || !value.length || value.length > 50) throw new Error(`${label} needs 1–50 entries.`);
  return value.map((item, index) => required(item, `${label} item ${index + 1}`));
};

export function normalizeTemplatePath(value: unknown, label: string): string {
  const path = required(value, label, 300).replaceAll("\\", "/").replace(/^\.\//, "");
  if (path.startsWith("/") || /^(?:[A-Za-z]:|https?:|file:)/i.test(path) || path.split("/").some((part) => !part || part === "." || part === ".."))
    throw new Error(`${label} must be a relative file path inside the selected media folder.`);
  return path;
}

export function parseCourseImportTemplate(value: unknown, categories: Array<{ name: string; subcategories: string[] }>): CourseImportTemplate {
  const input = record(value);
  if (input.version !== 1) throw new Error("Unsupported template version. Download the current template.");
  const title = required(input.title, "Course title", 200);
  const category = required(input.category, "Category", 100);
  const subcategory = required(input.subcategory, "Subcategory", 100);
  const categoryEntry = categories.find((item) => item.name === category);
  if (!categoryEntry || !categoryEntry.subcategories.includes(subcategory)) throw new Error("Choose a current category and one of its subcategories.");
  if (!["Beginner", "Intermediate", "Advanced"].includes(String(input.level))) throw new Error("Level must be Beginner, Intermediate, or Advanced.");
  if (!["English", "Tamil", "Hindi"].includes(String(input.language))) throw new Error("Language must be English, Tamil, or Hindi.");
  if (typeof input.price !== "number" || ![29, 39, 49, 59].includes(input.price)) throw new Error("Price must be ₹29, ₹39, ₹49, or ₹59.");
  const thumbnailPath = normalizeTemplatePath(input.thumbnailPath, "Thumbnail path");
  if (!/\.(png|jpe?g|webp)$/i.test(thumbnailPath)) throw new Error("Thumbnail must be a PNG, JPG, or WebP file.");
  if (!Array.isArray(input.sections) || !input.sections.length || input.sections.length > 100) throw new Error("Add 1–100 sections.");
  let previewCount = 0;
  let lessonCount = 0;
  const sections = input.sections.map((sectionValue, sectionIndex) => {
    const section = record(sectionValue);
    const sectionTitle = required(section.title, `Section ${sectionIndex + 1} title`, 200);
    if (!Array.isArray(section.lessons) || !section.lessons.length || section.lessons.length > 100) throw new Error(`Section ${sectionIndex + 1} needs 1–100 lessons.`);
    const lessons = section.lessons.map((lessonValue, lessonIndex) => {
      lessonCount++;
      const lesson = record(lessonValue);
      const label = `Section ${sectionIndex + 1}, lesson ${lessonIndex + 1}`;
      const type = lesson.type;
      if (!["Video", "Text", "Quiz", "Assignment", "Resource"].includes(String(type))) throw new Error(`${label} has an unsupported lesson type.`);
      const result: ImportedLesson = {
        title: required(lesson.title, `${label} title`, 200),
        type: type as ImportedLesson["type"], duration: required(lesson.duration, `${label} duration`, 30),
      };
      if (!/^(?:(?:\d+:)?\d{1,2}:\d{2}|\d+\s*mins?|\d+h(?:\s+\d+m)?)$/i.test(result.duration)) throw new Error(`${label} has an invalid duration. Use 5 mins or 01:30.`);
      if (type === "Video") {
        result.videoPath = normalizeTemplatePath(lesson.videoPath, `${label} video path`);
        if (!/\.(mp4|webm)$/i.test(result.videoPath)) throw new Error(`${label} video must be MP4 or WebM.`);
        if (lesson.isPreview === true) previewCount++;
        result.isPreview = lesson.isPreview === true;
      } else if (type === "Text") result.content = required(lesson.content, `${label} reading text`, 5000);
      else {
        const activity = record(lesson.activity);
        if (type === "Quiz") {
          if (activity.kind !== "quiz" || !Array.isArray(activity.questions) || activity.questions.length < 1 || activity.questions.length > 20)
            throw new Error(`${label} needs 1–20 quiz questions.`);
          const passingPercent = Number(activity.passingPercent);
          if (!Number.isInteger(passingPercent) || passingPercent < 1 || passingPercent > 100) throw new Error(`${label} needs a passing score from 1 to 100.`);
          const questions = activity.questions.map((questionValue, questionIndex) => {
            const question = record(questionValue);
            const prompt = required(question.prompt, `${label}, question ${questionIndex + 1}`, 500);
            if (question.type === "fill_blank") return { type: "fill_blank" as const, prompt,
              answer: required(question.answer, `${label}, answer ${questionIndex + 1}`, 300) };
            if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 6)
              throw new Error(`${label}, question ${questionIndex + 1} needs 2–6 choices.`);
            const options = question.options.map((option, index) => required(option, `${label}, choice ${index + 1}`, 300));
            const correctIndex = Number(question.correctIndex);
            if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length)
              throw new Error(`${label}, question ${questionIndex + 1} needs a valid correctIndex.`);
            return { type: "multiple_choice" as const, prompt, options, correctIndex };
          });
          result.activity = { kind: "quiz", passingPercent, questions };
        } else if (type === "Assignment") result.activity = { kind: "assignment", instructions: required(activity.instructions, `${label} instructions`, 5000) };
        else {
          const url = required(activity.url, `${label} resource URL`, 2000);
          try { if (new URL(url).protocol !== "https:") throw new Error("protocol"); }
          catch { throw new Error(`${label} resource URL must use HTTPS.`); }
          result.activity = { kind: "resource", label: required(activity.label, `${label} resource name`, 200), url,
            description: typeof activity.description === "string" ? activity.description.trim().slice(0, 2000) : "" };
        }
      }
      return result;
    });
    return { title: sectionTitle, lessons };
  });
  if (lessonCount > 500) throw new Error("A course supports up to 500 lessons.");
  if (previewCount > 1) throw new Error("Choose at most one free preview video.");
  if (previewCount && sections.flatMap((section) => section.lessons).filter((lesson) => lesson.type === "Video" && !lesson.isPreview).length === 0)
    throw new Error("Add a full video lesson when the course has a free preview.");
  return {
    version: 1, title, shortDescription: required(input.shortDescription, "Short description", 500),
    fullDescription: required(input.fullDescription, "Full description", 20000), category, subcategory,
    level: input.level as CourseImportTemplate["level"], language: input.language as CourseImportTemplate["language"],
    price: input.price as CourseImportTemplate["price"], thumbnailPath,
    whatYouWillLearn: list(input.whatYouWillLearn, "Learning outcomes"), requirements: list(input.requirements, "Requirements"), sections,
  };
}
