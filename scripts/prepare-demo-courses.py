"""Create original, narrated English demo lessons and artwork for four catalog topics.

Output is staged under output/demo-courses, never published by this script.
"""

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "demo-courses"
OUT.mkdir(parents=True, exist_ok=True)
FONT = Path(r"C:\Windows\Fonts\arial.ttf")
BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")

COURSES = [
    {
        "title": "What is RAG?", "slug": "what-is-rag-english-demo", "category": "AI & Generative AI",
        "subcategory": "AI Fundamentals", "price": 39, "accent": "#8B5CF6",
        "slides": [
            ("What is RAG?", "Retrieval + generation", "Retrieval augmented generation, or RAG, gives a language model relevant source material before it answers. In this English demo, we will follow a question through retrieval, context selection, and response generation."),
            ("The problem", "A model may lack your latest documents", "A language model's built in knowledge can be out of date, and it cannot automatically know your private handbook. Asking it to guess may produce a confident but incorrect answer."),
            ("Step 1: prepare", "Split documents into searchable chunks", "First, collect permitted documents. Split each document into useful passages, and store those passages in a search index. Some systems use embeddings so passages with similar meaning can be found."),
            ("Step 2: retrieve", "Search for passages related to the question", "When a learner asks a question, the application searches the index. It selects a small set of relevant passages. Good retrieval matters because a model cannot use a source it never receives."),
            ("Step 3: generate", "Answer using the retrieved context", "The application sends the question and selected passages to the model. It can ask the model to cite sources and to say when the provided material does not contain an answer."),
            ("Check the answer", "Inspect relevance, freshness, and permissions", "RAG is not a guarantee of truth. Evaluate whether the retrieved passage actually supports each claim, keep the index current, and make sure users only retrieve documents they are allowed to see."),
            ("Try it", "Question -> search -> context -> answer", "Imagine asking when a course refund is available. Retrieve the current refund policy, provide the relevant paragraph to the model, then compare the answer against the policy. That is the RAG workflow."),
        ],
    },
    {
        "title": "What is an API?", "slug": "what-is-an-api-english-demo", "category": "Technology & Programming",
        "subcategory": "APIs & Data", "price": 29, "accent": "#3B82F6",
        "slides": [
            ("What is an API?", "A way for software to communicate", "An application programming interface, or API, is a defined way for one software component to request data or actions from another. This English demo uses a course catalog as an example."),
            ("A simple example", "A page asks a server for courses", "When you open a learning website, the browser can request a list of courses. The server returns data such as titles, prices, and categories. The page then displays that information."),
            ("Request", "Method + address + optional data", "A request usually includes an address called an endpoint and a method. GET reads information. POST often creates something. A request can also include parameters or a body with input data."),
            ("Response", "Status + structured data", "The server replies with a status code and, often, a JSON body. A success response might include a course title and price. An error response should explain what went wrong without exposing private information."),
            ("Access control", "Authentication is not authorization", "Some APIs require a signed in user. Authentication identifies who made the request. Authorization checks what that person is allowed to do, such as viewing a purchased lesson or editing their own course."),
            ("A complete exchange", "GET /courses -> 200 + course list", "Suppose a browser sends GET slash courses. The server checks the request, reads published courses, and returns a success response with a list. The browser renders those courses as cards."),
            ("Your takeaway", "An API is a contract between systems", "Remember the basic flow: a client sends a request, a server performs a permitted action, and it returns a response. Clear inputs, predictable outputs, and careful access checks make the contract useful."),
        ],
    },
    {
        "title": "What is SEO?", "slug": "what-is-seo-english-demo", "category": "Digital Marketing",
        "subcategory": "Search & Advertising", "price": 29, "accent": "#F97316",
        "slides": [
            ("What is SEO?", "Help people find useful pages", "Search engine optimization, or SEO, is the work of making pages easier for search engines to understand and more useful for people searching. This English demo covers the basic workflow."),
            ("Search intent", "Start with the learner's question", "Before writing a page, ask what the visitor wants. Someone searching what is RAG expects a clear explanation. Someone searching buy an AI course may be comparing products. Match the page to the intent."),
            ("Useful content", "Answer clearly and accurately", "A page should answer its main question, use descriptive headings, and make important details easy to find. Original examples and current information help readers more than repeated keywords."),
            ("Page signals", "Title, URL, and internal links", "A descriptive page title and URL help explain its topic. Relevant internal links connect related lessons. Image alternative text describes images for accessibility and may provide additional context."),
            ("Technical basics", "Allow crawling and keep pages usable", "Search engines need access to the page. A site should avoid broken links, work on phones, and load reasonably well. Structured data can help clarify meaning when it accurately describes the visible page."),
            ("Measure outcomes", "Look beyond rankings", "Check whether visitors can find the page, engage with it, and take the intended next step. Search visibility can change, so use reliable analytics and improve pages based on real user needs."),
            ("Your first checklist", "Intent -> content -> access -> measurement", "Choose one real learner question. Publish a clear answer with a useful title, check that the page can be reached on mobile, and review search performance over time. Avoid promising guaranteed rankings."),
        ],
    },
    {
        "title": "What is MVP?", "slug": "what-is-mvp-english-demo", "category": "Business & Entrepreneurship",
        "subcategory": "Startup Fundamentals", "price": 29, "accent": "#10B981",
        "slides": [
            ("What is MVP?", "A small product built to learn", "A minimum viable product, or MVP, is the smallest usable version of an idea that can help a team test an important assumption with real users. This English demo uses a learning app example."),
            ("Start with a problem", "Name the user and their need", "Suppose learners struggle to find short lessons on one topic. The key question is whether people want a focused lesson library. Features should follow that question, not lead it."),
            ("Choose one test", "What must you learn first?", "A useful MVP tests a specific belief. For example, will learners finish a short lesson and return for another? Define a measurable signal before building so the result can guide your next decision."),
            ("Build the smallest path", "Browse -> purchase -> watch", "The first version might have only a few real lessons, simple checkout, and reliable playback. It does not need every future feature. The basic path must still work well enough to earn trust."),
            ("Observe behavior", "Talk to users and inspect outcomes", "After launch, watch where learners stop, ask what confused them, and compare results with the original expectation. A small sample can reveal problems, although it may not prove a broad market exists."),
            ("Decide what next", "Improve, change direction, or stop", "Use evidence to refine the product. If people finish but do not return, investigate why. If they cannot complete checkout, fix that path before adding more lessons. The MVP is a learning step."),
            ("Remember", "Minimum means focused, not broken", "A strong MVP is small in scope, usable, and honest about what it offers. State the assumption, build one working experience, measure the response, and make the next choice from evidence."),
        ],
    },
]


def font(size, bold=False):
    return ImageFont.truetype(str(BOLD if bold else FONT), size)


def wrap(draw, value, face, max_width):
    lines = []
    line = ""
    for word in value.split():
        candidate = f"{line} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=face)[2] > max_width and line:
            lines.append(line)
            line = word
        else:
            line = candidate
    return lines + ([line] if line else [])


def card(course, heading, subheading, index, total):
    image = Image.new("RGB", (1280, 720), "#131C2D")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 1280, 13), fill=course["accent"])
    draw.rounded_rectangle((66, 67, 255, 112), radius=16, fill=course["accent"])
    draw.text((84, 76), "ELEVATE", font=font(24, True), fill="#FFFFFF")
    draw.text((67, 150), "ENGLISH DEMO LESSON", font=font(21, True), fill=course["accent"])
    y = 230
    for line in wrap(draw, heading, font(62, True), 1110):
        draw.text((67, y), line, font=font(62, True), fill="#FFFFFF")
        y += 78
    y += 18
    for line in wrap(draw, subheading, font(37), 1110):
        draw.text((69, y), line, font=font(37), fill="#D5DDE9")
        y += 52
    draw.line((67, 636, 1213, 636), fill="#43516A", width=2)
    draw.text((69, 657), course["category"], font=font(19), fill="#AAB7CA")
    draw.text((1128, 657), f"{index}/{total}", font=font(20), fill="#AAB7CA")
    return image


def main():
    for course in COURSES:
        folder = OUT / course["slug"]
        folder.mkdir(exist_ok=True)
        script = []
        for index, (heading, subheading, narration) in enumerate(course["slides"], 1):
            card(course, heading, subheading, index, len(course["slides"])).save(folder / f"slide-{index:02}.png")
            script.append({"heading": heading, "narration": narration})
        card(course, course["title"], course["slides"][0][1], 1, len(course["slides"])).save(folder / "thumbnail.png")
        (folder / "script.json").write_text(json.dumps(script, indent=2), encoding="utf-8")
    print(f"Prepared artwork and scripts for {len(COURSES)} courses in {OUT}")


if __name__ == "__main__":
    main()
