// Initial catalog shown while the admin-managed category list loads.
export const CATALOG_CATEGORIES = [
  { name: "AI & Generative AI", subcategories: ["AI Fundamentals", "Language Models", "AI Applications"] },
  { name: "AI Tools & Automation", subcategories: ["AI Assistants", "Workflow Automation", "Local AI"] },
  { name: "Technology & Programming", subcategories: ["Programming Basics", "APIs & Data", "Cloud & Developer Tools"] },
  { name: "Digital Marketing", subcategories: ["Search & Advertising", "Content & Growth"] },
  { name: "Business & Entrepreneurship", subcategories: ["Startup Fundamentals", "Business Strategy"] },
  { name: "Sales & Communication", subcategories: ["Sales Fundamentals", "Communication Skills"] },
  { name: "Finance & Investment Basics", subcategories: ["Personal Finance", "Investing Basics"] },
  { name: "Mindfulness & Personal Development", subcategories: ["Mindfulness & Wellbeing", "Productivity & Growth"] },
  { name: "Freelancing & Online Income", subcategories: ["Freelancing", "Online Business", "Creator Economy"] },
  { name: "Design & Content Creation", subcategories: ["Visual Design", "Design Tools", "Content Creation"] },
] as const;

const LEGACY_CATEGORY_MAP: Record<string, string> = {
  "AI & ML": "AI & Generative AI",
  "Data Science": "Technology & Programming",
  Development: "Technology & Programming",
  "Cloud & DevOps": "Technology & Programming",
  Cybersecurity: "Technology & Programming",
  General: "Technology & Programming",
  Marketing: "Digital Marketing",
  Business: "Business & Entrepreneurship",
  Sales: "Sales & Communication",
  Finance: "Finance & Investment Basics",
  Mindfulness: "Mindfulness & Personal Development",
  Freelancing: "Freelancing & Online Income",
  Design: "Design & Content Creation",
  "Content Creation": "Design & Content Creation",
};

export function catalogCategory(value: string): string {
  return LEGACY_CATEGORY_MAP[value] || value;
}
