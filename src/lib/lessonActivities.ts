export type MultipleChoiceQuestion = { type?: "multiple_choice"; prompt: string; options: string[]; correctIndex?: number };
export type QuizQuestion =
  | MultipleChoiceQuestion
  | { type: "fill_blank"; prompt: string; answer: string };
export type QuizActivity = { kind: "quiz"; questions: QuizQuestion[]; passingPercent: number };
export type AssignmentActivity = { kind: "assignment"; instructions: string };
export type ResourceActivity = { kind: "resource"; label: string; url: string; description: string };
export type LessonActivity = QuizActivity | AssignmentActivity | ResourceActivity;

export function newLessonActivity(type: "Quiz" | "Assignment" | "Resource"): LessonActivity {
  if (type === "Quiz") return { kind: "quiz", passingPercent: 70,
    questions: [{ prompt: "", options: ["", "", "", ""], correctIndex: 0 }] };
  if (type === "Assignment") return { kind: "assignment", instructions: "" };
  return { kind: "resource", label: "", url: "", description: "" };
}
