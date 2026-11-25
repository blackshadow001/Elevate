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

  // Concept-matched authentic problem bank so every level has genuine, runnable specs & test cases
  interface SpecTemplate {
    functionName: string;
    problemStatement: string;
    example: { input: string; output: string; explanation: string };
    parameters: { name: string; type: string }[];
    returns: string;
    constraints: string[];
    inputFormat: string;
    outputFormat: string;
    pythonParams: string;
    jsParams: string;
    tsParams: string;
    tsReturn: string;
    javaSig: string;
    javaReturnStub: string;
    cppSig: string;
    cppReturnStub: string;
    testCases: TestCase[];
  }

  const CONCEPT_SPECS: Record<ConceptTag, SpecTemplate[]> = {
    "python beginner": [
      {
        functionName: "sumEvenNumbers",
        problemStatement: "Given an integer array `nums`, calculate and return the sum of all even integers in the array. Ignore odd numbers and handle negative even numbers properly.",
        example: { input: "nums = [1, 2, 3, 4, 6]", output: "12", explanation: "Even numbers are 2, 4, 6. Their sum is 2 + 4 + 6 = 12." },
        parameters: [{ name: "nums", type: "int[]" }],
        returns: "int: Total sum of all even numbers",
        constraints: ["0 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
        inputFormat: "An integer array nums.",
        outputFormat: "Return a single integer representing the sum of even values.",
        pythonParams: "nums: list[int]",
        jsParams: "nums",
        tsParams: "nums: number[]",
        tsReturn: "number",
        javaSig: "public static int sumEvenNumbers(int[] nums)",
        javaReturnStub: "0",
        cppSig: "int sumEvenNumbers(vector<int> nums)",
        cppReturnStub: "0",
        testCases: [
          { id: 0, input: "[1, 2, 3, 4, 6]", expectedOutput: "12", explanation: "2 + 4 + 6 = 12" },
          { id: 1, input: "[1, 3, 5, 7]", expectedOutput: "0", explanation: "No even numbers present." },
          { id: 2, input: "[-2, -4, 5, 8]", expectedOutput: "2", isHidden: true },
          { id: 3, input: "[]", expectedOutput: "0", isHidden: true },
        ],
      },
      {
        functionName: "reverseWords",
        problemStatement: "Given a string `s`, return the string with the order of characters reversed while preserving case and punctuation.",
        example: { input: 's = "elevate"', output: '"etavele"', explanation: "Reversing all characters produces 'etavele'." },
        parameters: [{ name: "s", type: "string" }],
        returns: "string: Reversed character sequence",
        constraints: ["0 <= s.length <= 10^5"],
        inputFormat: "A string s.",
        outputFormat: "Return the reversed string.",
        pythonParams: "s: str",
        jsParams: "s",
        tsParams: "s: string",
        tsReturn: "string",
        javaSig: "public static String reverseWords(String s)",
        javaReturnStub: '""',
        cppSig: "string reverseWords(string s)",
        cppReturnStub: '""',
        testCases: [
          { id: 0, input: '"elevate"', expectedOutput: '"etavele"' },
          { id: 1, input: '"abc123"', expectedOutput: '"321cba"' },
          { id: 2, input: '"racecar"', expectedOutput: '"racecar"', isHidden: true },
          { id: 3, input: '""', expectedOutput: '""', isHidden: true },
        ],
      },
    ],
    "python intermediate": [
      {
        functionName: "countUniqueWords",
        problemStatement: "Given a list of string tokens `words`, return the count of distinct words ignoring case sensitivity.",
        example: { input: 'words = ["Code", "code", "SQL", "Web"]', output: "3", explanation: "Unique lowercase tokens: 'code', 'sql', 'web'." },
        parameters: [{ name: "words", type: "string[]" }],
        returns: "int: Count of unique case-insensitive tokens",
        constraints: ["0 <= words.length <= 10^4"],
        inputFormat: "An array of strings words.",
        outputFormat: "An integer count.",
        pythonParams: "words: list[str]",
        jsParams: "words",
        tsParams: "words: string[]",
        tsReturn: "number",
        javaSig: "public static int countUniqueWords(List<String> words)",
        javaReturnStub: "0",
        cppSig: "int countUniqueWords(vector<string> words)",
        cppReturnStub: "0",
        testCases: [
          { id: 0, input: '["Code", "code", "SQL", "Web"]', expectedOutput: "3" },
          { id: 1, input: '["a", "b", "c"]', expectedOutput: "3" },
          { id: 2, input: "[]", expectedOutput: "0", isHidden: true },
        ],
      },
    ],
    arrays: [
      {
        functionName: "maxSubarraySum",
        problemStatement: "Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum using Kadane's algorithm in O(N) time.",
        example: { input: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]", output: "6", explanation: "Subarray [4, -1, 2, 1] has the largest sum = 6." },
        parameters: [{ name: "nums", type: "int[]" }],
        returns: "int: Maximum contiguous subarray sum",
        constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
        inputFormat: "Non-empty integer array nums.",
        outputFormat: "Single integer maximum sum.",
        pythonParams: "nums: list[int]",
        jsParams: "nums",
        tsParams: "nums: number[]",
        tsReturn: "number",
        javaSig: "public static int maxSubarraySum(int[] nums)",
        javaReturnStub: "0",
        cppSig: "int maxSubarraySum(vector<int> nums)",
        cppReturnStub: "0",
        testCases: [
          { id: 0, input: "[-2, 1, -3, 4, -1, 2, 1, -5, 4]", expectedOutput: "6" },
          { id: 1, input: "[5, 4, -1, 7, 8]", expectedOutput: "23" },
          { id: 2, input: "[-3, -1, -7]", expectedOutput: "-1", isHidden: true },
          { id: 3, input: "[1]", expectedOutput: "1", isHidden: true },
        ],
      },
      {
        functionName: "moveZeroes",
        problemStatement: "Given an integer array `nums`, move all `0`'s to the end of it while maintaining the relative order of the non-zero elements, and return the resulting array.",
        example: { input: "nums = [0, 1, 0, 3, 12]", output: "[1, 3, 12, 0, 0]", explanation: "Non-zero order [1, 3, 12] is preserved while zeroes move to the end." },
        parameters: [{ name: "nums", type: "int[]" }],
        returns: "int[]: Reordered array",
        constraints: ["0 <= nums.length <= 10^4"],
        inputFormat: "Integer array nums.",
        outputFormat: "Array with zeroes moved to the end.",
        pythonParams: "nums: list[int]",
        jsParams: "nums",
        tsParams: "nums: number[]",
        tsReturn: "number[]",
        javaSig: "public static int[] moveZeroes(int[] nums)",
        javaReturnStub: "nums",
        cppSig: "vector<int> moveZeroes(vector<int> nums)",
        cppReturnStub: "{}",
        testCases: [
          { id: 0, input: "[0, 1, 0, 3, 12]", expectedOutput: "[1, 3, 12, 0, 0]" },
          { id: 1, input: "[0]", expectedOutput: "[0]" },
          { id: 2, input: "[4, 2, 0, 1]", expectedOutput: "[4, 2, 1, 0]", isHidden: true },
        ],
      },
    ],
    "hash maps": [
      {
        functionName: "twoSum",
        problemStatement: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target` in O(N) time using a hash map.",
        example: { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", explanation: "nums[0] + nums[1] == 2 + 7 == 9." },
        parameters: [{ name: "nums", type: "int[]" }, { name: "target", type: "int" }],
        returns: "int[]: Pair of 0-based indices",
        constraints: ["2 <= nums.length <= 10^4", "Exactly one valid solution exists."],
        inputFormat: "An integer array nums and an integer target.",
        outputFormat: "Array of two indices [i, j].",
        pythonParams: "nums: list[int], target: int",
        jsParams: "nums, target",
        tsParams: "nums: number[], target: number",
        tsReturn: "number[]",
        javaSig: "public static int[] twoSum(int[] nums, int target)",
        javaReturnStub: "new int[]{}",
        cppSig: "vector<int> twoSum(vector<int> nums, int target)",
        cppReturnStub: "{}",
        testCases: [
          { id: 0, input: "[2, 7, 11, 15], 9", expectedOutput: "[0, 1]" },
          { id: 1, input: "[3, 2, 4], 6", expectedOutput: "[1, 2]" },
          { id: 2, input: "[3, 3], 6", expectedOutput: "[0, 1]", isHidden: true },
        ],
      },
    ],
    stacks: [
      {
        functionName: "isValidBrackets",
        problemStatement: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string brackets close in the correct LIFO order.",
        example: { input: 's = "({[]})"', output: "true", explanation: "All brackets open and close cleanly using a stack." },
        parameters: [{ name: "s", type: "string" }],
        returns: "boolean: true if balanced, false otherwise",
        constraints: ["1 <= s.length <= 10^4"],
        inputFormat: "Bracket string s.",
        outputFormat: "Boolean true or false.",
        pythonParams: "s: str",
        jsParams: "s",
        tsParams: "s: string",
        tsReturn: "boolean",
        javaSig: "public static boolean isValidBrackets(String s)",
        javaReturnStub: "false",
        cppSig: "bool isValidBrackets(string s)",
        cppReturnStub: "false",
        testCases: [
          { id: 0, input: '"({[]})"', expectedOutput: "true" },
          { id: 1, input: '"()[]{}"', expectedOutput: "true" },
          { id: 2, input: '"(]"', expectedOutput: "false", isHidden: true },
          { id: 3, input: '"((("', expectedOutput: "false", isHidden: true },
        ],
      },
    ],
    nodes: [
      {
        functionName: "isListPalindrome",
        problemStatement: "Given the node values of a singly linked list serialized as an array `values`, determine whether the sequence reads identical forwards and backwards.",
        example: { input: "values = [1, 2, 2, 1]", output: "true", explanation: "[1, 2, 2, 1] mirrors evenly from both ends." },
        parameters: [{ name: "values", type: "int[]" }],
        returns: "boolean: true if palindrome sequence",
        constraints: ["1 <= values.length <= 10^5"],
        inputFormat: "Array representation of linked list node values.",
        outputFormat: "Boolean true or false.",
        pythonParams: "values: list[int]",
        jsParams: "values",
        tsParams: "values: number[]",
        tsReturn: "boolean",
        javaSig: "public static boolean isListPalindrome(int[] values)",
        javaReturnStub: "false",
        cppSig: "bool isListPalindrome(vector<int> values)",
        cppReturnStub: "false",
        testCases: [
          { id: 0, input: "[1, 2, 2, 1]", expectedOutput: "true" },
          { id: 1, input: "[1, 2]", expectedOutput: "false" },
          { id: 2, input: "[7]", expectedOutput: "true", isHidden: true },
        ],
      },
    ],
    search: [
      {
        functionName: "binarySearch",
        problemStatement: "Given a sorted integer array `nums` in ascending order and a `target` integer, return the 0-based index of `target` if present, or `-1` otherwise, in O(log N) time.",
        example: { input: "nums = [-1, 0, 3, 5, 9, 12], target = 9", output: "4", explanation: "9 exists at index 4." },
        parameters: [{ name: "nums", type: "int[]" }, { name: "target", type: "int" }],
        returns: "int: Index of target or -1",
        constraints: ["1 <= nums.length <= 10^4", "All elements in nums are strictly increasing."],
        inputFormat: "Sorted array nums and integer target.",
        outputFormat: "Integer index or -1.",
        pythonParams: "nums: list[int], target: int",
        jsParams: "nums, target",
        tsParams: "nums: number[], target: number",
        tsReturn: "number",
        javaSig: "public static int binarySearch(int[] nums, int target)",
        javaReturnStub: "-1",
        cppSig: "int binarySearch(vector<int> nums, int target)",
        cppReturnStub: "-1",
        testCases: [
          { id: 0, input: "[-1, 0, 3, 5, 9, 12], 9", expectedOutput: "4" },
          { id: 1, input: "[-1, 0, 3, 5, 9, 12], 2", expectedOutput: "-1" },
          { id: 2, input: "[5], 5", expectedOutput: "0", isHidden: true },
        ],
      },
    ],
    trees: [
      {
        functionName: "isValidBstInorder",
        problemStatement: "Given an array `inorder` produced by an inorder traversal of a binary tree, verify whether it satisfies the strict Binary Search Tree (BST) invariant (`a < b` for every adjacent pair).",
        example: { input: "inorder = [2, 5, 7, 10, 14]", output: "true", explanation: "Every element is strictly greater than the previous one." },
        parameters: [{ name: "inorder", type: "int[]" }],
        returns: "boolean: true if strictly increasing BST traversal",
        constraints: ["0 <= inorder.length <= 10^4"],
        inputFormat: "Array of integers representing inorder traversal.",
        outputFormat: "Boolean true or false.",
        pythonParams: "inorder: list[int]",
        jsParams: "inorder",
        tsParams: "inorder: number[]",
        tsReturn: "boolean",
        javaSig: "public static boolean isValidBstInorder(int[] inorder)",
        javaReturnStub: "false",
        cppSig: "bool isValidBstInorder(vector<int> inorder)",
        cppReturnStub: "false",
        testCases: [
          { id: 0, input: "[2, 5, 7, 10, 14]", expectedOutput: "true" },
          { id: 1, input: "[5, 1, 4, 3, 6]", expectedOutput: "false" },
          { id: 2, input: "[4, 4, 8]", expectedOutput: "false", isHidden: true },
        ],
      },
    ],
    algorithms: [
      {
        functionName: "countConnectedComponents",
        problemStatement: "Given `n` vertices (0 to n-1) and a list of undirected `edges`, return the number of connected components in the graph using BFS or DFS traversal.",
        example: { input: "n = 5, edges = [[0, 1], [1, 2], [3, 4]]", output: "2", explanation: "Component {0,1,2} and Component {3,4}." },
        parameters: [{ name: "n", type: "int" }, { name: "edges", type: "int[][]" }],
        returns: "int: Total connected components",
        constraints: ["1 <= n <= 2000"],
        inputFormat: "Integer n and array of edge pairs edges.",
        outputFormat: "Integer count of components.",
        pythonParams: "n: int, edges: list[list[int]]",
        jsParams: "n, edges",
        tsParams: "n: number, edges: number[][]",
        tsReturn: "number",
        javaSig: "public static int countConnectedComponents(int n, int[][] edges)",
        javaReturnStub: "0",
        cppSig: "int countConnectedComponents(int n, vector<vector<int>> edges)",
        cppReturnStub: "0",
        testCases: [
          { id: 0, input: "5, [[0, 1], [1, 2], [3, 4]]", expectedOutput: "2" },
          { id: 1, input: "4, [[0, 1], [1, 2], [2, 3]]", expectedOutput: "1" },
          { id: 2, input: "3, []", expectedOutput: "3", isHidden: true },
        ],
      },
    ],
    "dynamic programming": [
      {
        functionName: "climbStairs",
        problemStatement: "You are climbing a staircase that takes `n` steps to reach the top. Each time you can either climb `1` or `2` steps. Compute in how many distinct ways you can reach the top.",
        example: { input: "n = 3", output: "3", explanation: "Three paths: (1+1+1), (1+2), and (2+1)." },
        parameters: [{ name: "n", type: "int" }],
        returns: "int: Distinct ways to reach step n",
        constraints: ["1 <= n <= 45"],
        inputFormat: "Positive integer n.",
        outputFormat: "Integer number of ways.",
        pythonParams: "n: int",
        jsParams: "n",
        tsParams: "n: number",
        tsReturn: "number",
        javaSig: "public static int climbStairs(int n)",
        javaReturnStub: "0",
        cppSig: "int climbStairs(int n)",
        cppReturnStub: "0",
        testCases: [
          { id: 0, input: "3", expectedOutput: "3" },
          { id: 1, input: "5", expectedOutput: "8" },
          { id: 2, input: "1", expectedOutput: "1", isHidden: true },
          { id: 3, input: "6", expectedOutput: "13", isHidden: true },
        ],
      },
    ],
  };

  const bank = CONCEPT_SPECS[concept] || CONCEPT_SPECS.arrays;
  const spec = bank[(levelNum + puzzleIndex) % bank.length];
  const pyName = spec.functionName.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");

  return {
    functionName: spec.functionName,
    problemStatement: `**${themeItem.title} (${variationName})**\n\n${spec.problemStatement}`,
    example: spec.example,
    functionDescription: {
      name: spec.functionName,
      parameters: spec.parameters,
      returns: spec.returns,
    },
    constraints: spec.constraints,
    inputFormat: spec.inputFormat,
    outputFormat: spec.outputFormat,
    starterBoilerplate: {
      python: `def ${pyName}(${spec.pythonParams}):
    # Complete '${spec.functionName}' for ${themeItem.title}
    # Hint: ${themeItem.snippetIdea}
    pass
`,
      javascript: `/**
 * Complete '${spec.functionName}' for ${themeItem.title}
 */
function ${spec.functionName}(${spec.jsParams}) {
    // Write your solution here
    
}
`,
      typescript: `function ${spec.functionName}(${spec.tsParams}): ${spec.tsReturn} {
    // Write your solution here
    return ${spec.javaReturnStub === "nums" ? "nums" : spec.javaReturnStub};
}
`,
      java: `import java.util.*;

class Solution {
    ${spec.javaSig} {
        // Write your solution here
        return ${spec.javaReturnStub};
    }
}
`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

${spec.cppSig} {
    // Write your solution here
    return ${spec.cppReturnStub};
}
`,
    },
    testCases: spec.testCases,
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
