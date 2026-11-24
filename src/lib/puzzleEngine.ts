export type ConceptTag = 
  | "python beginner" 
  | "python intermediate" 
  | "arrays" 
  | "hash maps" 
  | "stacks" 
  | "nodes" 
  | "trees" 
  | "search" 
  | "algorithms" 
  | "dynamic programming";

export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden?: boolean;
}

export type SupportedChallengeLanguage = "python" | "javascript" | "typescript" | "java" | "cpp";

export interface CodingChallenge {
  id: string;
  levelNumber: number;
  puzzleIndex: number; // 1 to 6
  title: string;
  concept: ConceptTag;
  theme: string;
  elo: number;
  prompt: string;
  codeContext: string; // The code context with the missing invariant line
  expectedLine: string; // The optimal algorithmic invariant line
  acceptedAlternatives: string[];
  options: string[]; // 4 conceptual options
  hint: string;
  analysis: string; // Algorithmic analysis explaining why this is the optimal approach
  language: "python" | "javascript";

  // HackerRank Problem Specification
  functionName: string;
  problemStatement: string;
  example: {
    input: string;
    output: string;
    explanation: string;
  };
  functionDescription: {
    name: string;
    parameters: { name: string; type: string }[];
    returns: string;
  };
  constraints: string[];
  inputFormat: string;
  outputFormat: string;
  starterBoilerplate: {
    python: string;
    javascript: string;
    typescript: string;
    java: string;
    cpp: string;
  };
  testCases: TestCase[];
}

// Backward compatibility aliases
export type ChessCodePuzzle = CodingChallenge;
export type ChallengeLevel = ChessPuzzleLevel;

export interface ChessPuzzleLevel {
  levelNumber: number; // 1 to 100
  title: string;
  concept: ConceptTag;
  theme: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Master";
  baseElo: number;
  description: string;
  puzzleCount: number;
  puzzles: ChessCodePuzzle[];
}

// 10 Conceptual Chapters (10 Levels each = 100 Levels Total)
const CHAPTERS_METADATA: {
  range: [number, number];
  concept: ConceptTag;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Master";
  baseElo: number;
  themes: { title: string; theme: string; snippetIdea: string }[];
}[] = [
  {
    range: [1, 10],
    concept: "python beginner",
    difficulty: "Beginner",
    baseElo: 400,
    themes: [
      { title: "Variable Assignment & Type Casting", theme: "Types", snippetIdea: "int(x) + float(y)" },
      { title: "String Slicing & Negative Indexing", theme: "Strings", snippetIdea: "s[::-1]" },
      { title: "Conditional Branches (If-Elif-Else)", theme: "Conditionals", snippetIdea: "if score >= 90: return 'A'" },
      { title: "List Appending & Pop Mechanics", theme: "Lists", snippetIdea: "arr.pop() if arr else None" },
      { title: "For Loop Range & Step Increments", theme: "Loops", snippetIdea: "for i in range(0, n, 2):" },
      { title: "While Loop Exit Boundaries", theme: "Loops", snippetIdea: "while left < right:" },
      { title: "Dictionary Key Membership (in)", theme: "Dictionaries", snippetIdea: "if key in seen_cache:" },
      { title: "List Comprehension Filtering", theme: "Comprehensions", snippetIdea: "[x for x in nums if x % 2 == 0]" },
      { title: "Function Multiple Return Unpacking", theme: "Functions", snippetIdea: "return min_val, max_val" },
      { title: "Safe Division & ZeroDivision Guard", theme: "Error Handling", snippetIdea: "total / count if count > 0 else 0" },
    ],
  },
  {
    range: [11, 20],
    concept: "arrays",
    difficulty: "Beginner",
    baseElo: 700,
    themes: [
      { title: "Two Pointers Convergence", theme: "Two Pointers", snippetIdea: "left += 1; right -= 1" },
      { title: "Prefix Sum Accumulator", theme: "Prefix Sum", snippetIdea: "prefix[i] = prefix[i-1] + nums[i]" },
      { title: "Subarray Sliding Window Expansion", theme: "Sliding Window", snippetIdea: "window_sum += nums[right]" },
      { title: "In-Place Array Reversal", theme: "Two Pointers", snippetIdea: "nums[l], nums[r] = nums[r], nums[l]" },
      { title: "Remove Duplicates from Sorted Array", theme: "Pointers", snippetIdea: "if nums[i] != nums[k]: k += 1; nums[k] = nums[i]" },
      { title: "Rotate Array by K (Three-Reverse Trick)", theme: "Array Math", snippetIdea: "reverse(nums, 0, n - 1)" },
      { title: "Boyer-Moore Majority Vote Candidate", theme: "Voting", snippetIdea: "count += (1 if num == candidate else -1)" },
      { title: "Move Zeroes Without Reallocation", theme: "Pointers", snippetIdea: "if nums[i] != 0: nums[last_non_zero] = nums[i]" },
      { title: "Maximum Subarray Kadane Step", theme: "Greedy/DP", snippetIdea: "curr_sum = max(num, curr_sum + num)" },
      { title: "Merge Sorted Arrays In-Place", theme: "Two Pointers", snippetIdea: "while p1 >= 0 and p2 >= 0:" },
    ],
  },
  {
    range: [21, 30],
    concept: "hash maps",
    difficulty: "Intermediate",
    baseElo: 1000,
    themes: [
      { title: "Two Sum Hash Map Complement", theme: "Complements", snippetIdea: "diff = target - num; if diff in map:" },
      { title: "Character Frequency Counter", theme: "Frequencies", snippetIdea: "counts[c] = counts.get(c, 0) + 1" },
      { title: "Valid Anagram Sorting vs Map", theme: "Equivalence", snippetIdea: "if counts[c] < 0: return False" },
      { title: "First Non-Repeating Character", theme: "Frequency Query", snippetIdea: "if freq[char] == 1: return idx" },
      { title: "Intersection of Two Arrays", theme: "Sets", snippetIdea: "return list(set(nums1) & set(nums2))" },
      { title: "Longest Consecutive Sequence (O(N))", theme: "Set Lookup", snippetIdea: "if num - 1 not in num_set:" },
      { title: "Subarray Sum Equals K (Prefix Map)", theme: "Prefix Hash", snippetIdea: "count += prefix_map.get(curr_sum - k, 0)" },
      { title: "Isomorphic Strings Bijective Mapping", theme: "Dual Mapping", snippetIdea: "if map_s[c1] != c2 or map_t[c2] != c1:" },
      { title: "Group Anagrams by Sorted Key", theme: "Grouping", snippetIdea: "groups[tuple(sorted(word))].append(word)" },
      { title: "LRU Cache Node Hash Lookup", theme: "Cache", snippetIdea: "self.cache[key] = node; self._add(node)" },
    ],
  },
  {
    range: [31, 40],
    concept: "stacks",
    difficulty: "Intermediate",
    baseElo: 1300,
    themes: [
      { title: "Valid Parentheses Matching", theme: "Balanced Brackets", snippetIdea: "if stack.pop() != pairs[char]: return False" },
      { title: "Min Stack Constant-Time Tracking", theme: "Min Tracking", snippetIdea: "min_stack.append(min(val, min_stack[-1]))" },
      { title: "Next Greater Element (Monotonic)", theme: "Monotonic Stack", snippetIdea: "while stack and stack[-1] < num: stack.pop()" },
      { title: "Daily Temperatures Days Until Warmer", theme: "Monotonic Stack", snippetIdea: "ans[prev_idx] = curr_idx - prev_idx" },
      { title: "Evaluate Reverse Polish Notation", theme: "Postfix Math", snippetIdea: "b, a = stack.pop(), stack.pop(); stack.append(op(a, b))" },
      { title: "Queue Implemented with Two Stacks", theme: "Amortized Queue", snippetIdea: "if not out_stack: while in_stack: out_stack.append(in_stack.pop())" },
      { title: "Decode Nested String Multiplying", theme: "String Stack", snippetIdea: "curr_str = prev_str + curr_str * repeat_count" },
      { title: "Remove All Adjacent Duplicates", theme: "Stack Cleaning", snippetIdea: "if stack and stack[-1] == char: stack.pop()" },
      { title: "Asteroid Collision Survivor Stack", theme: "Collision", snippetIdea: "while stack and stack[-1] > 0 and ast < 0:" },
      { title: "Largest Rectangle in Histogram", theme: "Monotonic Heights", snippetIdea: "h = heights[stack.pop()]; w = i - stack[-1] - 1 if stack else i" },
    ],
  },
  {
    range: [41, 50],
    concept: "nodes",
    difficulty: "Intermediate",
    baseElo: 1550,
    themes: [
      { title: "Linked List Node Pointer Traversal", theme: "Pointer Next", snippetIdea: "curr = curr.next" },
      { title: "Reverse Linked List (Iterative 3-Pointer)", theme: "Pointers Reversal", snippetIdea: "next_node = curr.next; curr.next = prev; prev = curr; curr = next_node" },
      { title: "Fast & Slow Pointers (Floyd's Cycle)", theme: "Cycle Detection", snippetIdea: "slow = slow.next; fast = fast.next.next" },
      { title: "Find Middle Node of List", theme: "Fast/Slow Pointer", snippetIdea: "while fast and fast.next: slow = slow.next; fast = fast.next.next" },
      { title: "Merge Two Sorted Node Chains", theme: "List Merging", snippetIdea: "curr.next = l1 if l1.val <= l2.val else l2" },
      { title: "Remove N-th Node From End of List", theme: "Window Pointers", snippetIdea: "fast = fast.next; ... slow.next = slow.next.next" },
      { title: "Palindrome Linked List (Half-Reverse)", theme: "Node Symmetry", snippetIdea: "if first_half.val != second_half.val: return False" },
      { title: "Intersection Node of Two Linked Lists", theme: "Node Alignment", snippetIdea: "pA = headB if pA is None else pA.next" },
      { title: "Odd Even Node Rearrangement", theme: "Node Unweaving", snippetIdea: "odd.next = even.next; odd = odd.next" },
      { title: "Copy List with Random Pointer", theme: "Deep Copy", snippetIdea: "copy.next = curr.next.next" },
    ],
  },
  {
    range: [51, 60],
    concept: "search",
    difficulty: "Intermediate",
    baseElo: 1800,
    themes: [
      { title: "Binary Search Midpoint Calculation", theme: "Overflow Prevention", snippetIdea: "mid = left + (right - left) // 2" },
      { title: "Search Insert Position (Lower Bound)", theme: "Binary Search", snippetIdea: "if nums[mid] >= target: right = mid else: left = mid + 1" },
      { title: "First & Last Boundary Position", theme: "Binary Search Range", snippetIdea: "if nums[mid] == target: ans = mid; right = mid - 1" },
      { title: "Search in Rotated Sorted Array", theme: "Rotated Halves", snippetIdea: "if nums[left] <= nums[mid]: check_left_sorted() else: check_right_sorted()" },
      { title: "Find Minimum in Rotated Sorted Array", theme: "Rotated Inflection", snippetIdea: "if nums[mid] > nums[right]: left = mid + 1 else: right = mid" },
      { title: "Square Root via Integer Binary Search", theme: "Search on Answer", snippetIdea: "if mid * mid <= x: ans = mid; left = mid + 1 else: right = mid - 1" },
      { title: "Peak Element Hunting in Array", theme: "Gradient Ascent", snippetIdea: "if nums[mid] < nums[mid + 1]: left = mid + 1 else: right = mid" },
      { title: "Search in 2D Row/Col Sorted Matrix", theme: "Staircase Search", snippetIdea: "if matrix[row][col] > target: col -= 1 else: row += 1" },
      { title: "Capacity to Ship Packages Within D Days", theme: "Feasibility Function", snippetIdea: "if can_ship(mid, days): right = mid else: left = mid + 1" },
      { title: "Koko Eating Bananas Minimum Speed", theme: "Binary Search Rate", snippetIdea: "hours += math.ceil(pile / speed)" },
    ],
  },
  {
    range: [61, 70],
    concept: "trees",
    difficulty: "Advanced",
    baseElo: 2050,
    themes: [
      { title: "Maximum Depth of Binary Tree Node", theme: "Recursive Tree Depth", snippetIdea: "return 1 + max(dfs(root.left), dfs(root.right))" },
      { title: "Invert Binary Tree (Mirror Child Nodes)", theme: "Tree Mutation", snippetIdea: "root.left, root.right = invert(root.right), invert(root.left)" },
      { title: "Binary Tree DFS (Pre, In, Post-Order)", theme: "Tree DFS", snippetIdea: "dfs(node.left); result.append(node.val); dfs(node.right)" },
      { title: "Level Order Traversal (BFS Queue)", theme: "Tree BFS", snippetIdea: "node = queue.popleft(); level.append(node.val)" },
      { title: "Check if Two Trees Are Identical", theme: "Tree Equivalence", snippetIdea: "if not p or not q: return p == q; return p.val == q.val and ..." },
      { title: "Symmetric Tree Mirror Comparison", theme: "Dual DFS", snippetIdea: "return is_mirror(t1.left, t2.right) and is_mirror(t1.right, t2.left)" },
      { title: "Diameter of Binary Tree", theme: "Tree Path Math", snippetIdea: "self.max_diam = max(self.max_diam, left_h + right_h)" },
      { title: "Subtree of Another Tree Verification", theme: "Tree Matching", snippetIdea: "if is_same(s, t): return True; return is_sub(s.left, t) or is_sub(s.right, t)" },
      { title: "Path Sum to Target Leaf Node", theme: "Backtracking Path", snippetIdea: "if not node.left and not node.right: return remain == node.val" },
      { title: "Construct Tree from Preorder & Inorder", theme: "Tree Reconstruction", snippetIdea: "root = TreeNode(preorder[0]); mid = inorder.index(root.val)" },
    ],
  },
  {
    range: [71, 80],
    concept: "trees",
    difficulty: "Advanced",
    baseElo: 2250,
    themes: [
      { title: "Validate Binary Search Tree Bounds", theme: "BST Invariant", snippetIdea: "if not (low < node.val < high): return False" },
      { title: "Search in Binary Search Tree", theme: "BST Pruning", snippetIdea: "return search(root.right, val) if val > root.val else search(root.left, val)" },
      { title: "Insert Node into BST", theme: "BST Insertion", snippetIdea: "if val > root.val: root.right = insert(root.right, val) else: root.left = insert(root.left, val)" },
      { title: "Delete Node from BST (Inorder Successor)", theme: "BST Deletion", snippetIdea: "succ = get_min(root.right); root.val = succ.val; root.right = delete(root.right, succ.val)" },
      { title: "Lowest Common Ancestor in BST", theme: "BST Ancestor", snippetIdea: "if p.val > root.val and q.val > root.val: return lca(root.right, p, q)" },
      { title: "K-th Smallest Element in BST", theme: "Inorder Generator", snippetIdea: "while curr or stack: while curr: stack.append(curr); curr = curr.left" },
      { title: "Convert Sorted Array to Balanced BST", theme: "Divide and Conquer", snippetIdea: "mid = len(nums) // 2; root = TreeNode(nums[mid])" },
      { title: "BST Iterator (O(h) Memory Stack)", theme: "Iterator Stack", snippetIdea: "self._push_left(node.right)" },
      { title: "Two Sum IV in BST (Dual Inorder Pointers)", theme: "BST Two Pointers", snippetIdea: "sum_val = l.val + r.val; if sum_val == k: return True" },
      { title: "Recover BST Swapped Nodes", theme: "Inorder Discrepancy", snippetIdea: "if prev and prev.val > curr.val: first = prev if not first else first; second = curr" },
    ],
  },
  {
    range: [81, 90],
    concept: "algorithms",
    difficulty: "Master",
    baseElo: 2450,
    themes: [
      { title: "Adjacency List Graph Node Building", theme: "Graph Modeling", snippetIdea: "graph[u].append(v); graph[v].append(u)" },
      { title: "BFS Shortest Path in Unweighted Graph", theme: "Queue Distance", snippetIdea: "for neighbor in graph[node]: if neighbor not in visited: queue.append((neighbor, dist + 1))" },
      { title: "Number of Islands (Grid BFS/DFS)", theme: "Grid Traversal", snippetIdea: "grid[r][c] = '0'; dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)" },
      { title: "Rotting Oranges Multi-source BFS", theme: "Simultaneous BFS", snippetIdea: "for _ in range(len(queue)): r, c = queue.popleft()" },
      { title: "Course Schedule Directed Cycle Detection", theme: "Kahn's / DFS Color", snippetIdea: "if in_degree[neighbor] == 0: queue.append(neighbor)" },
      { title: "Topological Sort Linear Ordering", theme: "DAG Sorting", snippetIdea: "order.append(node); for child in graph[node]: in_degree[child] -= 1" },
      { title: "Word Ladder One-Letter Transformation", theme: "Word Graph BFS", snippetIdea: "pattern = word[:j] + '*' + word[j+1:]" },
      { title: "Clone Graph Deep Node Copy", theme: "Graph Memoization", snippetIdea: "clones[node] = Node(node.val); clone.neighbors = [dfs(n) for n in node.neighbors]" },
      { title: "Pacific Atlantic Water Flow", theme: "Dual Boundary BFS", snippetIdea: "return list(pacific_reachable & atlantic_reachable)" },
      { title: "Dijkstra Shortest Path with Min-Heap", theme: "Priority Queue", snippetIdea: "heappush(pq, (curr_dist + weight, neighbor))" },
    ],
  },
  {
    range: [91, 100],
    concept: "dynamic programming",
    difficulty: "Master",
    baseElo: 2650,
    themes: [
      { title: "Climbing Stairs (Fibonacci DP State)", theme: "1D Recurrence", snippetIdea: "dp[i] = dp[i - 1] + dp[i - 2]" },
      { title: "House Robber (Optimal Non-Adjacent)", theme: "Take or Skip", snippetIdea: "rob2 = max(rob1 + num, rob2); rob1 = temp" },
      { title: "Coin Change (Fewest Coins Table)", theme: "Unbounded DP", snippetIdea: "dp[a] = min(dp[a], 1 + dp[a - coin])" },
      { title: "Longest Increasing Subsequence (Patience Binary)", theme: "Subsequence DP", snippetIdea: "idx = bisect_left(tails, num); tails[idx] = num" },
      { title: "Maximum Subarray Kadane Invariant", theme: "Local vs Global", snippetIdea: "max_so_far = max(num, max_so_far + num)" },
      { title: "Unique Paths in Grid with Obstacles", theme: "2D Grid DP", snippetIdea: "dp[r][c] = (dp[r-1][c] + dp[r][c-1]) if grid[r][c] == 0 else 0" },
      { title: "0/1 Knapsack Value Maximization", theme: "Bounded Capacity", snippetIdea: "dp[w] = max(dp[w], val + dp[w - weight])" },
      { title: "Longest Common Subsequence (2-String Matrix)", theme: "String DP", snippetIdea: "dp[i][j] = 1 + dp[i+1][j+1] if s1[i] == s2[j] else max(dp[i+1][j], dp[i][j+1])" },
      { title: "Edit Distance (Insert, Delete, Replace)", theme: "Matrix Transformation", snippetIdea: "dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])" },
      { title: "2D Grid Random Walk Probability on Board", theme: "State Transition", snippetIdea: "new_board[nr][nc] += board[r][c] / 8.0" },
    ],
  },
];

// Helper to generate 4 distinct, pedagogically realistic tactical options
function generateSmartOptions(winningMove: string, concept: string): string[] {
  const optionsSet = new Set<string>();
  optionsSet.add(winningMove);

  const variations: string[] = [];

  // Comparison & boundary swaps
  if (winningMove.includes("<=")) variations.push(winningMove.replace(/<=/g, "<"));
  else if (winningMove.includes("<")) variations.push(winningMove.replace(/</g, "<="));
  if (winningMove.includes(">=")) variations.push(winningMove.replace(/>=/g, ">"));
  else if (winningMove.includes(">")) variations.push(winningMove.replace(/>/g, ">="));
  if (winningMove.includes("==")) variations.push(winningMove.replace(/==/g, "!="));
  if (winningMove.includes("!=")) variations.push(winningMove.replace(/!=/g, "=="));

  // Arithmetic & index swaps
  if (winningMove.includes("+ 1")) variations.push(winningMove.replace(/\+ 1/g, "+ 2"), winningMove.replace(/\+ 1/g, "- 1"));
  if (winningMove.includes("- 1")) variations.push(winningMove.replace(/- 1/g, "- 2"), winningMove.replace(/- 1/g, "+ 1"));
  if (winningMove.includes(" + ")) variations.push(winningMove.replace(/ \+ /g, " - "));
  if (winningMove.includes(" - ")) variations.push(winningMove.replace(/ - /g, " + "));
  if (winningMove.includes("*")) variations.push(winningMove.replace(/\*/g, "//"));
  if (winningMove.includes("//")) variations.push(winningMove.replace(/\/\//g, "/"));

  // Direction / pointer / state swaps
  if (winningMove.includes("left")) variations.push(winningMove.replace(/left/g, "right"));
  if (winningMove.includes("right")) variations.push(winningMove.replace(/right/g, "left"));
  if (winningMove.includes("slow")) variations.push(winningMove.replace(/slow/g, "fast"));
  if (winningMove.includes("fast")) variations.push(winningMove.replace(/fast/g, "slow"));
  if (winningMove.includes("prev")) variations.push(winningMove.replace(/prev/g, "curr"));
  if (winningMove.includes("curr")) variations.push(winningMove.replace(/curr/g, "next_node"));
  if (winningMove.includes(".next")) variations.push(winningMove.replace(/\.next/g, ".prev"));

  // Common collections & methods
  if (winningMove.includes("append")) variations.push(winningMove.replace(/append/g, "extend"));
  if (winningMove.includes("pop()")) variations.push(winningMove.replace(/pop\(\)/g, "pop(0)"));
  if (winningMove.includes("min(")) variations.push(winningMove.replace(/min\(/g, "max("));
  if (winningMove.includes("max(")) variations.push(winningMove.replace(/max\(/g, "min("));
  if (winningMove.includes("True")) variations.push(winningMove.replace(/True/g, "False"));
  if (winningMove.includes("False")) variations.push(winningMove.replace(/False/g, "True"));
  if (winningMove.includes("int(")) variations.push(winningMove.replace(/int\(/g, "str("));
  if (winningMove.includes("float(")) variations.push(winningMove.replace(/float\(/g, "int("));
  if (winningMove.includes("[::-1]")) variations.push(winningMove.replace(/\[::-1\]/g, "[:1:-1]"), winningMove.replace(/\[::-1\]/g, "[::1]"));
  if (winningMove.includes("range(")) variations.push(winningMove.replace(/range\(/g, "enumerate("));

  for (const v of variations) {
    if (v !== winningMove && v.trim().length > 0) {
      optionsSet.add(v);
    }
  }

  // Fallback realistic distractor patterns
  const fallbacks: string[] = [
    winningMove.replace(/\+/g, "-"),
    winningMove.replace(/x/g, "str(x)"),
    winningMove.replace(/y/g, "int(y)"),
    winningMove.replace(/0/g, "1"),
    winningMove.replace(/1/g, "0"),
    winningMove.includes("return") ? winningMove.replace("return", "pass # return") : `return ${winningMove}`,
    winningMove.replace(/\.val/g, ".next"),
    winningMove.replace(/nums\[/g, "nums[i + "),
    winningMove.replace(/\(/g, "(not ")
  ];

  for (const fb of fallbacks) {
    if (optionsSet.size >= 4) break;
    if (fb !== winningMove && fb.trim().length > 0) {
      optionsSet.add(fb);
    }
  }

  // If still under 4, ensure unique labeled placeholders
  let counter = 1;
  while (optionsSet.size < 4) {
    optionsSet.add(`${winningMove} # alternative variant ${counter++}`);
  }

  const list = Array.from(optionsSet).slice(0, 4);
  // Deterministic shuffle
  return list.sort((a, b) => (a.length % 3) - (b.length % 3) || a.localeCompare(b));
}

// Generate HackerRank problem specification for coding challenges
function buildHackerRankMeta(
  themeItem: { title: string; theme: string; snippetIdea: string },
  concept: ConceptTag,
  levelNum: number,
  puzzleIndex: number,
  variationName: string
) {
  // If Level 1, Puzzle 1: Exact problem from the user's HackerRank screenshot!
  if (levelNum === 1 && puzzleIndex === 1) {
    return {
      functionName: "getRemovableIndices",
      problemStatement: `Given two strings, \`str1\` and \`str2\`, where \`str1\` contains exactly one character more than \`str2\`, find the indices of the characters in \`str1\` that can be removed to make \`str1\` equal to \`str2\`. Return the array of indices in increasing order. If it is not possible, return \`[-1]\`.\n\nNote: Use 0-based indexing.`,
      example: {
        input: `str1 = "abdggda", str2 = "abdgda"`,
        output: `[3, 4, 5]`,
        explanation: `Any 'g' character at positions 3, 4, or 5 can be deleted to obtain str2. Return [3, 4, 5].`
      },
      functionDescription: {
        name: "getRemovableIndices",
        parameters: [
          { name: "str1", type: "string" },
          { name: "str2", type: "string" }
        ],
        returns: "int[]: The 0-based indices of removable characters in str1 in ascending order"
      },
      constraints: [
        "2 <= |str1| <= 2 * 10^5",
        "1 <= |str2| <= 2 * 10^5",
        "|str1| = |str2| + 1",
        "str1 and str2 only contain lowercase English letters."
      ],
      inputFormat: "Two strings, str1 and str2.",
      outputFormat: "int[]: the indices of characters that can be removed from str1 in ascending order, or [-1] if it is not possible to match str2.",
      starterBoilerplate: {
        python: `def get_removable_indices(str1: str, str2: str) -> list[int]:
    # Complete the 'getRemovableIndices' function below.
    # The function is expected to return an INTEGER_ARRAY.
    # Write your code here
    pass
`,
        javascript: `/**
 * Complete the 'getRemovableIndices' function below.
 * @param {string} str1
 * @param {string} str2
 * @return {number[]}
 */
function getRemovableIndices(str1, str2) {
    // Write your code here
    
}
`,
        typescript: `/**
 * Complete the 'getRemovableIndices' function below.
 * The function is expected to return an number[].
 */
function getRemovableIndices(str1: string, str2: string): number[] {
    // Write your code here
    return [];
}
`,
        java: `import java.io.*;
import java.util.*;

class Solution {
    /*
     * Complete the 'getRemovableIndices' function below.
     * The function is expected to return an INTEGER_ARRAY.
     */
    public static List<Integer> getRemovableIndices(String str1, String str2) {
        // Write your code here
        List<Integer> result = new ArrayList<>();
        return result;
    }
}
`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

// Complete the 'getRemovableIndices' function below.
// The function is expected to return an INTEGER_ARRAY.
vector<int> getRemovableIndices(string str1, string str2) {
    // Write your code here
    return {};
}
`
      },
      testCases: [
        {
          id: 0,
          input: `"abdggda", "abdgda"`,
          expectedOutput: `[3, 4, 5]`,
          explanation: `Characters at index 3, 4, or 5 ('g') can be removed to yield "abdgda".`
        },
        {
          id: 1,
          input: `"abcde", "abce"`,
          expectedOutput: `[3]`,
          explanation: `Removing index 3 ('d') yields "abce".`
        },
        {
          id: 2,
          input: `"aaaaa", "aaaa"`,
          expectedOutput: `[0, 1, 2, 3, 4]`,
          isHidden: true,
          explanation: `Any character can be removed.`
        },
        {
          id: 3,
          input: `"xyz", "abc"`,
          expectedOutput: `[-1]`,
          isHidden: true,
          explanation: `Strings differ by multiple characters.`
        }
      ]
    };
  }

  // General theme-based HackerRank specification
  const funcBase = themeItem.title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join("_");
  const functionName = funcBase || `solve_${concept.replace(/\s+/g, "_")}`;

  return {
    functionName,
    problemStatement: `Implement the algorithm for **${themeItem.title}** (${variationName}) focusing on \`${concept.toUpperCase()}\`.\n\nYour solution must maintain data structure invariants and avoid common runtime pitfalls such as boundary off-by-one errors or inefficient re-allocations.`,
    example: {
      input: `input_data = [4, 7, 2, 9, 1]`,
      output: `[1, 2, 4, 7, 9]`,
      explanation: `Processes the input collection and returns the optimal transformation.`
    },
    functionDescription: {
      name: functionName,
      parameters: [
        { name: "input_data", type: "array / collection" },
        { name: "k", type: "integer (optional threshold)" }
      ],
      returns: "The transformed collection or verified boolean result"
    },
    constraints: [
      "1 <= len(input_data) <= 10^5",
      "-10^4 <= input_data[i] <= 10^4",
      "Expected Time Complexity: O(n) or O(n log n)",
      "Expected Space Complexity: O(1) auxiliary space"
    ],
    inputFormat: "An input array or structured object input_data.",
    outputFormat: "Return the valid computed result matching the problem specification.",
    starterBoilerplate: {
      python: `def ${functionName}(input_data, k=0):
    # Complete the '${functionName}' function below.
    # Write your code here
    pass
`,
      javascript: `/**
 * Complete the '${functionName}' function below.
 * @param {any} input_data
 * @param {number} [k=0]
 * @return {any}
 */
function ${functionName}(input_data, k = 0) {
    // Write your code here
    
}
`,
      typescript: `/**
 * Complete the '${functionName}' function below.
 */
function ${functionName}(input_data: any, k: number = 0): any {
    // Write your code here
    return input_data;
}
`,
      java: `import java.io.*;
import java.util.*;

class Solution {
    /*
     * Complete the '${functionName}' function below.
     */
    public static Object ${functionName.replace(/_([a-z])/g, (_, g) => g.toUpperCase())}(Object input_data, int k) {
        // Write your code here
        return input_data;
    }
}
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

// Complete the '${functionName}' function below.
auto ${functionName}(vector<int> input_data, int k = 0) {
    // Write your code here
    return input_data;
}
`
    },
    testCases: [
      {
        id: 0,
        input: `[4, 7, 2, 9, 1], 2`,
        expectedOutput: `[1, 2, 4, 7, 9]`,
        explanation: `Standard sample verification test case.`
      },
      {
        id: 1,
        input: `[10, -5, 20], 1`,
        expectedOutput: `[-5, 10, 20]`,
        explanation: `Sample verification with negative boundary values.`
      },
      {
        id: 2,
        input: `[1]`,
        expectedOutput: `[1]`,
        isHidden: true,
        explanation: `Hidden test case verifying single element boundary.`
      },
      {
        id: 3,
        input: `[]`,
        expectedOutput: `[]`,
        isHidden: true,
        explanation: `Hidden test case verifying empty collection.`
      }
    ]
  };
}

// Helper to generate 5-7 similarity-based challenges per level with 4 conceptual options
function generateLevelPuzzles(levelNum: number, themeItem: { title: string; theme: string; snippetIdea: string }, concept: ConceptTag, elo: number): ChessCodePuzzle[] {
  const puzzles: ChessCodePuzzle[] = [];
  const puzzleCount = 6; // 6 challenges per level = 600 similarity-based challenges across all 100 levels!

  const variations = [
    {
      name: "Problem Foundation",
      desc: "Identify the vital foundation line to initiate the algorithmic solution.",
      promptSnippet: "Find the foundational implementation line:",
      distractorType: "syntax",
    },
    {
      name: "Branching State Transition",
      desc: "Choose the correct state update when two logic branches converge.",
      promptSnippet: "Find the optimal state transition update:",
      distractorType: "boundary",
    },
    {
      name: "Boundary & Edge Cases",
      desc: "Neutralize edge cases (empty collections, single nodes, 0 division).",
      promptSnippet: "Find the correct boundary guard condition:",
      distractorType: "offByOne",
    },
    {
      name: "Complement & Inversion",
      desc: "Reverse the operation or track inverse complements.",
      promptSnippet: "Select the optimal complement logic:",
      distractorType: "inverted",
    },
    {
      name: "Algorithmic Efficiency",
      desc: "Execute the O(1) or O(log N) transition without redundant overhead.",
      promptSnippet: "Select the highest efficiency operation:",
      distractorType: "quadratic",
    },
    {
      name: "Optimal Resolution",
      desc: "Synthesize the complete algorithm step to lock in the verified solution.",
      promptSnippet: "Find the finishing line to complete the challenge:",
      distractorType: "incomplete",
    },
  ];

  for (let i = 0; i < puzzleCount; i++) {
    const v = variations[i];
    const puzzleElo = elo + (i * 15);
    const puzzleId = `puzzle-lvl${levelNum}-p${i + 1}`;

    const winningMove = themeItem.snippetIdea;
    const options = generateSmartOptions(winningMove, concept);
    const hrMeta = buildHackerRankMeta(themeItem, concept, levelNum, i + 1, v.name);

    puzzles.push({
      id: puzzleId,
      levelNumber: levelNum,
      puzzleIndex: i + 1,
      title: `${themeItem.title} · ${v.name}`,
      concept,
      theme: themeItem.theme,
      elo: puzzleElo,
      prompt: `${themeItem.title} (${v.name})\n${v.desc}\n\n👉 Optimal Step: ${v.promptSnippet}`,
      codeContext: `# [Level ${levelNum} · Challenge ${i + 1}/6 · Rating ${puzzleElo}]
# Concept: ${concept.toUpperCase()} — Theme: ${themeItem.theme}
def execute_solution_step(input_data):
    # Analyzing scenario...
    # [YOUR OPTIMAL CODE LINE GOES HERE]
    pass
`,
      expectedLine: winningMove,
      acceptedAlternatives: [winningMove, winningMove.replace(/;\s*/g, "\n    ")],
      options,
      hint: `💡 Invariant: Notice the ${themeItem.theme} property. Focus on preserving invariants without off-by-one errors.`,
      analysis: `🔍 Algorithmic Analysis: The line '${winningMove}' is the only invariant that guarantees correctness. Any deviation alters loop termination or violates invariants, leading to runtime failure.`,
      language: "python",
      ...hrMeta,
    });
  }

  return puzzles;
}

// Generate the complete 100-Level Curriculum
export function getElevate100PuzzleLevels(): ChessPuzzleLevel[] {
  const levels: ChessPuzzleLevel[] = [];

  for (let lvl = 1; lvl <= 100; lvl++) {
    const chapter = CHAPTERS_METADATA.find(c => lvl >= c.range[0] && lvl <= c.range[1]) || CHAPTERS_METADATA[0];
    const themeIdx = (lvl - chapter.range[0]) % chapter.themes.length;
    const themeItem = chapter.themes[themeIdx];
    const baseElo = chapter.baseElo + ((lvl - chapter.range[0]) * 30);

    const puzzles = generateLevelPuzzles(lvl, themeItem, chapter.concept, baseElo);

    levels.push({
      levelNumber: lvl,
      title: `Level ${lvl}: ${themeItem.title}`,
      concept: chapter.concept,
      theme: themeItem.theme,
      difficulty: chapter.difficulty,
      baseElo,
      description: `Solve 6 progressive ${chapter.concept} challenges on ${themeItem.theme}. Earn 3 stars to unlock Level ${lvl + 1}.`,
      puzzleCount: puzzles.length,
      puzzles,
    });
  }

  return levels;
}

// User Progress in Coding Challenges
export interface ChallengeUserState {
  currentLevel: number;
  unlockedLevels: number[];
  rating: number; // e.g. starts at 800
  streak: number;
  bestStreak: number;
  solvedPuzzlesCount: number;
  starsMap: Record<number, number>; // levelNumber -> stars (1, 2, or 3)
  completedPuzzles: Record<string, boolean>; // puzzleId -> true
}

export const INITIAL_USER_CHALLENGE_STATE: ChallengeUserState = {
  currentLevel: 1,
  unlockedLevels: [1],
  rating: 800,
  streak: 0,
  bestStreak: 0,
  solvedPuzzlesCount: 0,
  starsMap: {},
  completedPuzzles: {},
};

export type ChessPuzzleUserState = ChallengeUserState;
export const INITIAL_USER_CHESS_STATE = INITIAL_USER_CHALLENGE_STATE;
