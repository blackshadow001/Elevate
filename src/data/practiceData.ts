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
    id: "codekata",
    name: "CodeKata",
    tagline: "Sharpen your coding skills, prepare for interviews",
    description: "Solve algorithmic challenges, data structure problems, and coding interview questions with real-time test case evaluation.",
    path: "/practice/codekata",
    iconType: "code",
    badge: "Interview Prep",
    accentColor: "from-blue-500 to-indigo-600",
    stats: "1,200+ Problems",
  },
  {
    id: "webkata",
    name: "WebKata",
    tagline: "Build basic frontend & backend development skills",
    description: "Interactive HTML, CSS, and modern JavaScript sandboxes with real-time visual output and automated DOM validation tests.",
    path: "/practice/webkata",
    iconType: "terminal",
    badge: "Fullstack Web",
    accentColor: "from-emerald-500 to-teal-600",
    stats: "250+ Exercises",
  },
  {
    id: "sqlkata",
    name: "SQLKata",
    tagline: "Master SQL concepts in relational database management",
    description: "Execute live SQL queries on real relational datasets. Master multi-table JOINs, window functions, and analytics queries.",
    path: "/practice/sqlkata",
    iconType: "database",
    badge: "Databases & SQL",
    accentColor: "from-purple-500 to-violet-600",
    stats: "300+ Queries",
  },
  {
    id: "fixthecode",
    name: "FixTheCode",
    tagline: "A series of programs curated by industry experts",
    description: "Inspect real-world code snippets with subtle production bugs. Identify the defect, fix the code, and pass the automated test suites.",
    path: "/practice/fixthecode",
    iconType: "bug",
    badge: "Debugging Suite",
    accentColor: "from-rose-500 to-pink-600",
    stats: "180+ Programs",
  },
  {
    id: "ide",
    name: "IDE - Online Compiler",
    tagline: "Run & test your code in any programming language",
    description: "A fast, cloud-ready code playground and compiler supporting JavaScript, Python, TypeScript, HTML/CSS with standard I/O.",
    path: "/practice/ide",
    iconType: "braces",
    badge: "Cloud Compiler",
    accentColor: "from-amber-500 to-orange-600",
    stats: "Multi-Language",
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
  validationCheck: string; // JS code run inside iframe or test runner
}

export const WEBKATA_CHALLENGES: WebKataChallenge[] = [
  {
    id: "web-1",
    title: "Interactive Counter Component",
    difficulty: "Beginner",
    category: "DOM & Event Handling",
    description: "Build an interactive counter with Increment, Decrement, and Reset buttons. Ensure the counter number changes color when positive (green), negative (red), or zero (gray).",
    tasks: [
      "Add a display element with id='counter-value'",
      "Add buttons with id='btn-decrement', id='btn-reset', and id='btn-increment'",
      "Hook up click listeners in JS to update counter value",
      "Style with responsive flex layout and clear button states",
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
  padding: 2.5rem;
  border-radius: 1.25rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
  border: 1px solid #E5E7EB;
  text-align: center;
  width: 320px;
}

h2 {
  margin-top: 0;
  color: #172033;
  font-size: 1.25rem;
}

.value {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 1.5rem 0;
  color: #172033;
  transition: color 0.2s ease;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

button {
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  background: #F7F8FA;
  color: #172033;
  border: 1px solid #E5E7EB;
  transition: all 0.15s ease;
}

button:hover {
  background: #FF6B35;
  color: white;
  border-color: #FF6B35;
}`,
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
    validationCheck: "return document.getElementById('counter-value') !== null;",
  },
  {
    id: "web-2",
    title: "User Profile Card with Badge",
    difficulty: "Beginner",
    category: "CSS Layout & Components",
    description: "Design a clean user profile card displaying an avatar, student name, career path role, status badge, and 'Connect' button with state toggle.",
    tasks: [
      "Implement card with rounded borders and subtle drop shadow",
      "Add circular avatar with online status dot indicator",
      "Add toggleable Connect/Connected button with state change in JS",
    ],
    initialHtml: `<div class="profile-card">
  <div class="avatar-wrap">
    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" alt="Avatar" class="avatar" />
    <span class="status-dot"></span>
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
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}
.avatar-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #FF6B35;
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
.skills { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem; }
.tag { font-size: 0.75rem; background: #FFF7ED; color: #EA580C; padding: 0.25rem 0.5rem; border-radius: 9999px; font-weight: 600; }
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
    validationCheck: "return document.getElementById('connect-btn') !== null;",
  },
];

// --- SQLKATA DATA ---
export interface SqlKataChallenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  description: string;
  expectedQueryRegex: RegExp;
  starterQuery: string;
  solutionQuery: string;
}

export const SQL_SAMPLE_TABLES = {
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
};

export const SQLKATA_CHALLENGES: SqlKataChallenge[] = [
  {
    id: "sql-1",
    title: "1. High Earners Query",
    difficulty: "Easy",
    category: "Filtering & WHERE",
    description: "Write a SQL query to select the `name`, `salary`, and `city` of all employees who earn more than ₹75,000, ordered by salary descending.",
    expectedQueryRegex: /select\s+.*salary.*from\s+employees\s+where\s+salary\s*>\s*75000/i,
    starterQuery: "SELECT name, salary, city\nFROM employees\nWHERE salary > 75000\nORDER BY salary DESC;",
    solutionQuery: "SELECT name, salary, city FROM employees WHERE salary > 75000 ORDER BY salary DESC;",
  },
  {
    id: "sql-2",
    title: "2. Department Salary Analysis (JOIN & GROUP BY)",
    difficulty: "Medium",
    category: "Aggregations & Joins",
    description: "Write a query to list each department's name along with the total count of employees and their average salary (rounded to 2 decimal places).",
    expectedQueryRegex: /join\s+departments.*group\s+by/i,
    starterQuery: `SELECT d.dept_name, COUNT(e.id) as employee_count, ROUND(AVG(e.salary), 2) as avg_salary
FROM departments d
JOIN employees e ON d.id = e.department_id
GROUP BY d.dept_name;`,
    solutionQuery: `SELECT d.dept_name, COUNT(e.id) as employee_count, ROUND(AVG(e.salary), 2) as avg_salary FROM departments d JOIN employees e ON d.id = e.department_id GROUP BY d.dept_name;`,
  },
  {
    id: "sql-3",
    title: "3. Completed Revenue Total",
    difficulty: "Easy",
    category: "Aggregations & Filter",
    description: "Write a query to compute the total revenue (SUM of `total_amount`) and count of orders that have the status 'completed'.",
    expectedQueryRegex: /sum\(total_amount\).*status\s*=\s*['"]completed['"]/i,
    starterQuery: "SELECT COUNT(*) as total_orders, SUM(total_amount) as total_revenue\nFROM orders\nWHERE status = 'completed';",
    solutionQuery: "SELECT COUNT(*) as total_orders, SUM(total_amount) as total_revenue FROM orders WHERE status = 'completed';",
  },
];

// --- FIXTHECODE DATA ---
export interface FixTheCodeChallenge {
  id: string;
  title: string;
  language: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  errorLog: string;
  buggyCode: string;
  solutionCode: string;
  testFunction: (code: string) => { passed: boolean; message: string };
}

export const FIXTHECODE_CHALLENGES: FixTheCodeChallenge[] = [
  {
    id: "fix-1",
    title: "Off-by-One Array Index Exception",
    language: "JavaScript",
    difficulty: "Easy",
    description: "The function `calculateAverage` attempts to compute the arithmetic mean of an array of numbers. However, during execution on non-empty arrays, it causes an off-by-one loop index out-of-bounds bug leading to `NaN`.",
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
        const fn = new Function(`${code}; return calculateAverage([10, 20, 30, 40]);`);
        const result = fn();
        if (result === 25) {
          return { passed: true, message: "All test cases passed! Average correctly calculated as 25." };
        }
        return { passed: false, message: `Expected 25, but function returned ${result}. Check your loop bound.` };
      } catch (err: any) {
        return { passed: false, message: `Runtime Error: ${err.message}` };
      }
    },
  },
  {
    id: "fix-2",
    title: "Infinite Recursion in Factorial",
    language: "JavaScript",
    difficulty: "Easy",
    description: "The `factorial` function throws `RangeError: Maximum call stack size exceeded` because the recursive base condition is missing for n = 0 and n = 1.",
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
        const fn = new Function(`${code}; return factorial(5);`);
        const result = fn();
        if (result === 120) {
          return { passed: true, message: "Passed! factorial(5) correctly returns 120." };
        }
        return { passed: false, message: `Expected 120, got ${result}.` };
      } catch (err: any) {
        return { passed: false, message: `Call stack exceeded: ${err.message}` };
      }
    },
  },
  {
    id: "fix-3",
    title: "Asynchronous Promise Missing Await",
    language: "JavaScript",
    difficulty: "Medium",
    description: "The function `getUserDisplayName` is supposed to fetch user data asynchronously and return the uppercase full name. Instead, it returns `[object Promise]` because `await` is missing.",
    errorLog: "AssertionError: Expected 'KAVITHA RAJAN', received '[object Promise]'",
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
      try {
        const hasAwait = /await\s+fetchMockUser/i.test(code);
        if (hasAwait) {
          return { passed: true, message: "Passed! Correctly awaited async user fetch and formatted name." };
        }
        return { passed: false, message: "Make sure you await the promise returned by fetchMockUser(id)." };
      } catch (err: any) {
        return { passed: false, message: `Error: ${err.message}` };
      }
    },
  },
];
