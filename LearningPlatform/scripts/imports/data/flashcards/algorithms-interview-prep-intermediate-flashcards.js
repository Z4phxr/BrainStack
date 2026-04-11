module.exports = [
    {
      question: 'What is Big O notation used for?',
      answer: 'Big O notation describes how an algorithm’s runtime or space requirements grow as input size increases. It focuses on worst-case performance and helps compare algorithm efficiency independently of hardware.',
      tagSlugs: ['big-o', 'complexity', 'interview-prep']
    },
    {
      question: 'What is O(1) time complexity?',
      answer: 'O(1) means constant time complexity where execution time does not change regardless of input size. Example: accessing an element in an array by index.',
      tagSlugs: ['big-o', 'complexity']
    },
    {
      question: 'What is O(n) time complexity?',
      answer: 'O(n) means linear time complexity where runtime grows proportionally with input size. Example: looping through an array once.',
      tagSlugs: ['big-o', 'complexity']
    },
    {
      question: 'What is binary search?',
      answer: 'Binary search is an algorithm that finds an element in a sorted array by repeatedly dividing the search range in half, achieving O(log n) time complexity.',
      tagSlugs: ['binary-search', 'algorithms']
    },
    {
      question: 'Why must binary search be used on sorted data?',
      answer: 'Binary search relies on ordering to eliminate half of the search space each step. Without sorting, the algorithm cannot determine which half to discard.',
      tagSlugs: ['binary-search']
    },
    {
      question: 'What is O(log n) complexity?',
      answer: 'O(log n) means logarithmic complexity where the problem size is reduced by a constant factor each step, such as in binary search.',
      tagSlugs: ['big-o']
    },
    {
      question: 'What is a hash map?',
      answer: 'A hash map is a data structure that stores key-value pairs and provides average O(1) lookup, insertion, and deletion using a hash function.',
      tagSlugs: ['hashmap', 'data-structures']
    },
    {
      question: 'Why are hash maps useful in interviews?',
      answer: 'Hash maps allow fast lookups and are often used to optimize brute-force solutions, especially in problems involving frequency counting or pair matching.',
      tagSlugs: ['hashmap', 'interview-prep']
    },
    {
      question: 'What is a stack?',
      answer: 'A stack is a LIFO (Last In, First Out) data structure where elements are added and removed from the top.',
      tagSlugs: ['stack', 'data-structures']
    },
    {
      question: 'What is a queue?',
      answer: 'A queue is a FIFO (First In, First Out) data structure where elements are added at the rear and removed from the front.',
      tagSlugs: ['queue', 'data-structures']
    },
    {
      question: 'What is recursion?',
      answer: 'Recursion is a technique where a function calls itself to solve smaller subproblems until reaching a base case.',
      tagSlugs: ['recursion', 'algorithms']
    },
    {
      question: 'What is a base case in recursion?',
      answer: 'A base case is the condition that stops recursive calls and prevents infinite recursion.',
      tagSlugs: ['recursion']
    },
    {
      question: 'What is merge sort time complexity?',
      answer: 'Merge sort has O(n log n) time complexity due to dividing the array and merging sorted halves.',
      tagSlugs: ['sorting', 'algorithms']
    },
    {
      question: 'What is quicksort average time complexity?',
      answer: 'Quicksort has average O(n log n) time complexity but worst-case O(n^2) if pivot selection is poor.',
      tagSlugs: ['sorting']
    },
    {
      question: 'What is a linked list?',
      answer: 'A linked list is a linear data structure where each element (node) points to the next node in sequence.',
      tagSlugs: ['linked-list', 'data-structures']
    },
    {
      question: 'What is BFS?',
      answer: 'Breadth-first search (BFS) is a graph traversal algorithm that explores nodes level by level using a queue.',
      tagSlugs: ['graphs', 'bfs']
    },
    {
      question: 'What is DFS?',
      answer: 'Depth-first search (DFS) explores as far as possible along a branch before backtracking, often implemented using recursion or a stack.',
      tagSlugs: ['graphs', 'dfs']
    },
    {
      question: 'What is dynamic programming?',
      answer: 'Dynamic programming is an optimization technique that solves problems by breaking them into overlapping subproblems and storing results to avoid recomputation.',
      tagSlugs: ['dynamic-programming']
    },
    {
      question: 'What is memoization?',
      answer: 'Memoization is a top-down DP technique where recursive results are cached to avoid redundant calculations.',
      tagSlugs: ['dynamic-programming']
    },
    {
      question: 'What is tabulation?',
      answer: 'Tabulation is a bottom-up DP approach where solutions are built iteratively using a table.',
      tagSlugs: ['dynamic-programming']
    },
    {
      question: 'What is sliding window technique?',
      answer: 'Sliding window is a technique used to process subarrays or substrings efficiently by maintaining a moving window over data.',
      tagSlugs: ['sliding-window']
    },
    {
      question: 'What is two pointers technique?',
      answer: 'Two pointers is an algorithmic technique where two indices move through a structure to solve problems efficiently.',
      tagSlugs: ['two-pointers']
    },
    {
      question: 'What is prefix sum?',
      answer: 'Prefix sum is a technique where cumulative sums are precomputed to answer range sum queries in O(1) time.',
      tagSlugs: ['prefix-sum']
    },
    {
      question: 'What is divide and conquer?',
      answer: 'Divide and conquer is a strategy where a problem is split into smaller subproblems, solved independently, and combined.',
      tagSlugs: ['divide-and-conquer']
    },
    {
      question: 'Why is O(n^2) considered slow?',
      answer: 'O(n^2) algorithms scale poorly because runtime grows quadratically with input size, making them inefficient for large datasets.',
      tagSlugs: ['big-o']
    },
  
    // filler conceptual cards to reach ~50
    {
      question: 'What is a tree in data structures?',
      answer: 'A tree is a hierarchical structure with nodes connected by edges, starting from a root node and branching into child nodes.',
      tagSlugs: ['trees', 'data-structures']
    },
    {
      question: 'What is a binary tree?',
      answer: 'A binary tree is a tree where each node has at most two children: left and right.',
      tagSlugs: ['trees']
    },
    {
      question: 'What is a heap?',
      answer: 'A heap is a special tree-based structure that satisfies heap property, used in priority queues.',
      tagSlugs: ['heap', 'data-structures']
    },
    {
      question: 'What is a priority queue?',
      answer: 'A priority queue is a data structure where elements are served based on priority rather than insertion order.',
      tagSlugs: ['heap', 'data-structures']
    },
    {
      question: 'What is space complexity?',
      answer: 'Space complexity measures how much memory an algorithm uses relative to input size.',
      tagSlugs: ['big-o']
    },
    {
      question: 'What is backtracking?',
      answer: 'Backtracking is a technique for solving problems by trying possible solutions and abandoning invalid paths.',
      tagSlugs: ['backtracking']
    },
    {
      question: 'What is greedy algorithm?',
      answer: 'A greedy algorithm makes the locally optimal choice at each step hoping it leads to a global optimum.',
      tagSlugs: ['greedy']
    },
    {
      question: 'What is amortized complexity?',
      answer: 'Amortized complexity averages the cost of operations over a sequence of operations, smoothing out expensive steps.',
      tagSlugs: ['big-o']
    },
    {
      question: 'What is adjacency list?',
      answer: 'An adjacency list is a graph representation where each node stores a list of its neighbors.',
      tagSlugs: ['graphs']
    },
    {
      question: 'What is adjacency matrix?',
      answer: 'An adjacency matrix is a 2D array representing graph connections, where rows and columns indicate edges.',
      tagSlugs: ['graphs']
    },
    {
      question: 'What is cycle detection?',
      answer: 'Cycle detection is the process of identifying whether a graph contains a loop.',
      tagSlugs: ['graphs']
    },
    {
      question: 'What is Dijkstra’s algorithm used for?',
      answer: 'Dijkstra’s algorithm finds the shortest path from a source node to all other nodes in a weighted graph.',
      tagSlugs: ['graphs']
    },
    {
      question: 'What is greedy choice property?',
      answer: 'It means a locally optimal choice leads to a globally optimal solution in greedy algorithms.',
      tagSlugs: ['greedy']
    },
    {
      question: 'What is optimal substructure?',
      answer: 'Optimal substructure means an optimal solution can be built from optimal solutions of subproblems.',
      tagSlugs: ['dynamic-programming']
    },
    {
      question: 'What is overlapping subproblems?',
      answer: 'Overlapping subproblems occur when the same subproblems are solved multiple times in recursion.',
      tagSlugs: ['dynamic-programming']
    },
    {
      question: 'What is time complexity?',
      answer: 'Time complexity measures how runtime increases with input size.',
      tagSlugs: ['big-o']
    },
    {
      question: 'What is a brute force approach?',
      answer: 'Brute force tries all possible solutions without optimization.',
      tagSlugs: ['algorithms']
    }
  ];