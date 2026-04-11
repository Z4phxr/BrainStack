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
      // MODULE 1
      // =========================
      {
        title: 'Module 1: Foundations of Algorithm Analysis',
        order: 1,
        isPublished: false,
  
        lessons: [
          // =========================
          // LESSON 1.1
          // =========================
          {
            title: 'Lesson 1.1: What Makes an Algorithm Efficient?',
            order: 1,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'When preparing for coding interviews, one of the first skills you need is understanding what makes an algorithm efficient. Efficiency is not just about writing code that works, but about writing code that performs well when input sizes grow dramatically. In real systems, an algorithm that works for 10 items might completely fail for 10 million items.'
              },
              {
                blockType: 'text',
                content: 'An algorithm is a step-by-step procedure for solving a problem. However, different algorithms solving the same problem can have drastically different performance characteristics. For example, searching for an element in a list can be done using linear search or binary search, and their performance differs significantly as input size increases.'
              },
              {
                blockType: 'text',
                content: 'The two main resources we measure are **time complexity** and **space complexity**. Time complexity describes how execution time grows with input size, while space complexity describes how much memory an algorithm uses. Both are critical in interviews, but time complexity is usually the primary focus.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Diagram comparing algorithm growth rates. Show multiple curves labeled O(1), O(log n), O(n), O(n log n), O(n^2). X-axis labeled "Input Size (n)" and Y-axis labeled "Time". Highlight how exponential growth quickly becomes impractical compared to logarithmic and linear growth.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'text',
                content: 'A key insight in algorithm design is that input size matters more than constant factors. For example, an algorithm that performs 100 operations per input item is still O(n), even though it may be slower in practice than a more optimized constant-factor solution for small inputs.'
              },
              {
                blockType: 'callout',
                variant: 'warning',
                title: 'Interview Insight',
                content: 'Interviewers care more about scalability than micro-optimizations. A correct O(n log n) solution will almost always be preferred over an O(n^2) solution, even if the latter has smaller constants.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What does algorithm efficiency primarily measure?',
                tagSlugs: ['algorithms', 'big-o'],
                choices: [
                  'How beautiful the code looks',
                  'Time and space usage as input size grows',
                  'Number of functions used',
                  'How fast a computer runs the code'
                ],
                correctAnswer: 'Time and space usage as input size grows',
                solution: 'Algorithm efficiency focuses on how time and memory requirements scale with increasing input size.',
                points: 1,
                isPublished: false
              },
              {
                type: 'TRUE_FALSE',
                order: 2,
                prompt: 'An algorithm that is fast for small inputs will always remain fast for large inputs.',
                tagSlugs: ['algorithms', 'complexity-analysis'],
                correctAnswer: 'false',
                solution: 'False. Some algorithms degrade rapidly as input size increases, especially those with quadratic or exponential complexity.',
                points: 1,
                isPublished: false
              },
              {
                type: 'OPEN_ENDED',
                order: 3,
                prompt: 'Explain why scalability matters more than raw speed in algorithm design.',
                tagSlugs: ['algorithms', 'interview-prep'],
                solution: 'Scalability ensures that an algorithm continues to perform efficiently as input size grows. In real-world systems and interviews, handling large inputs is critical, so algorithms must be evaluated based on growth behavior rather than performance on small datasets.',
                points: 2,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 1.2
          // =========================
          {
            title: 'Lesson 1.2: Big-O Notation Deep Dive',
            order: 2,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Big-O notation is a mathematical way to describe how an algorithm behaves as input size grows. Instead of measuring exact time in seconds, we describe growth trends. This abstraction is extremely important in interviews because it allows us to compare algorithms independent of hardware or programming language.'
              },
              {
                blockType: 'text',
                content: 'The most common complexity classes are O(1), O(log n), O(n), O(n log n), and O(n^2). Each represents a different growth rate. For example, O(1) is constant time and does not grow with input size, while O(n^2) grows very quickly and becomes inefficient for large inputs.'
              },
              {
                blockType: 'math',
                latex: 'O(n^2)',
                displayMode: true
              },
              {
                blockType: 'text',
                content: 'Big-O focuses on the worst-case scenario, which is often what interviewers expect you to analyze. For example, even if a search algorithm performs well on average, its worst-case performance determines its Big-O classification.'
              },
              {
                blockType: 'text',
                content: 'When analyzing complexity, we drop constants and lower-order terms. For example, O(3n + 10) simplifies to O(n). This is because as n grows large, constants become irrelevant compared to dominant growth terms.'
              },
              {
                blockType: 'callout',
                variant: 'tip',
                title: 'Memory Trick',
                content: 'Think of Big-O as describing the shape of growth, not the exact speed. You are comparing curves, not measuring seconds.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'Which Big-O notation represents constant time complexity?',
                tagSlugs: ['big-o'],
                choices: [
                  'O(n)',
                  'O(log n)',
                  'O(1)',
                  'O(n^2)'
                ],
                correctAnswer: 'O(1)',
                solution: 'O(1) means the operation takes constant time regardless of input size.',
                points: 1,
                isPublished: false
              },
              {
                type: 'MULTIPLE_CHOICE',
                order: 2,
                prompt: 'What is O(3n + 10) simplified to in Big-O notation?',
                tagSlugs: ['big-o'],
                choices: [
                  'O(3n)',
                  'O(n)',
                  'O(10)',
                  'O(n + 10)'
                ],
                correctAnswer: 'O(n)',
                solution: 'We drop constants and lower-order terms, leaving O(n).',
                points: 1,
                isPublished: false
              },
              {
                type: 'TRUE_FALSE',
                order: 3,
                prompt: 'Big-O notation describes the exact runtime in seconds.',
                tagSlugs: ['big-o'],
                correctAnswer: 'false',
                solution: 'False. Big-O describes growth rate, not exact execution time.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 1.3
          // =========================
          {
            title: 'Lesson 1.3: Asymptotic Thinking in Practice',
            order: 3,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Asymptotic thinking is the ability to analyze how algorithms behave as input size approaches infinity. Instead of focusing on small details, we focus on dominant behavior. This is a core skill in technical interviews because it allows you to quickly compare solutions.'
              },
              {
                blockType: 'text',
                content: 'When analyzing expressions, we identify the fastest growing term. For example, in O(n^2 + n), the n^2 term dominates, so we simplify to O(n^2). This helps reduce complexity analysis into a structured process.'
              },
              {
                blockType: 'text',
                content: 'Another important concept is ignoring constant multipliers. Whether an algorithm runs 5n or 100n operations, both are O(n). This is because growth rate matters more than exact counts when n becomes large.'
              },
              {
                blockType: 'text',
                content: 'In Python, nested loops are a common source of higher complexity. For example, a loop inside another loop often indicates O(n^2) behavior, which may not scale well for large datasets.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Visual breakdown of nested loops in code. Show a Python snippet with two loops and an illustration of a grid being traversed. Highlight how each element is visited multiple times leading to O(n^2) complexity.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'info',
                title: 'Key Insight',
                content: 'Most interview problems are not about writing code first, but about recognizing the underlying complexity pattern before implementation.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What dominates complexity in O(n^2 + n)?',
                tagSlugs: ['big-o'],
                choices: [
                  'O(n)',
                  'O(n^2)',
                  'O(1)',
                  'O(n + n^2)'
                ],
                correctAnswer: 'O(n^2)',
                solution: 'The highest-order term dominates Big-O complexity.',
                points: 1,
                isPublished: false
              },
              {
                type: 'TRUE_FALSE',
                order: 2,
                prompt: 'Constant factors matter in Big-O analysis.',
                tagSlugs: ['big-o'],
                correctAnswer: 'false',
                solution: 'False. Constants are ignored in asymptotic analysis.',
                points: 1,
                isPublished: false
              }
            ]
          }
        ]
      },
  
      // =========================
      // MODULE 2
      // =========================
      {
        title: 'Module 2: Core Data Structures',
        order: 2,
        isPublished: false,
  
        lessons: [
          // =========================
          // LESSON 2.1
          // =========================
          {
            title: 'Lesson 2.1: Arrays & Strings Mastery',
            order: 1,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Arrays and strings are the most fundamental data structures in programming interviews. An array stores elements in contiguous memory locations, which allows fast indexed access. Strings are essentially arrays of characters, which means most array techniques apply to string problems as well.'
              },
              {
                blockType: 'text',
                content: 'The key strength of arrays is O(1) random access. This means you can directly access any element using its index without traversing the entire structure. However, inserting or deleting elements in the middle of an array can be expensive because it may require shifting elements.'
              },
              {
                blockType: 'text',
                content: 'In Python, arrays are typically implemented using lists. While Python lists are dynamic and flexible, they still maintain the core characteristics of arrays in terms of indexing and memory behavior.'
              },
              {
                blockType: 'text',
                content: 'Common interview patterns involving arrays include two pointers, sliding window, and prefix sum techniques. These patterns help reduce brute-force O(n^2) solutions into more efficient O(n) solutions.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Diagram showing array memory layout. Display contiguous memory blocks labeled with indices 0 to n-1. Show how accessing arr[3] directly jumps to memory location without traversal.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'tip',
                title: 'Interview Tip',
                content: 'If a problem involves subarrays or substrings, immediately consider sliding window or prefix sum patterns.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is the time complexity of accessing an element in an array by index?',
                tagSlugs: ['arrays'],
                choices: [
                  'O(n)',
                  'O(log n)',
                  'O(1)',
                  'O(n^2)'
                ],
                correctAnswer: 'O(1)',
                solution: 'Arrays allow direct indexing, so access time is constant.',
                points: 1,
                isPublished: false
              },
              {
                type: 'TRUE_FALSE',
                order: 2,
                prompt: 'Inserting an element in the middle of an array is always O(1).',
                tagSlugs: ['arrays'],
                correctAnswer: 'false',
                solution: 'False. Inserting in the middle requires shifting elements, making it O(n).',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 2.2
          // =========================
          {
            title: 'Lesson 2.2: Hash Tables (Dictionaries)',
            order: 2,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Hash tables, known as dictionaries in Python, are one of the most powerful data structures for coding interviews. They allow average O(1) time complexity for insertion, deletion, and lookup operations, making them ideal for optimization problems.'
              },
              {
                blockType: 'text',
                content: 'A hash table works by applying a hash function to a key, which produces an index where the value is stored. This allows direct access without scanning the entire dataset. However, collisions can occur when multiple keys map to the same index.'
              },
              {
                blockType: 'text',
                content: 'Python dictionaries handle collisions internally using advanced techniques like open addressing and resizing. As a result, they are highly optimized and widely used in real-world applications and interviews.'
              },
              {
                blockType: 'text',
                content: 'A very common interview pattern is frequency counting using dictionaries. Instead of nested loops, you store counts in a hash map and achieve O(n) solutions for problems like anagrams and duplicates.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Diagram of hash table mapping keys to indices using a hash function. Show collisions and how they are resolved using chaining or probing.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'warning',
                title: 'Common Mistake',
                content: 'Assuming hash tables are always O(1) worst-case is incorrect. In worst-case scenarios with many collisions, performance can degrade, but average case remains O(1).'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is the average time complexity of dictionary lookup in Python?',
                tagSlugs: ['hash-maps'],
                choices: [
                  'O(n)',
                  'O(log n)',
                  'O(1)',
                  'O(n^2)'
                ],
                correctAnswer: 'O(1)',
                solution: 'Python dictionaries use hash tables which provide average constant-time lookup.',
                points: 1,
                isPublished: false
              },
              {
                type: 'TRUE_FALSE',
                order: 2,
                prompt: 'Hash collisions never occur in hash tables.',
                tagSlugs: ['hash-maps'],
                correctAnswer: 'false',
                solution: 'False. Collisions can occur when different keys map to the same hash index.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 2.3
          // =========================
          {
            title: 'Lesson 2.3: Stacks & Queues',
            order: 3,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Stacks and queues are linear data structures that control the order in which elements are processed. A stack follows LIFO (Last In, First Out), while a queue follows FIFO (First In, First Out). These structures are heavily used in algorithm problems and system design.'
              },
              {
                blockType: 'text',
                content: 'Stacks are commonly used for function call management, expression evaluation, and backtracking problems. In Python, lists can be used as stacks using append() and pop() operations.'
              },
              {
                blockType: 'text',
                content: 'Queues are used in breadth-first search (BFS), scheduling systems, and buffering tasks. Python provides collections.deque for efficient queue operations.'
              },
              {
                blockType: 'text',
                content: 'A powerful variation is the monotonic stack, which maintains elements in a sorted order and is used in advanced problems like "next greater element" and histogram area calculation.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Visual comparison of stack (LIFO) and queue (FIFO). Show elements entering and leaving in different orders. Include arrows indicating flow direction.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'info',
                title: 'Interview Insight',
                content: 'If a problem involves "next greater/smaller element" or "undo operations", consider using a stack.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What order does a stack follow?',
                tagSlugs: ['data-structures'],
                choices: [
                  'FIFO',
                  'LIFO',
                  'Random order',
                  'Priority order'
                ],
                correctAnswer: 'LIFO',
                solution: 'Stacks follow Last In, First Out ordering.',
                points: 1,
                isPublished: false
              },
              {
                type: 'TRUE_FALSE',
                order: 2,
                prompt: 'Queues follow LIFO order.',
                tagSlugs: ['data-structures'],
                correctAnswer: 'false',
                solution: 'False. Queues follow FIFO order.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 2.4
          // =========================
          {
            title: 'Lesson 2.4: Linked Lists',
            order: 4,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'A linked list is a linear data structure where each element (node) contains a value and a reference to the next node. Unlike arrays, linked lists do not store elements in contiguous memory locations, which makes insertions and deletions more flexible.'
              },
              {
                blockType: 'text',
                content: 'The main advantage of linked lists is efficient insertion and deletion at known positions, which can be done in O(1) time if the node reference is already available. However, accessing an element requires traversal from the head, making it O(n).'
              },
              {
                blockType: 'text',
                content: 'There are several types of linked lists: singly linked lists, doubly linked lists, and circular linked lists. Each variation has trade-offs in terms of complexity and flexibility.'
              },
              {
                blockType: 'text',
                content: 'In interviews, linked lists are often used to test pointer manipulation skills, especially in problems involving reversal, cycle detection, and merging lists.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Diagram of a singly linked list showing nodes with values and arrows pointing to next node. Include head pointer and NULL at end.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'warning',
                title: 'Common Pitfall',
                content: 'Many candidates forget to handle edge cases like empty lists or single-node lists when working with linked list problems.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is the time complexity of accessing an element in a linked list?',
                tagSlugs: ['data-structures'],
                choices: [
                  'O(1)',
                  'O(log n)',
                  'O(n)',
                  'O(n^2)'
                ],
                correctAnswer: 'O(n)',
                solution: 'You must traverse the list from the head, resulting in linear time complexity.',
                points: 1,
                isPublished: false
              },
              {
                type: 'TRUE_FALSE',
                order: 2,
                prompt: 'Linked lists provide faster random access than arrays.',
                tagSlugs: ['data-structures'],
                correctAnswer: 'false',
                solution: 'False. Arrays provide O(1) random access, while linked lists require O(n) traversal.',
                points: 1,
                isPublished: false
              }
            ]
          }
        ]
      }
    ]
  };