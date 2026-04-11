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
      // MODULE 3
      // =========================
      {
        title: 'Module 3: Searching Algorithms',
        order: 3,
        isPublished: false,
  
        lessons: [
  
          // =========================
          // LESSON 3.1
          // =========================
          {
            title: 'Lesson 3.1: Linear Search vs Binary Search',
            order: 1,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Searching is one of the most fundamental operations in computer science. The simplest approach is linear search, where we scan each element one by one until we find the target. While this is easy to implement, it becomes inefficient for large datasets because it may require checking every element.'
              },
              {
                blockType: 'text',
                content: 'Binary search is a much more efficient algorithm, but it requires the data to be sorted. Instead of checking every element, it repeatedly divides the search space in half, eliminating half of the remaining elements at each step.'
              },
              {
                blockType: 'text',
                content: 'This difference leads to a dramatic performance gap. Linear search runs in O(n), while binary search runs in O(log n), making it significantly faster for large inputs.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Side-by-side visual comparison of linear search scanning elements sequentially vs binary search repeatedly dividing a sorted array in half. Highlight reduction of search space each step.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'text',
                content: 'A key insight in interviews is recognizing when binary search is applicable. If the problem involves a sorted structure or a monotonic condition, binary search may be the optimal approach.'
              },
              {
                blockType: 'callout',
                variant: 'tip',
                title: 'Interview Tip',
                content: 'If you see phrases like "minimum", "maximum", or "sorted", immediately consider binary search as a possible solution.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is the time complexity of linear search?',
                tagSlugs: ['searching'],
                choices: [
                  'O(1)',
                  'O(log n)',
                  'O(n)',
                  'O(n log n)'
                ],
                correctAnswer: 'O(n)',
                solution: 'Linear search checks each element one by one.',
                points: 1,
                isPublished: false
              },
              {
                type: 'TRUE_FALSE',
                order: 2,
                prompt: 'Binary search works on unsorted arrays.',
                tagSlugs: ['searching'],
                correctAnswer: 'false',
                solution: 'False. Binary search requires sorted data.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 3.2
          // =========================
          {
            title: 'Lesson 3.2: Binary Search Deep Dive',
            order: 2,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Binary search is one of the most important algorithms in technical interviews. It works by repeatedly dividing a sorted search space into two halves and eliminating the half that cannot contain the target value.'
              },
              {
                blockType: 'text',
                content: 'The key idea is maintaining a search range defined by two pointers: left and right. At each step, we compute the middle index and compare the middle element with the target.'
              },
              {
                blockType: 'text',
                content: 'If the target is smaller than the middle element, we search the left half. If it is larger, we search the right half. This process continues until the target is found or the range becomes empty.'
              },
              {
                blockType: 'text',
                content: 'Binary search is not just for arrays. It can also be applied to "search on answer" problems, where we search for an optimal value in a range instead of searching for an element.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Step-by-step visualization of binary search on a sorted array. Show left, mid, right pointers shrinking search space each iteration.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'warning',
                title: 'Common Mistake',
                content: 'Incorrectly updating left and right pointers can lead to infinite loops or missed elements. Always carefully handle mid calculations and boundary updates.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is the time complexity of binary search?',
                tagSlugs: ['searching'],
                choices: [
                  'O(n)',
                  'O(log n)',
                  'O(n log n)',
                  'O(1)'
                ],
                correctAnswer: 'O(log n)',
                solution: 'Binary search halves the search space at each step.',
                points: 1,
                isPublished: false
              },
              {
                type: 'OPEN_ENDED',
                order: 2,
                prompt: 'Explain why binary search is faster than linear search.',
                tagSlugs: ['searching'],
                solution: 'Binary search eliminates half of the search space at each step, reducing the number of comparisons from linear growth O(n) to logarithmic growth O(log n). This exponential reduction in search space makes it significantly more efficient for large datasets.',
                points: 2,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 3.3
          // =========================
          {
            title: 'Lesson 3.3: Binary Search Variations',
            order: 3,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Binary search is not limited to finding exact elements. Many interview problems require modified versions of binary search where we search for boundaries, ranges, or conditions rather than a specific value.'
              },
              {
                blockType: 'text',
                content: 'One common variation is finding the first or last occurrence of an element. Instead of stopping when we find the target, we continue searching in one direction to find the boundary.'
              },
              {
                blockType: 'text',
                content: 'Another important pattern is "binary search on answer", where we search for the minimum or maximum value that satisfies a condition. This is common in optimization problems.'
              },
              {
                blockType: 'text',
                content: 'Rotated sorted arrays are another classic variation. Even though the array is partially unsorted, we can still apply binary search by identifying which half is sorted.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Visualization of rotated sorted array split into two sorted halves. Show how binary search decides which half to explore based on target value.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'info',
                title: 'Key Insight',
                content: 'If a problem asks for "minimum possible value" under constraints, it is often a binary search on answer problem.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is "binary search on answer" used for?',
                tagSlugs: ['searching'],
                choices: [
                  'Finding exact elements only',
                  'Sorting arrays efficiently',
                  'Solving optimization problems with a search space',
                  'Replacing recursion'
                ],
                correctAnswer: 'Solving optimization problems with a search space',
                solution: 'It is used when we search for the optimal value that satisfies a condition.',
                points: 1,
                isPublished: false
              }
            ]
          }
        ]
      },
  
      // =========================
      // MODULE 4
      // =========================
      {
        title: 'Module 4: Sorting Algorithms',
        order: 4,
        isPublished: false,
  
        lessons: [
  
          // =========================
          // LESSON 4.1
          // =========================
          {
            title: 'Lesson 4.1: Basic Sorting Algorithms',
            order: 1,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Sorting is a foundational topic in computer science and interviews. Even though built-in sorting functions exist in Python, understanding how sorting algorithms work internally is critical for solving complex problems and optimizing solutions.'
              },
              {
                blockType: 'text',
                content: 'Basic sorting algorithms include bubble sort, selection sort, and insertion sort. These are not efficient for large datasets, but they are important for understanding algorithmic thinking and complexity analysis.'
              },
              {
                blockType: 'text',
                content: 'Bubble sort repeatedly swaps adjacent elements if they are in the wrong order, gradually pushing larger elements to the end. Selection sort finds the smallest element and places it at the beginning. Insertion sort builds a sorted portion one element at a time.'
              },
              {
                blockType: 'text',
                content: 'All three of these algorithms generally have O(n^2) time complexity, making them inefficient for large datasets but useful for educational purposes.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Comparison of bubble sort, selection sort, and insertion sort animations showing how elements move step by step during sorting.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'warning',
                title: 'Interview Reality',
                content: 'You will almost never use O(n^2) sorting in production or interviews, but understanding it helps you appreciate more advanced algorithms like merge sort and quick sort.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is the time complexity of bubble sort in the worst case?',
                tagSlugs: ['sorting'],
                choices: [
                  'O(n)',
                  'O(log n)',
                  'O(n^2)',
                  'O(n log n)'
                ],
                correctAnswer: 'O(n^2)',
                solution: 'Bubble sort compares all pairs in worst case.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 4.2
          // =========================
          {
            title: 'Lesson 4.2: Merge Sort (Divide and Conquer)',
            order: 2,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Merge sort is a classic example of the divide and conquer strategy. It works by recursively splitting the array into halves until each subarray contains a single element, and then merging them back together in sorted order.'
              },
              {
                blockType: 'text',
                content: 'The key idea is that merging two sorted arrays is efficient and can be done in linear time. By combining this with recursive splitting, we achieve an overall time complexity of O(n log n).'
              },
              {
                blockType: 'text',
                content: 'Unlike simpler sorting algorithms, merge sort guarantees O(n log n) performance in all cases, making it very reliable for large datasets.'
              },
              {
                blockType: 'text',
                content: 'However, merge sort requires additional memory for merging, which means its space complexity is O(n), making it less memory-efficient than some alternatives.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Visualization of merge sort recursion tree splitting array into halves and merging sorted subarrays step by step.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'math',
                latex: 'O(n \\log n)',
                displayMode: true
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is the time complexity of merge sort?',
                tagSlugs: ['sorting'],
                choices: [
                  'O(n)',
                  'O(n^2)',
                  'O(n log n)',
                  'O(log n)'
                ],
                correctAnswer: 'O(n log n)',
                solution: 'Merge sort divides the array log n times and merges in linear time.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 4.3
          // =========================
          {
            title: 'Lesson 4.3: Quick Sort (Partitioning Strategy)',
            order: 3,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Quick sort is one of the most efficient sorting algorithms in practice. It uses a partitioning strategy where a pivot element is chosen, and the array is rearranged so that smaller elements are on the left and larger elements are on the right.'
              },
              {
                blockType: 'text',
                content: 'After partitioning, the algorithm recursively sorts the left and right subarrays. This divide-and-conquer approach makes quick sort very fast on average.'
              },
              {
                blockType: 'text',
                content: 'Although quick sort has an average-case complexity of O(n log n), its worst-case complexity is O(n^2), which occurs when the pivot is poorly chosen.'
              },
              {
                blockType: 'text',
                content: 'Despite worst-case scenarios, quick sort is widely used because it performs extremely well in real-world applications due to cache efficiency and low overhead.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Diagram showing quick sort partitioning around a pivot element, with elements rearranged to left and right subarrays.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'info',
                title: 'Practical Insight',
                content: 'Python’s built-in sort uses Timsort, not quick sort, because it performs better on real-world partially sorted data.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What is the average time complexity of quick sort?',
                tagSlugs: ['sorting'],
                choices: [
                  'O(n log n)',
                  'O(n^2)',
                  'O(n)',
                  'O(log n)'
                ],
                correctAnswer: 'O(n log n)',
                solution: 'Quick sort divides the array and sorts partitions efficiently on average.',
                points: 1,
                isPublished: false
              }
            ]
          },
  
          // =========================
          // LESSON 4.4
          // =========================
          {
            title: 'Lesson 4.4: Sorting in Python (Built-in & Strategy)',
            order: 4,
            isPublished: false,
  
            theoryBlocks: [
              {
                blockType: 'text',
                content: 'Python provides highly optimized built-in sorting functions: sorted() and list.sort(). These use an algorithm called Timsort, which is a hybrid of merge sort and insertion sort, optimized for real-world data.'
              },
              {
                blockType: 'text',
                content: 'Timsort performs exceptionally well on partially sorted data, which is common in real applications. It adapts dynamically based on the structure of the input.'
              },
              {
                blockType: 'text',
                content: 'Even though you rarely implement sorting manually in interviews, understanding sorting algorithms helps you choose the right approach when sorting becomes part of a larger problem.'
              },
              {
                blockType: 'text',
                content: 'A common interview pattern is sorting as a preprocessing step before applying two pointers or binary search techniques.'
              },
              {
                blockType: 'image',
                image: '__IMPORT_PLACEHOLDER_IMAGE__',
                caption: 'Diagram showing Timsort combining merge sort and insertion sort strategies depending on input structure.',
                align: 'center',
                width: 'md'
              },
              {
                blockType: 'callout',
                variant: 'tip',
                title: 'Interview Tip',
                content: 'If a problem becomes easier after sorting, it is often a sign that sorting is part of the optimal solution.'
              }
            ],
  
            tasks: [
              {
                type: 'MULTIPLE_CHOICE',
                order: 1,
                prompt: 'What sorting algorithm does Python use internally?',
                tagSlugs: ['sorting'],
                choices: [
                  'Quick sort',
                  'Merge sort',
                  'Timsort',
                  'Bubble sort'
                ],
                correctAnswer: 'Timsort',
                solution: 'Python uses Timsort, a hybrid sorting algorithm.',
                points: 1,
                isPublished: false
              }
            ]
          }
        ]
      }
    ]
  };