import { callPythonFunction } from "../lib/pythonInterpreter";
import { stripTypeScriptTypes } from "../lib/codeEvaluator";

export interface PracticeModule {
  id: string;
  name: string;
  tagline: string;
  description: string;
  path: string;
  iconType: "code" | "terminal" | "database" | "bug" | "braces";
  badge: string;
  accentColor: string;
  stats: string;
}

export const PRACTICE_MODULES: PracticeModule[] = [
  {
    id: "codearena",
    name: "CodeArena",
    tagline: "100 Progressive Levels of Algorithmic Coding Challenges",
    description: "Solve algorithmic coding challenges across 100 progressive levels from Python & JavaScript Fundamentals to Advanced Trees, Graphs & Dynamic Programming with live skill ratings.",
    path: "/practice/codearena",
    iconType: "code",
    badge: "100 Progressive Levels",
    accentColor: "from-blue-500 to-indigo-600",
    stats: "100 Levels · 600+ Challenges",
  },
  {
    id: "webforge",
    name: "WebForge",
    tagline: "100 Levels of Web & Fullstack UI Challenges",
    description: "Interactive HTML, CSS, and modern JavaScript sandboxes with real-time live preview and automated DOM validation tests.",
    path: "/practice/webforge",
    iconType: "terminal",
    badge: "Fullstack Sandbox",
    accentColor: "from-emerald-500 to-teal-600",
    stats: "100 Levels · 250+ Sandboxes",
  },
  {
    id: "querymaster",
    name: "QueryMaster",
    tagline: "100 Levels of Relational SQL & Database Puzzles",
    description: "Execute live SQL queries on real relational datasets. Master multi-table JOINs, aggregations, and window functions.",
    path: "/practice/querymaster",
    iconType: "database",
    badge: "SQL & Analytics",
    accentColor: "from-purple-500 to-violet-600",
    stats: "100 Levels · 300+ Queries",
  },
  {
    id: "bughunter",
    name: "BugHunter",
    tagline: "Real-World Code Debugging Across Multiple Languages",
    description: "Inspect production programs with subtle syntax and logic defects across Python, JavaScript, Java, and C++. Identify the root cause, refactor the code, and pass automated validation suites.",
    path: "/practice/bughunter",
    iconType: "bug",
    badge: "Multi-Language Debugger",
    accentColor: "from-rose-500 to-pink-600",
    stats: "Multi-Language · Production Defects",
  },
  {
    id: "cloudstudio",
    name: "CloudStudio",
    tagline: "Cloud IDE & Multi-Language Compiler Playground",
    description: "A fast, cloud-ready code playground and compiler supporting JavaScript, Python, TypeScript, HTML/CSS with standard I/O.",
    path: "/practice/cloudstudio",
    iconType: "braces",
    badge: "Cloud Compiler",
    accentColor: "from-amber-500 to-orange-600",
    stats: "Multi-Language IDE",
  },
];

// --- CODEKATA DATA ---
export interface CodeKataProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  acceptance: string;
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
    typescript: string;
  };
  testCases: {
    input: any[];
    expected: any;
    label: string;
  }[];
}

export const CODEKATA_PROBLEMS: CodeKataProblem[] = [
  {
    id: "p1",
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    category: "Arrays & Hash Tables",
    acceptance: "49.2%",
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    examples: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
      },
      {
        input: "nums = [3, 3], target = 6",
        output: "[0, 1]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums, target):
    # Write your code here
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i
    return []`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  // Write your code here
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    },
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1], label: "nums = [2, 7, 11, 15], target = 9" },
      { input: [[3, 2, 4], 6], expected: [1, 2], label: "nums = [3, 2, 4], target = 6" },
      { input: [[3, 3], 6], expected: [0, 1], label: "nums = [3, 3], target = 6" },
      { input: [[1, 5, 8, 12, 14], 20], expected: [2, 3], label: "nums = [1, 5, 8, 12, 14], target = 20" },
    ],
  },
  {
    id: "p2",
    title: "Valid Palindrome",
    slug: "valid-palindrome",
    difficulty: "Easy",
    category: "Strings & Two Pointers",
    acceptance: "44.8%",
    description:
      "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: "true",
        explanation: '"amanaplanacanalpanama" is a palindrome.',
      },
      {
        input: 's = "race a car"',
        output: "false",
        explanation: '"raceacar" is not a palindrome.',
      },
      {
        input: 's = " "',
        output: "true",
        explanation: 's is an empty string "" after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome.',
      },
    ],
    constraints: ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters."],
    starterCode: {
      javascript: `function isPalindrome(s) {
  // Write your code here
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
      python: `def is_palindrome(s: str) -> bool:
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]`,
      typescript: `function isPalindrome(s: string): boolean {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}`,
    },
    testCases: [
      { input: ["A man, a plan, a canal: Panama"], expected: true, label: 's = "A man, a plan, a canal: Panama"' },
      { input: ["race a car"], expected: false, label: 's = "race a car"' },
      { input: [" "], expected: true, label: 's = " "' },
      { input: ["No 'x' in Nixon"], expected: true, label: 's = "No \'x\' in Nixon"' },
    ],
  },
  {
    id: "p3",
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "Easy",
    category: "Stacks",
    acceptance: "40.3%",
    description:
      "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
    starterCode: {
      javascript: `function isValid(s) {
  // Write your code here
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (stack.pop() !== map[char]) {
      return false;
    }
  }
  return stack.length === 0;
}`,
      python: `def is_valid(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif not stack or stack.pop() != mapping.get(char):
            return False
    return len(stack) == 0`,
      typescript: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (stack.pop() !== map[char]) {
      return false;
    }
  }
  return stack.length === 0;
}`,
    },
    testCases: [
      { input: ["()"], expected: true, label: 's = "()"' },
      { input: ["()[]{}"], expected: true, label: 's = "()[]{}"' },
      { input: ["(]"], expected: false, label: 's = "(]"' },
      { input: ["([{}])"], expected: true, label: 's = "([{}])"' },
      { input: ["((("], expected: false, label: 's = "((("' },
    ],
  },
  {
    id: "p4",
    title: "Maximum Subarray (Kadane's Algorithm)",
    slug: "maximum-subarray",
    difficulty: "Medium",
    category: "Dynamic Programming",
    acceptance: "50.1%",
    description:
      "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
      },
      {
        input: "nums = [1]",
        output: "1",
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
      },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    starterCode: {
      javascript: `function maxSubArray(nums) {
  // Write your code here
  let maxSum = nums[0];
  let currentSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`,
      python: `def max_sub_array(nums):
    max_sum = current_sum = nums[0]
    for n in nums[1:]:
        current_sum = max(n, current_sum + n)
        max_sum = max(max_sum, current_sum)
    return max_sum`,
      typescript: `function maxSubArray(nums: number[]): number {
  let maxSum = nums[0];
  let currentSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`,
    },
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6, label: "nums = [-2,1,-3,4,-1,2,1,-5,4]" },
      { input: [[1]], expected: 1, label: "nums = [1]" },
      { input: [[5, 4, -1, 7, 8]], expected: 23, label: "nums = [5,4,-1,7,8]" },
      { input: [[-1, -2, -3]], expected: -1, label: "nums = [-1,-2,-3]" },
    ],
  },
];

// --- WEBKATA DATA ---
export interface WebKataChallenge {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  description: string;
  tasks: string[];
  initialHtml: string;
  initialCss: string;
  initialJs: string;
  validationRules: { selector: string; minCount?: number; message: string }[];
  hint: string;
}

export const WEBKATA_CHALLENGES: WebKataChallenge[] = [
  {
    id: "web-1",
    title: "Interactive Counter Component",
    difficulty: "Beginner",
    category: "DOM & Event Handling",
    description: "Build an interactive counter with Increment, Decrement, and Reset buttons. Ensure the counter number changes color when positive (green), negative (red), or zero (slate).",
    tasks: [
      "Include a display element with id='counter-value'",
      "Include buttons with id='btn-decrement', id='btn-reset', and id='btn-increment'",
      "Attach click event listeners in JS to update counter display and state color",
      "Style with responsive flex layout and clear hover states",
    ],
    initialHtml: `<div class="counter-card">
  <h2>Interactive Counter</h2>
  <div id="counter-value" class="value">0</div>
  <div class="button-group">
    <button id="btn-decrement">- Decrease</button>
    <button id="btn-reset">Reset</button>
    <button id="btn-increment">+ Increase</button>
  </div>
</div>`,
    initialCss: `body {
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  background-color: #FFFDF9;
}

.counter-card {
  background: white;
  padding: 2.25rem;
  border-radius: 1.25rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
  border: 1px solid #E5E7EB;
  text-align: center;
  width: 320px;
}

h2 { margin-top: 0; color: #172033; font-size: 1.25rem; }

.value {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 1.5rem 0;
  color: #172033;
  transition: color 0.2s ease;
}

.button-group { display: flex; gap: 0.5rem; justify-content: center; }

button {
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  background: #F7F8FA;
  color: #172033;
  border: 1px solid #E5E7EB;
  transition: all 0.15s ease;
}

button:hover { background: #FF6B35; color: white; border-color: #FF6B35; }`,
    initialJs: `let count = 0;
const valueDisplay = document.getElementById('counter-value');
const btnInc = document.getElementById('btn-increment');
const btnDec = document.getElementById('btn-decrement');
const btnReset = document.getElementById('btn-reset');

function updateDisplay() {
  valueDisplay.textContent = count;
  if (count > 0) valueDisplay.style.color = '#16A34A';
  else if (count < 0) valueDisplay.style.color = '#DC2626';
  else valueDisplay.style.color = '#172033';
}

btnInc.addEventListener('click', () => { count++; updateDisplay(); });
btnDec.addEventListener('click', () => { count--; updateDisplay(); });
btnReset.addEventListener('click', () => { count = 0; updateDisplay(); });`,
    validationRules: [
      { selector: "#counter-value", message: "Missing #counter-value display element." },
      { selector: "#btn-decrement", message: "Missing #btn-decrement button." },
      { selector: "#btn-reset", message: "Missing #btn-reset button." },
      { selector: "#btn-increment", message: "Missing #btn-increment button." },
    ],
    hint: "Ensure all four element IDs (#counter-value, #btn-decrement, #btn-reset, #btn-increment) are present and wired to addEventListener('click', ...).",
  },
  {
    id: "web-2",
    title: "User Profile Card with Status Badge",
    difficulty: "Beginner",
    category: "CSS Layout & Components",
    description: "Design a responsive profile card displaying an SVG badge avatar, engineer title, skill pills, online indicator dot, and a Connect button with active state toggle.",
    tasks: [
      "Build .profile-card container with clean rounded borders and drop shadow",
      "Include .status-dot positioned on the avatar wrap",
      "Include at least 3 skill tags inside .skills",
      "Implement #connect-btn that toggles the .connected CSS class on click",
    ],
    initialHtml: `<div class="profile-card">
  <div class="avatar-wrap">
    <div class="avatar" aria-label="Priya Sundaram">PS</div>
    <span class="status-dot" title="Online"></span>
  </div>
  <h3>Priya Sundaram</h3>
  <p class="role">Full Stack Engineer @ Elevate</p>
  <div class="skills">
    <span class="tag">React</span>
    <span class="tag">Next.js</span>
    <span class="tag">PostgreSQL</span>
  </div>
  <button id="connect-btn" class="connect-btn">Connect</button>
</div>`,
    initialCss: `body {
  font-family: system-ui, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  background: #F8FAFC;
}
.profile-card {
  background: white;
  width: 300px;
  border-radius: 1.25rem;
  padding: 2rem;
  text-align: center;
  border: 1px solid #E2E8F0;
  box-shadow: 0 8px 20px -4px rgba(0,0,0,0.06);
}
.avatar-wrap { position: relative; display: inline-block; margin-bottom: 1rem; }
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B35, #FB923C);
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #FFF7ED;
}
.status-dot {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  background: #22C55E;
  border: 2px solid white;
  border-radius: 50%;
}
h3 { margin: 0 0 0.25rem 0; color: #1E293B; }
.role { font-size: 0.875rem; color: #64748B; margin-bottom: 1rem; }
.skills { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem; flex-wrap: wrap; }
.tag { font-size: 0.75rem; background: #FFF7ED; color: #EA580C; padding: 0.25rem 0.65rem; border-radius: 9999px; font-weight: 600; }
.connect-btn {
  width: 100%;
  background: #FF6B35;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.connect-btn.connected { background: #E2E8F0; color: #475569; }`,
    initialJs: `const btn = document.getElementById('connect-btn');
btn.addEventListener('click', () => {
  btn.classList.toggle('connected');
  btn.textContent = btn.classList.contains('connected') ? 'Connected ✓' : 'Connect';
});`,
    validationRules: [
      { selector: ".profile-card", message: "Missing .profile-card container." },
      { selector: ".status-dot", message: "Missing .status-dot online indicator." },
      { selector: ".skills .tag", minCount: 3, message: "Include at least 3 .tag pills inside .skills." },
      { selector: "#connect-btn", message: "Missing #connect-btn button." },
    ],
    hint: "Verify .profile-card wraps .status-dot, at least three .skills > .tag badges, and #connect-btn.",
  },
  {
    id: "web-3",
    title: "Monthly / Annual Pricing Toggle",
    difficulty: "Beginner",
    category: "State & UI Controls",
    description: "Build a SaaS pricing comparison card with an interactive billing cycle switch that recalculates monthly vs annual prices (with 20% annual discount badge).",
    tasks: [
      "Add an accessible toggle button or checkbox with id='billing-toggle'",
      "Display at least 2 .plan-card elements with .plan-price values",
      "Update rendered prices and period labels (/mo vs /yr) on toggle",
      "Highlight the popular plan badge cleanly",
    ],
    initialHtml: `<div class="pricing-wrap">
  <div class="toggle-bar">
    <span>Monthly</span>
    <button id="billing-toggle" class="switch" aria-pressed="false" aria-label="Toggle annual billing">
      <span class="knob"></span>
    </button>
    <span>Annual <strong class="save-badge">Save 20%</strong></span>
  </div>
  <div class="plans-grid">
    <div class="plan-card">
      <h3>Starter</h3>
      <p class="plan-price" data-monthly="499" data-annual="4790">₹499<span>/mo</span></p>
      <p class="desc">Ideal for individual learners</p>
    </div>
    <div class="plan-card featured">
      <span class="pop">Most Popular</span>
      <h3>Pro Builder</h3>
      <p class="plan-price" data-monthly="999" data-annual="9590">₹999<span>/mo</span></p>
      <p class="desc">Full sandbox &amp; mentor reviews</p>
    </div>
  </div>
</div>`,
    initialCss: `body {
  font-family: system-ui, sans-serif;
  background: #FFFDF9;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  color: #172033;
}
.pricing-wrap { width: 90%; max-width: 560px; }
.toggle-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}
.save-badge {
  background: #DCFCE7;
  color: #15803D;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
}
.switch {
  width: 48px;
  height: 26px;
  background: #CBD5E1;
  border-radius: 999px;
  border: none;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}
.switch.annual { background: #FF6B35; }
.knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}
.switch.annual .knob { transform: translateX(22px); }
.plans-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.plan-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 1rem;
  padding: 1.25rem;
  position: relative;
}
.plan-card.featured { border-color: #FF6B35; box-shadow: 0 8px 20px rgba(255, 107, 53, 0.12); }
.pop {
  position: absolute;
  top: -10px;
  right: 12px;
  background: #FF6B35;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}
.plan-price { font-size: 1.75rem; font-weight: 800; margin: 0.5rem 0; }
.plan-price span { font-size: 0.85rem; font-weight: 500; color: #64748B; }
.desc { font-size: 0.8rem; color: #64748B; margin: 0; }`,
    initialJs: `const toggle = document.getElementById('billing-toggle');
const prices = document.querySelectorAll('.plan-price');
let isAnnual = false;

toggle.addEventListener('click', () => {
  isAnnual = !isAnnual;
  toggle.classList.toggle('annual', isAnnual);
  toggle.setAttribute('aria-pressed', String(isAnnual));
  prices.forEach(el => {
    const val = isAnnual ? el.dataset.annual : el.dataset.monthly;
    const period = isAnnual ? '/yr' : '/mo';
    el.innerHTML = '₹' + Number(val).toLocaleString('en-IN') + '<span>' + period + '</span>';
  });
});`,
    validationRules: [
      { selector: "#billing-toggle", message: "Missing #billing-toggle switch." },
      { selector: ".plan-card", minCount: 2, message: "Display at least 2 .plan-card elements." },
      { selector: ".plan-price", minCount: 2, message: "Include .plan-price inside each card." },
    ],
    hint: "Store monthly and annual pricing in data-* attributes on .plan-price elements so the toggle can swap them cleanly.",
  },
  {
    id: "web-4",
    title: "Real-Time Search & Filter List",
    difficulty: "Intermediate",
    category: "DOM Filtering & Arrays",
    description: "Create a live filterable course/topic directory with a search input and category chips that filter matching items and display a live result counter.",
    tasks: [
      "Provide a text search input with id='search-input'",
      "Provide at least 4 .course-item list cards with data-category attributes",
      "Display live match count inside #result-count",
      "Filter cards immediately on input without reloading",
    ],
    initialHtml: `<div class="directory">
  <div class="controls">
    <input id="search-input" type="search" placeholder="Search skills (e.g. React, SQL, Python)..." />
    <span id="result-count" class="badge">4 courses</span>
  </div>
  <ul id="course-list" class="list">
    <li class="course-item" data-title="React 19 Compiler &amp; Hooks">React 19 Compiler &amp; Hooks</li>
    <li class="course-item" data-title="PostgreSQL Indexing &amp; Query Tuning">PostgreSQL Indexing &amp; Query Tuning</li>
    <li class="course-item" data-title="Python Asyncio &amp; FastAPI">Python Asyncio &amp; FastAPI</li>
    <li class="course-item" data-title="Next.js Server Components">Next.js Server Components</li>
  </ul>
</div>`,
    initialCss: `body { font-family: system-ui, sans-serif; background: #F8FAFC; padding: 1.5rem; margin: 0; color: #172033; }
.directory { max-width: 480px; margin: 0 auto; background: white; padding: 1.25rem; border-radius: 1rem; border: 1px solid #E2E8F0; }
.controls { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; }
#search-input { flex: 1; padding: 0.6rem 0.85rem; border: 1px solid #CBD5E1; border-radius: 0.65rem; font-size: 0.85rem; }
#search-input:focus { outline: none; border-color: #FF6B35; }
.badge { background: #FFF7ED; color: #EA580C; font-size: 0.75rem; font-weight: 700; padding: 0.4rem 0.65rem; border-radius: 999px; white-space: nowrap; }
.list { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem; }
.course-item { padding: 0.75rem 1rem; border: 1px solid #F1F5F9; border-radius: 0.65rem; background: #FFFDF9; font-size: 0.875rem; font-weight: 600; }
.course-item.hidden { display: none; }`,
    initialJs: `const input = document.getElementById('search-input');
const items = Array.from(document.querySelectorAll('.course-item'));
const countBadge = document.getElementById('result-count');

input.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  let visible = 0;
  items.forEach(item => {
    const match = item.textContent.toLowerCase().includes(q);
    item.classList.toggle('hidden', !match);
    if (match) visible++;
  });
  countBadge.textContent = visible + (visible === 1 ? ' course' : ' courses');
});`,
    validationRules: [
      { selector: "#search-input", message: "Missing #search-input field." },
      { selector: "#result-count", message: "Missing #result-count element." },
      { selector: ".course-item", minCount: 4, message: "Provide at least 4 .course-item rows." },
    ],
    hint: "Listen for the 'input' event on #search-input and toggle a .hidden class on .course-item rows that don't match.",
  },
  {
    id: "web-5",
    title: "Accessible FAQ Accordion",
    difficulty: "Intermediate",
    category: "Accessibility & ARIA",
    description: "Implement an accessible FAQ accordion using button triggers, aria-expanded attributes, and smooth panel visibility toggling.",
    tasks: [
      "Render at least 3 .faq-item cards with .faq-trigger buttons",
      "Keep aria-expanded synchronized on each .faq-trigger button",
      "Toggle .faq-panel visibility smoothly when triggered",
    ],
    initialHtml: `<div class="faq-box">
  <h2>Quick Answers</h2>
  <div class="faq-item">
    <button class="faq-trigger" aria-expanded="true">How does browser compilation work? <span>−</span></button>
    <div class="faq-panel open">Code runs securely in an isolated browser sandbox with zero installation.</div>
  </div>
  <div class="faq-item">
    <button class="faq-trigger" aria-expanded="false">Are certificates verifiable? <span>+</span></button>
    <div class="faq-panel">Yes! Every credential includes a unique serial ID on our verification portal.</div>
  </div>
  <div class="faq-item">
    <button class="faq-trigger" aria-expanded="false">Can I switch plans anytime? <span>+</span></button>
    <div class="faq-panel">You can upgrade, pause, or cancel from your account dashboard anytime.</div>
  </div>
</div>`,
    initialCss: `body { font-family: system-ui, sans-serif; background: #FFFDF9; padding: 1.5rem; margin: 0; color: #172033; }
.faq-box { max-width: 480px; margin: 0 auto; }
h2 { font-size: 1.25rem; margin-bottom: 1rem; }
.faq-item { background: white; border: 1px solid #E5E7EB; border-radius: 0.75rem; margin-bottom: 0.65rem; overflow: hidden; }
.faq-trigger {
  width: 100%; text-align: left; background: none; border: none; padding: 0.9rem 1rem;
  font-weight: 700; font-size: 0.875rem; color: #172033; cursor: pointer;
  display: flex; justify-content: space-between; align-items: center;
}
.faq-panel { display: none; padding: 0 1rem 0.9rem; font-size: 0.82rem; color: #64748B; line-height: 1.5; }
.faq-panel.open { display: block; }`,
    initialJs: `document.querySelectorAll('.faq-trigger').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    const panel = btn.nextElementSibling;
    panel.classList.toggle('open', !expanded);
    btn.querySelector('span').textContent = expanded ? '+' : '−';
  });
});`,
    validationRules: [
      { selector: ".faq-item", minCount: 3, message: "Include at least 3 .faq-item accordions." },
      { selector: ".faq-trigger[aria-expanded]", minCount: 3, message: "All .faq-trigger buttons must have aria-expanded attributes." },
      { selector: ".faq-panel", minCount: 3, message: "Each item needs a .faq-panel answer block." },
    ],
    hint: "Use semantic <button class='faq-trigger'> elements with aria-expanded='true'/'false' rather than clickable divs.",
  },
  {
    id: "web-6",
    title: "Toast Notification Dispatcher",
    difficulty: "Intermediate",
    category: "Dynamic DOM & Timers",
    description: "Create a notification stack manager supporting Success and Alert toast creation inside a dedicated live region with auto-dismissal timers.",
    tasks: [
      "Include trigger buttons #toast-success and #toast-error",
      "Include an aria-live container with id='toast-stack'",
      "Append dynamically styled .toast cards and auto-remove after 3 seconds",
    ],
    initialHtml: `<div class="workspace">
  <div class="btn-row">
    <button id="toast-success" class="btn success">Trigger Success Toast</button>
    <button id="toast-error" class="btn error">Trigger Alert Toast</button>
  </div>
  <div id="toast-stack" aria-live="polite"></div>
</div>`,
    initialCss: `body { font-family: system-ui, sans-serif; background: #F8FAFC; padding: 1.5rem; margin: 0; }
.workspace { max-width: 460px; margin: 0 auto; }
.btn-row { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
.btn { flex: 1; padding: 0.75rem; border: none; border-radius: 0.75rem; color: white; font-weight: 700; cursor: pointer; }
.btn.success { background: #16A34A; }
.btn.error { background: #DC2626; }
#toast-stack { display: flex; flex-direction: column; gap: 0.5rem; }
.toast {
  padding: 0.75rem 1rem; border-radius: 0.75rem; color: white; font-size: 0.82rem; font-weight: 600;
  box-shadow: 0 6px 16px rgba(0,0,0,0.12); animation: slideIn 0.2s ease;
}
.toast.ok { background: #172033; border-left: 4px solid #22C55E; }
.toast.err { background: #172033; border-left: 4px solid #EF4444; }
@keyframes slideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`,
    initialJs: `const stack = document.getElementById('toast-stack');

function pushToast(text, kind) {
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.textContent = text;
  stack.prepend(el);
  setTimeout(() => el.remove(), 3000);
}

document.getElementById('toast-success').addEventListener('click', () => {
  pushToast('✓ Submission saved and tests passed!', 'ok');
});
document.getElementById('toast-error').addEventListener('click', () => {
  pushToast('⚠ Connection interrupted — retrying...', 'err');
});`,
    validationRules: [
      { selector: "#toast-success", message: "Missing #toast-success trigger button." },
      { selector: "#toast-error", message: "Missing #toast-error trigger button." },
      { selector: "#toast-stack[aria-live]", message: "Missing #toast-stack with aria-live attribute." },
    ],
    hint: "Use document.createElement('div'), prepend into #toast-stack, and clean up with setTimeout(() => el.remove(), 3000).",
  },
  {
    id: "web-7",
    title: "Accessible Modal Dialog",
    difficulty: "Advanced",
    category: "Overlays & Keyboard UX",
    description: "Build a native accessible dialog overlay that opens on button click and closes cleanly via Close button, backdrop click, or Escape key.",
    tasks: [
      "Provide an open trigger button #open-modal",
      "Use a modal container #modal-dialog with role='dialog' or native <dialog>",
      "Provide a #close-modal control and handle Escape keydown dismissal",
    ],
    initialHtml: `<div class="page">
  <button id="open-modal" class="primary-btn">Open Workspace Settings</button>
  <div id="modal-dialog" class="backdrop hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-card">
      <div class="modal-head">
        <h3 id="modal-title">Workspace Settings</h3>
        <button id="close-modal" class="icon-btn" aria-label="Close modal">✕</button>
      </div>
      <p>Configure compiler theme, auto-save interval, and keyboard shortcuts.</p>
      <button id="save-settings" class="primary-btn">Save Preferences</button>
    </div>
  </div>
</div>`,
    initialCss: `body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #FFFDF9; }
.primary-btn { background: #FF6B35; color: white; border: none; padding: 0.7rem 1.25rem; border-radius: 0.65rem; font-weight: 700; cursor: pointer; }
.backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55); display: flex; align-items: center; justify-content: center; padding: 1rem; }
.backdrop.hidden { display: none; }
.modal-card { background: white; max-width: 380px; width: 100%; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 20px 30px rgba(0,0,0,0.2); }
.modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.modal-head h3 { margin: 0; color: #172033; }
.icon-btn { background: #F1F5F9; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-weight: 700; }
p { font-size: 0.85rem; color: #64748B; margin-bottom: 1.25rem; }`,
    initialJs: `const modal = document.getElementById('modal-dialog');
const openBtn = document.getElementById('open-modal');
const closeBtn = document.getElementById('close-modal');
const saveBtn = document.getElementById('save-settings');

function closeModal() { modal.classList.add('hidden'); }
openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
closeBtn.addEventListener('click', closeModal);
saveBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });`,
    validationRules: [
      { selector: "#open-modal", message: "Missing #open-modal button." },
      { selector: "#modal-dialog[role='dialog']", message: "Missing #modal-dialog with role='dialog'." },
      { selector: "#close-modal", message: "Missing #close-modal button." },
    ],
    hint: "Compare e.target === modal on backdrop clicks so clicking inside .modal-card does not dismiss the dialog.",
  },
  {
    id: "web-8",
    title: "Interactive Tabs Panel",
    difficulty: "Advanced",
    category: "Component Architecture",
    description: "Create a tabbed interface with ARIA role='tablist', role='tab', and role='tabpanel' synchronization supporting click switching.",
    tasks: [
      "Render a [role='tablist'] containing at least 3 [role='tab'] buttons",
      "Synchronize aria-selected='true'/'false' across tabs",
      "Show the matching .tab-panel and hide inactive panels cleanly",
    ],
    initialHtml: `<div class="tabs-card">
  <div role="tablist" class="tablist">
    <button role="tab" aria-selected="true" data-tab="overview" class="tab active">Overview</button>
    <button role="tab" aria-selected="false" data-tab="syllabus" class="tab">Syllabus</button>
    <button role="tab" aria-selected="false" data-tab="reviews" class="tab">Reviews</button>
  </div>
  <div id="overview" role="tabpanel" class="tab-panel active">Master full-stack systems with guided hands-on sandboxes.</div>
  <div id="syllabus" role="tabpanel" class="tab-panel">12 modules covering DOM events, accessibility, CSS Grid, and state.</div>
  <div id="reviews" role="tabpanel" class="tab-panel">Rated 4.9/5 by over 1,400 software engineering learners.</div>
</div>`,
    initialCss: `body { font-family: system-ui, sans-serif; background: #F8FAFC; padding: 1.5rem; margin: 0; color: #172033; }
.tabs-card { max-width: 480px; margin: 0 auto; background: white; border-radius: 1rem; border: 1px solid #E2E8F0; overflow: hidden; }
.tablist { display: flex; border-bottom: 1px solid #E2E8F0; background: #FFFDF9; }
.tab { flex: 1; padding: 0.8rem; border: none; background: transparent; font-weight: 700; font-size: 0.85rem; color: #64748B; cursor: pointer; border-bottom: 2px solid transparent; }
.tab.active { color: #FF6B35; border-bottom-color: #FF6B35; background: white; }
.tab-panel { display: none; padding: 1.25rem; font-size: 0.875rem; color: #475569; line-height: 1.55; }
.tab-panel.active { display: block; }`,
    initialJs: `const tabs = document.querySelectorAll('[role="tab"]');
const panels = document.querySelectorAll('[role="tabpanel"]');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetId = tab.dataset.tab;
    tabs.forEach(t => {
      const active = t === tab;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });
    panels.forEach(p => p.classList.toggle('active', p.id === targetId));
  });
});`,
    validationRules: [
      { selector: "[role='tablist']", message: "Missing [role='tablist'] container." },
      { selector: "[role='tab']", minCount: 3, message: "Include at least 3 [role='tab'] buttons." },
      { selector: "[role='tabpanel']", minCount: 3, message: "Include matching [role='tabpanel'] panels." },
    ],
    hint: "Bind each tab via data-tab matching the target panel's id, updating aria-selected on all tabs.",
  },
];

// --- SQLKATA DATA ---
export type SchemaTableName = "employees" | "departments" | "orders" | "courses" | "enrollments";

export interface SqlKataChallenge {
  id: string;
  tableKey: SchemaTableName;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  description: string;
  hint: string;
  starterQuery: string;
  solutionQuery: string;
}

export const SQL_SAMPLE_TABLES: Record<SchemaTableName, Record<string, string | number>[]> = {
  employees: [
    { id: 1, name: "Arun Kumar", department_id: 101, salary: 85000, hire_date: "2023-01-15", city: "Chennai" },
    { id: 2, name: "Deepa Raj", department_id: 102, salary: 92000, hire_date: "2022-03-20", city: "Coimbatore" },
    { id: 3, name: "Karthik Raja", department_id: 101, salary: 65000, hire_date: "2024-06-10", city: "Chennai" },
    { id: 4, name: "Meena Swaminathan", department_id: 103, salary: 78000, hire_date: "2023-08-01", city: "Madurai" },
    { id: 5, name: "Sanjay Natarajan", department_id: 102, salary: 110000, hire_date: "2021-11-05", city: "Bangalore" },
    { id: 6, name: "Pavithra V", department_id: 103, salary: 72000, hire_date: "2024-02-18", city: "Chennai" },
  ],
  departments: [
    { id: 101, dept_name: "Engineering", budget: 2500000, floor: 3 },
    { id: 102, dept_name: "Product & AI", budget: 3200000, floor: 4 },
    { id: 103, dept_name: "Design & UX", budget: 1400000, floor: 2 },
  ],
  orders: [
    { order_id: 1001, customer_name: "Vignesh", total_amount: 3499, status: "completed", order_date: "2026-10-01" },
    { order_id: 1002, customer_name: "Ananya", total_amount: 1999, status: "completed", order_date: "2026-10-03" },
    { order_id: 1003, customer_name: "Ramesh", total_amount: 4999, status: "pending", order_date: "2026-10-04" },
    { order_id: 1004, customer_name: "Pooja", total_amount: 1999, status: "completed", order_date: "2026-10-05" },
    { order_id: 1005, customer_name: "Suresh", total_amount: 2499, status: "cancelled", order_date: "2026-10-06" },
  ],
  courses: [
    { course_id: 1, title: "Next.js Fullstack", category: "Development", price: 2999, level: "Intermediate" },
    { course_id: 2, title: "AI Agents & RAG", category: "AI & ML", price: 3999, level: "Advanced" },
    { course_id: 3, title: "SQL Mastery", category: "Data Science", price: 1499, level: "Beginner" },
    { course_id: 4, title: "Design Systems", category: "Design", price: 1999, level: "Beginner" },
  ],
  enrollments: [
    { enroll_id: 501, student_name: "Karthik", course_id: 1, progress: 100, rating: 5 },
    { enroll_id: 502, student_name: "Divya", course_id: 2, progress: 85, rating: 5 },
    { enroll_id: 503, student_name: "Arjun", course_id: 1, progress: 60, rating: 4 },
    { enroll_id: 504, student_name: "Sneha", course_id: 3, progress: 100, rating: 5 },
    { enroll_id: 505, student_name: "Vikram", course_id: 2, progress: 40, rating: 4 },
  ],
};

export const SQLKATA_CHALLENGES: SqlKataChallenge[] = [
  {
    id: "sql-1",
    tableKey: "employees",
    title: "1. High Earners Query",
    difficulty: "Easy",
    category: "Filtering & Sorting",
    description: "Select the `name`, `salary`, and `city` of all employees who earn more than ₹75,000, ordered by `salary` descending.",
    hint: "Use WHERE salary > 75000 followed by ORDER BY salary DESC.",
    starterQuery: "SELECT name, salary, city\nFROM employees\nWHERE salary > 75000\nORDER BY salary DESC;",
    solutionQuery: "SELECT name, salary, city FROM employees WHERE salary > 75000 ORDER BY salary DESC;",
  },
  {
    id: "sql-2",
    tableKey: "employees",
    title: "2. Chennai Headcount & Top Salary",
    difficulty: "Easy",
    category: "Aggregations",
    description: "Calculate the number of employees based in `'Chennai'` (`AS chennai_team`) and the maximum salary among them (`AS top_salary`).",
    hint: "Filter with WHERE city = 'Chennai' and project COUNT(*) AS chennai_team, MAX(salary) AS top_salary.",
    starterQuery: "SELECT COUNT(*) AS chennai_team, MAX(salary) AS top_salary\nFROM employees\nWHERE city = 'Chennai';",
    solutionQuery: "SELECT COUNT(*) AS chennai_team, MAX(salary) AS top_salary FROM employees WHERE city = 'Chennai';",
  },
  {
    id: "sql-3",
    tableKey: "departments",
    title: "3. Department Salary Analysis (JOIN & GROUP BY)",
    difficulty: "Medium",
    category: "Aggregations & Joins",
    description: "List each department's `dept_name`, its `employee_count`, and average employee salary (`avg_salary`, rounded to 2 decimals) sorted by `avg_salary` descending.",
    hint: "JOIN employees e ON d.id = e.department_id, then GROUP BY d.dept_name.",
    starterQuery: `SELECT d.dept_name, COUNT(e.id) AS employee_count, ROUND(AVG(e.salary), 2) AS avg_salary
FROM departments d
JOIN employees e ON d.id = e.department_id
GROUP BY d.dept_name
ORDER BY avg_salary DESC;`,
    solutionQuery: "SELECT d.dept_name, COUNT(e.id) AS employee_count, ROUND(AVG(e.salary), 2) AS avg_salary FROM departments d JOIN employees e ON d.id = e.department_id GROUP BY d.dept_name ORDER BY avg_salary DESC;",
  },
  {
    id: "sql-4",
    tableKey: "departments",
    title: "4. High-Budget Departments Above ₹2M",
    difficulty: "Easy",
    category: "Filtering & Projection",
    description: "Return `dept_name`, `budget`, and `floor` for departments whose `budget` is at least 2,000,000, sorted by `budget` descending.",
    hint: "Use WHERE budget >= 2000000 ORDER BY budget DESC.",
    starterQuery: "SELECT dept_name, budget, floor\nFROM departments\nWHERE budget >= 2000000\nORDER BY budget DESC;",
    solutionQuery: "SELECT dept_name, budget, floor FROM departments WHERE budget >= 2000000 ORDER BY budget DESC;",
  },
  {
    id: "sql-5",
    tableKey: "orders",
    title: "5. Completed Revenue Total",
    difficulty: "Easy",
    category: "Aggregations & Filter",
    description: "Compute `total_orders` and `total_revenue` (SUM of `total_amount`) for orders with `status = 'completed'`.",
    hint: "Use COUNT(*) AS total_orders, SUM(total_amount) AS total_revenue with WHERE status = 'completed'.",
    starterQuery: "SELECT COUNT(*) AS total_orders, SUM(total_amount) AS total_revenue\nFROM orders\nWHERE status = 'completed';",
    solutionQuery: "SELECT COUNT(*) AS total_orders, SUM(total_amount) AS total_revenue FROM orders WHERE status = 'completed';",
  },
  {
    id: "sql-6",
    tableKey: "orders",
    title: "6. Revenue Breakdown by Order Status",
    difficulty: "Medium",
    category: "GROUP BY",
    description: "Group all orders by `status` and show `status`, `order_count`, and `revenue` (SUM of `total_amount`), ordered by `revenue` descending.",
    hint: "GROUP BY status and ORDER BY revenue DESC.",
    starterQuery: "SELECT status, COUNT(*) AS order_count, SUM(total_amount) AS revenue\nFROM orders\nGROUP BY status\nORDER BY revenue DESC;",
    solutionQuery: "SELECT status, COUNT(*) AS order_count, SUM(total_amount) AS revenue FROM orders GROUP BY status ORDER BY revenue DESC;",
  },
  {
    id: "sql-7",
    tableKey: "courses",
    title: "7. Top-Priced Catalog Courses",
    difficulty: "Easy",
    category: "ORDER BY & LIMIT",
    description: "Fetch the `title`, `category`, and `price` of the 2 most expensive courses in the catalog.",
    hint: "Sort by price DESC and append LIMIT 2.",
    starterQuery: "SELECT title, category, price\nFROM courses\nORDER BY price DESC\nLIMIT 2;",
    solutionQuery: "SELECT title, category, price FROM courses ORDER BY price DESC LIMIT 2;",
  },
  {
    id: "sql-8",
    tableKey: "enrollments",
    title: "8. Course Enrollment & Average Progress",
    difficulty: "Hard",
    category: "Multi-Table JOIN & HAVING",
    description: "Join `courses` with `enrollments` to find each course's `title`, `learners` count, and `avg_progress` (rounded to 1 decimal), ordered by `learners` descending.",
    hint: "JOIN courses c ON e.course_id = c.course_id GROUP BY c.title.",
    starterQuery: `SELECT c.title, COUNT(e.enroll_id) AS learners, ROUND(AVG(e.progress), 1) AS avg_progress
FROM enrollments e
JOIN courses c ON e.course_id = c.course_id
GROUP BY c.title
ORDER BY learners DESC;`,
    solutionQuery: "SELECT c.title, COUNT(e.enroll_id) AS learners, ROUND(AVG(e.progress), 1) AS avg_progress FROM enrollments e JOIN courses c ON e.course_id = c.course_id GROUP BY c.title ORDER BY learners DESC;",
  },
];

// --- FIXTHECODE DATA ---
export interface FixTheCodeChallenge {
  id: string;
  title: string;
  language: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  hint: string;
  errorLog: string;
  buggyCode: string;
  solutionCode: string;
  testFunction: (code: string) => { passed: boolean; message: string };
}

export const FIXTHECODE_CHALLENGES: FixTheCodeChallenge[] = [
  // --- PYTHON CHALLENGES ---
  {
    id: "fix-py-1",
    title: "Mutable Default Argument in Dictionary State",
    language: "Python",
    difficulty: "Easy",
    description: "The function `record_student_grade` defines a default dictionary `grade_book={}` in the parameter list. In Python, default arguments are evaluated once at function definition time, causing all calls that rely on the default to mutate the same shared dictionary instance across users.",
    hint: "Replace `grade_book={}` with `grade_book=None`, then initialize `grade_book = {}` inside the function when `grade_book is None`.",
    errorLog: "StateLeakException: grade_book state persisted between separate test executions: {'Alice': 95, 'Bob': 88}.",
    buggyCode: `def record_student_grade(student, grade, grade_book={}):
    # BUG: Mutable default argument retains state between calls!
    grade_book[student] = grade
    return grade_book`,
    solutionCode: `def record_student_grade(student, grade, grade_book=None):
    if grade_book is None:
        grade_book = {}
    grade_book[student] = grade
    return grade_book`,
    testFunction: (code) => {
      const hasNoneCheck = /grade_book\s*=\s*None/i.test(code) && /if\s+grade_book\s+is\s+None/i.test(code);
      if (!hasNoneCheck) {
        return { passed: false, message: "Use `grade_book=None` in the parameter signature and initialize `{}` when `grade_book is None`." };
      }
      const res = callPythonFunction(code, ["record_student_grade"], `"Alice", 95`);
      if (res.error) return { passed: false, message: `Python Error: ${res.error}` };
      const val = res.value as Record<string, number> | undefined;
      if (val && val.Alice === 95) {
        return { passed: true, message: "Passed! Verified live execution and safe None sentinel initialization." };
      }
      return { passed: false, message: "Function did not return expected dictionary {'Alice': 95}." };
    },
  },
  {
    id: "fix-py-2",
    title: "ZeroDivision Boundary in Mean Calculator",
    language: "Python",
    difficulty: "Easy",
    description: "The function `compute_batch_mean` crashes with an unhandled `ZeroDivisionError` when an empty list or collection of sensor values is passed in.",
    hint: "Guard against `not values` or `len(values) == 0` at the top and return `0.0`.",
    errorLog: "ZeroDivisionError: division by zero in 'sum(values) / len(values)' on empty dataset values=[].",
    buggyCode: `def compute_batch_mean(values):
    # BUG: Does not check if values list is empty before dividing by len(values)
    return sum(values) / len(values)`,
    solutionCode: `def compute_batch_mean(values):
    if not values or len(values) == 0:
        return 0.0
    return sum(values) / len(values)`,
    testFunction: (code) => {
      const r1 = callPythonFunction(code, ["compute_batch_mean"], `[10, 20, 30]`);
      if (r1.error) return { passed: false, message: `Python Error: ${r1.error}` };
      const rEmpty = callPythonFunction(code, ["compute_batch_mean"], `[]`);
      if (rEmpty.error) return { passed: false, message: `Python Error on empty list: ${rEmpty.error}` };
      if (r1.value === 20 && rEmpty.value === 0) {
        return { passed: true, message: "Passed! Mean computes 20.0 on [10, 20, 30] and safely returns 0.0 on []." };
      }
      return { passed: false, message: `Expected 0 on empty input and 20 on [10,20,30]; got ${String(rEmpty.value)} and ${String(r1.value)}.` };
    },
  },
  {
    id: "fix-py-3",
    title: "Binary Search Infinite Loop on Integer Midpoint",
    language: "Python",
    difficulty: "Medium",
    description: "The function `binary_search` loops infinitely when searching for keys located in the upper boundary because `low` is updated to `mid` instead of `mid + 1`, preventing the search range from converging when `high - low == 1`.",
    hint: "When `nums[mid] < target`, advance `low = mid + 1` instead of `low = mid`.",
    errorLog: "TimeLimitExceeded: Loop condition 'while low <= high' failed to terminate on target = 18.",
    buggyCode: `def binary_search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            # BUG: Updating low to mid instead of mid + 1 causes infinite loop
            low = mid
        else:
            high = mid - 1
    return -1`,
    solutionCode: `def binary_search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
    testFunction: (code) => {
      if (!/low\s*=\s*mid\s*\+\s*1/i.test(code)) {
        return { passed: false, message: "Update `low = mid + 1` when `nums[mid] < target` so the search interval strictly shrinks." };
      }
      const rFound = callPythonFunction(code, ["binary_search"], `[2, 5, 8, 12, 18], 18`);
      const rMissing = callPythonFunction(code, ["binary_search"], `[2, 5, 8, 12, 18], 99`);
      if (rFound.error) return { passed: false, message: `Python Error: ${rFound.error}` };
      if (rFound.value === 4 && rMissing.value === -1) {
        return { passed: true, message: "Passed! Verified live binary_search([2,5,8,12,18], 18) -> 4 and missing -> -1." };
      }
      return { passed: false, message: `Expected index 4 and -1, got ${String(rFound.value)} and ${String(rMissing.value)}.` };
    },
  },

  // --- JAVASCRIPT CHALLENGES ---
  {
    id: "fix-1",
    title: "Off-by-One Array Index Exception",
    language: "JavaScript",
    difficulty: "Easy",
    description: "The function `calculateAverage` attempts to compute the arithmetic mean of an array of numbers. However, during execution on non-empty arrays, it causes an off-by-one loop index out-of-bounds bug leading to `NaN`.",
    hint: "Change `i <= nums.length` to strict `<` (`i < nums.length`).",
    errorLog: "TypeError / NaN: loop evaluates nums[nums.length] as undefined, poisoning the sum to NaN.",
    buggyCode: `function calculateAverage(nums) {
  if (!nums || nums.length === 0) return 0;
  
  let sum = 0;
  // BUG: Note the loop condition <= instead of <
  for (let i = 0; i <= nums.length; i++) {
    sum += nums[i];
  }
  
  return sum / nums.length;
}`,
    solutionCode: `function calculateAverage(nums) {
  if (!nums || nums.length === 0) return 0;
  
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
  }
  
  return sum / nums.length;
}`,
    testFunction: (code) => {
      try {
        const fn = new Function(`${code}; return [calculateAverage([10, 20, 30, 40]), calculateAverage([])];`);
        const [avg, emptyAvg] = fn();
        if (avg === 25 && emptyAvg === 0) {
          return { passed: true, message: "All test cases passed! Average correctly calculated as 25 (and 0 on empty input)." };
        }
        return { passed: false, message: `Expected 25, but function returned ${avg}. Check your loop bound.` };
      } catch (err: unknown) {
        return { passed: false, message: `Runtime Error: ${err instanceof Error ? err.message : String(err)}` };
      }
    },
  },
  {
    id: "fix-2",
    title: "Infinite Recursion in Factorial",
    language: "JavaScript",
    difficulty: "Easy",
    description: "The `factorial` function throws `RangeError: Maximum call stack size exceeded` because the recursive base condition is missing for n = 0 and n = 1.",
    hint: "Add `if (n <= 1) return 1;` as the base case at the top of `factorial`.",
    errorLog: "RangeError: Maximum call stack size exceeded at factorial(0) -> factorial(-1) -> factorial(-2)...",
    buggyCode: `function factorial(n) {
  // BUG: Base case condition is missing!
  // Factorial of 0 or 1 should return 1.
  return n * factorial(n - 1);
}`,
    solutionCode: `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`,
    testFunction: (code) => {
      try {
        const fn = new Function(`${code}; return [factorial(5), factorial(0)];`);
        const [f5, f0] = fn();
        if (f5 === 120 && f0 === 1) {
          return { passed: true, message: "Passed! factorial(5) -> 120 and factorial(0) -> 1." };
        }
        return { passed: false, message: `Expected 120 and 1, got ${f5} and ${f0}.` };
      } catch (err: unknown) {
        return { passed: false, message: `Call stack exceeded: ${err instanceof Error ? err.message : String(err)}` };
      }
    },
  },
  {
    id: "fix-3",
    title: "Asynchronous Promise Missing Await",
    language: "JavaScript",
    difficulty: "Medium",
    description: "The function `getUserDisplayName` is supposed to fetch user data asynchronously and return the uppercase full name. Instead, it fails because `await` is missing before `fetchMockUser(id)`.",
    hint: "Add `await` before calling `fetchMockUser(id)` inside the `async` function.",
    errorLog: "TypeError: Cannot read properties of undefined (reading 'toUpperCase') on Promise object.",
    buggyCode: `async function fetchMockUser(id) {
  return { id, name: "Kavitha Rajan", role: "Instructor" };
}

async function getUserDisplayName(id) {
  // BUG: Missing await when calling asynchronous fetchMockUser
  const user = fetchMockUser(id);
  return user.name.toUpperCase();
}`,
    solutionCode: `async function fetchMockUser(id) {
  return { id, name: "Kavitha Rajan", role: "Instructor" };
}

async function getUserDisplayName(id) {
  const user = await fetchMockUser(id);
  return user.name.toUpperCase();
}`,
    testFunction: (code) => {
      const hasAwait = /await\s+fetchMockUser/i.test(code);
      if (hasAwait) {
        return { passed: true, message: "Passed! Correctly awaited async user fetch and formatted name." };
      }
      return { passed: false, message: "Make sure you `await` the promise returned by `fetchMockUser(id)`." };
    },
  },

  // --- TYPESCRIPT CHALLENGES ---
  {
    id: "fix-ts-1",
    title: "Falsy Zero Coalescing Defect",
    language: "TypeScript",
    difficulty: "Easy",
    description: "Using the logical OR operator (`||`) to provide a fallback value treats `0` as falsy, unintentionally overriding valid zero-threshold settings with the default fallback value of 10.",
    hint: "Replace `||` with the nullish coalescing operator `??`.",
    errorLog: "AssertionError: expected getThreshold({ id: 'u1', settings: { notificationThreshold: 0 } }) to return 0, received 10.",
    buggyCode: `interface UserSettings {
  notificationThreshold?: number;
}

interface UserProfile {
  id: string;
  settings?: UserSettings;
}

function getThreshold(user: UserProfile): number {
  // BUG: || treats 0 as falsy, reverting valid 0 to 10
  return user.settings?.notificationThreshold || 10;
}`,
    solutionCode: `interface UserSettings {
  notificationThreshold?: number;
}

interface UserProfile {
  id: string;
  settings?: UserSettings;
}

function getThreshold(user: UserProfile): number {
  return user.settings?.notificationThreshold ?? 10;
}`,
    testFunction: (code) => {
      try {
        const js = stripTypeScriptTypes(code);
        const fn = new Function(`${js}; return [getThreshold({ id: '1', settings: { notificationThreshold: 0 } }), getThreshold({ id: '2' })];`);
        const [zeroVal, defaultVal] = fn();
        if (zeroVal === 0 && defaultVal === 10) {
          return { passed: true, message: "Passed! Live TypeScript evaluation returned 0 for explicit zero and 10 for undefined." };
        }
        return { passed: false, message: `Expected [0, 10], got [${zeroVal}, ${defaultVal}]. Use ?? instead of ||.` };
      } catch (err: unknown) {
        return { passed: false, message: `TypeScript Execution Error: ${err instanceof Error ? err.message : String(err)}` };
      }
    },
  },
  {
    id: "fix-ts-2",
    title: "Shallow Object Reference Mutation Bug",
    language: "TypeScript",
    difficulty: "Medium",
    description: "The function `applyCourseDiscount` directly mutates the passed `CoursePrice` object (`course.price = ...`) instead of returning a new immutable object copy, corrupting the caller's original catalog pricing.",
    hint: "Return a shallow copy `{ ...course, price: ... }` instead of mutating `course.price` in place.",
    errorLog: "StateMutationError: Original catalog object price was overwritten after previewing discount.",
    buggyCode: `interface CoursePrice {
  id: string;
  price: number;
}

function applyCourseDiscount(course: CoursePrice, percentOff: number): CoursePrice {
  // BUG: Directly mutates the original course object
  course.price = Math.round(course.price * (1 - percentOff / 100));
  return course;
}`,
    solutionCode: `interface CoursePrice {
  id: string;
  price: number;
}

function applyCourseDiscount(course: CoursePrice, percentOff: number): CoursePrice {
  return {
    ...course,
    price: Math.round(course.price * (1 - percentOff / 100)),
  };
}`,
    testFunction: (code) => {
      try {
        const js = stripTypeScriptTypes(code);
        const fn = new Function(`${js}; const orig = { id: 'c1', price: 1000 }; const discounted = applyCourseDiscount(orig, 20); return { origPrice: orig.price, discPrice: discounted.price };`);
        const out = fn();
        if (out.origPrice === 1000 && out.discPrice === 800) {
          return { passed: true, message: "Passed! Original price remained 1000 while discounted copy is 800." };
        }
        return { passed: false, message: `Original object was mutated (orig.price=${out.origPrice}) or discount wrong (${out.discPrice}).` };
      } catch (err: unknown) {
        return { passed: false, message: `Error: ${err instanceof Error ? err.message : String(err)}` };
      }
    },
  },
  {
    id: "fix-ts-3",
    title: "Numeric Sort Comparator Bug",
    language: "TypeScript",
    difficulty: "Easy",
    description: "In JavaScript/TypeScript, `Array.prototype.sort()` without a comparator sorts numbers lexicographically as strings, placing `100` before `20`.",
    hint: "Copy the array `[...scores]` and pass `(a, b) => a - b` to `.sort(...)`.",
    errorLog: "AssertionError: sortScores([100, 20, 5]) returned [100, 20, 5] instead of [5, 20, 100].",
    buggyCode: `function sortScores(scores: number[]): number[] {
  // BUG: Default .sort() converts numbers to strings ("100" < "20")
  return [...scores].sort();
}`,
    solutionCode: `function sortScores(scores: number[]): number[] {
  return [...scores].sort((a, b) => a - b);
}`,
    testFunction: (code) => {
      try {
        const js = stripTypeScriptTypes(code);
        const fn = new Function(`${js}; return sortScores([100, 20, 5, 35]);`);
        const sorted = fn();
        if (JSON.stringify(sorted) === "[5,20,35,100]") {
          return { passed: true, message: "Passed! Verified numeric ascending sort [5, 20, 35, 100]." };
        }
        return { passed: false, message: `Expected [5,20,35,100], got ${JSON.stringify(sorted)}.` };
      } catch (err: unknown) {
        return { passed: false, message: `Error: ${err instanceof Error ? err.message : String(err)}` };
      }
    },
  },

  // --- JAVA CHALLENGES ---
  {
    id: "fix-java-1",
    title: "String Value Equality via Reference Comparison",
    language: "Java",
    difficulty: "Easy",
    description: "In Java, using the `==` operator on `String` references checks object identity rather than character sequence equality. This causes legitimate tokens created dynamically in heap memory to be incorrectly rejected.",
    hint: "Use `provided != null && provided.equals(expected)` instead of `==`.",
    errorLog: "AssertionError: expected true for verifyToken(new String(\"AUTH_TOKEN\"), \"AUTH_TOKEN\"), but received false.",
    buggyCode: `public class SecurityValidator {
    public static boolean verifyToken(String provided, String expected) {
        // BUG: In Java, == checks reference identity, not string content equality
        return provided == expected;
    }
}`,
    solutionCode: `public class SecurityValidator {
    public static boolean verifyToken(String provided, String expected) {
        return provided != null && provided.equals(expected);
    }
}`,
    testFunction: (code) => {
      const hasEquals = /\.equals\s*\(\s*expected\s*\)/i.test(code) || /expected\.equals\s*\(\s*provided\s*\)/i.test(code);
      const hasDoubleEqual = /provided\s*==\s*expected/i.test(code);
      if (hasEquals && !hasDoubleEqual) {
        return { passed: true, message: "Passed! Correctly uses .equals() for string content equality in Java." };
      }
      return { passed: false, message: "Replace reference equality == with the .equals() method." };
    },
  },
  {
    id: "fix-java-2",
    title: "NullPointerException in Auto-Unboxing Loop",
    language: "Java",
    difficulty: "Medium",
    description: "The method `sumMetricValues` iterates over an array of `Integer` objects and accumulates their sum into an unboxed primitive `int`. When an element in the array is `null`, Java attempts auto-unboxing and throws a `NullPointerException`.",
    hint: "Add `if (val != null)` before adding `val` to `total`.",
    errorLog: "java.lang.NullPointerException: Cannot invoke \"java.lang.Integer.intValue()\" because \"val\" is null at sumMetricValues.",
    buggyCode: `public class MetricsEngine {
    public static int sumMetricValues(Integer[] values) {
        int total = 0;
        for (Integer val : values) {
            // BUG: Auto-unboxing val throws NullPointerException if val is null
            total += val;
        }
        return total;
    }
}`,
    solutionCode: `public class MetricsEngine {
    public static int sumMetricValues(Integer[] values) {
        int total = 0;
        for (Integer val : values) {
            if (val != null) {
                total += val;
            }
        }
        return total;
    }
}`,
    testFunction: (code) => {
      const hasNullCheck = /if\s*\(\s*val\s*!=\s*null\s*\)/i.test(code) || /val\s*!=\s*null\s*\?\s*val\s*:\s*0/i.test(code);
      if (hasNullCheck) {
        return { passed: true, message: "Passed! Null guard prevents NullPointerException during auto-unboxing." };
      }
      return { passed: false, message: "Add a null check (e.g. if (val != null)) before accumulating val into total." };
    },
  },
  {
    id: "fix-java-3",
    title: "ConcurrentModificationException During List Iteration",
    language: "Java",
    difficulty: "Hard",
    description: "Removing elements directly from a `List` inside a for-each loop mutates the underlying list structurally during active iteration, throwing `ConcurrentModificationException`.",
    hint: "Use `list.removeIf(item -> item < 0);` or iterate with an explicit `Iterator`.",
    errorLog: "java.util.ConcurrentModificationException at ArrayList$Itr.checkForComodification.",
    buggyCode: `import java.util.*;

public class FilterService {
    public static void removeNegatives(List<Integer> nums) {
        // BUG: Mutating list inside enhanced for-loop throws ConcurrentModificationException
        for (Integer n : nums) {
            if (n < 0) {
                nums.remove(n);
            }
        }
    }
}`,
    solutionCode: `import java.util.*;

public class FilterService {
    public static void removeNegatives(List<Integer> nums) {
        nums.removeIf(n -> n < 0);
    }
}`,
    testFunction: (code) => {
      const safe = /removeIf\s*\(/i.test(code) || /Iterator\s*<\s*Integer\s*>/i.test(code);
      if (safe) {
        return { passed: true, message: "Passed! Safely removes elements without ConcurrentModificationException." };
      }
      return { passed: false, message: "Replace the enhanced for-loop removal with nums.removeIf(...) or an explicit Iterator." };
    },
  },

  // --- C++ CHALLENGES ---
  {
    id: "fix-cpp-1",
    title: "Integer Division Truncation in Percentage Calculation",
    language: "C++",
    difficulty: "Easy",
    description: "In C++, dividing two integers (`passed / total`) yields integer division, which truncates any fractional result to 0 when `passed < total`. Multiplying by 100.0 afterward results in 0.0% instead of the accurate floating-point percentage.",
    hint: "Cast `passed` with `static_cast<double>(passed)` before dividing by `total`.",
    errorLog: "AssertionError: expected calculatePassRate(75, 100) == 75.0, but received 0.0.",
    buggyCode: `#include <iostream>

double calculatePassRate(int passed, int total) {
    if (total <= 0) return 0.0;
    // BUG: passed / total performs integer division, evaluating to 0
    return (passed / total) * 100.0;
}`,
    solutionCode: `#include <iostream>

double calculatePassRate(int passed, int total) {
    if (total <= 0) return 0.0;
    return (static_cast<double>(passed) / total) * 100.0;
}`,
    testFunction: (code) => {
      const hasCast = /static_cast<double>\s*\(\s*passed\s*\)/i.test(code) ||
                      /\(double\)\s*passed/i.test(code) ||
                      /\(double\)\s*\(passed\)/i.test(code) ||
                      /passed\s*\*\s*100\.0\s*\/\s*total/i.test(code) ||
                      /100\.0\s*\*\s*passed\s*\/\s*total/i.test(code);
      if (hasCast) {
        return { passed: true, message: "Passed! Floating-point division correctly avoids integer truncation." };
      }
      return { passed: false, message: "Cast passed to double (or multiply by 100.0 before dividing) to prevent integer truncation." };
    },
  },
  {
    id: "fix-cpp-2",
    title: "Mismatched Scalar Delete on Array Allocation",
    language: "C++",
    difficulty: "Medium",
    description: "The function allocates memory with `new int[size]` but deallocates it using scalar `delete buf` instead of array `delete[] buf`. In C++, this causes undefined behavior, memory leaks, and sanitizer crash warnings.",
    hint: "Pair `new[]` with `delete[] buf;`.",
    errorLog: "AddressSanitizer: alloc-dealloc-mismatch (operator new [] vs operator delete) on pointer 0x602000000010.",
    buggyCode: `#include <iostream>

int* createBuffer(int size) {
    int* buf = new int[size];
    return buf;
}

void releaseBuffer(int* buf) {
    // BUG: Allocated with new[], but freed with scalar delete
    delete buf;
}`,
    solutionCode: `#include <iostream>

int* createBuffer(int size) {
    int* buf = new int[size];
    return buf;
}

void releaseBuffer(int* buf) {
    delete[] buf;
}`,
    testFunction: (code) => {
      const hasArrayDelete = /delete\[\]\s*buf/i.test(code);
      if (hasArrayDelete) {
        return { passed: true, message: "Passed! Array delete[] properly pairs with dynamic array new[] allocation." };
      }
      return { passed: false, message: "Use delete[] buf instead of scalar delete to deallocate an array." };
    },
  },
  {
    id: "fix-cpp-3",
    title: "Dangling Reference to Local Stack Variable",
    language: "C++",
    difficulty: "Hard",
    description: "Returning a reference (`const std::string&`) to a local stack variable creates a dangling reference because the local string is destroyed as soon as the function returns.",
    hint: "Return `std::string` by value instead of `const std::string&`.",
    errorLog: "warning: reference to stack memory associated with local variable 'greeting' returned [-Wreturn-stack-address]",
    buggyCode: `#include <string>

// BUG: Returning reference to destroyed local stack variable
const std::string& buildGreeting(const std::string& name) {
    std::string greeting = "Welcome to Elevate, " + name;
    return greeting;
}`,
    solutionCode: `#include <string>

std::string buildGreeting(const std::string& name) {
    std::string greeting = "Welcome to Elevate, " + name;
    return greeting;
}`,
    testFunction: (code) => {
      const returnsValue = /std::string\s+buildGreeting\s*\(/i.test(code) && !/std::string\s*&\s*buildGreeting/i.test(code);
      if (returnsValue) {
        return { passed: true, message: "Passed! Returning std::string by value eliminates the dangling reference." };
      }
      return { passed: false, message: "Change the return type from `const std::string&` to `std::string` (return by value)." };
    },
  },
];
