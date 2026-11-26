import "server-only";
import { getDb } from "@/server/db";
import { listCourses } from "@/server/courses";
import { listCatalogCategories } from "@/server/catalogCategories";
import { mockBlogPosts } from "@/data/blogPosts";
import { PRACTICE_MODULES } from "@/data/practiceData";
import {
  cachedAsync,
  cachedSync,
  withLlmConcurrencyGuard,
} from "@/server/cache";

export interface ChatCard {
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  badge: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

export interface ChatReplyPayload {
  reply: string;
  cards: ChatCard[];
  followUps: string[];
  mode: "local-rag" | "offline-llm-rag" | "cloud-llm-rag";
}

interface KnowledgeChunk {
  id: string;
  kind: "course" | "practice" | "qa" | "blog" | "platform";
  title: string;
  text: string;
  href: string;
  badge: string;
  meta: string;
  cardSubtitle: string;
}

const SYNONYMS: Record<string, string[]> = {
  py: ["python"],
  js: ["javascript", "ecmascript"],
  ts: ["typescript"],
  db: ["database", "sql", "postgresql"],
  sql: ["database", "query", "join", "index", "querymaster"],
  dsa: ["algorithm", "algorithms", "coding", "codearena", "sliding", "pointers"],
  ai: ["artificial", "intelligence", "llm", "rag", "ml", "generative"],
  rag: ["retrieval", "vector", "embeddings", "llm"],
  frontend: ["html", "css", "react", "webforge", "dom", "ui"],
  react: ["frontend", "nextjs", "server", "components"],
  pass: ["personal", "plan", "subscription", "unlimited"],
  cost: ["price", "pricing", "fee", "free", "inr"],
  price: ["cost", "pricing", "fee", "free", "plan"],
  cert: ["certificate", "certification", "verify", "credential"],
  teach: ["instructor", "tutor", "mentor", "apply"],
  bug: ["bughunter", "debug", "debugging", "fix"],
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "what",
  "which",
  "who",
  "how",
  "can",
  "could",
  "should",
  "would",
  "do",
  "does",
  "i",
  "me",
  "my",
  "you",
  "your",
  "we",
  "our",
  "for",
  "to",
  "of",
  "in",
  "on",
  "with",
  "about",
  "and",
  "or",
  "tell",
  "show",
  "find",
  "give",
  "want",
  "need",
  "please",
  "explain",
  "help",
  "top",
  "recommend",
  "open",
]);

function expandTokens(raw: string): string[] {
  const base = raw
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));

  const expanded = new Set<string>(base);
  for (const token of base) {
    const extra = SYNONYMS[token];
    if (extra) {
      for (const word of extra) expanded.add(word);
    }
  }
  return Array.from(expanded);
}

function normalizeCacheKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^\w\s+#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatInr(price: number): string {
  return price <= 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`;
}

function buildKnowledgeBase() {
  return cachedSync("chatbot:kb-v2", 60_000, () => {
    const db = getDb();
    const { items: courses, total: totalCourses } = listCourses(
      new URLSearchParams({ sort: "popular", pageSize: "50" })
    );
    const categories = listCatalogCategories();

    const planSettings = db
      .prepare(
        "SELECT monthly_price_minor, annual_price_minor FROM personal_plan_settings WHERE id=1"
      )
      .get() as
      | { monthly_price_minor?: number; annual_price_minor?: number }
      | undefined;
    const planCourseRows = db
      .prepare(
        `SELECT c.title, c.slug, c.category FROM personal_plan_courses p
         JOIN courses c ON c.id=p.course_id
         WHERE c.status='published' AND c.review_status='approved'
         ORDER BY c.title COLLATE NOCASE LIMIT 15`
      )
      .all() as Array<{ title: string; slug: string; category: string }>;

    const chunks: KnowledgeChunk[] = [];

    for (const course of courses) {
      chunks.push({
        id: `course-${course.id}`,
        kind: "course",
        title: course.title,
        text: `${course.title} ${course.subtitle} ${course.description} ${course.category} ${course.level} ${course.language} instructor ${course.instructor.name}`,
        href: `/courses/${encodeURIComponent(course.slug)}`,
        badge: course.category,
        meta: `${formatInr(course.price)} · ${course.lessonCount} lessons · ${course.level} · ${course.language}`,
        cardSubtitle:
          course.subtitle ||
          course.description.slice(0, 120) ||
          `${course.level} course in ${course.language}`,
      });
    }

    for (const mod of PRACTICE_MODULES) {
      chunks.push({
        id: `practice-${mod.id}`,
        kind: "practice",
        title: mod.name,
        text: `${mod.name} ${mod.tagline} ${mod.description} ${mod.stats} interactive practice coding challenge lab`,
        href: mod.path,
        badge: mod.badge,
        meta: mod.stats,
        cardSubtitle: mod.description,
      });
    }

    for (const post of mockBlogPosts) {
      chunks.push({
        id: `blog-${post.id}`,
        kind: "blog",
        title: post.title,
        text: `${post.title} ${post.excerpt} ${post.category} ${post.tags.join(" ")} ${post.keyTakeaways.join(" ")}`,
        href: `/blog/${post.slug}`,
        badge: `${post.category} Guide`,
        meta: `${post.readTime} · ${post.level}`,
        cardSubtitle: post.excerpt,
      });

      for (const sec of post.sections) {
        if (sec.qaItems) {
          for (const qa of sec.qaItems) {
            chunks.push({
              id: `qa-${post.id}-${qa.number}`,
              kind: "qa",
              title: qa.question,
              text: `${qa.question} ${qa.answer} ${post.tags.join(" ")} ${post.category}`,
              href: `/blog/${post.slug}#${sec.id}`,
              badge: `Q${qa.number} · ${qa.difficulty}`,
              meta: `${post.title} · ${qa.difficulty}`,
              cardSubtitle: qa.answer,
            });
          }
        } else {
          chunks.push({
            id: `sec-${post.id}-${sec.id}`,
            kind: "blog",
            title: `${sec.title} (${post.title})`,
            text: `${sec.title} ${sec.paragraphs.join(" ")} ${post.tags.join(" ")}`,
            href: `/blog/${post.slug}#${sec.id}`,
            badge: post.category,
            meta: `${post.readTime} · Section Guide`,
            cardSubtitle: sec.paragraphs[0] || post.excerpt,
          });
        }
      }

      for (const faq of post.faqs) {
        chunks.push({
          id: `blogfaq-${post.id}-${faq.question.slice(0, 20)}`,
          kind: "qa",
          title: faq.question,
          text: `${faq.question} ${faq.answer} ${post.tags.join(" ")}`,
          href: `/blog/${post.slug}#frequently-asked-questions`,
          badge: `${post.category} FAQ`,
          meta: post.title,
          cardSubtitle: faq.answer,
        });
      }
    }

    const monthlyStr = planSettings?.monthly_price_minor
      ? `₹${(Number(planSettings.monthly_price_minor) / 100).toLocaleString("en-IN")}/month`
      : "monthly billing";
    const annualStr = planSettings?.annual_price_minor
      ? `₹${(Number(planSettings.annual_price_minor) / 100).toLocaleString("en-IN")}/year`
      : "annual billing";

    chunks.push(
      {
        id: "platform-personal-plan",
        kind: "platform",
        title: "Elevate Personal Plan",
        text: `Personal Plan subscription unlimited pass membership ${monthlyStr} ${annualStr} ${planCourseRows.map((c) => c.title).join(" ")}`,
        href: "/personal-plan",
        badge: "Personal Pass",
        meta: `${monthlyStr} · ${annualStr} · ${planCourseRows.length} included courses`,
        cardSubtitle:
          planCourseRows.length > 0
            ? `Unlocks all ${planCourseRows.length} selected courses with certificates and flexible billing.`
            : "Flexible subscription access to selected curated courses and certificates.",
      },
      {
        id: "platform-certificates",
        kind: "platform",
        title: "Verified Certificates & Credential Verification",
        text: "certificate verification verify credential completion download proof pdf employer",
        href: "/certificates/verify",
        badge: "Certificates",
        meta: "Public Verification Portal",
        cardSubtitle:
          "Completed courses grant uniquely numbered verifiable certificates viewable anytime.",
      },
      {
        id: "platform-teach",
        kind: "platform",
        title: "Teach on Elevate (Instructor Studio)",
        text: "teach instructor tutor mentor apply course studio revenue upload video review",
        href: "/instructor/apply",
        badge: "Instructors",
        meta: "3–5 Business Day Review",
        cardSubtitle:
          "Submit a course syllabus from your learner account to unlock Instructor Studio.",
      },
      {
        id: "platform-contact",
        kind: "platform",
        title: "Support, Billing & Enterprise Contact",
        text: "contact support help refund billing login password enterprise team invoice sla faq",
        href: "/contact",
        badge: "24h Support",
        meta: "support@elevate.courses · Mon–Fri",
        cardSubtitle:
          "Get direct help with enrollments, certificates, billing, or team licensing within 24 business hours.",
      }
    );

    return {
      courses,
      totalCourses,
      categories,
      planSettings,
      planCourseRows,
      monthlyStr,
      annualStr,
      chunks,
    };
  });
}

function scoreChunks(
  chunks: KnowledgeChunk[],
  query: string,
  tokens: string[],
  historyText: string
): KnowledgeChunk[] {
  const lowerQuery = query.toLowerCase();
  const contextTokens = expandTokens(`${query} ${historyText}`);

  const wantsCourses =
    /\b(course|courses|catalog|enroll|syllabus|class|classes)\b/.test(
      lowerQuery
    ) &&
    !/\b(interview|question|difference|explain|what is|how does|blog|article)\b/.test(
      lowerQuery
    );
  const wantsPractice =
    /\b(practice|lab|labs|arena|playground|kata|challenge|challenges|sandbox|codearena|querymaster|webforge|bughunter|cloudstudio)\b/.test(
      lowerQuery
    );
  const wantsTechnicalQa =
    /\b(what|why|how|difference|compare|explain|when|vs|meaning)\b|\?/.test(
      lowerQuery
    );

  return chunks
    .map((chunk) => {
      const titleLower = chunk.title.toLowerCase();
      const bodyLower = chunk.text.toLowerCase();
      let score = 0;

      if (titleLower.includes(lowerQuery) && lowerQuery.length > 3) score += 20;

      for (const token of tokens) {
        if (titleLower.includes(token)) score += 7;
        else if (bodyLower.includes(token)) score += 3;
      }

      if (score === 0 && contextTokens.length > 0) {
        for (const t of contextTokens) {
          if (titleLower.includes(t)) score += 2;
        }
      }

      if (wantsCourses && chunk.kind === "course") {
        score += 18;
      }
      if (wantsPractice && chunk.kind === "practice") {
        score += 18;
      }
      if (wantsTechnicalQa && chunk.kind === "qa" && score >= 5) {
        score += 8;
      }

      if (
        chunk.kind === "course" &&
        /\bfree\b/.test(lowerQuery) &&
        chunk.meta.startsWith("Free")
      ) {
        score += 10;
      }
      if (
        chunk.kind === "course" &&
        /\btamil\b/.test(lowerQuery) &&
        bodyLower.includes("tamil")
      ) {
        score += 9;
      }

      return { chunk, score };
    })
    .filter((entry) => entry.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((entry) => entry.chunk);
}

interface LlmResult {
  text: string;
  source: "offline-llm-rag" | "cloud-llm-rag";
}

async function callConfiguredLlm(
  userQuery: string,
  history: ChatTurn[],
  retrieved: KnowledgeChunk[],
  summaryStats: string
): Promise<LlmResult | null> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openaiKey =
    process.env.OPENAI_API_KEY?.trim() || process.env.LLM_API_KEY?.trim();
  const openaiBaseUrl = (
    process.env.LLM_BASE_URL?.trim() || "https://api.openai.com/v1"
  ).replace(/\/$/, "");
  const openaiModel = process.env.LLM_MODEL?.trim() || "gpt-4o-mini";

  // Local/Remote Offline LLM (Ollama / vLLM / Llama.cpp)
  const localLlmUrl = process.env.LOCAL_LLM_URL?.trim()?.replace(/\/$/, "");
  const localLlmModel = process.env.LOCAL_LLM_MODEL?.trim() || "qwen2.5:3b";

  if (!geminiKey && !openaiKey && !localLlmUrl) {
    return null;
  }

  const maxConcurrent = Number(process.env.MAX_CONCURRENT_LLM || (geminiKey || openaiKey ? 20 : 4));

  return withLlmConcurrencyGuard(maxConcurrent, 16, 2000, async () => {
    const contextBlock = retrieved
      .map(
        (c, i) =>
          `[${i + 1}] (${c.badge}) ${c.title} | ${c.meta}\nURL: ${c.href}\nDetails: ${c.cardSubtitle}`
      )
      .join("\n\n");

    const systemPrompt = `You are Elevate Assistant, an expert software engineering mentor, problem solver, and course advisor on the Elevate learning platform.

Capabilities & Rules:
1. Answer ALL types of questions—coding, algorithms, SQL, system design, debugging, math, career strategy—accurately and concisely.
2. NEVER invent numbers, fees, or rupee prices if an exact price is not explicitly shown in the Live Platform Snapshot below; instead direct users to /personal-plan or the course card for live pricing.
3. Write complexity/math in plain text (for example O(log n) or O(n)), NEVER using LaTeX delimiters, and keep responses sharp (under 220 words).

Live Platform Snapshot:
${summaryStats}

Retrieved Elevate Context:
${contextBlock || "No exact catalog match found; answer the user's question directly and thoughtfully, and optionally invite them to practice in Elevate's arenas when relevant."}`;

    try {
      // 1. Prefer high-scale Cloud LLM when explicitly configured
      if (geminiKey) {
        const contents = [
          ...history.slice(-6).map((m) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.text }],
          })),
          { role: "user", parts: [{ text: userQuery }] },
        ];
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
            geminiKey
          )}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(12000),
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents,
              generationConfig: { maxOutputTokens: 700, temperature: 0.35 },
            }),
          }
        );
        if (res.ok) {
          const json = await res.json();
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (typeof text === "string" && text.trim()) {
            const isLocalEndpoint =
              process.env.LOCAL_LLM_MODE === "offline" ||
              openaiBaseUrl.includes("127.0.0.1") ||
              openaiBaseUrl.includes("localhost");
            return {
              text: text.trim(),
              source: isLocalEndpoint ? "offline-llm-rag" : "cloud-llm-rag",
            };
          }
        }
      }

      if (openaiKey) {
        const messages = [
          { role: "system", content: systemPrompt },
          ...history.slice(-6).map((m) => ({ role: m.role, content: m.text })),
          { role: "user", content: userQuery },
        ];
        const isLocalEndpoint =
          process.env.LOCAL_LLM_MODE === "offline" ||
          openaiBaseUrl.includes("127.0.0.1") ||
          openaiBaseUrl.includes("localhost");
        const res = await fetch(`${openaiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          signal: AbortSignal.timeout(isLocalEndpoint ? 45000 : 15000),
          body: JSON.stringify({
            model: openaiModel,
            messages,
            max_tokens: isLocalEndpoint ? 300 : 650,
            temperature: 0.3,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          const text = json?.choices?.[0]?.message?.content;
          if (typeof text === "string" && text.trim()) {
            return {
              text: text.trim(),
              source: isLocalEndpoint ? "offline-llm-rag" : "cloud-llm-rag",
            };
          }
        }
      }

      // 2. Offline Local / Dedicated Inference Server (Ollama native /api/chat)
      if (localLlmUrl) {
        const ollamaMessages = [
          { role: "system", content: systemPrompt },
          ...history.slice(-6).map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text,
          })),
          { role: "user", content: userQuery },
        ];
        const res = await fetch(`${localLlmUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(25000),
          body: JSON.stringify({
            model: localLlmModel,
            messages: ollamaMessages,
            stream: false,
            keep_alive: "15m",
            options: {
              temperature: 0.35,
              num_ctx: 4096,
              num_predict: 550,
            },
          }),
        });
        if (res.ok) {
          const json = await res.json();
          const text = json?.message?.content;
          if (typeof text === "string" && text.trim()) {
            return { text: text.trim(), source: "offline-llm-rag" };
          }
        }
      }
    } catch {
      return null;
    }

    return null;
  });
}

async function computeChatResponse(
  query: string,
  history: ChatTurn[]
): Promise<ChatReplyPayload> {
  const kb = buildKnowledgeBase();
  const lower = query.toLowerCase().trim();
  const tokens = expandTokens(query);

  const recentUserHistory = history
    .filter((h) => h.role === "user")
    .slice(-2)
    .map((h) => h.text)
    .join(" ");

  if (
    /^(hi|hello|hey|good morning|good evening|namaste|vanakkam)\b/.test(
      lower
    ) &&
    tokens.length <= 2
  ) {
    const featuredCards: ChatCard[] = kb.courses.slice(0, 2).map((c) => ({
      title: c.title,
      subtitle: c.subtitle || `${c.category} · ${c.level}`,
      meta: `${formatInr(c.price)} · ${c.lessonCount} lessons`,
      href: `/courses/${encodeURIComponent(c.slug)}`,
      badge: c.category,
    }));
    return {
      reply: `Hi! Welcome to Elevate. I'm connected to our live catalog of ${kb.totalCourses} courses across ${kb.categories.length} categories, 5 interactive practice arenas, and an AI technical tutor. Ask me any coding, system design, or course question!`,
      cards: featuredCards,
      followUps: [
        "Recommend top courses",
        "Explain Python GIL vs Asyncio",
        "Tell me about Personal Plan",
        "Open SQL practice",
      ],
      mode: "local-rag",
    };
  }

  let retrieved = scoreChunks(kb.chunks, query, tokens, "");
  if (retrieved.length === 0 && recentUserHistory) {
    retrieved = scoreChunks(
      kb.chunks,
      query,
      expandTokens(`${query} ${recentUserHistory}`),
      ""
    );
  }

  if (
    retrieved.length === 0 &&
    /(popular|recommend|course|catalog|best|start|topics)/.test(lower)
  ) {
    retrieved = kb.chunks.filter((c) => c.kind === "course").slice(0, 3);
  }

  // Ensure Personal Plan prompt always injects plan chunk
  if (/(personal plan|pass|subscription|unlimited|membership)/.test(lower)) {
    const planChunk = kb.chunks.find((c) => c.id === "platform-personal-plan");
    if (planChunk && !retrieved.some((r) => r.id === planChunk.id)) {
      retrieved = [planChunk, ...retrieved].slice(0, 5);
    }
  }

  const summaryStats = `${kb.totalCourses} published courses across ${kb.categories.map((c) => c.name).join(", ")}; 5 free Practice Arenas (CodeArena, WebForge, QueryMaster, BugHunter, CloudStudio); Personal Plan (${kb.monthlyStr} / ${kb.annualStr}) with ${kb.planCourseRows.length} included courses.`;

  const llmResult = await callConfiguredLlm(
    query,
    history,
    retrieved,
    summaryStats
  );

  // Build deduplicated cards from top retrieved context
  const dedupedCards: ChatCard[] = [];
  const seenHrefs = new Set<string>();
  for (const item of retrieved) {
    if (seenHrefs.has(item.href)) continue;
    seenHrefs.add(item.href);
    dedupedCards.push({
      title: item.title,
      subtitle: item.cardSubtitle,
      meta: item.meta,
      href: item.href,
      badge: item.badge,
    });
    if (dedupedCards.length >= 3) break;
  }

  if (llmResult) {
    return {
      reply: llmResult.text,
      cards: dedupedCards,
      followUps: [
        "Give a code example",
        "Recommend a practice lab",
        "Tell me about Personal Plan",
      ],
      mode: llmResult.source,
    };
  }

  // Deterministic RAG fallback when LLM unavailable / overloaded
  if (/(personal plan|pass|subscription|unlimited|membership)/.test(lower)) {
    const includedTitles = kb.planCourseRows
      .slice(0, 3)
      .map((c) => c.title)
      .join(", ");
    const deterministicReply =
      kb.planCourseRows.length > 0
        ? `Elevate Personal Plan unlocks ${kb.planCourseRows.length} included pro courses (${kb.monthlyStr} or ${kb.annualStr}), including ${includedTitles}, with full progress tracking and verified certificates.`
        : `Elevate Personal Plan offers bundled access to curated premium courses (${kb.monthlyStr} or ${kb.annualStr}) with completion certificates. Check the Personal Plan page for current included courses.`;

    return {
      reply: deterministicReply,
      cards:
        dedupedCards.length > 0
          ? dedupedCards
          : [
              {
                title: "Elevate Personal Plan",
                subtitle: "Flexible monthly or annual subscription options",
                meta: `${kb.monthlyStr} · ${kb.annualStr}`,
                href: "/personal-plan",
                badge: "Personal Pass",
              },
            ],
      followUps: [
        "Show free courses",
        "How do certificates work?",
        "Open free practice labs",
      ],
      mode: "local-rag",
    };
  }

  if (retrieved.length > 0) {
    const topQa = retrieved.find((r) => r.kind === "qa");
    const topCourse = retrieved.find((r) => r.kind === "course");
    const topPractice = retrieved.find((r) => r.kind === "practice");

    let deterministicReply = "";
    if (topQa) {
      deterministicReply = `${topQa.cardSubtitle} (From our ${topQa.meta} guide — click the card below for code examples.)`;
    } else if (topCourse && /\bfree\b/.test(lower)) {
      const freeCourses = kb.courses.filter((c) => c.price === 0).length;
      deterministicReply =
        freeCourses > 0
          ? `We found ${freeCourses} free Elevate courses along with free interactive browser practice labs you can start right away:`
          : "Our 5 interactive coding arenas and engineering handbooks are 100% free to access right away, alongside these top catalog matches:";
    } else if (topPractice && !topCourse) {
      deterministicReply = `You can practice this directly in your browser using Elevate's ${topPractice.title} environment—zero setup needed:`;
    } else if (topCourse) {
      deterministicReply = `Here are the top matches from Elevate's ${kb.totalCourses} live courses, hands-on practice arenas, and technical handbooks:`;
    } else {
      deterministicReply = retrieved[0].cardSubtitle;
    }

    return {
      reply: deterministicReply,
      cards: dedupedCards,
      followUps: [
        "Python interview prep",
        "Tell me about Personal Plan",
        "Open SQL practice",
      ],
      mode: "local-rag",
    };
  }

  return {
    reply: `I can answer questions across Elevate's ${kb.totalCourses} live courses, 5 interactive coding arenas, Python/SQL/AI engineering handbooks, certificates, and support. Try browsing our Catalog or opening CodeArena & CloudStudio to test code live:`,
    cards: [
      {
        title: "Browse All Courses",
        subtitle: `Filter ${kb.totalCourses} published courses across ${kb.categories.length} categories.`,
        meta: "Catalog · Tamil & English",
        href: "/courses",
        badge: "Courses",
      },
      {
        title: "Interactive Practice Hub",
        subtitle:
          "Solve live challenges in CodeArena, QueryMaster, WebForge & BugHunter.",
        meta: "1,150+ Browser Challenges",
        href: "/practice",
        badge: "Free Labs",
      },
    ],
    followUps: [
      "Recommend top courses",
      "Tell me about Personal Plan",
      "Contact support",
    ],
    mode: "local-rag",
  };
}

export async function generateChatResponse(
  query: string,
  history: ChatTurn[] = []
): Promise<ChatReplyPayload> {
  // For standalone / first-turn equivalent questions, share singleflight cached response for 10 min!
  // That guarantees 20,000 simultaneous queries on shared/popular questions complete with <1ms overhead.
  const canUseAnswerCache = history.length <= 1;
  if (canUseAnswerCache) {
    const cacheKey = `chat:ans:v1:${normalizeCacheKey(query)}`;
    return cachedAsync(cacheKey, 10 * 60 * 1000, () =>
      computeChatResponse(query, history)
    );
  }
  return computeChatResponse(query, history);
}
