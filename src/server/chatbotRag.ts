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
  titleTokens: Set<string>;
  bodyTokens: Set<string>;
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
  bought: ["purchase", "purchased", "order", "payment", "enrollment", "dashboard"],
  purchased: ["order", "payment", "enrollment", "dashboard"],
  paid: ["payment", "razorpay", "order", "enrollment"],
  dashboard: ["learning", "library", "enrollment", "courses"],
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "am",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "done",
  "will",
  "would",
  "could",
  "should",
  "can",
  "may",
  "might",
  "must",
  "what",
  "which",
  "who",
  "whom",
  "how",
  "when",
  "where",
  "why",
  "i",
  "me",
  "my",
  "you",
  "your",
  "we",
  "our",
  "he",
  "she",
  "it",
  "its",
  "they",
  "them",
  "their",
  "this",
  "that",
  "these",
  "those",
  "there",
  "here",
  "for",
  "to",
  "of",
  "in",
  "on",
  "at",
  "by",
  "from",
  "into",
  "onto",
  "with",
  "about",
  "and",
  "or",
  "but",
  "not",
  "no",
  "nor",
  "so",
  "yet",
  "still",
  "just",
  "very",
  "too",
  "also",
  "only",
  "already",
  "then",
  "than",
  "tell",
  "show",
  "showing",
  "find",
  "give",
  "want",
  "need",
  "get",
  "got",
  "please",
  "explain",
  "help",
  "top",
  "recommend",
  "open",
  "see",
]);

function tokenizeWords(raw: string): string[] {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

function expandTokens(raw: string): string[] {
  const base = tokenizeWords(raw);
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

function makeChunk(
  item: Omit<KnowledgeChunk, "titleTokens" | "bodyTokens">
): KnowledgeChunk {
  return {
    ...item,
    titleTokens: new Set(tokenizeWords(item.title)),
    bodyTokens: new Set(tokenizeWords(`${item.title} ${item.text}`)),
  };
}

function buildKnowledgeBase() {
  return cachedSync("chatbot:kb-v3", 60_000, () => {
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
      chunks.push(
        makeChunk({
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
        })
      );
    }

    for (const mod of PRACTICE_MODULES) {
      chunks.push(
        makeChunk({
          id: `practice-${mod.id}`,
          kind: "practice",
          title: mod.name,
          text: `${mod.name} ${mod.tagline} ${mod.description} ${mod.stats} interactive practice coding challenge lab`,
          href: mod.path,
          badge: mod.badge,
          meta: mod.stats,
          cardSubtitle: mod.description,
        })
      );
    }

    for (const post of mockBlogPosts) {
      chunks.push(
        makeChunk({
          id: `blog-${post.id}`,
          kind: "blog",
          title: post.title,
          text: `${post.title} ${post.excerpt} ${post.category} ${post.tags.join(" ")} ${post.keyTakeaways.join(" ")}`,
          href: `/blog/${post.slug}`,
          badge: `${post.category} Guide`,
          meta: `${post.readTime} · ${post.level}`,
          cardSubtitle: post.excerpt,
        })
      );

      for (const sec of post.sections) {
        if (sec.qaItems) {
          for (const qa of sec.qaItems) {
            chunks.push(
              makeChunk({
                id: `qa-${post.id}-${qa.number}`,
                kind: "qa",
                title: qa.question,
                text: `${qa.question} ${qa.answer} ${post.tags.join(" ")} ${post.category}`,
                href: `/blog/${post.slug}#${sec.id}`,
                badge: `Q${qa.number} · ${qa.difficulty}`,
                meta: `${post.title} · ${qa.difficulty}`,
                cardSubtitle: qa.answer,
              })
            );
          }
        } else {
          chunks.push(
            makeChunk({
              id: `sec-${post.id}-${sec.id}`,
              kind: "blog",
              title: `${sec.title} (${post.title})`,
              text: `${sec.title} ${sec.paragraphs.join(" ")} ${post.tags.join(" ")}`,
              href: `/blog/${post.slug}#${sec.id}`,
              badge: post.category,
              meta: `${post.readTime} · Section Guide`,
              cardSubtitle: sec.paragraphs[0] || post.excerpt,
            })
          );
        }
      }

      for (const faq of post.faqs) {
        chunks.push(
          makeChunk({
            id: `blogfaq-${post.id}-${faq.question.slice(0, 20)}`,
            kind: "qa",
            title: faq.question,
            text: `${faq.question} ${faq.answer} ${post.tags.join(" ")}`,
            href: `/blog/${post.slug}#frequently-asked-questions`,
            badge: `${post.category} FAQ`,
            meta: post.title,
            cardSubtitle: faq.answer,
          })
        );
      }
    }

    const monthlyStr = planSettings?.monthly_price_minor
      ? `₹${(Number(planSettings.monthly_price_minor) / 100).toLocaleString("en-IN")}/month`
      : "monthly billing";
    const annualStr = planSettings?.annual_price_minor
      ? `₹${(Number(planSettings.annual_price_minor) / 100).toLocaleString("en-IN")}/year`
      : "annual billing";

    const platformChunks: Array<Omit<KnowledgeChunk, "titleTokens" | "bodyTokens">> = [
      {
        id: "platform-dashboard-missing-course",
        kind: "platform",
        title: "Purchased Course Not Showing on Dashboard",
        text: "bought purchased paid course order razorpay dashboard missing library enrollment access email account verify payment",
        href: "/dashboard",
        badge: "Order & Access Help",
        meta: "My Learning Dashboard",
        cardSubtitle:
          "Check that you are signed into the same email used at checkout, refresh your Learning Dashboard, or contact support@elevate.courses with your Razorpay order ID for quick reconciliation.",
      },
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
        id: "platform-personal-plan-account",
        kind: "platform",
        title: "Manage Personal Plan Subscription",
        text: "personal plan account billing renewal subscription reconcile active courses",
        href: "/personal-plan/account",
        badge: "Subscription Status",
        meta: "Billing & Reconciliation",
        cardSubtitle:
          "Inspect active subscription billing dates, cancel renewal, or sync Personal Plan course access.",
      },
      {
        id: "platform-certificates",
        kind: "platform",
        title: "Verified Certificates & Credential Verification",
        text: "certificate verification verify credential completion download proof pdf employer qr code",
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
        title: "Contact Learner Support & Order Desk",
        text: "contact support help refund billing login password enterprise team invoice sla payment order",
        href: "/contact",
        badge: "24h Support",
        meta: "support@elevate.courses · Mon–Fri",
        cardSubtitle:
          "Send your payment receipt or order reference to support@elevate.courses for fast enrollment resolution within 24 business hours.",
      },
      {
        id: "platform-faq",
        kind: "platform",
        title: "Frequently Asked Questions (Payments, Access & Labs)",
        text: "faq razorpay upi card netbanking lifetime self-paced courses access help",
        href: "/faq",
        badge: "FAQ & Help",
        meta: "Instant Answers",
        cardSubtitle:
          "Answers covering Razorpay UPI/card payments, lifetime course access, browser coding labs, and verification.",
      },
    ];

    for (const item of platformChunks) {
      chunks.push(makeChunk(item));
    }

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

  const wantsPurchaseHelp =
    /\b(bought|purchase|purchased|paid|payment|razorpay|order|orders|dashboard|missing|not showing|not visible|unable to see|access|enrolled|enrollment|refund|billing|receipt)\b/.test(
      lowerQuery
    );
  const wantsCourses =
    !wantsPurchaseHelp &&
    /\b(course|courses|catalog|syllabus|class|classes)\b/.test(lowerQuery) &&
    !/\b(interview|question|difference|explain|what is|how does|blog|article)\b/.test(
      lowerQuery
    );
  const wantsPractice =
    /\b(practice|lab|labs|arena|playground|kata|challenge|challenges|sandbox|codearena|querymaster|webforge|bughunter|cloudstudio)\b/.test(
      lowerQuery
    );
  const wantsTechnicalQa =
    !wantsPurchaseHelp &&
    /\b(what|why|how|difference|compare|explain|when|vs|meaning)\b|\?/.test(
      lowerQuery
    );

  return chunks
    .map((chunk) => {
      const titleLower = chunk.title.toLowerCase();
      let score = 0;
      let tokenHits = 0;

      if (titleLower.includes(lowerQuery) && lowerQuery.length > 4) score += 20;

      for (const token of tokens) {
        if (chunk.titleTokens.has(token)) {
          score += 8;
          tokenHits += 1;
        } else if (chunk.bodyTokens.has(token)) {
          score += 4;
          tokenHits += 1;
        }
      }

      if (score === 0 && contextTokens.length > 0) {
        for (const t of contextTokens) {
          if (chunk.titleTokens.has(t)) {
            score += 3;
            tokenHits += 1;
          }
        }
      }

      if (wantsPurchaseHelp && chunk.kind === "platform") {
        score += 18;
      }
      if (wantsCourses && chunk.kind === "course") {
        score += 14;
      }
      if (wantsPractice && chunk.kind === "practice") {
        score += 16;
      }
      if (wantsTechnicalQa && chunk.kind === "qa" && tokenHits >= 2) {
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
        chunk.bodyTokens.has("tamil")
      ) {
        score += 9;
      }

      // Avoid spurious 1-token matches inside long Q&A documents
      if (chunk.kind === "qa" && tokenHits < 2) {
        score = 0;
      }

      return { chunk, score };
    })
    .filter((entry) => entry.score >= 5)
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

  const maxConcurrent = Number(
    process.env.MAX_CONCURRENT_LLM || (geminiKey || openaiKey ? 50 : 4)
  );

  return withLlmConcurrencyGuard(maxConcurrent, 64, 4000, async () => {
    const contextBlock = retrieved
      .map(
        (c, i) =>
          `[${i + 1}] (${c.badge}) ${c.title} | ${c.meta}\nURL: ${c.href}\nDetails: ${c.cardSubtitle}`
      )
      .join("\n\n");

    const systemPrompt = `You are Elevate Assistant, an intelligent software engineering mentor, technical problem-solver, and customer advisor on the Elevate learning platform.

Capabilities & Rules:
1. Understand the user's intent deeply and answer ALL types of questions—complex coding, algorithms, SQL, system design, debugging, math, career guidance, OR Elevate account/course/payment questions—directly, accurately, and concisely.
2. When answering questions about Elevate courses, dashboard, orders, pricing, Personal Plan, certificates, or practice labs, ground your response accurately using the Platform Facts & Retrieved Context below (never invent prices or URLs not listed).
3. Write Big-O / math in plain text (for example O(log n) or O(n)), NEVER using LaTeX delimiters, and keep answers crisp and well-structured (under 220 words).

Elevate Platform Facts:
- ${summaryStats}
- Dashboard (/dashboard): Contains "Pick up where you left off" (enrolled courses), "My Certificates", "Upcoming Live Classes", and at the bottom "Explore More Courses" (unpurchased catalog suggestions that are NOT charged).
- Orders & Receipts (/profile): Learners can check signed-in account email and paid order history.
- Payments & Missing Courses (/contact): Razorpay supports UPI, cards, and netbanking; if a paid course is missing from /dashboard, verify the checkout email/Google account or contact support@elevate.courses (24h business SLA).
- Subscriptions (/personal-plan & /personal-plan/account): Active Personal Plan automatically unlocks included pro courses without individual checkout; Free (₹0) courses also enroll in one click.
- Practice Arenas (/practice): CodeArena (100 DSA levels), QueryMaster (Live SQL), WebForge (UI Sandbox), BugHunter (Debugging), CloudStudio (Cloud IDE) — all free in-browser.
- Verification & Teaching: Verify credentials at /certificates/verify; apply to teach at /instructor/apply.

Retrieved Elevate Context:
${contextBlock || "No specific catalog item matched; answer the user's question thoroughly and naturally."}`;

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
          signal: AbortSignal.timeout(isLocalEndpoint ? 45000 : 30000),
          body: JSON.stringify({
            model: openaiModel,
            messages,
            max_tokens: isLocalEndpoint ? 300 : 2400,
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

function suggestFollowUps(lower: string, isSupport: boolean): string[] {
  if (isSupport) {
    return [
      "Tell me about Personal Plan",
      "How do I contact support?",
      "Recommend top courses",
    ];
  }
  if (/\b(sql|database|query|index|table)\b/.test(lower)) {
    return [
      "Open SQL QueryMaster",
      "Explain B-Tree composite indexes",
      "Recommend Data & SQL guides",
    ];
  }
  return [
    "Show a code example",
    "Open CodeArena practice",
    "Recommend top courses",
  ];
}

function formatPlatformSummary(
  kb: ReturnType<typeof buildKnowledgeBase>
): string {
  return `${kb.totalCourses} published courses across ${kb.categories.map((c) => c.name).join(", ")}; 5 free Practice Arenas (CodeArena, WebForge, QueryMaster, BugHunter, CloudStudio); Personal Plan (${kb.monthlyStr} / ${kb.annualStr}) with ${kb.planCourseRows.length} included courses.`;
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

  const isUnpurchasedCourseInDashboard =
    /\b(dashboard|library)\b/.test(lower) &&
    (/\b(haven'?t|have not|not|didn'?t|did not|never|without)\s+(bought|buy|purchased|purchase|paid|pay|enrolled|enroll)\b/.test(
      lower
    ) ||
      /\b(extra|unknown|unfamiliar|unexpected|random|free)\b.*\b(course|courses)\b/.test(
        lower
      ));

  if (isUnpurchasedCourseInDashboard) {
    const unexpectedCourseCards: ChatCard[] = [
      {
        title: "Check Profile & Order History",
        subtitle:
          "Review your paid orders, account email, and security settings to confirm which courses were billed.",
        meta: "Account & Receipts",
        href: "/profile",
        badge: "Verify Orders",
      },
      {
        title: "Personal Plan Included Courses",
        subtitle:
          "Active Personal Plan subscriptions automatically unlock included courses on your dashboard.",
        meta: "Subscription Sync",
        href: "/personal-plan/account",
        badge: "Personal Plan",
      },
      {
        title: "Contact Learner Support",
        subtitle:
          "Notice an unexpected enrollment or charge? Reach support@elevate.courses within 24h.",
        meta: "support@elevate.courses",
        href: "/contact",
        badge: "24h Support",
      },
    ];

    const unexpectedContext = [
      makeChunk({
        id: "platform-unexpected-course-dashboard",
        kind: "platform",
        title: "Why an Unpurchased Course Appears on Dashboard",
        text: "dashboard explore more courses personal plan free course profile orders unpurchased",
        href: "/profile",
        badge: "Dashboard Help",
        meta: "Elevate Dashboard Structure",
        cardSubtitle:
          "Courses can appear on /dashboard for 3 normal reasons: (1) the bottom 'Explore More Courses' section shows unpurchased catalog suggestions (not charged), (2) an active Personal Plan automatically unlocks included courses, or (3) a Free starter course was enrolled. Check /profile for receipts or /contact for help.",
      }),
      ...kb.chunks.filter((c) =>
        ["platform-personal-plan-account", "platform-contact"].includes(c.id)
      ),
    ];

    const llmResult = await callConfiguredLlm(
      query,
      history,
      unexpectedContext,
      formatPlatformSummary(kb)
    );

    const deterministicUnexpectedReply =
      "A course you didn't directly buy can appear on your dashboard for three common reasons:\n1. **Explore More Courses**: The bottom section of /dashboard displays unpurchased catalog suggestions to discover—these have not been charged.\n2. **Personal Plan or Free Enrollment**: If you have an active Personal Plan (/personal-plan/account), included pro courses are added automatically; ₹0 Free courses also enroll without checkout.\n3. **Order & Account Check**: Check your receipts and active email in your Profile (/profile). If anything looks unfamiliar or you notice an unexpected charge, contact support@elevate.courses via /contact immediately.";

    return {
      reply: llmResult ? llmResult.text : deterministicUnexpectedReply,
      cards: unexpectedCourseCards,
      followUps: [
        "Tell me about Personal Plan",
        "Contact support",
        "Recommend top courses",
      ],
      mode: llmResult ? llmResult.source : "local-rag",
    };
  }

  const isPurchaseOrDashboardIssue =
    !isUnpurchasedCourseInDashboard &&
    /\b(bought|purchase|purchased|paid|payment|razorpay|order|orders)\b/.test(lower) &&
    /\b(missing|not showing|not visible|didn'?t appear|did not appear|unable to see|not unlocked|cannot find|can'?t find|where is)\b/.test(
      lower
    );

  if (isPurchaseOrDashboardIssue) {
    const troubleshootingCards: ChatCard[] = [
      {
        title: "Open My Learning Dashboard",
        subtitle:
          "Refresh your dashboard library and confirm you are signed into the exact account used during checkout.",
        meta: "Learner Library",
        href: "/dashboard",
        badge: "Check Access",
      },
      {
        title: "Contact Learner Support (24h SLA)",
        subtitle:
          "Share your Razorpay payment ID or registered email at support@elevate.courses so we can reconcile your enrollment.",
        meta: "support@elevate.courses",
        href: "/contact",
        badge: "Order Support",
      },
      {
        title: "Personal Plan Account & Sync",
        subtitle:
          "If you purchased Personal Plan, check subscription status and included courses here.",
        meta: "Subscription Status",
        href: "/personal-plan/account",
        badge: "Personal Plan",
      },
    ];

    const supportContext = kb.chunks.filter((c) =>
      [
        "platform-dashboard-missing-course",
        "platform-contact",
        "platform-personal-plan-account",
      ].includes(c.id)
    );
    const llmResult = await callConfiguredLlm(
      query,
      history,
      supportContext,
      formatPlatformSummary(kb)
    );

    const deterministicSupportReply =
      "If a course you bought isn't showing up in your dashboard, check these steps:\n1. Verify you're logged in with the exact same email or Google account used during Razorpay checkout.\n2. Refresh your My Learning Dashboard (/dashboard) or check Personal Plan Account (/personal-plan/account) if you subscribed to a pass.\n3. If payment succeeded and the course is still missing, message us on Contact Support (/contact) or email support@elevate.courses with your payment/order receipt ID so our team can reconcile your enrollment right away.";

    return {
      reply: llmResult ? llmResult.text : deterministicSupportReply,
      cards: troubleshootingCards,
      followUps: [
        "Contact support",
        "Tell me about Personal Plan",
        "Recommend top courses",
      ],
      mode: llmResult ? llmResult.source : "local-rag",
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

  const summaryStats = formatPlatformSummary(kb);

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
    const isSupportQuery = /\b(bought|purchase|purchased|paid|payment|dashboard|order|support|contact|refund|account|verify|certificate)\b/.test(
      lower
    );
    return {
      reply: llmResult.text,
      cards: dedupedCards,
      followUps: suggestFollowUps(lower, isSupportQuery),
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
    const topPlatform = retrieved.find((r) => r.kind === "platform");

    let deterministicReply = "";
    if (topPlatform) {
      deterministicReply = topPlatform.cardSubtitle;
    } else if (topQa) {
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
    const cacheKey = `chat:ans:v5:${normalizeCacheKey(query)}`;
    return cachedAsync(cacheKey, 10 * 60 * 1000, () =>
      computeChatResponse(query, history)
    );
  }
  return computeChatResponse(query, history);
}
