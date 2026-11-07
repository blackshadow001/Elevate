export type MicroCourseTopic = { title: string; category: string; subcategory: string; suggestedPrice: number };

// Editorial starting points for tutors. These are not published courses or purchasable products.
const topicGroups: Array<{ category: string; subcategory: string; topics: Array<[string, number]> }> = [
  { category: "AI & Generative AI", subcategory: "AI Fundamentals", topics: [
    ["ChatGPT for Beginners", 29], ["What is an LLM?", 29], ["What is RAG?", 39], ["What is MCP?", 39],
    ["What is Prompt Engineering?", 29], ["What is Generative AI?", 29],
  ] },
  { category: "AI & Generative AI", subcategory: "AI Applications", topics: [
    ["What are AI Agents?", 49], ["What is Fine-Tuning in AI?", 39], ["What is Multimodal AI?", 39], ["ChatGPT vs Gemini vs Claude", 49],
  ] },
  { category: "AI Tools & Automation", subcategory: "AI Assistants", topics: [
    ["Introduction to Google Gemini", 29], ["Introduction to Claude AI", 29], ["What is Perplexity AI?", 29],
    ["How to Create an AI Chatbot", 49],
  ] },
  { category: "AI Tools & Automation", subcategory: "Workflow Automation", topics: [
    ["What is n8n?", 39], ["What is Make.com?", 39], ["What is Zapier?", 39], ["What is AI Workflow Automation?", 49],
  ] },
  { category: "AI Tools & Automation", subcategory: "Local AI", topics: [["What is Ollama?", 39], ["What is Local LLM?", 49]] },
  { category: "Technology & Programming", subcategory: "APIs & Data", topics: [
    ["What is an API?", 29], ["What is REST API?", 29], ["What is JSON?", 29], ["What is MongoDB?", 29], ["What is SQL?", 29],
  ] },
  { category: "Technology & Programming", subcategory: "Cloud & Developer Tools", topics: [
    ["What is Git & GitHub?", 29], ["What is Docker?", 39], ["What is Cloud Computing?", 39], ["What is AWS EC2?", 39], ["What is Blockchain?", 49],
  ] },
  { category: "Digital Marketing", subcategory: "Search & Advertising", topics: [
    ["Digital Marketing for Beginners", 29], ["What is SEO?", 29], ["What is SEM?", 29], ["What is Google Ads?", 39], ["What is Meta Ads?", 39],
  ] },
  { category: "Digital Marketing", subcategory: "Content & Growth", topics: [
    ["What is Affiliate Marketing?", 39], ["What is Email Marketing?", 29], ["What is Influencer Marketing?", 39],
    ["What is Content Marketing?", 29], ["What is Personal Branding?", 39],
  ] },
  { category: "Business & Entrepreneurship", subcategory: "Startup Fundamentals", topics: [
    ["How to Start a Business?", 39], ["What is a Startup?", 29], ["What is a Business Model?", 29],
    ["What is a Business Plan?", 39], ["What is MVP?", 29], ["What is Bootstrapping?", 39],
  ] },
  { category: "Business & Entrepreneurship", subcategory: "Business Strategy", topics: [
    ["What is Franchise Business?", 39], ["What is Market Research?", 39], ["What is SWOT Analysis?", 29], ["What is Customer Acquisition?", 49],
  ] },
  { category: "Sales & Communication", subcategory: "Sales Fundamentals", topics: [
    ["Sales for Beginners", 29], ["What is Lead Generation?", 29], ["What is a Sales Funnel?", 39], ["How to Close a Deal?", 39],
    ["What is B2B vs B2C?", 29], ["Negotiation Skills", 39], ["Customer Relationship Management", 39], ["What is CRM Software?", 29],
  ] },
  { category: "Sales & Communication", subcategory: "Communication Skills", topics: [
    ["Effective Communication Skills", 29], ["Public Speaking Basics", 39],
  ] },
  { category: "Finance & Investment Basics", subcategory: "Personal Finance", topics: [
    ["Personal Finance for Beginners", 29], ["What is Credit Score?", 29], ["What is Inflation?", 29], ["What is Financial Planning?", 39],
    ["What is Compound Interest?", 29],
  ] },
  { category: "Finance & Investment Basics", subcategory: "Investing Basics", topics: [
    ["What is SIP?", 29], ["What is Mutual Fund?", 29], ["What is Stock Market?", 39], ["What is an IPO?", 29], ["What is Cryptocurrency?", 39],
  ] },
  { category: "Mindfulness & Personal Development", subcategory: "Mindfulness & Wellbeing", topics: [
    ["Mindfulness for Beginners", 29], ["Emotional Intelligence", 39], ["Stress Management", 29], ["Growth Mindset", 29],
  ] },
  { category: "Mindfulness & Personal Development", subcategory: "Productivity & Growth", topics: [
    ["How to Build Self-Discipline", 29], ["Time Management Techniques", 29], ["How to Overcome Procrastination", 29],
    ["How to Build Confidence", 29], ["Habit Building Techniques", 29], ["Decision Making Skills", 39],
  ] },
  { category: "Freelancing & Online Income", subcategory: "Freelancing", topics: [
    ["Freelancing for Beginners", 29], ["What is Upwork?", 29], ["What is Fiverr?", 29], ["How to Build a Portfolio", 29],
    ["How to Find Your First Client", 39], ["What is Remote Work?", 29], ["How to Price Your Freelance Services", 39],
  ] },
  { category: "Freelancing & Online Income", subcategory: "Online Business", topics: [
    ["What is Dropshipping?", 39], ["What is Print-on-Demand?", 39],
  ] },
  { category: "Freelancing & Online Income", subcategory: "Creator Economy", topics: [["How to Start a YouTube Channel", 39]] },
  { category: "Design & Content Creation", subcategory: "Visual Design", topics: [
    ["What is UI/UX Design?", 29], ["What is Graphic Design?", 29], ["What is Typography?", 29],
    ["What is Color Theory?", 29], ["What is Branding?", 29],
  ] },
  { category: "Design & Content Creation", subcategory: "Design Tools", topics: [
    ["Canva for Beginners", 29], ["Photoshop for Beginners", 39], ["What is Figma?", 29],
  ] },
  { category: "Design & Content Creation", subcategory: "Content Creation", topics: [
    ["Video Editing Basics", 39], ["How to Create Instagram Reels", 39],
  ] },
];

export const MICRO_COURSE_TOPICS: MicroCourseTopic[] = topicGroups.flatMap(({ category, subcategory, topics }) =>
  topics.map(([title, suggestedPrice]) => ({ title, category, subcategory, suggestedPrice })));
