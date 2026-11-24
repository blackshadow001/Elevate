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

export interface ChessCodePuzzle {
  id: string;
  levelNumber: number;
  puzzleIndex: number; // 1 to 6
  title: string;
  concept: ConceptTag;
  theme: string;
  elo: number;
  prompt: string;
  codeContext: string; // The code "board" with the missing move or bug
  expectedLine: string; // The winning tactical line
  acceptedAlternatives: string[];
  options: string[]; // 4 tactical choices like choosing the winning chess move
  hint: string;
  analysis: string; // Chess-style move analysis explaining why this is the only winning move
  language: "python" | "javascript";
}

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
      { title: "Chess Knight Probability on Board", theme: "State Transition", snippetIdea: "new_board[nr][nc] += board[r][c] / 8.0" },
    ],
  },
];

// Helper to generate 5-7 similarity-based puzzles per level with 4 tactical choices like Chess.com
function generateLevelPuzzles(levelNum: number, themeItem: { title: string; theme: string; snippetIdea: string }, concept: ConceptTag, elo: number): ChessCodePuzzle[] {
  const puzzles: ChessCodePuzzle[] = [];
  const puzzleCount = 6; // 6 puzzles per level = 600 similarity-based puzzles across all 100 levels!

  const variations = [
    {
      name: "The Opening Check",
      desc: "Identify the vital foundation line to initiate the tactical solution.",
      promptSnippet: "Find the winning opening line:",
      distractorType: "syntax",
    },
    {
      name: "The Middle Fork",
      desc: "Choose the correct state update when two branches converge.",
      promptSnippet: "Find the optimal tactical update:",
      distractorType: "boundary",
    },
    {
      name: "The Endgame Defense",
      desc: "Neutralize edge cases (empty collections, single nodes, 0 division).",
      promptSnippet: "Find the winning boundary defense move:",
      distractorType: "offByOne",
    },
    {
      name: "The Counter-Tactic",
      desc: "Reverse the operation or track inverse complements.",
      promptSnippet: "Select the winning counter-tactic move:",
      distractorType: "inverted",
    },
    {
      name: "The Speed Advantage",
      desc: "Execute the O(1) or O(log N) transition without redundant overhead.",
      promptSnippet: "Select the highest efficiency tactical move:",
      distractorType: "quadratic",
    },
    {
      name: "The Checkmate Move",
      desc: "Synthesize the complete algorithm step to lock in the victory.",
      promptSnippet: "Find the finishing line to complete the level:",
      distractorType: "incomplete",
    },
  ];

  for (let i = 0; i < puzzleCount; i++) {
    const v = variations[i];
    const puzzleElo = elo + (i * 15);
    const puzzleId = `puzzle-lvl${levelNum}-p${i + 1}`;

    const winningMove = themeItem.snippetIdea;
    const optionA = winningMove;
    const optionB = winningMove.replace(/<=/g, "<").replace(/\+=/g, "-=").replace(/left/g, "right");
    const optionC = winningMove.replace(/\+ 1/g, "+ 2").replace(/==/g, "!=").replace(/min/g, "max");
    const optionD = winningMove.replace(/\[i\]/g, "[i + 1]").replace(/append/g, "extend");

    // Shuffle options deterministically
    const options = [optionA, optionB, optionC, optionD].sort((a, b) => a.localeCompare(b));

    puzzles.push({
      id: puzzleId,
      levelNumber: levelNum,
      puzzleIndex: i + 1,
      title: `${themeItem.title} · ${v.name}`,
      concept,
      theme: themeItem.theme,
      elo: puzzleElo,
      prompt: `${themeItem.title} (${v.name})\n${v.desc}\n\n👉 Your move: ${v.promptSnippet}`,
      codeContext: `# [Level ${levelNum} · Puzzle ${i + 1}/6 · Rating ${puzzleElo}]
# Concept: ${concept.toUpperCase()} — Theme: ${themeItem.theme}
def execute_tactical_step(input_data):
    # Analyzing tactical scenario...
    # [YOUR WINNING MOVE GOES HERE]
    pass
`,
      expectedLine: winningMove,
      acceptedAlternatives: [winningMove, winningMove.replace(/;\s*/g, "\n    ")],
      options,
      hint: `💡 Invariant: Notice the ${themeItem.theme} property. Focus on preserving invariants without off-by-one errors.`,
      analysis: `♟️ Tactical Analysis: The move '${winningMove}' is the only line that guarantees correctness. Any deviation alters loop termination or violates node invariants, leading to runtime error.`,
      language: "python",
    });
  }

  return puzzles;
}

// Generate the complete 100-Level Chess.com style Curriculum
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
      description: `Solve 6 similarity-based ${chapter.concept} tactical puzzles on ${themeItem.theme}. Earn 3 stars to unlock Level ${lvl + 1}.`,
      puzzleCount: puzzles.length,
      puzzles,
    });
  }

  return levels;
}

// User Progress in Chess Puzzles
export interface ChessPuzzleUserState {
  currentLevel: number;
  unlockedLevels: number[];
  rating: number; // e.g. starts at 800
  streak: number;
  bestStreak: number;
  solvedPuzzlesCount: number;
  starsMap: Record<number, number>; // levelNumber -> stars (1, 2, or 3)
  completedPuzzles: Record<string, boolean>; // puzzleId -> true
}

export const INITIAL_USER_CHESS_STATE: ChessPuzzleUserState = {
  currentLevel: 1,
  unlockedLevels: [1],
  rating: 800,
  streak: 0,
  bestStreak: 0,
  solvedPuzzlesCount: 0,
  starsMap: {},
  completedPuzzles: {},
};
