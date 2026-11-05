export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: string;
  coverImage: string;
}

export const mockBlogPosts: BlogPost[] = [
  {
    id: "blog-1",
    slug: "modern-react-compiler-nextjs-15",
    title: "How the React Compiler Changes Frontend Architecture in 2026",
    excerpt: "Exploring automated memoization, zero-cost abstractions, and the future of component state management.",
    category: "Engineering",
    author: {
      name: "John Doe",
      role: "Software Architect",
      avatar: "/images/first-version/photo-1534528741775-53994a69daeb.jpg",
    },
    publishedAt: "October 4, 2026",
    readTime: "6 min read",
    coverImage: "/images/first-version/photo-1555066931-4365d14bab8c.jpg",
    content: `
Modern frontend development is witnessing its biggest paradigm shift since hooks arrived. The React Compiler automatically optimizes rendering cycles, virtually eliminating the need for manual useMemo, useCallback, and React.memo boilerplate.

### Why Memoization Was Painful
For years, frontend teams spent excessive mental bandwidth debugging unnecessary re-renders. A single missing dependency inside an array would silently break object referential equality and cascade recalculations across whole component trees.

### Automated Compiler Transformations
By analyzing JavaScript semantics at build time, the compiler introduces fine-grained reactive blocks that re-evaluate only when specific inputs change. This yields predictable 60fps experiences without cognitive overhead.
    `,
  },
  {
    id: "blog-2",
    slug: "building-production-rag-agents",
    title: "Architecting Hybrid Vector Search & RAG in Production",
    excerpt: "A deep dive into combining keyword BM25 retrieval with dense vector embeddings for low-latency AI assistants.",
    category: "AI & ML",
    author: {
      name: "Priya Sundaram",
      role: "Lead AI Researcher",
      avatar: "/images/first-version/photo-1573496359142-b8d87734a5a2.jpg",
    },
    publishedAt: "September 28, 2026",
    readTime: "8 min read",
    coverImage: "/images/first-version/photo-1618005182384-a83a8bd57fbe.jpg",
    content: `
Retrieval-Augmented Generation (RAG) is now the standard architecture for domain-adapted LLMs. However, pure dense vector search often struggles with precise SKU numbers, product codes, or niche jargon.

### The Power of Reciprocal Rank Fusion
By synthesizing results from BM25 sparse keyword indices with modern multilingual embedding spaces, hybrid search dramatically reduces hallucinations and delivers precise answers.
    `,
  },
  {
    id: "blog-3",
    slug: "design-tokens-multi-platform-apps",
    title: "Scaling Design Tokens Across Web, iOS, and Android",
    excerpt: "Practical design system synchronization between Figma variables, Tailwind CSS themes, and native UI kits.",
    category: "Design",
    author: {
      name: "Ananya Sharma",
      role: "Staff Product Designer",
      avatar: "/images/first-version/photo-1580489944761-15a19d654956.jpg",
    },
    publishedAt: "September 15, 2026",
    readTime: "5 min read",
    coverImage: "/images/first-version/photo-1581291518857-4e27b48ff24e.jpg",
    content: `
Cohesive brand experiences require shared single sources of truth. Modern Figma variables empower design teams to export token definitions directly to JSON, creating a seamless sync pipeline with engineering repositories.
    `,
  },
];
