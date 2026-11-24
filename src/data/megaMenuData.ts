export interface ExploreSubItem {
  name: string;
  href: string;
  badge?: string;
}

export interface ExploreCategorySection {
  id: string;
  title: string;
  icon?: string;
  subTitle: string;
  items: ExploreSubItem[];
}

export const EXPLORE_MENU_SECTIONS: Record<string, ExploreCategorySection> = {
  "google-ai": {
    id: "google-ai",
    title: "Learn AI with Google",
    subTitle: "Official Google & Industry AI Specializations",
    items: [
      { name: "Google Cloud Generative AI Leader", href: "/courses?search=Google+Cloud+AI", badge: "Hot" },
      { name: "Gemini 2.5 Multi-Modal Prompt Engineering", href: "/courses?search=Gemini+Prompting", badge: "New" },
      { name: "TensorFlow & Keras Deep Learning", href: "/courses?search=TensorFlow" },
      { name: "Google Vertex AI Agent Architect", href: "/courses?search=Vertex+AI" },
      { name: "Responsible AI & Safe Deployment", href: "/courses?search=Responsible+AI" },
      { name: "Transformer Foundations & Attention", href: "/courses?search=Transformers" },
    ],
  },
  "learn-ai": {
    id: "learn-ai",
    title: "Learn AI",
    subTitle: "Master Generative AI, LLMs, and Machine Learning",
    items: [
      { name: "Generative AI Foundations", href: "/courses?search=Generative+AI", badge: "Trending" },
      { name: "Prompt Engineering Masterclass", href: "/courses?search=Prompt+Engineering" },
      { name: "Large Language Models (LLMs) & Agents", href: "/courses?search=LLM" },
      { name: "Production RAG Architecture & Vector DBs", href: "/courses?search=RAG" },
      { name: "PyTorch & Deep Neural Networks", href: "/courses?search=PyTorch" },
      { name: "Computer Vision & Object Detection", href: "/courses?search=Computer+Vision" },
      { name: "Natural Language Processing (NLP)", href: "/courses?search=NLP" },
      { name: "AI for Everyday Work & Productivity", href: "/courses?search=AI+Productivity" },
    ],
  },
  "career": {
    id: "career",
    title: "In-demand Careers",
    subTitle: "Structured Career Accelerators with verified portfolios",
    items: [
      { name: "Cloud Engineer", href: "/career-paths/ai-foundations", badge: "High Demand" },
      { name: "Data Scientist", href: "/career-paths/digital-growth" },
      { name: "Digital Marketer", href: "/career-paths/digital-growth" },
      { name: "Full Stack Web Developer", href: "/courses?search=Full+Stack" },
      { name: "Game Developer", href: "/courses?search=Game+Development" },
      { name: "Project Manager", href: "/courses?search=Project+Management" },
      { name: "Machine Learning Engineer", href: "/courses?search=Machine+Learning" },
      { name: "Cybersecurity Analyst", href: "/courses?search=Cybersecurity" },
      { name: "Data Engineer", href: "/courses?search=Data+Engineer" },
      { name: "AI Engineer", href: "/career-paths/ai-foundations" },
      { name: "Software Engineer", href: "/courses?search=Software+Engineering" },
      { name: "Financial Analyst", href: "/courses?search=Financial+Analyst" },
      { name: "UX Designer", href: "/courses?search=UX+Design" },
      { name: "All Career Accelerators", href: "/career-paths", badge: "Explore All" },
    ],
  },
  "certifications": {
    id: "certifications",
    title: "Prepare for a Certification",
    subTitle: "Accredited credentials from Amazon, Microsoft, and Google",
    items: [
      { name: "AWS Certified Cloud Practitioner (CLF-C02)", href: "/courses?search=AWS+Cloud+Practitioner", badge: "Popular" },
      { name: "Microsoft Azure Fundamentals (AZ-900)", href: "/courses?search=AZ-900" },
      { name: "AWS Certified Solutions Architect - Associate", href: "/courses?search=AWS+Solutions+Architect" },
      { name: "CompTIA Security+ Exam Prep", href: "/courses?search=CompTIA+Security" },
      { name: "Google Cloud Associate Cloud Engineer", href: "/courses?search=Google+Cloud" },
      { name: "Certified Kubernetes Administrator (CKA)", href: "/courses?search=Kubernetes" },
      { name: "PMP Project Management Professional", href: "/courses?search=PMP" },
      { name: "Cisco Certified Network Associate (CCNA)", href: "/courses?search=CCNA" },
      { name: "View All Verified Certifications", href: "/certificates" },
    ],
  },
  "practice": {
    id: "practice",
    title: "Practice with Role Play & Coding",
    subTitle: "Solve progressive coding challenges and build in live sandboxes",
    items: [
      { name: "CodeArena — 100-Level Coding Challenges", href: "/practice/codearena", badge: "100 Lvls" },
      { name: "WebForge — Frontend Sandbox", href: "/practice/webforge" },
      { name: "QueryMaster — Relational SQL Grid", href: "/practice/querymaster" },
      { name: "BugHunter — 1-Line Code Debugging", href: "/practice/bughunter" },
      { name: "CloudStudio — Multi-Language Cloud IDE", href: "/practice/cloudstudio" },
      { name: "Explore All Practice Tracks", href: "/practice" },
    ],
  },
  "communities": {
    id: "communities",
    title: "Elevate Communities",
    subTitle: "Connect with peer learners, mentors, and hiring partners",
    items: [
      { name: "Student Study Groups & Circles", href: "/community" },
      { name: "Weekly Live Code Challenges", href: "/live" },
      { name: "Mentorship & Career AMA Sessions", href: "/community" },
      { name: "Elevate Developer Discord", href: "/community" },
      { name: "Alumni Hiring Network", href: "/careers" },
    ],
  },
  "development": {
    id: "development",
    title: "Development",
    subTitle: "Frontend, backend, mobile, and systems engineering",
    items: [
      { name: "Web Development", href: "/courses?category=Development" },
      { name: "JavaScript & TypeScript Mastery", href: "/courses?search=JavaScript" },
      { name: "React JS & Next.js 15 Fullstack", href: "/courses?search=React" },
      { name: "Python for Engineering & Data", href: "/courses?search=Python" },
      { name: "Node.js, Express & Microservices", href: "/courses?search=Node.js" },
      { name: "Java Spring Boot Enterprise", href: "/courses?search=Java" },
      { name: "Go (Golang) Cloud Microservices", href: "/courses?search=Golang" },
      { name: "Flutter & React Native Mobile Apps", href: "/courses?search=Mobile+Apps" },
      { name: "Docker, Kubernetes & CI/CD Pipelines", href: "/courses?search=Docker" },
    ],
  },
  "business": {
    id: "business",
    title: "Business",
    subTitle: "Strategy, management, entrepreneurship, and execution",
    items: [
      { name: "Project Management Foundations", href: "/courses?search=Project+Management" },
      { name: "Product Management Essentials", href: "/courses?search=Product+Management" },
      { name: "Startup Entrepreneurship & MVP", href: "/courses?search=Startup" },
      { name: "Leadership & Team Management", href: "/courses?search=Leadership" },
      { name: "Business Strategy & Competitive Analysis", href: "/courses?search=Strategy" },
      { name: "High-Stakes Sales & Negotiation", href: "/courses?search=Sales" },
    ],
  },
  "finance": {
    id: "finance",
    title: "Finance & Accounting",
    subTitle: "Corporate finance, investments, and bookkeeping",
    items: [
      { name: "Financial Modeling & Valuation in Excel", href: "/courses?search=Financial+Modeling" },
      { name: "Accounting & Financial Statements 101", href: "/courses?search=Accounting" },
      { name: "Stock Market Investing & Technical Analysis", href: "/courses?search=Investing" },
      { name: "Corporate Financial Analysis", href: "/courses?search=Corporate+Finance" },
      { name: "Crypto, Web3 & Decentralized Finance", href: "/courses?search=Crypto" },
    ],
  },
  "it-software": {
    id: "it-software",
    title: "IT & Software",
    subTitle: "Cloud infrastructure, cybersecurity, and networking",
    items: [
      { name: "Amazon Web Services (AWS) Architecture", href: "/courses?search=AWS" },
      { name: "Microsoft Azure Infrastructure", href: "/courses?search=Azure" },
      { name: "Linux System Administration & Bash", href: "/courses?search=Linux" },
      { name: "Ethical Hacking & Penetration Testing", href: "/courses?search=Ethical+Hacking" },
      { name: "Kubernetes Orchestration in Production", href: "/courses?search=Kubernetes" },
      { name: "CompTIA Network+ & Cisco Networking", href: "/courses?search=Networking" },
    ],
  },
  "productivity": {
    id: "productivity",
    title: "Office Productivity",
    subTitle: "Spreadsheets, dashboards, and automated workflows",
    items: [
      { name: "Microsoft Excel: Beginner to Advanced", href: "/courses?search=Excel" },
      { name: "Microsoft Power BI & Data Storytelling", href: "/courses?search=Power+BI" },
      { name: "Google Sheets Automation & Apps Script", href: "/courses?search=Google+Sheets" },
      { name: "Tableau Visual Analytics", href: "/courses?search=Tableau" },
      { name: "PowerPoint & Executive Presentations", href: "/courses?search=PowerPoint" },
      { name: "Notion & Asana Workspace Architecture", href: "/courses?search=Notion" },
    ],
  },
  "personal-dev": {
    id: "personal-dev",
    title: "Personal Development",
    subTitle: "Communication, mindset, and peak performance",
    items: [
      { name: "Public Speaking & Confident Presentations", href: "/courses?search=Public+Speaking" },
      { name: "Executive Writing & Clear Thinking", href: "/courses?search=Writing" },
      { name: "Time Management & Deep Work Protocols", href: "/courses?search=Productivity" },
      { name: "Emotional Intelligence for Leaders", href: "/courses?search=Emotional+Intelligence" },
      { name: "Critical Thinking & Decision Making", href: "/courses?search=Critical+Thinking" },
    ],
  },
  "design": {
    id: "design",
    title: "Design",
    subTitle: "UI/UX, graphic design, design systems, and 3D",
    items: [
      { name: "Figma UI/UX Design Masterclass", href: "/courses?search=Figma" },
      { name: "User Research & Usability Testing", href: "/courses?search=User+Research" },
      { name: "Design Systems & Token Architecture", href: "/courses?search=Design+Systems" },
      { name: "Adobe Photoshop & Illustrator Pro", href: "/courses?search=Photoshop" },
      { name: "Webflow Responsive Web Building", href: "/courses?search=Webflow" },
    ],
  },
  "marketing": {
    id: "marketing",
    title: "Marketing",
    subTitle: "Growth, search optimization, and performance campaigns",
    items: [
      { name: "Search Engine Optimization (SEO) Masterclass", href: "/courses?search=SEO" },
      { name: "Digital Marketing & Brand Strategy", href: "/courses?search=Digital+Marketing" },
      { name: "Google Ads & Meta Performance Marketing", href: "/courses?search=Google+Ads" },
      { name: "Social Media Growth & Viral Content", href: "/courses?search=Social+Media" },
      { name: "Email Marketing & Marketing Automation", href: "/courses?search=Email+Marketing" },
    ],
  },
};

export const FOOTER_DIRECTORY_COLUMNS = [
  {
    title: "In-demand Careers",
    links: [
      { name: "Data Scientist", href: "/courses?search=Data+Scientist" },
      { name: "Full Stack Web Developer", href: "/courses?search=Full+Stack" },
      { name: "Cloud Engineer", href: "/courses?search=Cloud+Engineer" },
      { name: "Project Manager", href: "/courses?search=Project+Manager" },
      { name: "Game Developer", href: "/courses?search=Game+Developer" },
      { name: "All Career Accelerators", href: "/career-paths" },
    ],
  },
  {
    title: "Web Development",
    links: [
      { name: "Web Development", href: "/courses?category=Development" },
      { name: "JavaScript", href: "/courses?search=JavaScript" },
      { name: "React JS", href: "/courses?search=React" },
      { name: "Angular", href: "/courses?search=Angular" },
      { name: "Java", href: "/courses?search=Java" },
    ],
  },
  {
    title: "IT Certifications",
    links: [
      { name: "Amazon AWS", href: "/courses?search=AWS" },
      { name: "AWS Certified Cloud Practitioner", href: "/courses?search=AWS+Certified+Cloud+Practitioner" },
      { name: "AZ-900: Microsoft Azure Fundamentals", href: "/courses?search=AZ-900" },
      { name: "AWS Certified Solutions Architect - Associate", href: "/courses?search=AWS+Solutions+Architect" },
      { name: "Kubernetes", href: "/courses?search=Kubernetes" },
    ],
  },
  {
    title: "Leadership",
    links: [
      { name: "Leadership", href: "/courses?search=Leadership" },
      { name: "Management Skills", href: "/courses?search=Management" },
      { name: "Project Management", href: "/courses?search=Project+Management" },
      { name: "Personal Productivity", href: "/courses?search=Productivity" },
      { name: "Emotional Intelligence", href: "/courses?search=Emotional+Intelligence" },
    ],
  },
  {
    title: "Certifications by Skill",
    links: [
      { name: "Cybersecurity Certification", href: "/certificates" },
      { name: "Project Management Certification", href: "/certificates" },
      { name: "Cloud Certification", href: "/certificates" },
      { name: "Data Analytics Certification", href: "/certificates" },
      { name: "HR Management Certification", href: "/certificates" },
      { name: "See all Certifications", href: "/certificates" },
    ],
  },
  {
    title: "Data Science",
    links: [
      { name: "Data Science", href: "/courses?search=Data+Science" },
      { name: "Python", href: "/courses?search=Python" },
      { name: "Machine Learning", href: "/courses?search=Machine+Learning" },
      { name: "ChatGPT", href: "/courses?search=ChatGPT" },
      { name: "Deep Learning", href: "/courses?search=Deep+Learning" },
    ],
  },
  {
    title: "Communication",
    links: [
      { name: "Communication Skills", href: "/courses?search=Communication" },
      { name: "Presentation Skills", href: "/courses?search=Presentation" },
      { name: "Public Speaking", href: "/courses?search=Public+Speaking" },
      { name: "Writing", href: "/courses?search=Writing" },
      { name: "PowerPoint", href: "/courses?search=PowerPoint" },
    ],
  },
  {
    title: "Business Analytics & Intelligence",
    links: [
      { name: "Microsoft Excel", href: "/courses?search=Excel" },
      { name: "SQL", href: "/courses?search=SQL" },
      { name: "Microsoft Power BI", href: "/courses?search=Power+BI" },
      { name: "Data Analysis", href: "/courses?search=Data+Analysis" },
      { name: "Business Analysis", href: "/courses?search=Business+Analysis" },
    ],
  },
];
