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
      // MODULE 5
      // =========================
      {
        title: 'Module 5: Recursion & Backtracking',
        order: 5,
        isPublished: false,
  
        lessons: [
  
          // =========================
          // LESSON 5.1
          // =========================
          {
            title: 'Lesson 5.1: Recursion Fundamentals',
            order: 1,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Recursion is a technique where a function calls itself to solve a smaller version of the same problem. Instead of solving the entire problem at once, recursion breaks it down into smaller subproblems until reaching a base case that can be solved directly.'
              },
              {
                blockType: 'text',
                content: 'Every recursive function has two key components: a **base case**, which stops the recursion, and a **recursive case**, which reduces the problem size. Without a base case, recursion would continue indefinitely and crash the program.'
              },
              {
                blockType: 'text',
                content: 'Recursion is closely tied to the call stack. Each function call is stored in memory until it completes. This is why deep recursion can lead to stack overflow errors in some cases.'
              },
              {
                blockType: 'text',
                content: 'A simple example is factorial calculation: n! = n × (n-1)!. Each call depends on the next smaller value until reaching 1.'
              },
              {
                blockType: 'math',
                latex: 'n! = n \\cdot (n-1)!',
                displayMode: true
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Call stack visualization of recursive factorial function showing stacked function calls for n=4 down to base case n=1.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'warning',
                title: 'Common Mistake',
                content: 'Many beginners forget the base case, causing infinite recursion and runtime crashes.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is required for every recursive function?',
                tagSlugs: ['recursion'],
                choices: [
                  'A loop',
                  'A base case',
                  'A dictionary',
                  'A sorted array'
                ],
                correctAnswer: 'A base case',
                solution: 'The base case stops recursion and prevents infinite calls.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 5.2
          // =========================
          {
            title: 'Lesson 5.2: Call Stack Visualization',
            order: 2,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'The call stack is a data structure used by the system to manage function calls. Each time a function is called, a new frame is pushed onto the stack. When the function returns, the frame is popped off.'
              },
              {
                blockType: 'text',
                content: 'In recursion, multiple function calls are active at the same time, each waiting for the next one to complete. This creates a chain of deferred computations.'
              },
              {
                blockType: 'text',
                content: 'Understanding the call stack is essential for debugging recursion problems because it helps you visualize how values are passed and returned.'
              },
              {
                blockType: 'text',
                content: 'For example, in a recursive sum function, each call waits for the result of the next smaller call before completing its own computation.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Stack diagram showing recursive function calls being pushed and popped in order, illustrating LIFO behavior of call stack.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'info',
                title: 'Key Insight',
                content: 'If you can draw the call stack manually, you can solve most recursion interview problems.'
              }
            ],
  
            tasks: [
              {
                type: 'TRUE_FALSE',
                order: 1,
                prompt: 'The call stack follows FIFO order.',
                tagSlugs: ['recursion'],
                correctAnswer: 'false',
                solution: 'False. The call stack follows LIFO (Last In, First Out).',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 5.3
          // =========================
          {
            title: 'Lesson 5.3: Backtracking Patterns',
            order: 3,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Backtracking is an advanced form of recursion used to explore all possible solutions to a problem. It builds solutions incrementally and abandons paths that do not lead to valid results.'
              },
              {
                blockType: 'text',
                content: 'The core idea is: try a choice, explore recursively, then undo the choice (backtrack) and try another path. This allows systematic exploration of all possibilities.'
              },
              {
                blockType: 'text',
                content: 'Backtracking is commonly used in problems like permutations, subsets, combinations, and constraint satisfaction problems such as Sudoku.'
              },
              {
                blockType: 'text',
                content: 'Although backtracking can be exponential in complexity, it is often optimized using pruning techniques to eliminate invalid paths early.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Decision tree diagram showing backtracking exploration of subsets, with branches being explored and pruned.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'tip',
                title: 'Interview Pattern',
                content: 'If a problem asks for "all possible combinations or permutations", backtracking is almost always the correct approach.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is backtracking mainly used for?',
                tagSlugs: ['recursion'],
                choices: [
                  'Sorting arrays',
                  'Finding shortest paths only',
                  'Exploring all possible solutions',
                  'Replacing loops'
                ],
                correctAnswer: 'Exploring all possible solutions',
                solution: 'Backtracking explores all valid possibilities systematically.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 5.4
          // =========================
          {
            title: 'Lesson 5.4: Pruning Strategies',
            order: 4,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Pruning is an optimization technique used in backtracking to eliminate branches that cannot lead to a valid solution. This reduces the number of recursive calls significantly.'
              },
              {
                blockType: 'text',
                content: 'Instead of exploring every possible path, we check conditions early. If a path violates constraints, we stop exploring it immediately.'
              },
              {
                blockType: 'text',
                content: 'Pruning is essential in solving large combinatorial problems where the number of possibilities grows exponentially.'
              },
              {
                blockType: 'text',
                content: 'For example, in a subset sum problem, if the current sum already exceeds the target, we can stop exploring that branch.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Backtracking tree showing pruned branches marked in red where invalid paths are cut early.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'success',
                title: 'Optimization Insight',
                content: 'Good pruning can turn an exponential solution into something practical for real interview constraints.'
              }
            ],
  
            tasks: [
              {
                type: 'TRUE_FALSE',
                order: 1,
                prompt: 'Pruning increases the number of recursive calls.',
                tagSlugs: ['recursion'],
                correctAnswer: 'false',
                solution: 'False. Pruning reduces the number of recursive calls.',
                points: 1,
                isPublished: false
              }
            ]
          }
        ]
      },
  
      // =========================
      // MODULE 6
      // =========================
      {
        title: 'Module 6: Trees & Graphs',
        order: 6,
        isPublished: false,
  
        lessons: [
  
          // =========================
          // LESSON 6.1
          // =========================
          {
            title: 'Lesson 6.1: Tree Basics & Traversals',
            order: 1,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'A tree is a hierarchical data structure consisting of nodes connected by edges. Each tree has a root node, and every node can have child nodes. Trees are widely used in computer science for representing hierarchical relationships.'
              },
              {
                blockType: 'text',
                content: 'The most common type is a binary tree, where each node has at most two children: left and right. Binary trees are the foundation for many advanced data structures like binary search trees and heaps.'
              },
              {
                blockType: 'text',
                content: 'Tree traversal is the process of visiting all nodes in a specific order. The three main traversal types are preorder, inorder, and postorder.'
              },
              {
                blockType: 'text',
                content: 'These traversals can be implemented using recursion or iterative approaches using stacks.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Binary tree diagram showing root, left and right children, with traversal paths highlighted for preorder, inorder, and postorder.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'info',
                title: 'Key Insight',
                content: 'Most tree problems in interviews can be solved using DFS recursion patterns.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is the maximum number of children in a binary tree node?',
                tagSlugs: ['data-structures', 'graphs'],
                choices: [
                  '1',
                  '2',
                  '3',
                  'Unlimited'
                ],
                correctAnswer: '2',
                solution: 'Binary trees allow at most two children per node.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 6.2
          // =========================
          {
            title: 'Lesson 6.2: Binary Search Trees (BST)',
            order: 2,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'A Binary Search Tree (BST) is a special type of binary tree where the left subtree contains values smaller than the root, and the right subtree contains values greater than the root.'
              },
              {
                blockType: 'text',
                content: 'This property allows efficient searching, insertion, and deletion operations, typically in O(log n) time for balanced trees.'
              },
              {
                blockType: 'text',
                content: 'However, if the tree becomes unbalanced, it can degrade into a linked list with O(n) performance.'
              },
              {
                blockType: 'text',
                content: 'BSTs are commonly used in interview problems involving range queries, searching, and validation of tree structure.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Binary search tree showing left subtree smaller than root and right subtree larger, with balanced vs unbalanced comparison.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'warning',
                title: 'Common Pitfall',
                content: 'Assuming BST is always balanced is incorrect — worst-case performance is O(n).'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is the average time complexity of search in a balanced BST?',
                tagSlugs: ['data-structures'],
                choices: [
                  'O(1)',
                  'O(log n)',
                  'O(n)',
                  'O(n^2)'
                ],
                correctAnswer: 'O(log n)',
                solution: 'Balanced BST splits search space in half at each step.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 6.3
          // =========================
          {
            title: 'Lesson 6.3: BFS vs DFS',
            order: 3,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Breadth-First Search (BFS) and Depth-First Search (DFS) are two fundamental graph traversal algorithms. BFS explores nodes level by level, while DFS explores as deep as possible before backtracking.'
              },
              {
                blockType: 'text',
                content: 'BFS uses a queue, while DFS uses a stack or recursion. Both algorithms are used extensively in tree and graph problems.'
              },
              {
                blockType: 'text',
                content: 'BFS is typically used for shortest path problems in unweighted graphs, while DFS is often used for path exploration and connectivity problems.'
              },
              {
                blockType: 'text',
                content: 'Choosing between BFS and DFS depends on the problem structure and what needs to be optimized.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Graph diagram showing BFS expanding level by level and DFS going deep into one branch before backtracking.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'tip',
                title: 'Interview Tip',
                content: 'If shortest path is required in an unweighted graph, BFS is usually the correct choice.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'Which algorithm uses a queue?',
                tagSlugs: ['graphs'],
                choices: [
                  'DFS',
                  'BFS',
                  'Binary Search',
                  'Quick Sort'
                ],
                correctAnswer: 'BFS',
                solution: 'BFS uses a queue for level-order traversal.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 6.4
          // =========================
          {
            title: 'Lesson 6.4: Graph Representations & Traversal',
            order: 4,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Graphs are general structures consisting of nodes (vertices) and connections (edges). They are used to represent networks such as social graphs, maps, and dependencies.'
              },
              {
                blockType: 'text',
                content: 'Graphs can be represented using adjacency lists or adjacency matrices. Adjacency lists are more space-efficient for sparse graphs, while adjacency matrices allow faster edge lookups.'
              },
              {
                blockType: 'text',
                content: 'Traversal techniques like BFS and DFS are also used in graphs to explore all reachable nodes from a starting point.'
              },
              {
                blockType: 'text',
                content: 'Graph problems often involve cycle detection, shortest path, and connectivity analysis.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Graph representation comparison showing adjacency list vs adjacency matrix for the same graph.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'info',
                title: 'Key Insight',
                content: 'Most graph problems in interviews are variations of BFS or DFS with slight modifications.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'Which graph representation is more space-efficient for sparse graphs?',
                tagSlugs: ['graphs'],
                choices: [
                  'Adjacency matrix',
                  'Adjacency list',
                  'Incidence matrix',
                  'Edge list only'
                ],
                correctAnswer: 'Adjacency list',
                solution: 'Adjacency lists only store existing edges, making them more space-efficient.',
                points: 1,
                isPublished: false
              }
            ]
          }
        ]
      }
    ]
  };