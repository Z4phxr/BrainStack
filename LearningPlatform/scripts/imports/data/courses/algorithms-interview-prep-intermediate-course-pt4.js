module.exports = {
    subject: {
      name: 'Algorithms & Data Structures',
      slug: 'algorithms-data-structures'
    },
  
    course: {
      title: 'Mastering Algorithms & Data Structures for Coding Interviews (Intermediate Deep Dive)',
      slug: 'algorithms-interview-prep-intermediate',
      description: 'A deep-dive interview preparation course covering algorithms, data structures, and dynamic programming using Python. Designed for intermediate learners aiming to pass technical coding interviews.',
      level: 'INTERMEDIATE',
      isPublished: false
    },
  
    modules: [
  
      // =========================
      // MODULE 7
      // =========================
      {
        title: 'Module 7: Dynamic Programming (Deep Dive)',
        order: 7,
        isPublished: false,
  
        lessons: [
  
          // =========================
          // LESSON 7.1
          // =========================
          {
            title: 'Lesson 7.1: What is Dynamic Programming?',
            order: 1,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Dynamic Programming (DP) is a powerful optimization technique used to solve problems by breaking them into overlapping subproblems. Instead of recomputing the same results multiple times, DP stores intermediate results and reuses them.'
              },
              {
                blockType: 'text',
                content: 'The key idea behind DP is **memoization** (top-down caching) or **tabulation** (bottom-up building). Both approaches aim to eliminate redundant computations and improve efficiency.'
              },
              {
                blockType: 'text',
                content: 'DP is typically used in optimization problems where a brute-force recursive solution exists but is too slow due to repeated calculations.'
              },
              {
                blockType: 'text',
                content: 'A classic example is Fibonacci numbers, where naive recursion recomputes values multiple times, leading to exponential time complexity.'
              },
              {
                blockType: 'math',
                latex: 'F(n) = F(n-1) + F(n-2)',
                displayMode: true
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Recursion tree for Fibonacci showing repeated overlapping subproblems highlighted in red, demonstrating inefficiency without DP.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'warning',
                title: 'Key Insight',
                content: 'If you see repeated calculations in recursion, DP is usually the solution.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is the main purpose of dynamic programming?',
                tagSlugs: ['dynamic-programming'],
                choices: [
                  'To sort data faster',
                  'To eliminate redundant computations',
                  'To replace recursion completely',
                  'To reduce memory usage only'
                ],
                correctAnswer: 'To eliminate redundant computations',
                solution: 'DP stores intermediate results to avoid recalculating the same subproblems.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 7.2
          // =========================
          {
            title: 'Lesson 7.2: Memoization vs Tabulation',
            order: 2,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Memoization is a top-down dynamic programming approach where we solve the problem recursively and store results of subproblems in a cache (usually a dictionary).'
              },
              {
                blockType: 'text',
                content: 'Tabulation is a bottom-up approach where we build solutions iteratively from the smallest subproblems up to the final answer using a table or array.'
              },
              {
                blockType: 'text',
                content: 'Both approaches achieve the same goal, but memoization is often easier to implement first, while tabulation is usually more efficient in practice.'
              },
              {
                blockType: 'text',
                content: 'Choosing between them depends on the problem structure and whether recursion is more natural to express.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Side-by-side comparison of memoization (top-down recursion tree with caching) vs tabulation (bottom-up table filling).',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'info',
                title: 'Interview Tip',
                content: 'Start with recursion, then optimize with memoization — this is the fastest way to solve DP problems in interviews.'
              }
            ],
  
            tasks: [
              {
                type: 'TRUE_FALSE',
                order: 1,
                prompt: 'Memoization is a bottom-up approach.',
                tagSlugs: ['dynamic-programming'],
                correctAnswer: 'false',
                solution: 'False. Memoization is a top-down approach using recursion with caching.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 7.3
          // =========================
          {
            title: 'Lesson 7.3: Classic DP Problems',
            order: 3,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Classic dynamic programming problems include Fibonacci sequence, knapsack problem, coin change, and longest common subsequence. These problems appear frequently in technical interviews.'
              },
              {
                blockType: 'text',
                content: 'Each DP problem has three key components: state definition, transition relation, and base cases. Understanding these components is essential to solving DP problems correctly.'
              },
              {
                blockType: 'text',
                content: 'For example, in the knapsack problem, the state represents the maximum value achievable with a given weight capacity and set of items.'
              },
              {
                blockType: 'text',
                content: 'DP problems often look complex at first, but they become manageable once broken into smaller subproblems.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Knapsack DP table showing items vs weight capacity grid being filled step by step.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'tip',
                title: 'Pattern Recognition',
                content: 'If a problem asks for "maximum/minimum ways" or "optimal substructure", it is likely a DP problem.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What are the three key components of a DP problem?',
                tagSlugs: ['dynamic-programming'],
                choices: [
                  'Sorting, searching, recursion',
                  'State, transition, base case',
                  'Input, output, loop',
                  'Array, stack, queue'
                ],
                correctAnswer: 'State, transition, base case',
                solution: 'Every DP problem is defined by these three components.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 7.4
          // =========================
          {
            title: 'Lesson 7.4: Grid DP & Path Problems',
            order: 4,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Grid-based DP problems involve navigating a matrix to find optimal paths, such as minimum cost or number of ways to reach a destination.'
              },
              {
                blockType: 'text',
                content: 'These problems often use a 2D DP table where each cell represents the best result up to that point in the grid.'
              },
              {
                blockType: 'text',
                content: 'Typical movements are restricted to right and down, simplifying the state transitions.'
              },
              {
                blockType: 'text',
                content: 'Grid DP is a great introduction to multi-dimensional dynamic programming problems.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Grid showing DP path from top-left to bottom-right with arrows indicating allowed movements (right and down).',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'math',
                latex: 'dp[i][j] = dp[i-1][j] + dp[i][j-1]',
                displayMode: true
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is commonly used to solve grid DP problems?',
                tagSlugs: ['dynamic-programming'],
                choices: [
                  'Stacks',
                  '2D arrays',
                  'Linked lists',
                  'Binary trees'
                ],
                correctAnswer: '2D arrays',
                solution: 'Grid DP uses a 2D table to store intermediate results.',
                points: 1,
                isPublished: false
              }
            ]
          }
        ]
      },
  
      // =========================
      // MODULE 8
      // =========================
      {
        title: 'Module 8: Interview Problem-Solving Patterns',
        order: 8,
        isPublished: false,
  
        lessons: [
  
          // =========================
          // LESSON 8.1
          // =========================
          {
            title: 'Lesson 8.1: Sliding Window Pattern',
            order: 1,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'The sliding window pattern is used to efficiently solve problems involving contiguous subarrays or substrings. Instead of recalculating results for every possible window, we maintain a moving window that updates incrementally.'
              },
              {
                blockType: 'text',
                content: 'This technique reduces time complexity from O(n^2) to O(n) in many cases by avoiding redundant computations.'
              },
              {
                blockType: 'text',
                content: 'There are two main types: fixed-size windows and variable-size windows depending on problem constraints.'
              },
              {
                blockType: 'text',
                content: 'Sliding window is commonly used in problems like maximum sum subarray and longest substring without repeating characters.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Array visualization showing a sliding window moving across elements while maintaining a running sum.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'tip',
                title: 'Interview Tip',
                content: 'If a problem involves "subarray" or "substring", consider sliding window first.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is the main advantage of sliding window?',
                tagSlugs: ['problem-solving-patterns'],
                choices: [
                  'It sorts data faster',
                  'It reduces redundant computations',
                  'It uses recursion',
                  'It replaces arrays'
                ],
                correctAnswer: 'It reduces redundant computations',
                solution: 'Sliding window avoids recomputing overlapping subproblems.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 8.2
          // =========================
          {
            title: 'Lesson 8.2: Two Pointers Technique',
            order: 2,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'The two pointers technique uses two indices moving through a data structure to solve problems efficiently, often reducing O(n^2) solutions to O(n).'
              },
              {
                blockType: 'text',
                content: 'This pattern is especially useful in sorted arrays, where pointers can move inward or outward depending on conditions.'
              },
              {
                blockType: 'text',
                content: 'Typical problems include pair sums, reversing arrays, and partitioning problems.'
              },
              {
                blockType: 'text',
                content: 'The key idea is that both pointers work together instead of independently scanning the structure.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Array with two pointers moving from both ends toward the center to find a target sum.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'info',
                title: 'Key Insight',
                content: 'Sorted data + pair condition → think two pointers immediately.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What type of data is most suitable for two pointers?',
                tagSlugs: ['problem-solving-patterns'],
                choices: [
                  'Unsorted linked lists',
                  'Sorted arrays',
                  'Graphs',
                  'Stacks'
                ],
                correctAnswer: 'Sorted arrays',
                solution: 'Two pointers work best when order allows directional movement.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 8.3
          // =========================
          {
            title: 'Lesson 8.3: Prefix Sum Pattern',
            order: 3,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Prefix sum is a technique used to preprocess an array so that range sum queries can be answered in constant time. It transforms repeated O(n) queries into O(1) lookups after O(n) preprocessing.'
              },
              {
                blockType: 'text',
                content: 'The idea is to store cumulative sums so that any subarray sum can be computed using subtraction of two prefix values.'
              },
              {
                blockType: 'text',
                content: 'Prefix sums are widely used in range query problems and frequency analysis.'
              },
              {
                blockType: 'text',
                content: 'This pattern is essential for optimizing brute-force range calculations.'
              },
              {
                blockType: 'math',
                latex: 'prefix[j] - prefix[i]',
                displayMode: true
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Array with prefix sum values shown above each index, demonstrating how range sum is computed using subtraction.',
                align: 'center',
                width: 'md'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is the benefit of prefix sums?',
                tagSlugs: ['problem-solving-patterns'],
                choices: [
                  'Faster sorting',
                  'Constant-time range queries after preprocessing',
                  'Better recursion',
                  'Reduced memory usage always'
                ],
                correctAnswer: 'Constant-time range queries after preprocessing',
                solution: 'Prefix sums allow O(1) range sum queries after O(n) setup.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 8.4
          // =========================
          {
            title: 'Lesson 8.4: Divide & Conquer Thinking',
            order: 4,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Divide and conquer is a problem-solving strategy where a problem is broken into smaller subproblems, solved independently, and then combined to form the final solution.'
              },
              {
                blockType: 'text',
                content: 'This strategy is the foundation of algorithms like merge sort and quick sort.'
              },
              {
                blockType: 'text',
                content: 'It is especially powerful when subproblems are independent and can be solved recursively.'
              },
              {
                blockType: 'text',
                content: 'Recognizing divide and conquer structure is a key interview skill.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Tree diagram showing problem split into subproblems, recursive solving, and merging results.',
                align: 'center',
                width: 'md'
              }
            ],
  
            tasks: [
              {
                type: 'TRUE_FALSE',
                order: 1,
                prompt: 'Divide and conquer always requires recursion.',
                tagSlugs: ['problem-solving-patterns'],
                correctAnswer: 'true',
                solution: 'True. It is typically implemented using recursion.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 8.5
          // =========================
          {
            title: 'Lesson 8.5: Pattern Recognition Mastery',
            order: 5,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'The final and most important skill in coding interviews is pattern recognition. Most interview problems are variations of a small set of core patterns like sliding window, two pointers, binary search, and dynamic programming.'
              },
              {
                blockType: 'text',
                content: 'Instead of solving each problem from scratch, experienced candidates recognize patterns and map problems to known solution strategies.'
              },
              {
                blockType: 'text',
                content: 'This reduces cognitive load and dramatically improves problem-solving speed during interviews.'
              },
              {
                blockType: 'text',
                content: 'Mastering patterns is what separates junior developers from strong interview performers.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Mind map connecting problem types (arrays, strings, graphs, DP) to common patterns like sliding window, BFS, recursion, and DP.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'success',
                title: 'Final Insight',
                content: 'If you recognize the pattern, you already have 70% of the solution in an interview.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is the most important skill in coding interviews?',
                tagSlugs: ['interview-prep'],
                choices: [
                  'Memorizing code',
                  'Pattern recognition',
                  'Typing speed',
                  'Using libraries'
                ],
                correctAnswer: 'Pattern recognition',
                solution: 'Most interview problems map to known algorithmic patterns.',
                points: 1,
                isPublished: false
              }
            ]
          }
        ]
      }
    ]
  };