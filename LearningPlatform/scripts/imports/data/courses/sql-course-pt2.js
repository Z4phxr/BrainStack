// data/courses/sql-course-pt2.js
module.exports = {
  subject: {
    name: 'Interview Preparation',
    slug: 'interview-preparation'
  },

  course: {
    title: 'SQL for Job Interviews: From Novice to Confident',
    slug: 'sql-interview-prep',
    description: 'Master the SQL skills that actually appear in technical interviews. Built around real CoderPad problem patterns - joins, aggregations, window functions, and live coding strategy for backend and data services roles.',
    level: 'BEGINNER',
    isPublished: false
  },

  modules: [
    // =========================================================
    // MODULE 3: Subqueries and CTEs
    // =========================================================
    {
      title: 'Module 3: Subqueries and CTEs - Writing Multi-Step Queries',
      order: 3,
      isPublished: false,

      lessons: [
        // ---------------------------------------------------------
        // LESSON 3.1: Subqueries in WHERE and FROM
        // ---------------------------------------------------------
        {
          title: 'Lesson 3.1: Subqueries in WHERE and FROM',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Many interview problems cannot be solved with a single flat query. You need to compute something first, then use that result to filter or join. This is where **subqueries** come in. A subquery is simply a SELECT statement nested inside another SQL statement. It runs first, produces a temporary result, and the outer query uses that result. Once you understand this concept, you unlock a whole new category of problems you can solve.'
            },
            {
              blockType: 'text',
              content: 'The most common subquery placement is in the `WHERE` clause. Here you compute a value or a list, then compare against it:\n\n```sql\n-- Find employees who earn more than the company average\nSELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);\n```\n\nThe inner query `(SELECT AVG(salary) FROM employees)` runs first and returns a single number - say 75000. Then the outer query becomes effectively `WHERE salary > 75000`. The database executes the subquery once and substitutes the result.'
            },
            {
              blockType: 'text',
              content: 'When a subquery returns a **list of values** (not just one), you use `IN` or `NOT IN` instead of `=`:\n\n```sql\n-- Find orders placed by customers in the "VIP" tier\nSELECT id, amount, created_at\nFROM orders\nWHERE customer_id IN (\n    SELECT id\n    FROM customers\n    WHERE tier = \'VIP\'\n);\n```\n\nThe inner query returns a list of VIP customer IDs. The outer query keeps only orders whose `customer_id` is in that list. This is a very common pattern - and it is often cleaner than a JOIN when you only need IDs from the second table.'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'The NOT IN + NULL Trap - A Critical Interview Gotcha',
              content: 'NOT IN behaves dangerously when the subquery result contains any NULL values. If the list has even one NULL, NOT IN returns zero rows - always. This is because SQL cannot determine if a value is "not equal" to NULL. The safe alternative is NOT EXISTS or LEFT JOIN + IS NULL. If you use NOT IN in an interview, mention this limitation - it shows deep knowledge.'
            },
            {
              blockType: 'text',
              content: 'Subqueries can also go in the `FROM` clause, creating a temporary derived table. This is powerful when you need to filter or aggregate data before joining it:\n\n```sql\n-- Find departments where the average salary is above 80000\nSELECT dept_averages.department_id, dept_averages.avg_sal\nFROM (\n    SELECT department_id, AVG(salary) AS avg_sal\n    FROM employees\n    GROUP BY department_id\n) AS dept_averages\nWHERE dept_averages.avg_sal > 80000;\n```\n\nThe inner query groups employees and computes the average per department. The outer query then filters that result. Notice the alias `dept_averages` after the closing parenthesis - this is required in PostgreSQL: every derived table in FROM must have an alias.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Two-part diagram showing subquery execution flow. Part 1 (WHERE subquery): Arrow pointing from inner query "(SELECT AVG(salary) FROM employees)" labeled "Runs first, returns: 75000" then arrow to outer query "WHERE salary > 75000" labeled "Outer query uses the result". Part 2 (FROM subquery): Inner query shown as a small table (department_id, avg_sal) labeled "Derived table", then arrow to outer query treating it as a regular table with a WHERE filter. Title: "Subquery Execution Order - Inner runs first, outer uses the result."',
              align: 'center',
              width: 'md'
            },
            {
              blockType: 'text',
              content: '`EXISTS` and `NOT EXISTS` are alternative ways to filter based on a subquery. They are faster than `IN` for large datasets because they stop as soon as the first match is found:\n\n```sql\n-- Find customers who have placed AT LEAST ONE order\nSELECT c.name\nFROM customers c\nWHERE EXISTS (\n    SELECT 1\n    FROM orders o\n    WHERE o.customer_id = c.id\n);\n\n-- Find customers with NO orders (safe alternative to NOT IN)\nSELECT c.name\nFROM customers c\nWHERE NOT EXISTS (\n    SELECT 1\n    FROM orders o\n    WHERE o.customer_id = c.id\n);\n```\n\nNote `SELECT 1` inside EXISTS - the actual value selected does not matter, only whether any row exists. This is a well-known SQL convention.'
            },
            {
              blockType: 'table',
              caption: 'Subquery Placement Guide - Where to Put Them and Why',
              hasHeaders: true,
              headers: ['Location', 'Returns', 'Use With', 'Example Use Case'],
              rows: [
                ['WHERE (single value)', 'One value', '=, >, <, >=, <=', 'Compare to AVG, MAX, MIN of another query'],
                ['WHERE (list)', 'Multiple values', 'IN, NOT IN', 'Filter by IDs from another table'],
                ['FROM clause', 'Table (multiple rows+cols)', 'Must be aliased', 'Pre-aggregate before joining or filtering'],
                ['EXISTS / NOT EXISTS', 'Boolean (row found or not)', 'WHERE EXISTS (...)', 'Check if related data exists - NULL-safe'],
                ['SELECT clause', 'One value per row', 'Scalar subquery', 'Add a calculated column from another table']
              ]
            },
            {
              blockType: 'text',
              content: 'A scalar subquery in the SELECT clause adds a computed column based on a related table - useful but can be slow on large datasets:\n\n```sql\n-- Show each employee and their department\'s average salary\nSELECT\n    e.name,\n    e.salary,\n    (SELECT AVG(e2.salary)\n     FROM employees e2\n     WHERE e2.department_id = e.department_id) AS dept_avg\nFROM employees e;\n```\n\nThis runs the subquery once per row in the outer query. For large tables, a JOIN with a pre-aggregated subquery is more efficient - but for interviews, knowing this pattern exists and being able to explain its tradeoff is exactly what impresses interviewers.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'What is the correct way to find all products whose price is above the average price of all products?',
              tagSlugs: ['sql', 'intermediate', 'subqueries', 'filtering'],
              choices: [
                'SELECT * FROM products WHERE price > AVG(price)',
                'SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products)',
                'SELECT * FROM products HAVING price > AVG(price)',
                'SELECT * FROM products WHERE price > (AVG(price) FROM products)'
              ],
              correctAnswer: 'SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products)',
              solution: 'AVG() is an aggregate function and cannot be used directly in a WHERE clause (WHERE runs before aggregation). You must compute the average in a subquery first, then compare to it. The subquery (SELECT AVG(price) FROM products) runs first and returns a single number, which the outer WHERE then uses for comparison.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'If a NOT IN subquery returns even one NULL value, the entire NOT IN condition will return zero rows.',
              tagSlugs: ['sql', 'intermediate', 'subqueries', 'null-handling', 'gotchas'],
              correctAnswer: 'true',
              solution: 'True. This is one of the most dangerous SQL gotchas. SQL cannot determine whether a value is "not equal to NULL" - that comparison is always unknown. When NOT IN encounters a NULL in the list, every row comparison becomes unknown, and unknown rows are excluded. The safe alternative is NOT EXISTS or LEFT JOIN + WHERE right_table.id IS NULL.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'A FROM clause subquery in PostgreSQL requires which of the following?',
              tagSlugs: ['sql', 'intermediate', 'subqueries'],
              choices: [
                'A semicolon at the end of the inner query',
                'An alias after the closing parenthesis',
                'The TEMPORARY keyword before SELECT',
                'At least one JOIN inside the subquery'
              ],
              correctAnswer: 'An alias after the closing parenthesis',
              solution: 'In PostgreSQL (and standard SQL), every derived table in a FROM clause must have an alias. Writing FROM (SELECT ...) AS my_alias is required syntax. Without the alias, PostgreSQL throws an error: "subquery in FROM must have an alias". The alias is how you reference the derived table\'s columns in the outer query.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Write a SQL query to find the names and salaries of the top 3 highest-paid employees in each department. Use a subquery approach (not window functions yet). Tables: "employees" (id, name, salary, department_id).',
              tagSlugs: ['sql', 'intermediate', 'subqueries', 'interview-prep', 'problem-patterns'],
              solution: '-- Subquery approach using a correlated subquery or derived table:\nSELECT e1.name, e1.salary, e1.department_id\nFROM employees e1\nWHERE (\n    SELECT COUNT(*)\n    FROM employees e2\n    WHERE e2.department_id = e1.department_id\n      AND e2.salary > e1.salary\n) < 3\nORDER BY e1.department_id, e1.salary DESC;\n-- Explanation: For each employee (e1), the correlated subquery counts how many employees in the same department earn MORE. If fewer than 3 people earn more, this employee is in the top 3. This is a classic correlated subquery pattern. Note: ties are handled differently by this approach vs RANK() - we will revisit this in Module 4 with window functions, which solve it more cleanly.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ---------------------------------------------------------
        // LESSON 3.2: Common Table Expressions (WITH clause)
        // ---------------------------------------------------------
        {
          title: 'Lesson 3.2: Common Table Expressions - The WITH Clause',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Common Table Expressions (CTEs) are one of the most useful tools in SQL for interviews - and one of the most impressive to use correctly. A CTE lets you define a named temporary result set at the top of your query using the `WITH` keyword, then reference it by name in the main query. Think of it as giving a subquery a readable name and pulling it out of the tangled mess of nested parentheses. CTEs make complex queries dramatically easier to read, write, and explain to an interviewer.'
            },
            {
              blockType: 'text',
              content: 'The syntax for a CTE:\n\n```sql\nWITH cte_name AS (\n    -- your subquery here\n    SELECT department_id, AVG(salary) AS avg_salary\n    FROM employees\n    GROUP BY department_id\n)\nSELECT e.name, e.salary, c.avg_salary\nFROM employees e\nINNER JOIN cte_name c ON e.department_id = c.department_id\nWHERE e.salary > c.avg_salary;\n```\n\nThe CTE `cte_name` is defined once at the top, then used just like a regular table in the main SELECT. The database computes it once (in most engines) and the result is available throughout the query.'
            },
            {
              blockType: 'text',
              content: 'You can define **multiple CTEs** in the same query, separated by commas. Each CTE can reference the ones defined before it:\n\n```sql\nWITH\nmonthly_revenue AS (\n    SELECT\n        DATE_TRUNC(\'month\', created_at) AS month,\n        SUM(amount) AS revenue\n    FROM orders\n    GROUP BY 1\n),\navg_monthly AS (\n    SELECT AVG(revenue) AS avg_rev\n    FROM monthly_revenue        -- references the first CTE!\n)\nSELECT month, revenue\nFROM monthly_revenue, avg_monthly\nWHERE revenue > avg_monthly.avg_rev\nORDER BY month;\n```\n\nThis finds months with above-average revenue. Notice the second CTE `avg_monthly` references `monthly_revenue`. This chaining ability makes multi-step data transformations clean and easy to follow.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Use CTEs to Show Your Thought Process',
              content: 'In a CoderPad interview, CTEs are a superpower for communication. Instead of writing one deeply nested query, write your logic in steps: "First I\'ll compute total revenue per customer (CTE 1), then I\'ll rank them (CTE 2), then filter to the top 10 (main query)." Interviewers can follow your reasoning at each step. This is far more impressive than a correct but unreadable nested subquery.'
            },
            {
              blockType: 'text',
              content: 'CTE vs subquery - when to choose which:\n\n**Use a CTE when:**\n- You need to reuse the same subquery result more than once\n- Your logic has multiple steps that are easier to read separately\n- You want to explain your approach clearly during an interview\n- The query is getting deeply nested and hard to follow\n\n**Use a subquery when:**\n- The query is simple and one-off\n- You only need the result in one specific place\n- You want slightly more compact code\n\nIn interviews, CTEs are almost always the better choice for readability. Clean code that is easy to explain beats compact code that is hard to follow.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Side-by-side comparison of the same query written two ways. Left side labeled "Subquery approach" shows deeply nested SQL with a FROM clause subquery inside another FROM clause subquery - visually messy with many parentheses. Right side labeled "CTE approach" shows the same logic split into two clean WITH blocks named "step_1" and "step_2", followed by a simple main SELECT. Arrow between them says "Same result, but CTE is readable." Highlight the improved readability of CTEs.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: 'A complete real-world example that combines CTEs with JOINs and aggregations - the kind of multi-step problem that appears in intermediate interviews:\n\n```sql\n-- Find customers whose total spending in Q1 2024\n-- is above the average Q1 spending across all customers\n\nWITH q1_spending AS (\n    SELECT\n        o.customer_id,\n        SUM(o.amount) AS total_spent\n    FROM orders o\n    WHERE o.created_at >= \'2024-01-01\'\n      AND o.created_at <  \'2024-04-01\'\n    GROUP BY o.customer_id\n),\navg_spending AS (\n    SELECT AVG(total_spent) AS avg_spent\n    FROM q1_spending\n)\nSELECT\n    c.name,\n    qs.total_spent,\n    ROUND(as2.avg_spent, 2) AS avg_benchmark\nFROM q1_spending qs\nINNER JOIN customers c  ON qs.customer_id = c.id\nCROSS JOIN avg_spending as2\nWHERE qs.total_spent > as2.avg_spent\nORDER BY qs.total_spent DESC;\n```\n\n`CROSS JOIN avg_spending` works here because `avg_spending` returns exactly one row - we just want to attach that single average value to every row in the result. This is a neat trick worth knowing.'
            },
            {
              blockType: 'text',
              content: '`DATE_TRUNC` appears in many interview problems and is worth knowing for PostgreSQL. It truncates a timestamp to the specified precision:\n\n```sql\nDATE_TRUNC(\'month\', created_at)   -- 2024-03-15 -> 2024-03-01\nDATE_TRUNC(\'year\',  created_at)   -- 2024-03-15 -> 2024-01-01\nDATE_TRUNC(\'week\',  created_at)   -- rounds down to Monday\nDATE_TRUNC(\'day\',   created_at)   -- strips time, keeps date\n```\n\nCommon interview pattern: "show revenue by month" means GROUP BY DATE_TRUNC(\'month\', created_at). Similarly, `EXTRACT(YEAR FROM date_col)` pulls just the year as a number - useful in WHERE clauses.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'What is the main advantage of using a CTE over a nested subquery in an interview setting?',
              tagSlugs: ['sql', 'intermediate', 'cte', 'best-practices', 'interview-prep'],
              choices: [
                'CTEs always execute faster than subqueries',
                'CTEs allow you to use aggregate functions in WHERE clauses',
                'CTEs improve readability and allow you to name and reuse intermediate steps',
                'CTEs are the only way to reference the same subquery twice'
              ],
              correctAnswer: 'CTEs improve readability and allow you to name and reuse intermediate steps',
              solution: 'CTEs do not guarantee better performance (that depends on the database engine), and they do not change WHERE clause rules. Their main benefits are readability (named steps are self-documenting) and the ability to reference the same intermediate result multiple times without repeating code. In interviews, readability and clear communication are extremely valuable.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'In a query with two CTEs (named "first_cte" and "second_cte"), can "second_cte" reference "first_cte" in its definition?',
              tagSlugs: ['sql', 'intermediate', 'cte'],
              choices: [
                'No - CTEs cannot reference each other at all',
                'Yes - a CTE can reference any CTE defined before it in the same WITH clause',
                'Only if first_cte is defined with the RECURSIVE keyword',
                'Only if both CTEs are in separate WITH clauses'
              ],
              correctAnswer: 'Yes - a CTE can reference any CTE defined before it in the same WITH clause',
              solution: 'In a WITH clause containing multiple CTEs, each CTE can reference any CTE that was defined earlier in the same WITH statement. This enables chaining - you can build step 2 on top of step 1, and step 3 on top of step 2, making complex multi-step transformations clean and readable.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'A CTE defined with the WITH keyword is persisted in the database and can be used in future queries in the same session.',
              tagSlugs: ['sql', 'intermediate', 'cte'],
              correctAnswer: 'false',
              solution: 'False. A CTE is a temporary result set that exists only for the duration of the single query it is defined in. It is not stored in the database and cannot be accessed by subsequent queries. For persistent temporary results across multiple queries in a session, you would use a temporary table (CREATE TEMP TABLE). This distinction may come up in interview theory questions.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Rewrite this nested subquery using a CTE to make it more readable:\n\nSELECT name, salary FROM employees WHERE department_id IN (SELECT id FROM departments WHERE (SELECT AVG(salary) FROM employees e2 WHERE e2.department_id = departments.id) > 90000);',
              tagSlugs: ['sql', 'intermediate', 'cte', 'subqueries', 'interview-prep'],
              solution: 'WITH dept_avg_salaries AS (\n    SELECT d.id AS department_id, AVG(e.salary) AS avg_salary\n    FROM departments d\n    INNER JOIN employees e ON d.id = e.department_id\n    GROUP BY d.id\n),\nhigh_paying_depts AS (\n    SELECT department_id\n    FROM dept_avg_salaries\n    WHERE avg_salary > 90000\n)\nSELECT e.name, e.salary\nFROM employees e\nINNER JOIN high_paying_depts hpd ON e.department_id = hpd.department_id;\n-- This version is far more readable: step 1 computes averages per department, step 2 filters to high-paying departments, main query gets employee details. The logic is self-documenting through the CTE names.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ---------------------------------------------------------
        // LESSON 3.3: Correlated Subqueries
        // ---------------------------------------------------------
        {
          title: 'Lesson 3.3: Correlated Subqueries - The Advanced Pattern',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'A **correlated subquery** is a subquery that references a column from the outer query. This means it runs once for **every row** in the outer query, using values from that row. It is one of the more advanced SQL concepts, and knowing how to recognize and write one correctly will genuinely impress an interviewer. The key insight: unlike a regular subquery which runs once, a correlated subquery is like a loop.'
            },
            {
              blockType: 'text',
              content: 'Compare a regular subquery vs a correlated subquery:\n\n```sql\n-- Regular subquery: inner query runs ONCE\nSELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);\n--                                  ^^^ no reference to outer query\n\n-- Correlated subquery: inner query runs ONCE PER ROW\nSELECT name, salary, department_id\nFROM employees e1\nWHERE salary > (\n    SELECT AVG(salary)\n    FROM employees e2\n    WHERE e2.department_id = e1.department_id  -- references outer query!\n);\n```\n\nThe second query finds employees who earn above their OWN department\'s average - not the company average. The `e1.department_id` reference makes the inner query re-calculate for each employee\'s specific department.'
            },
            {
              blockType: 'text',
              content: 'Correlated subqueries are also the mechanism behind `EXISTS` and `NOT EXISTS`, which you saw in the previous lesson:\n\n```sql\n-- Correlated EXISTS: for each customer row,\n-- check if any order row exists for that customer\nSELECT c.name\nFROM customers c\nWHERE EXISTS (\n    SELECT 1\n    FROM orders o\n    WHERE o.customer_id = c.id   -- c.id comes from outer query\n);\n```\n\nThe `WHERE o.customer_id = c.id` is what makes this correlated - `c.id` is from the outer query. For each customer row, the inner query checks if any matching order exists and returns true or false.'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Performance Warning - Know the Tradeoff',
              content: 'Correlated subqueries can be slow on large tables because they execute once per row in the outer query. A table with 1 million rows means the inner query runs 1 million times. In interviews, mentioning this tradeoff shows maturity: "I would use a correlated subquery here for clarity, but in production I would consider rewriting it as a JOIN or CTE for better performance on large datasets."'
            },
            {
              blockType: 'text',
              content: 'One of the most-asked interview problems that naturally calls for a correlated subquery: **"Find the most recent order for each customer."**\n\n```sql\n-- Correlated subquery approach\nSELECT o1.customer_id, o1.amount, o1.created_at\nFROM orders o1\nWHERE o1.created_at = (\n    SELECT MAX(o2.created_at)\n    FROM orders o2\n    WHERE o2.customer_id = o1.customer_id   -- correlated!\n);\n```\n\nFor each order row (`o1`), the inner query finds the maximum date for that same customer. If the current order\'s date equals that maximum, it IS the most recent order. This pattern appears in many variations: most recent login, highest purchase, first sign-up per region, and so on.'
            },
            {
              blockType: 'text',
              content: 'When to choose a correlated subquery vs a CTE + JOIN approach:\n\n```sql\n-- Correlated subquery (clean, but runs N times)\nSELECT name, salary\nFROM employees e1\nWHERE salary > (\n    SELECT AVG(salary) FROM employees e2\n    WHERE e2.department_id = e1.department_id\n);\n\n-- CTE + JOIN (more performant, preferred in production)\nWITH dept_avgs AS (\n    SELECT department_id, AVG(salary) AS avg_sal\n    FROM employees\n    GROUP BY department_id\n)\nSELECT e.name, e.salary\nFROM employees e\nINNER JOIN dept_avgs d ON e.department_id = d.department_id\nWHERE e.salary > d.avg_sal;\n```\n\nBoth return identical results. The CTE approach aggregates once, then joins - much more efficient for large tables. Knowing this equivalence and being able to offer both solutions in an interview is a mark of experience.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram illustrating correlated subquery execution. Show an outer "employees" table with 4 rows (Alice dept=1, Bob dept=1, Carol dept=2, Dave dept=2). For each row, an arrow points to the inner query running with the specific department_id value. Alice (dept=1): inner query runs with dept=1, returns AVG=80000. Bob (dept=1): inner query runs again with dept=1, returns 80000. Carol (dept=2): inner query runs with dept=2, returns AVG=95000. Dave (dept=2): inner query runs with dept=2, returns 95000. Then show which employees pass the WHERE salary > [dept_avg] check. Title: "Correlated subquery runs once per outer row."',
              align: 'center',
              width: 'md'
            },
            {
              blockType: 'text',
              content: 'The `NOT EXISTS` version of "find unmatched rows" is safer than `NOT IN` when NULLs might be present, and it is a correlated subquery:\n\n```sql\n-- Safe "find customers with no orders" using NOT EXISTS\nSELECT c.name\nFROM customers c\nWHERE NOT EXISTS (\n    SELECT 1\n    FROM orders o\n    WHERE o.customer_id = c.id\n);\n```\n\nCompare this to `NOT IN (SELECT customer_id FROM orders)` - if any order has a NULL customer_id, the NOT IN version silently returns zero results. NOT EXISTS has no such problem. In an interview, offering NOT EXISTS instead of NOT IN and explaining why earns significant respect.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'What makes a subquery "correlated"?',
              tagSlugs: ['sql', 'intermediate', 'correlated-subquery', 'subqueries'],
              choices: [
                'It uses aggregate functions like COUNT or AVG',
                'It is placed in the FROM clause instead of WHERE',
                'It references a column from the outer query, causing it to re-execute for each outer row',
                'It uses the WITH keyword to define a named result set'
              ],
              correctAnswer: 'It references a column from the outer query, causing it to re-execute for each outer row',
              solution: 'A correlated subquery references one or more columns from the outer query in its WHERE clause. Because the value changes for each row of the outer query, the inner query must re-execute for each outer row. This is what distinguishes it from a regular (non-correlated) subquery, which executes once independently.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'NOT EXISTS is generally safer than NOT IN when the subquery might return NULL values.',
              tagSlugs: ['sql', 'intermediate', 'subqueries', 'null-handling', 'gotchas'],
              correctAnswer: 'true',
              solution: 'True. NOT IN has a dangerous behavior: if the subquery returns ANY NULL value, the entire NOT IN condition evaluates to unknown (not true) for all rows, returning zero results. NOT EXISTS checks for the presence of rows rather than comparing values, so it handles NULLs correctly. This is a well-known SQL gotcha that experienced developers know to watch for.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'For a table with 500,000 rows, what is the main performance concern with a correlated subquery in the WHERE clause?',
              tagSlugs: ['sql', 'intermediate', 'correlated-subquery', 'performance'],
              choices: [
                'Correlated subqueries cannot access indexes, making them always slow',
                'The inner query executes once per outer row, potentially running 500,000 times',
                'Correlated subqueries are limited to returning only one column',
                'They require a full table lock, blocking other queries'
              ],
              correctAnswer: 'The inner query executes once per outer row, potentially running 500,000 times',
              solution: 'This is the core performance issue with correlated subqueries. For each of the 500,000 rows in the outer query, the inner query executes separately. This is O(N) subquery executions. Rewriting as a CTE or JOIN computes the inner result once and then joins - far more efficient on large datasets. Mentioning this in an interview and offering the optimized CTE alternative is impressive.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Write a correlated subquery to find the name and salary of the highest-paid employee in each department. Table: "employees" (id, name, salary, department_id).',
              tagSlugs: ['sql', 'intermediate', 'correlated-subquery', 'subqueries', 'interview-prep'],
              solution: 'SELECT name, salary, department_id\nFROM employees e1\nWHERE salary = (\n    SELECT MAX(salary)\n    FROM employees e2\n    WHERE e2.department_id = e1.department_id\n)\nORDER BY department_id;\n-- Explanation: for each employee row (e1), the inner query finds the maximum salary within the same department (e1.department_id is the correlation). If the employee\'s salary equals that maximum, they are the top earner in their department. Note: if multiple employees tie for the top salary in a department, all of them are returned. Bonus: mention this can also be solved more cleanly with window functions (ROW_NUMBER/RANK) which we cover in Module 4.',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    },

    // =========================================================
    // MODULE 4: Window Functions - Stand Out From Other Candidates
    // =========================================================
    {
      title: 'Module 4: Window Functions - Stand Out From Other Candidates',
      order: 4,
      isPublished: false,

      lessons: [
        // ---------------------------------------------------------
        // LESSON 4.1: ROW_NUMBER, RANK, DENSE_RANK
        // ---------------------------------------------------------
        {
          title: 'Lesson 4.1: ROW_NUMBER, RANK, and DENSE_RANK',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Window functions are the feature that separates SQL novices from confident intermediate developers - and they appear in roughly 70% of intermediate SQL interview questions. Unlike aggregate functions which collapse rows into one, window functions **compute a value for each row based on a set of related rows, while keeping all rows in the result**. The moment you understand that distinction, a whole category of problems that seemed hard become straightforward.'
            },
            {
              blockType: 'text',
              content: 'The syntax for any window function follows this structure:\n\n```sql\nFUNCTION_NAME() OVER (\n    PARTITION BY column    -- optional: define groups\n    ORDER BY column        -- how to sort within each group\n)\n```\n\n- `OVER()` is what makes it a window function - it defines the "window" of rows to consider\n- `PARTITION BY` divides rows into groups (like GROUP BY, but keeps all rows)\n- `ORDER BY` inside OVER sorts within each partition\n\nIf you omit `PARTITION BY`, the window is the entire result set.'
            },
            {
              blockType: 'text',
              content: '**ROW_NUMBER()** assigns a unique sequential integer to each row within its partition, starting at 1. No ties - even if two rows are equal, they get different numbers:\n\n```sql\n-- Rank employees by salary within each department\nSELECT\n    name,\n    department_id,\n    salary,\n    ROW_NUMBER() OVER (\n        PARTITION BY department_id\n        ORDER BY salary DESC\n    ) AS row_num\nFROM employees;\n```\n\nResult: within each department, the highest earner gets row_num=1, second gets 2, etc. The key use case: **filtering to the top N per group** - which is one of the most common interview problems.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Table showing window function results side by side. Input table: 6 employees across 2 departments (dept=1: Alice 90k, Bob 85k, Carol 85k; dept=2: Dave 95k, Eve 80k, Frank 70k). Three output columns shown: ROW_NUMBER() - unique sequential per group (1,2,3 and 1,2,3), RANK() - gaps for ties (1,2,2 and 1,2,3), DENSE_RANK() - no gaps (1,2,2 and 1,2,3). Highlight where RANK differs from DENSE_RANK (gap after the tie: RANK gives 1,2,2,4 while DENSE_RANK gives 1,2,2,3). Title: "ROW_NUMBER vs RANK vs DENSE_RANK - How They Handle Ties".',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: '**RANK()** assigns ranks with **gaps for ties**. If two employees are tied at position 2, both get rank 2, and the next rank is 4 (position 3 is skipped):\n\n```sql\nSELECT name, salary,\n    RANK() OVER (ORDER BY salary DESC) AS rnk\nFROM employees;\n-- Result if salaries are 100k, 90k, 90k, 80k:\n-- ranks will be:          1,    2,    2,    4\n```\n\n**DENSE_RANK()** also handles ties, but **without gaps**. The same two tied employees both get rank 2, and the next rank is 3:\n\n```sql\nSELECT name, salary,\n    DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rnk\nFROM employees;\n-- Result if salaries are 100k, 90k, 90k, 80k:\n-- ranks will be:          1,    2,    2,    3\n```\n\nInterview question tip: when an interviewer says "find the 2nd highest salary," clarify whether they mean RANK (which skips numbers for ties) or DENSE_RANK (which does not).'
            },
            {
              blockType: 'text',
              content: 'The most powerful application of ROW_NUMBER in interviews: **"find the top N rows per group."** This cannot be done elegantly with GROUP BY alone - you need a window function wrapped in a CTE:\n\n```sql\n-- Top 2 highest-paid employees per department\nWITH ranked AS (\n    SELECT\n        name,\n        salary,\n        department_id,\n        ROW_NUMBER() OVER (\n            PARTITION BY department_id\n            ORDER BY salary DESC\n        ) AS rn\n    FROM employees\n)\nSELECT name, salary, department_id\nFROM ranked\nWHERE rn <= 2;\n```\n\nYou cannot put `WHERE rn <= 2` directly in the same query as the ROW_NUMBER - window functions run after WHERE, so the alias does not exist yet. The CTE wrapper solves this cleanly.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'The Pattern Every SQL Interview Tests',
              content: '"Find the top N per group" is probably the single most common window function interview question. Memorize this pattern: (1) write a CTE that adds ROW_NUMBER() with PARTITION BY group_column ORDER BY sort_column DESC, (2) in the outer query, SELECT from the CTE WHERE rn <= N. You will use this pattern constantly.'
            },
            {
              blockType: 'table',
              caption: 'ROW_NUMBER vs RANK vs DENSE_RANK - When to Use Each',
              hasHeaders: true,
              headers: ['Function', 'Handles Ties', 'Gaps in Numbering', 'Best For'],
              rows: [
                ['ROW_NUMBER()', 'No - assigns unique numbers', 'N/A', 'Top-N filtering, pagination, deduplication'],
                ['RANK()', 'Yes - ties get same rank', 'Yes (gaps after ties)', 'Competition-style ranking where gaps make sense'],
                ['DENSE_RANK()', 'Yes - ties get same rank', 'No (no gaps)', 'Finding Nth highest value when ties should not skip numbers']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Salaries in order are: 100k, 90k, 90k, 70k. What ranks does DENSE_RANK() assign to these four rows?',
              tagSlugs: ['sql', 'intermediate', 'window-functions', 'rank'],
              choices: [
                '1, 2, 3, 4',
                '1, 2, 2, 4',
                '1, 2, 2, 3',
                '1, 1, 2, 3'
              ],
              correctAnswer: '1, 2, 2, 3',
              solution: 'DENSE_RANK assigns the same rank to tied values but does NOT skip numbers. Both 90k employees share rank 2, and the next distinct salary (70k) gets rank 3 - not rank 4. Compare with RANK() which would give 1,2,2,4 (skipping 3 because two rows share rank 2). DENSE_RANK is best when you want the "2nd highest salary" to always exist even if the top salary has duplicates.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Why do you need a CTE (or subquery) when using ROW_NUMBER() to filter rows (e.g., WHERE rn <= 3)?',
              tagSlugs: ['sql', 'intermediate', 'window-functions', 'row-number', 'cte'],
              choices: [
                'Window functions cannot be used without a CTE',
                'WHERE clause runs before window functions are computed, so the alias does not exist yet',
                'ROW_NUMBER() requires the PARTITION BY clause to be specified',
                'PostgreSQL does not support window functions in WHERE clauses for performance reasons'
              ],
              correctAnswer: 'WHERE clause runs before window functions are computed, so the alias does not exist yet',
              solution: 'SQL execution order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT (where window functions run) -> ORDER BY. Window functions are computed in the SELECT phase, after WHERE has already run. So you cannot filter on a window function result in the same query\'s WHERE clause. Wrapping in a CTE or subquery makes the window result available as a "regular" column that a new outer WHERE can filter.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'PARTITION BY in a window function works like GROUP BY - it collapses the rows into one row per group.',
              tagSlugs: ['sql', 'intermediate', 'window-functions', 'partition-by'],
              correctAnswer: 'false',
              solution: 'False. This is the fundamental difference between window functions and aggregate functions. PARTITION BY divides rows into groups for the window calculation, but unlike GROUP BY, it does NOT reduce the number of rows. Every original row remains in the result, just with an additional column containing the window function result calculated within its partition.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Classic interview question: "Find the 3rd highest salary in the company." Write it using DENSE_RANK(). Table: "employees" (id, name, salary). Consider: what should happen if multiple employees share the 3rd highest salary?',
              tagSlugs: ['sql', 'intermediate', 'window-functions', 'rank', 'interview-prep', 'problem-patterns'],
              solution: 'WITH salary_ranks AS (\n    SELECT name, salary,\n        DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\n    FROM employees\n)\nSELECT name, salary\nFROM salary_ranks\nWHERE rnk = 3;\n-- DENSE_RANK is the right choice here because: if multiple people share the 2nd highest salary, RANK() would skip rank 3 entirely, and "3rd highest" would not exist. DENSE_RANK always finds the 3rd distinct salary level. If multiple employees share the 3rd highest salary, they ALL appear in the result - which is the correct behavior. Worth mentioning: some interviewers want only one row, in which case ROW_NUMBER LIMIT 1 with careful ordering would apply.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ---------------------------------------------------------
        // LESSON 4.2: PARTITION BY + ORDER BY Patterns
        // ---------------------------------------------------------
        {
          title: 'Lesson 4.2: PARTITION BY and ORDER BY - The Core Window Patterns',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Once you understand that window functions work over a "window" of rows without collapsing them, you can combine `PARTITION BY` and `ORDER BY` inside `OVER()` to answer a huge variety of interview questions. This lesson covers the key patterns: aggregate window functions (SUM, AVG, COUNT over windows), and how PARTITION BY combines with aggregate logic to replace complex subqueries with clean, efficient SQL.'
            },
            {
              blockType: 'text',
              content: 'You can use any aggregate function as a window function by adding `OVER()`. This adds the aggregate result as a column without collapsing rows:\n\n```sql\n-- Show each employee\'s salary AND their department\'s average salary\nSELECT\n    name,\n    department_id,\n    salary,\n    AVG(salary) OVER (PARTITION BY department_id) AS dept_avg,\n    salary - AVG(salary) OVER (PARTITION BY department_id) AS diff_from_avg\nFROM employees;\n```\n\nWithout window functions, this would require a correlated subquery or a JOIN with a CTE. With window functions, it is a single clean query. Every employee row stays, with two extra calculated columns added.'
            },
            {
              blockType: 'text',
              content: 'Adding `ORDER BY` inside `OVER()` changes the window from "all rows in the partition" to a **cumulative/running** window - rows from the first row up to the current row:\n\n```sql\n-- Running total of salary within each department, ordered by hire date\nSELECT\n    name,\n    department_id,\n    hire_date,\n    salary,\n    SUM(salary) OVER (\n        PARTITION BY department_id\n        ORDER BY hire_date\n    ) AS running_total\nFROM employees;\n```\n\nThis gives a cumulative sum: each employee\'s row shows the total salary of everyone in their department hired up to and including that employee. This is the **running total** pattern - a classic interview question.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'The Window Frame Clause (ROWS/RANGE)',
              content: 'When you add ORDER BY inside OVER(), the default window frame becomes "from the first row of the partition to the current row" (RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW). You can customize this with ROWS BETWEEN n PRECEDING AND n FOLLOWING for moving averages. For most interviews, knowing the default behavior is enough - just know that ORDER BY inside OVER() implies a cumulative/running calculation.'
            },
            {
              blockType: 'text',
              content: 'Combining window functions with regular WHERE and GROUP BY - a common source of confusion. Window functions run in the SELECT phase, AFTER WHERE and HAVING. This means:\n\n1. WHERE filters happen first (window functions see only the filtered rows)\n2. GROUP BY and HAVING happen next\n3. Window functions run after, over the filtered/grouped result\n4. ORDER BY and LIMIT happen last\n\n```sql\n-- Window function runs on the already-filtered rows\nSELECT\n    name, salary,\n    RANK() OVER (ORDER BY salary DESC) AS company_rank\nFROM employees\nWHERE department_id = 3;   -- filter first, then rank within that set\n```'
            },
            {
              blockType: 'text',
              content: 'A powerful real-world window function query - comparing each employee\'s salary to multiple benchmarks at once:\n\n```sql\nSELECT\n    e.name,\n    e.department_id,\n    e.salary,\n    AVG(e.salary) OVER ()                        AS company_avg,\n    AVG(e.salary) OVER (PARTITION BY department_id) AS dept_avg,\n    MAX(e.salary) OVER (PARTITION BY department_id) AS dept_max,\n    RANK()        OVER (PARTITION BY department_id\n                        ORDER BY salary DESC)     AS dept_rank\nFROM employees e\nORDER BY department_id, dept_rank;\n```\n\nMultiple `OVER()` clauses in a single SELECT are perfectly valid - each defines its own window independently. This query shows company average (no partition = whole table), department average (partitioned), department max, and rank - all in one pass through the data.'
            },
            {
              blockType: 'text',
              content: 'Using `COUNT(*) OVER (PARTITION BY ...)` adds the group size as a column - useful for calculating percentages within groups:\n\n```sql\n-- What percentage of total orders does each status represent?\nSELECT\n    status,\n    COUNT(*) AS status_count,\n    COUNT(*) OVER () AS total_orders,\n    ROUND(\n        100.0 * COUNT(*) / COUNT(*) OVER (),\n        2\n    ) AS pct_of_total\nFROM orders\nGROUP BY status;\n```\n\nHere `COUNT(*) OVER ()` runs over the entire result set (no PARTITION BY = no partitioning = the whole table is one window). This lets you calculate percentages without a separate subquery for the total.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Step-by-step visualization of PARTITION BY behavior. Show a table of 6 orders split across 2 customers (customer_id=1 and customer_id=2). For AVG(amount) OVER (PARTITION BY customer_id): draw two separate boxes around each customer\'s rows, label each box "Window for customer 1" and "Window for customer 2". Show that AVG is calculated separately within each box. Result column shows customer 1\'s rows all get the same avg (e.g., 150), and customer 2\'s rows all get their own avg (e.g., 220). Emphasize: all 6 rows are still present in the output.',
              align: 'center',
              width: 'md'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'What does AVG(salary) OVER () return (with empty parentheses after OVER)?',
              tagSlugs: ['sql', 'intermediate', 'window-functions', 'partition-by'],
              choices: [
                'An error - OVER() requires at least PARTITION BY or ORDER BY',
                'The average salary within the current row\'s department',
                'The average salary across the entire result set (no partitioning)',
                'NULL, because no window is defined'
              ],
              correctAnswer: 'The average salary across the entire result set (no partitioning)',
              solution: 'OVER() with empty parentheses is valid and means "the window is the entire result set." No PARTITION BY means all rows form one single partition. No ORDER BY means the window frame includes all rows in that partition. So AVG(salary) OVER () returns the same company-wide average for every row in the result.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'When you use ORDER BY inside an OVER() clause with SUM(), the result is a running/cumulative total rather than the total for the entire partition.',
              tagSlugs: ['sql', 'intermediate', 'window-functions', 'running-totals'],
              correctAnswer: 'true',
              solution: 'True. Adding ORDER BY inside OVER() changes the default window frame from "all rows in partition" to "all rows from the start of the partition up to and including the current row." This creates a cumulative/running calculation. Without ORDER BY, SUM(salary) OVER (PARTITION BY dept) gives the same total for every row in the department. With ORDER BY hire_date, it gives a running total that grows with each row.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'You want to show each employee, their salary, and what percentage of their department\'s total salary they represent. Which approach is cleanest?',
              tagSlugs: ['sql', 'intermediate', 'window-functions', 'partition-by', 'problem-patterns'],
              choices: [
                'Use a correlated subquery in the SELECT to compute the department total for each row',
                'Use SUM(salary) OVER (PARTITION BY department_id) to get the department total as a window function, then divide',
                'JOIN the employees table with a GROUP BY subquery that computes department totals',
                'Use HAVING SUM(salary) to filter after grouping'
              ],
              correctAnswer: 'Use SUM(salary) OVER (PARTITION BY department_id) to get the department total as a window function, then divide',
              solution: 'Window functions are the cleanest solution here. SUM(salary) OVER (PARTITION BY department_id) adds the department total as a column to every row, without collapsing rows. Then you divide individual salary by that total to get the percentage - all in a single query. The correlated subquery approach works but runs N times. The JOIN approach works but requires a CTE. Window functions are more concise and usually more efficient.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Write a SQL query that shows each order (id, customer_id, amount, created_at) alongside:\n1. That customer\'s running total amount (ordered by created_at)\n2. That customer\'s total order count so far (running count)\n3. The overall average order amount across all orders\n\nTable: "orders" (id, customer_id, amount, created_at)',
              tagSlugs: ['sql', 'intermediate', 'window-functions', 'running-totals', 'partition-by', 'interview-prep'],
              solution: 'SELECT\n    id,\n    customer_id,\n    amount,\n    created_at,\n    SUM(amount) OVER (\n        PARTITION BY customer_id\n        ORDER BY created_at\n    ) AS customer_running_total,\n    COUNT(*) OVER (\n        PARTITION BY customer_id\n        ORDER BY created_at\n    ) AS customer_running_order_count,\n    AVG(amount) OVER () AS overall_avg_amount\nFROM orders\nORDER BY customer_id, created_at;\n-- Key points: PARTITION BY customer_id + ORDER BY created_at creates a running window per customer. AVG(amount) OVER () with empty parentheses covers the full result set. All three window functions can coexist in one SELECT - each defines its own independent window.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ---------------------------------------------------------
        // LESSON 4.3: LEAD, LAG, and Running Totals
        // ---------------------------------------------------------
        {
          title: 'Lesson 4.3: LEAD, LAG, and Advanced Window Patterns',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'The final window function category covers **offset functions** - `LEAD` and `LAG` - which let you access values from other rows relative to the current row. These are extremely useful for time-series comparisons: "how does this month compare to last month?", "what was the previous order amount?", "how many days since the last event?". These questions appear frequently in data services and backend engineer interviews.'
            },
            {
              blockType: 'text',
              content: '**LAG()** accesses a value from a **previous** row within the window. **LEAD()** accesses a value from a **following** row:\n\n```sql\nSELECT\n    month,\n    revenue,\n    LAG(revenue)  OVER (ORDER BY month) AS prev_month_revenue,\n    LEAD(revenue) OVER (ORDER BY month) AS next_month_revenue\nFROM monthly_revenue;\n```\n\nFor the first row, `LAG(revenue)` returns NULL (no previous row). For the last row, `LEAD(revenue)` returns NULL. You can provide a default value as the second argument: `LAG(revenue, 1, 0)` returns 0 instead of NULL when there is no previous row.'
            },
            {
              blockType: 'text',
              content: 'The most common interview use case for LAG: **month-over-month change or growth rate**:\n\n```sql\nWITH monthly AS (\n    SELECT\n        DATE_TRUNC(\'month\', created_at) AS month,\n        SUM(amount)                     AS revenue\n    FROM orders\n    GROUP BY 1\n)\nSELECT\n    month,\n    revenue,\n    LAG(revenue) OVER (ORDER BY month)  AS prev_revenue,\n    revenue - LAG(revenue) OVER (ORDER BY month)  AS change,\n    ROUND(\n        100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))\n             / LAG(revenue) OVER (ORDER BY month),\n        2\n    ) AS pct_change\nFROM monthly\nORDER BY month;\n```\n\nThis shows month, revenue, previous month revenue, absolute change, and percentage change - all in one query. This exact pattern appears in data services interviews constantly.'
            },
            {
              blockType: 'text',
              content: 'LAG and LEAD can also work within partitions, making them useful for per-group comparisons:\n\n```sql\n-- Compare each employee\'s salary to the previous hire in the same department\nSELECT\n    name,\n    department_id,\n    hire_date,\n    salary,\n    LAG(salary) OVER (\n        PARTITION BY department_id\n        ORDER BY hire_date\n    ) AS prev_hire_salary,\n    salary - LAG(salary) OVER (\n        PARTITION BY department_id\n        ORDER BY hire_date\n    ) AS salary_diff\nFROM employees\nORDER BY department_id, hire_date;\n```\n\nPARTITION BY resets the LAG calculation at each department boundary, so the first employee in each department gets NULL (no previous hire in that department).'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'LAG/LEAD Optional Arguments',
              content: 'LAG and LEAD accept up to three arguments: LAG(column, offset, default). The offset (default 1) sets how many rows back/forward to look. The default replaces NULL when no row exists at that offset. Example: LAG(revenue, 2, 0) looks 2 rows back and returns 0 if none exists. Knowing this in an interview shows attention to detail.'
            },
            {
              blockType: 'text',
              content: 'The **NTILE(n)** window function divides rows into n roughly equal buckets and assigns a bucket number:\n\n```sql\n-- Divide customers into 4 spending quartiles\nSELECT\n    customer_id,\n    total_spent,\n    NTILE(4) OVER (ORDER BY total_spent DESC) AS spending_quartile\nFROM customer_totals;\n```\n\nQuartile 1 = top 25% spenders, Quartile 4 = bottom 25%. This is often used in segmentation - "which quartile does this customer fall into?" You might also see NTILE(10) for deciles, or NTILE(100) for percentiles.'
            },
            {
              blockType: 'text',
              content: 'A comprehensive window function "cheat sheet" query that demonstrates all patterns in one place - very useful for interview practice and revision:\n\n```sql\nSELECT\n    employee_id,\n    department_id,\n    salary,\n    hire_date,\n\n    -- Ranking functions\n    ROW_NUMBER()  OVER (PARTITION BY department_id ORDER BY salary DESC) AS row_num,\n    RANK()        OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk,\n    DENSE_RANK()  OVER (PARTITION BY department_id ORDER BY salary DESC) AS dense_rnk,\n\n    -- Aggregate windows\n    SUM(salary)   OVER (PARTITION BY department_id) AS dept_total,\n    AVG(salary)   OVER (PARTITION BY department_id) AS dept_avg,\n    COUNT(*)      OVER (PARTITION BY department_id) AS dept_headcount,\n\n    -- Running/cumulative (ORDER BY inside OVER)\n    SUM(salary)   OVER (PARTITION BY department_id ORDER BY hire_date) AS running_payroll,\n\n    -- Offset functions\n    LAG(salary)   OVER (PARTITION BY department_id ORDER BY hire_date) AS prev_hire_salary,\n    LEAD(salary)  OVER (PARTITION BY department_id ORDER BY hire_date) AS next_hire_salary,\n\n    -- Bucketing\n    NTILE(4)      OVER (ORDER BY salary DESC) AS salary_quartile\n\nFROM employees;\n```'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Summary reference card showing all window function categories in a structured layout. Section 1 "Ranking": ROW_NUMBER, RANK, DENSE_RANK with brief descriptions. Section 2 "Aggregates over window": SUM, AVG, COUNT, MAX, MIN with OVER(). Section 3 "Running calculations": same aggregates + ORDER BY inside OVER(). Section 4 "Offset": LAG (previous row), LEAD (next row), NTILE (bucketing). For each function show: syntax pattern, what it returns, and a one-line example. Style it like a developer reference card.',
              align: 'center',
              width: 'lg'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'What does LAG(amount, 1, 0) return for the very first row in the window?',
              tagSlugs: ['sql', 'intermediate', 'window-functions', 'lead-lag'],
              choices: [
                'NULL, because there is no previous row',
                '0, because the default value 0 is used when no previous row exists',
                'The amount value of the last row in the window',
                'An error, because LAG cannot be applied to the first row'
              ],
              correctAnswer: '0, because the default value 0 is used when no previous row exists',
              solution: 'LAG(column, offset, default) takes a third argument: the default value to use when no row exists at the specified offset. For the first row, there is no previous row, so normally LAG would return NULL. By specifying 0 as the default, we get 0 instead of NULL. This is useful for running totals or difference calculations where NULL would cause downstream arithmetic to also return NULL.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'What does NTILE(4) OVER (ORDER BY salary DESC) AS quartile return for an employee in the top 25% of salaries?',
              tagSlugs: ['sql', 'intermediate', 'window-functions'],
              choices: [
                '4, because 4 is the highest bucket',
                '1, because it is the first (highest) quartile',
                '25, because they are in the top 25%',
                'NULL, because NTILE cannot determine exact quartiles'
              ],
              correctAnswer: '1, because it is the first (highest) quartile',
              solution: 'NTILE(4) divides rows into 4 groups ordered by salary descending. Bucket 1 is the first group - the top 25% earners since we order by salary descending. Bucket 4 would be the lowest 25%. Think of it as "bucket number in sorted order" - with ORDER BY salary DESC, the highest salaries come first, so they land in bucket 1.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'LEAD() and LAG() can be combined with PARTITION BY, so they only look at rows within the same partition when looking ahead or behind.',
              tagSlugs: ['sql', 'intermediate', 'window-functions', 'lead-lag', 'partition-by'],
              correctAnswer: 'true',
              solution: 'True. LEAD and LAG respect partition boundaries. With PARTITION BY department_id, LAG() only looks at the previous row within the same department. At the first row of each new partition, LAG() returns NULL (or the default value if specified), because there is no previous row within that partition. This makes per-group temporal comparisons clean and correct.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Interview question: "Given a monthly_sales table (month DATE, product_id INT, revenue DECIMAL), write a query that shows for each product and month: the revenue, the previous month\'s revenue, and the month-over-month percentage change. Handle the case where there is no previous month gracefully."',
              tagSlugs: ['sql', 'intermediate', 'window-functions', 'lead-lag', 'partition-by', 'interview-prep', 'problem-patterns'],
              solution: 'SELECT\n    product_id,\n    month,\n    revenue,\n    LAG(revenue, 1, NULL) OVER (\n        PARTITION BY product_id\n        ORDER BY month\n    ) AS prev_month_revenue,\n    CASE\n        WHEN LAG(revenue) OVER (PARTITION BY product_id ORDER BY month) IS NULL\n        THEN NULL\n        ELSE ROUND(\n            100.0 * (revenue - LAG(revenue) OVER (PARTITION BY product_id ORDER BY month))\n                  / LAG(revenue) OVER (PARTITION BY product_id ORDER BY month),\n            2\n        )\n    END AS mom_pct_change\nFROM monthly_sales\nORDER BY product_id, month;\n-- Key decisions: PARTITION BY product_id means LAG looks within each product\'s history only. CASE handles first month gracefully (returns NULL instead of dividing by zero or NULL). The percentage formula is: (new - old) / old * 100. Note: repeating the LAG expression - in production you would wrap this in a CTE to avoid repeating the window definition.',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    }
  ]
};
