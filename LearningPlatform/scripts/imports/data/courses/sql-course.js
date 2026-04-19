// data/courses/sql-course.js
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
    // MODULE 1: SQL Foundations - The Interview Baseline
    // =========================================================
    {
      title: 'Module 1: SQL Foundations - The Interview Baseline',
      order: 1,
      isPublished: false,

      lessons: [
        // ---------------------------------------------------------
        // LESSON 1.1: How Relational Databases Work
        // ---------------------------------------------------------
        {
          title: 'Lesson 1.1: How Relational Databases Work',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Before you write a single query in an interview, your interviewer is already forming an opinion: do you understand **why** SQL exists? Most candidates jump straight into syntax. The ones who stand out explain their thinking first - and that starts with understanding the relational model. Spending two minutes on this foundation will save you from a lot of confusion when queries behave unexpectedly.'
            },
            {
              blockType: 'text',
              content: 'A **relational database** organizes data into **tables** (also called relations). Each table represents one type of entity - for example, a `users` table holds information about users, an `orders` table holds information about orders. Each row in a table is one record (one user, one order). Each column defines a property of that entity (name, email, created_at). This separation by entity type is fundamental - it is why we need JOINs to combine data from multiple tables.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram showing two tables side by side: a "users" table (columns: id, name, email) and an "orders" table (columns: id, user_id, amount, created_at). An arrow labeled "user_id references users.id" connects the two tables. Below, show a simple example row in each table. This illustrates the relationship between tables via foreign keys.',
              align: 'center',
              width: 'md'
            },
            {
              blockType: 'text',
              content: 'Tables are connected to each other through **keys**. A **primary key** is a column (or set of columns) that uniquely identifies each row in a table - think of it as the row\'s ID. A **foreign key** is a column in one table that references the primary key of another table. For example, the `orders` table has a `user_id` column that refers to the `id` column in the `users` table. This link is what tells the database: "this order belongs to that user."'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'What Interviewers Listen For',
              content: 'When an interviewer says "here is the schema," they are watching to see if you look at the foreign keys first. Identifying how tables relate to each other before writing any SQL shows database maturity. Say out loud: "I can see orders.user_id references users.id, so I will need a JOIN here."'
            },
            {
              blockType: 'text',
              content: 'SQL (Structured Query Language) is the language you use to talk to a relational database. It has several categories of commands, but in interviews you will almost exclusively write **DQL** (Data Query Language) - specifically `SELECT` statements. Occasionally you might be asked to write `INSERT`, `UPDATE`, or `DELETE` (DML - Data Manipulation Language), or explain `CREATE TABLE` (DDL - Data Definition Language). Knowing these categories by name impresses interviewers who ask "what types of SQL commands are there?"'
            },
            {
              blockType: 'table',
              caption: 'SQL Command Categories - Know the Names for Interview Theory Questions',
              hasHeaders: true,
              headers: ['Category', 'Full Name', 'Key Commands', 'Interview Frequency'],
              rows: [
                ['DQL', 'Data Query Language', 'SELECT', 'Very High - almost every question'],
                ['DML', 'Data Manipulation Language', 'INSERT, UPDATE, DELETE', 'Medium - sometimes asked'],
                ['DDL', 'Data Definition Language', 'CREATE, ALTER, DROP', 'Low - mostly theory'],
                ['TCL', 'Transaction Control Language', 'COMMIT, ROLLBACK, SAVEPOINT', 'Medium - ACID questions'],
                ['DCL', 'Data Control Language', 'GRANT, REVOKE', 'Low - rarely tested']
              ]
            },
            {
              blockType: 'text',
              content: 'The SQL execution order is one of the most commonly misunderstood concepts - and it trips up candidates during debugging. The order you **write** a query is not the order the database **executes** it. Understanding execution order explains why you cannot use a SELECT alias in a WHERE clause, and why HAVING must come after GROUP BY. This knowledge helps you write queries correctly on the first try - crucial when you are being watched during a live coding session.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Vertical flowchart showing SQL execution order with numbered steps: 1. FROM (which table?), 2. JOIN (combine tables), 3. WHERE (filter rows), 4. GROUP BY (group rows), 5. HAVING (filter groups), 6. SELECT (choose columns), 7. DISTINCT (remove duplicates), 8. ORDER BY (sort), 9. LIMIT (restrict count). Each step should have a short annotation explaining what happens. Title: "SQL Execution Order - Not the same as writing order!"',
              align: 'center',
              width: 'md'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'In a database, what is the purpose of a foreign key?',
              tagSlugs: ['sql', 'database', 'beginner', 'primary-key', 'foreign-key'],
              choices: [
                'To uniquely identify each row in the same table',
                'To speed up queries by indexing columns',
                'To link a row in one table to a row in another table',
                'To prevent NULL values from being inserted'
              ],
              correctAnswer: 'To link a row in one table to a row in another table',
              solution: 'A foreign key is a column in one table that references the primary key of another table, establishing a relationship between them. For example, orders.user_id references users.id, linking each order to the user who placed it.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'In what order does SQL actually execute the clauses of this query?\n\nSELECT name, COUNT(*) FROM orders WHERE amount > 100 GROUP BY name HAVING COUNT(*) > 5 ORDER BY name;',
              tagSlugs: ['sql', 'beginner', 'select'],
              choices: [
                'SELECT -> FROM -> WHERE -> GROUP BY -> HAVING -> ORDER BY',
                'FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY',
                'WHERE -> FROM -> SELECT -> GROUP BY -> HAVING -> ORDER BY',
                'FROM -> SELECT -> WHERE -> HAVING -> GROUP BY -> ORDER BY'
              ],
              correctAnswer: 'FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY',
              solution: 'SQL execution order is: FROM (identify the table), WHERE (filter rows), GROUP BY (group remaining rows), HAVING (filter groups), SELECT (pick columns to output), ORDER BY (sort the result). This is why you cannot reference a SELECT alias in a WHERE clause - WHERE runs before SELECT!',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'You can use a column alias defined in SELECT inside the WHERE clause of the same query.',
              tagSlugs: ['sql', 'beginner', 'gotchas', 'select'],
              correctAnswer: 'false',
              solution: 'False. WHERE is executed before SELECT in SQL\'s logical processing order, so the alias has not been defined yet when WHERE runs. You must repeat the full expression in WHERE, or use a subquery/CTE to wrap the query and then filter on the alias.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'An interviewer shows you two tables: a "customers" table and a "purchases" table. The purchases table has a "customer_id" column. Before writing any SQL, what would you say out loud to demonstrate database understanding? What are you looking for in the schema?',
              tagSlugs: ['sql', 'database', 'interview-prep', 'beginner'],
              solution: 'A strong candidate would say: "I can see that purchases.customer_id is a foreign key referencing customers.id - that is how the two tables relate. To get data from both tables, I will need a JOIN on that relationship. I also want to check what other columns exist - for example, does the customers table have a name column, and does purchases have an amount or date column? Understanding the shape of the data helps me know which JOIN type is appropriate." This demonstrates schema-reading skills before any code is written.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // ---------------------------------------------------------
        // LESSON 1.2: SELECT Deep Dive
        // ---------------------------------------------------------
        {
          title: 'Lesson 1.2: SELECT Deep Dive - Filtering, Sorting, Aliasing',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'The `SELECT` statement is the foundation of every SQL interview question. Even complex window function queries are ultimately SELECT statements. Getting completely comfortable with all of SELECT\'s clauses - not just "SELECT column FROM table" - is what separates candidates who feel confident from those who freeze up. This lesson covers every major SELECT clause you need for interviews, with the exact patterns that come up most often.'
            },
            {
              blockType: 'text',
              content: 'The basic SELECT anatomy looks like this:\n\n```sql\nSELECT column1, column2        -- what to show\nFROM table_name                -- where to get it\nWHERE condition                -- filter rows (optional)\nORDER BY column1 ASC/DESC      -- sort results (optional)\nLIMIT n;                       -- cap the number of rows (optional)\n```\n\nEvery clause is optional except SELECT and FROM. In an interview, always end your queries with a semicolon - it signals that you know SQL is a complete statement.'
            },
            {
              blockType: 'text',
              content: 'The `WHERE` clause filters rows **before** any grouping happens. You can combine multiple conditions using `AND`, `OR`, and `NOT`. Common operators you need to know for interviews:\n\n- `=` equals, `!=` or `<>` not equal\n- `>`, `<`, `>=`, `<=` comparisons\n- `BETWEEN x AND y` inclusive range check\n- `IN (val1, val2, val3)` match any value in a list\n- `LIKE \'pattern%\'` pattern matching (% is wildcard)\n- `IS NULL` / `IS NOT NULL` checking for missing values\n\nNote: never use `= NULL` to check for null - it will **always** return false. Always use `IS NULL`.'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'The NULL Trap - Most Common Beginner Mistake',
              content: 'Writing "WHERE column = NULL" is a very common interview mistake. NULL is not a value - it represents the absence of a value. Two NULLs are not equal to each other. Always write "WHERE column IS NULL" or "WHERE column IS NOT NULL". Interviewers watch for this.'
            },
            {
              blockType: 'text',
              content: '**Aliases** make your query readable and are essential in interviews because they clarify your intent to the interviewer watching you type. Use the `AS` keyword (or just a space) to rename columns and tables:\n\n```sql\nSELECT\n    first_name AS name,\n    salary * 12 AS annual_salary,\n    department_id AS dept\nFROM employees e              -- "e" is a table alias\nWHERE e.salary > 50000;\n```\n\nTable aliases become mandatory when you use JOINs (coming in Module 2), because you need to specify which table a column comes from.'
            },
            {
              blockType: 'text',
              content: '`ORDER BY` sorts your results. You can sort by multiple columns, and each can go in a different direction:\n\n```sql\nSELECT name, salary, department\nFROM employees\nORDER BY department ASC, salary DESC;\n```\n\nThis sorts by department A-Z, and within each department, highest salary first. `ASC` (ascending) is the default, so you only need to write it for clarity. In interviews, adding `ORDER BY` to your final answer often shows extra polish - especially when the question says "return the top N" or "order by date."'
            },
            {
              blockType: 'text',
              content: '`DISTINCT` removes duplicate rows from your result. It applies to the entire selected row, not just one column:\n\n```sql\nSELECT DISTINCT department FROM employees;    -- unique departments\nSELECT DISTINCT first_name, last_name FROM employees;  -- unique name combos\n```\n\n`LIMIT` (PostgreSQL/MySQL syntax) caps the number of rows returned. This is used heavily in interview questions that say "find the top 3" or "get the most recent 10 orders":\n\n```sql\nSELECT * FROM orders ORDER BY created_at DESC LIMIT 5;\n```'
            },
            {
              blockType: 'table',
              caption: 'WHERE Clause Operators Cheat Sheet - Memorize These for CoderPad',
              hasHeaders: true,
              headers: ['Operator', 'Example', 'What It Does'],
              rows: [
                ['=', 'WHERE status = \'active\'', 'Exact match'],
                ['!=  or  <>', 'WHERE status != \'deleted\'', 'Not equal'],
                ['BETWEEN', 'WHERE age BETWEEN 18 AND 65', 'Inclusive range (18 and 65 included)'],
                ['IN', 'WHERE country IN (\'US\', \'UK\', \'CA\')', 'Match any value in the list'],
                ['LIKE', 'WHERE name LIKE \'J%\'', '% is wildcard, _ is single character'],
                ['IS NULL', 'WHERE deleted_at IS NULL', 'Check for missing value (never use = NULL)'],
                ['AND / OR', 'WHERE age > 18 AND active = true', 'Combine multiple conditions']
              ]
            },
            {
              blockType: 'text',
              content: 'A realistic interview-style question using just SELECT: "Find the names and salaries of all employees in the Engineering department who earn more than 80000, ordered by salary from highest to lowest."\n\n```sql\nSELECT\n    name,\n    salary\nFROM employees\nWHERE department = \'Engineering\'\n  AND salary > 80000\nORDER BY salary DESC;\n```\n\nNotice the formatting: each clause on its own line, WHERE conditions indented. This is not required, but it makes your query readable to the interviewer - which matters a lot during live coding.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Which query correctly finds all users whose email is NOT set (is NULL)?',
              tagSlugs: ['sql', 'beginner', 'null-handling', 'filtering', 'gotchas'],
              choices: [
                'SELECT * FROM users WHERE email = NULL',
                'SELECT * FROM users WHERE email IS NULL',
                'SELECT * FROM users WHERE email == NULL',
                'SELECT * FROM users WHERE NOT email'
              ],
              correctAnswer: 'SELECT * FROM users WHERE email IS NULL',
              solution: 'NULL represents the absence of a value, not a value itself. Comparisons using = NULL always return false (or unknown) in SQL, because NULL is not equal to anything, including another NULL. You must use IS NULL to check for missing values.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'You need the 5 most recently created orders. Which query is correct (PostgreSQL)?',
              tagSlugs: ['sql', 'beginner', 'sorting', 'select'],
              choices: [
                'SELECT * FROM orders ORDER BY created_at ASC LIMIT 5',
                'SELECT * FROM orders ORDER BY created_at DESC LIMIT 5',
                'SELECT TOP 5 * FROM orders ORDER BY created_at DESC',
                'SELECT * FROM orders LIMIT 5 ORDER BY created_at DESC'
              ],
              correctAnswer: 'SELECT * FROM orders ORDER BY created_at DESC LIMIT 5',
              solution: 'To get the most recent records, you sort by the date column descending (newest first with DESC), then LIMIT to 5. Note: TOP is SQL Server syntax, not PostgreSQL. Also, LIMIT must come after ORDER BY - putting it before causes a syntax error.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Which WHERE clause finds all products with a price between 10 and 50 (both inclusive) in the category "Electronics" OR "Books"?',
              tagSlugs: ['sql', 'beginner', 'filtering', 'select'],
              choices: [
                'WHERE price > 10 AND price < 50 AND category = \'Electronics\' OR category = \'Books\'',
                'WHERE price BETWEEN 10 AND 50 AND category IN (\'Electronics\', \'Books\')',
                'WHERE price BETWEEN 10 AND 50 OR category IN (\'Electronics\', \'Books\')',
                'WHERE price >= 10 AND price <= 50 AND (category = \'Electronics\' OR \'Books\')'
              ],
              correctAnswer: 'WHERE price BETWEEN 10 AND 50 AND category IN (\'Electronics\', \'Books\')',
              solution: 'BETWEEN 10 AND 50 is inclusive on both ends (same as >= 10 AND <= 50). IN (\'Electronics\', \'Books\') cleanly checks for either category. The other options have AND/OR precedence bugs or invalid syntax (you cannot write OR \'Books\' without repeating the column name).',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 4,
              prompt: 'SELECT DISTINCT department, role FROM employees will return unique (department, role) combinations, not unique departments alone.',
              tagSlugs: ['sql', 'beginner', 'select'],
              correctAnswer: 'true',
              solution: 'True. DISTINCT applies to the full combination of all selected columns. If you select two columns, DISTINCT removes rows where both columns are identical. To get unique values from just one column, select only that column: SELECT DISTINCT department FROM employees.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 5,
              prompt: 'Write a SQL query to find all orders where the status is either "pending" or "processing", the amount is greater than 100, and the created_at date is in the year 2024. Return the order id, status, and amount, sorted by amount descending. Use the table name "orders".',
              tagSlugs: ['sql', 'beginner', 'filtering', 'sorting', 'interview-prep'],
              solution: 'SELECT id, status, amount FROM orders WHERE status IN (\'pending\', \'processing\') AND amount > 100 AND created_at >= \'2024-01-01\' AND created_at < \'2025-01-01\' ORDER BY amount DESC; -- Alternative for year filter: AND EXTRACT(YEAR FROM created_at) = 2024. The IN clause is cleaner than two OR conditions. The date range using >= and < is more reliable and index-friendly than using BETWEEN with timestamps or EXTRACT.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // ---------------------------------------------------------
        // LESSON 1.3: Aggregate Functions - GROUP BY, HAVING
        // ---------------------------------------------------------
        {
          title: 'Lesson 1.3: Aggregate Functions - COUNT, SUM, AVG, GROUP BY, HAVING',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Aggregate functions and GROUP BY appear in nearly every SQL interview. Questions like "how many orders did each customer place?", "what is the total revenue per product category?", or "which departments have more than 10 employees?" all require aggregation. Mastering this pattern - SELECT, FROM, WHERE, GROUP BY, HAVING - will let you answer a huge proportion of real interview problems.'
            },
            {
              blockType: 'text',
              content: '**Aggregate functions** collapse multiple rows into a single value. The five you must know:\n\n- `COUNT(*)` - count all rows in the group\n- `COUNT(column)` - count rows where column is NOT NULL\n- `SUM(column)` - total of all values\n- `AVG(column)` - average of all values\n- `MAX(column)` / `MIN(column)` - highest / lowest value\n\nWithout GROUP BY, these collapse the entire table into one row. With GROUP BY, they calculate one result per group.'
            },
            {
              blockType: 'text',
              content: 'The `GROUP BY` clause splits rows into groups based on one or more columns, then applies the aggregate function to each group separately:\n\n```sql\n-- How many orders did each customer place?\nSELECT\n    customer_id,\n    COUNT(*) AS order_count\nFROM orders\nGROUP BY customer_id;\n```\n\nThis returns one row per unique `customer_id`, with the count of their orders. **Critical rule:** every column in SELECT that is NOT an aggregate function MUST appear in the GROUP BY clause. Forgetting this is a very common interview error.'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'The GROUP BY Rule That Trips Everyone Up',
              content: 'If you SELECT a column, it must either be in GROUP BY, or be wrapped in an aggregate function. You cannot SELECT "name" and GROUP BY "customer_id" alone - the database does not know which name to pick for the group. Some databases (MySQL) will silently pick a random value; PostgreSQL (CoderPad default) will throw an error. Always check your SELECT list against your GROUP BY.'
            },
            {
              blockType: 'text',
              content: '`HAVING` is the WHERE clause for groups. It filters out entire groups after aggregation has happened. This is the key difference:\n\n- `WHERE` filters **individual rows** BEFORE grouping\n- `HAVING` filters **groups** AFTER grouping and aggregation\n\n```sql\n-- Customers who placed MORE than 3 orders:\nSELECT\n    customer_id,\n    COUNT(*) AS order_count\nFROM orders\nGROUP BY customer_id\nHAVING COUNT(*) > 3;\n```\n\nYou cannot write `WHERE COUNT(*) > 3` - that would be an error because WHERE runs before COUNT is calculated.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Step-by-step diagram showing how GROUP BY + HAVING works on an orders table. Step 1: raw orders table with columns customer_id and amount (8 rows, 3 different customer_ids). Step 2: GROUP BY customer_id splits rows into 3 groups (one per customer). Step 3: COUNT(*) calculates the count per group (e.g., customer 1 has 4, customer 2 has 2, customer 3 has 2). Step 4: HAVING COUNT(*) > 3 removes groups with count 2. Step 5: final result shows only customer 1 with count 4. Use colored boxes to represent row groups.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: 'A complete GROUP BY query putting everything together - this is a realistic interview problem: "Find the total revenue and average order value per product category, but only show categories with total revenue above 10000, sorted by total revenue descending."\n\n```sql\nSELECT\n    category,\n    SUM(amount)        AS total_revenue,\n    AVG(amount)        AS avg_order_value,\n    COUNT(*)           AS order_count\nFROM orders\nGROUP BY category\nHAVING SUM(amount) > 10000\nORDER BY total_revenue DESC;\n```\n\nNotice that ORDER BY uses the alias `total_revenue` - this works because ORDER BY runs after SELECT, so aliases are available there.'
            },
            {
              blockType: 'text',
              content: 'The difference between `COUNT(*)` and `COUNT(column_name)` is subtle but tested in interviews:\n\n- `COUNT(*)` counts **all rows**, including rows with NULLs\n- `COUNT(column_name)` counts only rows where that **column is NOT NULL**\n\nExample: if you have 10 orders, and 3 have a NULL `discount_code`, then `COUNT(*)` returns 10 but `COUNT(discount_code)` returns 7. This distinction matters when counting optional fields.'
            },
            {
              blockType: 'table',
              caption: 'WHERE vs HAVING - Know When to Use Each',
              hasHeaders: true,
              headers: ['Clause', 'Filters', 'Runs When', 'Can Use Aggregates?', 'Example'],
              rows: [
                ['WHERE', 'Individual rows', 'Before GROUP BY', 'No', 'WHERE amount > 100'],
                ['HAVING', 'Groups', 'After GROUP BY', 'Yes', 'HAVING COUNT(*) > 5'],
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'You want to find only customers who have placed more than 5 orders. Which query is correct?',
              tagSlugs: ['sql', 'beginner', 'aggregations', 'having', 'group-by'],
              choices: [
                'SELECT customer_id, COUNT(*) FROM orders WHERE COUNT(*) > 5 GROUP BY customer_id',
                'SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id HAVING COUNT(*) > 5',
                'SELECT customer_id, COUNT(*) FROM orders HAVING COUNT(*) > 5',
                'SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id WHERE COUNT(*) > 5'
              ],
              correctAnswer: 'SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id HAVING COUNT(*) > 5',
              solution: 'HAVING filters groups after aggregation - it is the correct tool when filtering by an aggregate function like COUNT(*). WHERE cannot use aggregate functions (it runs before them). HAVING without GROUP BY is unusual and almost certainly wrong here. WHERE must come before GROUP BY, not after it.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'A table called "reviews" has columns: id, product_id, rating (1-5), reviewer_name. Some rows have NULL for reviewer_name. What does COUNT(reviewer_name) return vs COUNT(*)?',
              tagSlugs: ['sql', 'beginner', 'aggregations', 'null-handling', 'gotchas'],
              choices: [
                'They always return the same value',
                'COUNT(*) counts all rows; COUNT(reviewer_name) counts only rows where reviewer_name is not NULL',
                'COUNT(reviewer_name) counts all rows; COUNT(*) only counts non-NULL rows',
                'COUNT(*) is invalid - you must always specify a column name'
              ],
              correctAnswer: 'COUNT(*) counts all rows; COUNT(reviewer_name) counts only rows where reviewer_name is not NULL',
              solution: 'COUNT(*) counts every row regardless of NULL values - it counts the row itself. COUNT(column) counts only rows where that specific column has a non-NULL value. In this case, if 3 out of 100 reviews have no reviewer_name, COUNT(*) = 100 but COUNT(reviewer_name) = 97.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'In a GROUP BY query, you can reference a SELECT alias in the HAVING clause in standard SQL (PostgreSQL).',
              tagSlugs: ['sql', 'intermediate', 'group-by', 'having', 'gotchas'],
              correctAnswer: 'false',
              solution: 'False. In standard SQL, HAVING is evaluated before SELECT, so aliases defined in SELECT are not available in HAVING. You must repeat the aggregate expression: HAVING COUNT(*) > 5, not HAVING order_count > 5. Note: some databases like MySQL and BigQuery allow this as an extension, but PostgreSQL (used in CoderPad) follows the standard.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 4,
              prompt: 'Which query finds the average salary per department, but ONLY for employees who were hired after 2020, and ONLY shows departments where that average is above 75000?',
              tagSlugs: ['sql', 'intermediate', 'aggregations', 'group-by', 'having', 'filtering'],
              choices: [
                'SELECT department, AVG(salary) FROM employees HAVING hire_year > 2020 GROUP BY department HAVING AVG(salary) > 75000',
                'SELECT department, AVG(salary) FROM employees WHERE hire_year > 2020 GROUP BY department HAVING AVG(salary) > 75000',
                'SELECT department, AVG(salary) FROM employees GROUP BY department WHERE hire_year > 2020 AND AVG(salary) > 75000',
                'SELECT department, AVG(salary) FROM employees WHERE hire_year > 2020 HAVING AVG(salary) > 75000 GROUP BY department'
              ],
              correctAnswer: 'SELECT department, AVG(salary) FROM employees WHERE hire_year > 2020 GROUP BY department HAVING AVG(salary) > 75000',
              solution: 'The correct clause order is: WHERE (filter individual rows - hired after 2020) -> GROUP BY (group by department) -> HAVING (filter groups by average salary). WHERE handles the row-level filter on hire date, GROUP BY groups the filtered rows, and HAVING applies the aggregate condition on those groups.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 5,
              prompt: 'Write a SQL query against a "sales" table (columns: id, salesperson_name, region, amount, sale_date). Find each salesperson\'s total sales amount and number of sales, but only for sales in 2024, and only show salespeople whose total exceeds 50000. Sort by total amount descending.',
              tagSlugs: ['sql', 'intermediate', 'aggregations', 'group-by', 'having', 'interview-prep'],
              solution: 'SELECT salesperson_name, SUM(amount) AS total_sales, COUNT(*) AS num_sales FROM sales WHERE sale_date >= \'2024-01-01\' AND sale_date < \'2025-01-01\' GROUP BY salesperson_name HAVING SUM(amount) > 50000 ORDER BY total_sales DESC; -- Key points: WHERE filters the year before grouping (more efficient than filtering after), GROUP BY groups by salesperson, HAVING filters groups by the aggregate total, ORDER BY uses the alias which is valid here (ORDER BY runs after SELECT).',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    },

    // =========================================================
    // MODULE 2: JOINs - The #1 Interview Topic
    // =========================================================
    {
      title: 'Module 2: JOINs - The #1 Interview Topic',
      order: 2,
      isPublished: false,

      lessons: [
        // ---------------------------------------------------------
        // LESSON 2.1: INNER JOIN
        // ---------------------------------------------------------
        {
          title: 'Lesson 2.1: INNER JOIN - Combining Tables',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'JOINs are the single most tested topic in SQL interviews. Nearly every intermediate or advanced question involves combining data from two or more tables. If you learn one thing from this course before your interview, make it JOINs. The good news: the concept is straightforward, and once it clicks, you will find yourself writing JOINs confidently in minutes rather than staring at the screen.'
            },
            {
              blockType: 'text',
              content: 'A **JOIN** combines rows from two tables based on a matching condition - almost always a foreign key relationship. The `INNER JOIN` (also written as just `JOIN`) returns only the rows where the condition is true in **both** tables. If a row in table A has no match in table B, it is excluded from the result. Think of it as the intersection of two sets.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Venn diagram showing two overlapping circles. Left circle labeled "Table A (all rows)". Right circle labeled "Table B (all rows)". The overlapping center section is highlighted/shaded and labeled "INNER JOIN result - only matching rows". Below the diagram, show a simple example: users table (3 users: Alice, Bob, Carol) and orders table (orders for Alice and Bob only - Carol has no orders). INNER JOIN result shows only Alice and Bob rows. This visually explains why Carol is excluded.',
              align: 'center',
              width: 'md'
            },
            {
              blockType: 'text',
              content: 'The syntax for INNER JOIN:\n\n```sql\nSELECT\n    u.name,\n    u.email,\n    o.amount,\n    o.created_at\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id;\n```\n\nBreaking this down:\n- `users u` - the first table, aliased as `u`\n- `INNER JOIN orders o` - join with the orders table, aliased as `o`\n- `ON u.id = o.user_id` - the join condition: match rows where user.id equals order.user_id\n- `u.name`, `o.amount` - column references use the table alias as a prefix\n\nUsing table aliases (`u`, `o`) is best practice - it keeps column references unambiguous.'
            },
            {
              blockType: 'text',
              content: 'You can add WHERE, GROUP BY, HAVING, and ORDER BY after a JOIN - they work exactly as before, just applied to the combined result:\n\n```sql\n-- Total spending per user, only for users who spent more than $500\nSELECT\n    u.name,\n    SUM(o.amount) AS total_spent\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.status = \'completed\'\nGROUP BY u.id, u.name\nHAVING SUM(o.amount) > 500\nORDER BY total_spent DESC;\n```\n\nThis is a classic interview query. Practice reading it from top to bottom: which users, combined with which orders, filter by completed status, group by user, show only high spenders, sort the result.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Always Alias Your Tables in Interviews',
              content: 'As soon as you write a JOIN, start using table aliases for every column reference. Writing "u.name" instead of just "name" prevents ambiguity errors when both tables have a column with the same name (like "id" or "created_at"), and shows the interviewer you understand where each column comes from. It is a small habit that signals experience.'
            },
            {
              blockType: 'text',
              content: 'Joining more than two tables follows the same pattern - just keep adding JOIN clauses:\n\n```sql\nSELECT\n    u.name       AS user_name,\n    p.name       AS product_name,\n    o.amount,\n    o.created_at\nFROM orders o\nINNER JOIN users u    ON o.user_id    = u.id\nINNER JOIN products p ON o.product_id = p.id\nWHERE o.created_at >= \'2024-01-01\';\n```\n\nThis joins three tables: orders, users, and products. The FROM table is "orders" because it holds the foreign keys to both other tables. Always start your FROM clause with the table that is the "center" of the relationships.'
            },
            {
              blockType: 'text',
              content: 'A common interview gotcha: **what happens when a column name exists in multiple tables?** If you join users and orders and both have an `id` column, writing `SELECT id` is ambiguous and will throw an error. You must write `SELECT u.id` or `SELECT o.id` to specify which table\'s ID you want. This is one of the main reasons table aliases matter - they make every column reference explicit and unambiguous.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'You have a "users" table and an "orders" table. User with id=5 exists in the users table but has placed no orders. What does an INNER JOIN between these tables return for user 5?',
              tagSlugs: ['sql', 'beginner', 'joins', 'inner-join'],
              choices: [
                'A row with user 5\'s data and NULL for the order columns',
                'User 5\'s data is not included in the result at all',
                'An error, because user 5 has no matching orders',
                'A row with just user 5\'s data and zeros for order amounts'
              ],
              correctAnswer: 'User 5\'s data is not included in the result at all',
              solution: 'INNER JOIN only returns rows where there is a match in BOTH tables. Since user 5 has no orders, there is no matching row in the orders table, so user 5 is completely excluded from the result. To include users with no orders, you would need a LEFT JOIN instead.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Which query correctly joins a "employees" table (id, name, department_id) with a "departments" table (id, department_name)?',
              tagSlugs: ['sql', 'beginner', 'joins', 'inner-join'],
              choices: [
                'SELECT e.name, d.department_name FROM employees e JOIN departments d WHERE e.department_id = d.id',
                'SELECT e.name, d.department_name FROM employees e INNER JOIN departments d ON e.department_id = d.id',
                'SELECT e.name, d.department_name FROM employees e, departments d ON e.department_id = d.id',
                'SELECT name, department_name FROM employees JOIN departments USING department_id = id'
              ],
              correctAnswer: 'SELECT e.name, d.department_name FROM employees e INNER JOIN departments d ON e.department_id = d.id',
              solution: 'The correct syntax uses INNER JOIN (or just JOIN) followed by the table name and alias, then ON followed by the join condition. Using WHERE instead of ON for a JOIN condition works technically (implicit join) but is bad practice and confusing. The comma syntax is an old-style cross join, not a proper JOIN.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Writing "JOIN" without specifying INNER is the same as "INNER JOIN" in standard SQL.',
              tagSlugs: ['sql', 'beginner', 'joins', 'inner-join'],
              correctAnswer: 'true',
              solution: 'True. The INNER keyword is optional. Plain JOIN defaults to INNER JOIN in all major databases including PostgreSQL. Most developers write JOIN for brevity. However, for clarity in interviews, writing INNER JOIN explicitly signals that you understand join types and are making a deliberate choice.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Write a SQL query using the following tables:\n- "products" (id, name, category_id, price)\n- "categories" (id, category_name)\n- "order_items" (id, order_id, product_id, quantity)\n\nFind the category name, total quantity sold, and average price per category. Only include categories with more than 100 total items sold. Sort by total quantity descending.',
              tagSlugs: ['sql', 'intermediate', 'joins', 'inner-join', 'aggregations', 'interview-prep'],
              solution: 'SELECT c.category_name, SUM(oi.quantity) AS total_quantity, AVG(p.price) AS avg_price FROM order_items oi INNER JOIN products p ON oi.product_id = p.id INNER JOIN categories c ON p.category_id = c.id GROUP BY c.id, c.category_name HAVING SUM(oi.quantity) > 100 ORDER BY total_quantity DESC; -- Key decisions: order_items is the FROM table because it connects to both products and categories (via product). GROUP BY uses both c.id and c.category_name for safety. HAVING filters after aggregation. Both JOINs chain naturally through the foreign key path.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ---------------------------------------------------------
        // LESSON 2.2: LEFT JOIN and NULL Patterns
        // ---------------------------------------------------------
        {
          title: 'Lesson 2.2: LEFT JOIN and NULL Patterns (The Classic Interview Trap)',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'The LEFT JOIN is the second most common join type in interviews, and it comes with a powerful pattern that catches many candidates off guard: **"find rows in table A that have no match in table B."** This pattern - LEFT JOIN + WHERE right_table.id IS NULL - appears in interviews disguised as many different business questions. Recognizing it immediately will make you look very experienced.'
            },
            {
              blockType: 'text',
              content: 'A **LEFT JOIN** (also called LEFT OUTER JOIN) returns **all rows from the left table**, plus matching rows from the right table. When there is no match in the right table, the right table columns come back as **NULL**. This is the key difference from INNER JOIN: with LEFT JOIN, no rows from the left table are ever dropped.\n\n```sql\nSELECT\n    u.name,\n    o.amount\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id;\n```\n\nThis returns every user, even users who have never ordered. Those users will show up with `NULL` in the `o.amount` column.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Two-part diagram. Top: Venn diagram with two circles (Table A left, Table B right). The entire LEFT circle is shaded, including the overlap. Label: "LEFT JOIN - all of Table A, plus matches from Table B. NULLs where no match." Bottom: concrete example table showing users (Alice, Bob, Carol) LEFT JOIN orders. Alice has 2 orders, Bob has 1 order, Carol has none. Result table shows all 3 users: Alice appears twice (once per order), Bob once, Carol once with NULL in order columns. Highlight Carol\'s row in a different color to show the NULL behavior.',
              align: 'center',
              width: 'md'
            },
            {
              blockType: 'text',
              content: 'The most powerful pattern with LEFT JOIN - the **"find unmatched rows"** pattern:\n\n```sql\n-- Find all users who have NEVER placed an order\nSELECT u.name\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE o.id IS NULL;\n```\n\nHere is how to read this: LEFT JOIN keeps all users. Users with no orders will have `o.id = NULL`. The WHERE clause filters to keep only those NULL rows - in other words, only users with no matching orders. This pattern answers questions like: "find products never ordered," "find employees with no manager," "find accounts with no transactions."'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Recognize This Pattern in Interviews',
              content: 'Whenever an interview question says "find X that have NO Y" or "find X that have never done Y", think LEFT JOIN + WHERE right_table.id IS NULL. This is cleaner and often faster than a NOT IN subquery. Say it out loud when you recognize it: "This is a LEFT JOIN with a NULL check on the right side - a classic unmatched rows pattern."'
            },
            {
              blockType: 'text',
              content: 'RIGHT JOIN is the mirror of LEFT JOIN - it keeps all rows from the right table and NULLs for unmatched left rows. In practice, you rarely need RIGHT JOIN because you can always rewrite it as a LEFT JOIN by swapping the table order. Most SQL developers stick to LEFT JOIN and reorder tables as needed. Some interviewers will ask you to explain this - knowing they are equivalent is a sign of experience.'
            },
            {
              blockType: 'text',
              content: 'FULL OUTER JOIN keeps all rows from both tables, filling in NULLs on either side when there is no match. It is less common in interviews but worth knowing conceptually:\n\n```sql\n-- All users AND all orders, whether they match or not\nSELECT u.name, o.amount\nFROM users u\nFULL OUTER JOIN orders o ON u.id = o.user_id;\n```\n\nThis would show: users with orders (matched), users without orders (o columns NULL), and - if any orders exist with invalid user_ids - orphaned orders (u columns NULL). You would use this to find any kind of mismatch between two datasets.'
            },
            {
              blockType: 'table',
              caption: 'JOIN Types Summary - What to Say When Asked to Compare Them',
              hasHeaders: true,
              headers: ['JOIN Type', 'Returns', 'Unmatched Left?', 'Unmatched Right?', 'When to Use'],
              rows: [
                ['INNER JOIN', 'Only matched rows', 'No', 'No', 'When you only want records with data on both sides'],
                ['LEFT JOIN', 'All left + matched right', 'Yes (NULLs)', 'No', 'Keep all of table A; also find "has no" patterns'],
                ['RIGHT JOIN', 'All right + matched left', 'No', 'Yes (NULLs)', 'Same as LEFT JOIN with tables swapped'],
                ['FULL OUTER JOIN', 'All rows from both', 'Yes (NULLs)', 'Yes (NULLs)', 'Find any unmatched records on either side']
              ]
            },
            {
              blockType: 'text',
              content: 'A subtle trap with LEFT JOIN and WHERE: **adding a WHERE condition on the right table converts a LEFT JOIN to an INNER JOIN behavior.** This is a common interview mistake:\n\n```sql\n-- WRONG: This actually behaves like INNER JOIN\nSELECT u.name, o.amount\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE o.status = \'completed\';  -- filters out NULLs!\n\n-- CORRECT: Move the filter into the JOIN condition\nSELECT u.name, o.amount\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id AND o.status = \'completed\';\n```\n\nIn the first query, users with no completed orders get `o.status = NULL`, which fails the WHERE condition, so they disappear. In the second query, the filter is in the ON clause, so users with no completed orders still appear (with NULL in o.amount).'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'You LEFT JOIN "customers" with "orders" on customer_id. A customer exists with no orders. What appears in the result for that customer\'s order columns?',
              tagSlugs: ['sql', 'beginner', 'joins', 'left-join', 'null-handling'],
              choices: [
                'The row is excluded from the result',
                'Zero values are shown for numeric order columns',
                'NULL values appear for all columns from the orders table',
                'An error is thrown because of the missing match'
              ],
              correctAnswer: 'NULL values appear for all columns from the orders table',
              solution: 'LEFT JOIN keeps all rows from the left table (customers). When there is no matching row in the right table (orders), all columns from the orders table are filled with NULL. The customer\'s own columns (name, email, etc.) appear normally. This is the defining behavior of LEFT JOIN.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Interview question: "Find all products that have NEVER been ordered." Which query solves this correctly?',
              tagSlugs: ['sql', 'intermediate', 'joins', 'left-join', 'null-handling', 'problem-patterns'],
              choices: [
                'SELECT p.name FROM products p INNER JOIN order_items oi ON p.id = oi.product_id WHERE oi.product_id IS NULL',
                'SELECT p.name FROM products p WHERE p.id NOT IN (SELECT product_id FROM order_items)',
                'SELECT p.name FROM products p LEFT JOIN order_items oi ON p.id = oi.product_id WHERE oi.id IS NULL',
                'SELECT p.name FROM products p RIGHT JOIN order_items oi ON p.id = oi.product_id WHERE oi.id IS NULL'
              ],
              correctAnswer: 'SELECT p.name FROM products p LEFT JOIN order_items oi ON p.id = oi.product_id WHERE oi.id IS NULL',
              solution: 'The LEFT JOIN + WHERE right_table.id IS NULL pattern is the correct and most efficient approach. LEFT JOIN keeps all products; unordered products get NULL in oi.id; WHERE oi.id IS NULL keeps only those. Note: NOT IN also works (option B) but has a dangerous NULL trap - if any order_item.product_id is NULL, NOT IN returns no results at all. INNER JOIN with IS NULL (option A) is self-contradicting - INNER JOIN already excludes NULLs.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Adding a WHERE clause that filters on a column from the right-side table of a LEFT JOIN can effectively turn it into an INNER JOIN.',
              tagSlugs: ['sql', 'intermediate', 'joins', 'left-join', 'gotchas'],
              correctAnswer: 'true',
              solution: 'True. If you LEFT JOIN and then add WHERE right_table.some_column = \'value\', rows with no right-table match have NULL for that column, which fails the WHERE condition, so they are removed. This silently converts LEFT JOIN behavior to INNER JOIN behavior. To filter the right table while keeping unmatched left rows, put the condition in the JOIN\'s ON clause instead of WHERE.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Write two SQL queries for this problem:\n1. Find all customers and their total order count. Customers with no orders should show 0 (not be excluded).\n2. Find customers who have never placed an order.\n\nTables: "customers" (id, name), "orders" (id, customer_id, amount)',
              tagSlugs: ['sql', 'intermediate', 'joins', 'left-join', 'null-handling', 'interview-prep'],
              solution: '-- Query 1: All customers with order count (0 for no orders)\nSELECT c.name, COUNT(o.id) AS order_count\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name\nORDER BY order_count DESC;\n-- Note: COUNT(o.id) counts only non-NULL values, so customers with no orders correctly show 0, not NULL. COUNT(*) would show 1 for unmatched rows, which is wrong.\n\n-- Query 2: Customers who never ordered\nSELECT c.name\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nWHERE o.id IS NULL;',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ---------------------------------------------------------
        // LESSON 2.3: Multi-Table JOINs + Interview Problems
        // ---------------------------------------------------------
        {
          title: 'Lesson 2.3: Multi-Table JOINs and Real Interview Problems',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'In real interviews, you will almost always be working with 3 or more tables. The good news is that multi-table JOINs follow the exact same rules - you just chain multiple JOIN clauses together. The skill being tested here is not syntax memorization, it is your ability to trace the relationships between tables and pick the right path through them. This lesson focuses on that analytical skill, plus the most common JOIN problem patterns you will actually face on CoderPad.'
            },
            {
              blockType: 'text',
              content: 'Chaining multiple JOINs is straightforward - each JOIN adds one more table to the query:\n\n```sql\n-- Get order details with customer name and product name\nSELECT\n    c.name         AS customer_name,\n    p.name         AS product_name,\n    oi.quantity,\n    o.created_at   AS order_date\nFROM orders o\nINNER JOIN customers c    ON o.customer_id  = c.id\nINNER JOIN order_items oi ON o.id           = oi.order_id\nINNER JOIN products p     ON oi.product_id  = p.id\nWHERE o.created_at >= \'2024-01-01\'\nORDER BY o.created_at DESC;\n```\n\nTip: start your FROM clause with the table that sits at the center of the relationships (here, `orders` connects to all others). Then JOIN outward from there.'
            },
            {
              blockType: 'text',
              content: 'How to approach a multi-table JOIN problem in an interview - say this out loud:\n\n1. **Read the schema** - identify all tables and their columns\n2. **Find the foreign keys** - how do tables connect?\n3. **Identify what the question needs** - which tables contain those columns?\n4. **Trace the path** - what sequence of JOINs gets from your starting table to the data you need?\n5. **Choose JOIN types** - INNER (must exist on both sides) or LEFT (keep all from left)?\n6. **Add filters, grouping, and sorting last**\n\nThis structured approach, spoken out loud, shows the interviewer your problem-solving process - which they value as much as the final answer.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Self-JOINs - An Uncommon But Impressive Pattern',
              content: 'A self-join joins a table to itself. Classic use case: an "employees" table where each employee has a "manager_id" column that references another employee\'s id in the same table. You can find each employee and their manager\'s name by doing: FROM employees e JOIN employees m ON e.manager_id = m.id. The key is using two different aliases (e and m) for the same table. Knowing this pattern can set you apart in an interview.'
            },
            {
              blockType: 'text',
              content: 'The most common multi-table JOIN interview problems and the patterns to recognize them:\n\n**Pattern 1: "Get X with details from related Y and Z"** - straightforward INNER JOINs chained together.\n\n**Pattern 2: "Find X that has no Y"** - LEFT JOIN + WHERE y.id IS NULL.\n\n**Pattern 3: "Rank X by Y within groups of Z"** - JOIN + GROUP BY + ORDER BY (or window functions in Module 4).\n\n**Pattern 4: "Find duplicates"** - self-JOIN or GROUP BY + HAVING COUNT(*) > 1.\n\n**Pattern 5: "Compare X to Y"** - two separate aggregations joined together, often via a CTE (Module 3).'
            },
            {
              blockType: 'text',
              content: 'Common interview problem - "Find duplicate emails in a users table":\n\n```sql\n-- Method 1: GROUP BY + HAVING (most common answer)\nSELECT email, COUNT(*) AS count\nFROM users\nGROUP BY email\nHAVING COUNT(*) > 1;\n\n-- Method 2: Self-join (shows JOIN knowledge)\nSELECT DISTINCT u1.email\nFROM users u1\nINNER JOIN users u2 ON u1.email = u2.email\n  AND u1.id != u2.id;\n```\n\nMethod 1 is simpler and what most interviewers expect. Method 2 demonstrates you know self-joins exist. Knowing both - and being able to explain the tradeoffs - is impressive.'
            },
            {
              blockType: 'text',
              content: 'Combining JOINs with aggregations is where interview problems get meaty. One of the most common patterns - "find the top customer per category":\n\n```sql\n-- Total revenue per customer per category\nSELECT\n    c.name    AS customer_name,\n    cat.name  AS category,\n    SUM(oi.quantity * p.price) AS revenue\nFROM orders o\nINNER JOIN customers c    ON o.customer_id  = c.id\nINNER JOIN order_items oi ON o.id           = oi.order_id\nINNER JOIN products p     ON oi.product_id  = p.id\nINNER JOIN categories cat ON p.category_id  = cat.id\nGROUP BY c.id, c.name, cat.id, cat.name\nORDER BY cat.name, revenue DESC;\n```\n\nNote: `oi.quantity * p.price` calculates line-item revenue inline - you can do math inside aggregate functions.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Entity-relationship style diagram showing a typical e-commerce schema with 5 tables: customers (id, name, email), orders (id, customer_id, created_at), order_items (id, order_id, product_id, quantity), products (id, name, price, category_id), categories (id, name). Draw arrows showing foreign key relationships between them. Label each arrow with the column names involved. This helps learners visualize the JOIN path when given a schema in an interview.',
              align: 'center',
              width: 'lg'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'When writing a multi-table JOIN query, what is the best starting point for the FROM clause?',
              tagSlugs: ['sql', 'intermediate', 'joins', 'best-practices', 'interview-prep'],
              choices: [
                'Always start with the smallest table to improve performance',
                'Always start with the table that has the most rows',
                'Start with the table that sits at the center of the relationships (holds the foreign keys)',
                'It does not matter - results are the same regardless of table order'
              ],
              correctAnswer: 'Start with the table that sits at the center of the relationships (holds the foreign keys)',
              solution: 'Starting with the "hub" table (the one whose foreign keys connect to all the others) makes the JOIN chain easier to read and reason about. In an e-commerce schema, "orders" or "order_items" usually holds foreign keys to customers, products, etc., making them natural starting points. While the query result is the same regardless of order, readability and maintainability matter - especially in interviews where you are explaining your thought process.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Interview question: "Find employees and their manager\'s name. The manager_id column in employees references another row in the same table." What type of JOIN is needed?',
              tagSlugs: ['sql', 'intermediate', 'joins', 'interview-prep'],
              choices: [
                'A regular INNER JOIN between employees and a managers table',
                'A self-JOIN: join the employees table to itself using two different aliases',
                'A CROSS JOIN between the employees table and itself',
                'This cannot be done with a JOIN - a subquery is required'
              ],
              correctAnswer: 'A self-JOIN: join the employees table to itself using two different aliases',
              solution: 'When a table references itself (a hierarchical or recursive relationship), you use a self-join. You alias the same table twice: FROM employees e JOIN employees m ON e.manager_id = m.id. Here "e" represents the employee and "m" represents the manager row. Without two aliases, the database would not know which copy of the table you are referencing in each column.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'In a GROUP BY query that uses JOINs, you must include all non-aggregated columns from all joined tables in the GROUP BY clause.',
              tagSlugs: ['sql', 'intermediate', 'joins', 'group-by', 'gotchas'],
              correctAnswer: 'true',
              solution: 'True. The GROUP BY rule applies to all selected columns regardless of which table they come from. If you SELECT u.name and u.email (from users) and o.status (from orders), then all three must be in GROUP BY unless they are wrapped in an aggregate function. The table source does not matter - only whether the column is aggregated or not.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Classic interview question: Given tables "employees" (id, name, salary, department_id) and "departments" (id, name), write a query to find the department name and the highest salary in that department. Only show departments that have at least one employee earning over 100000.',
              tagSlugs: ['sql', 'intermediate', 'joins', 'aggregations', 'having', 'interview-prep'],
              solution: 'SELECT d.name AS department_name, MAX(e.salary) AS highest_salary FROM employees e INNER JOIN departments d ON e.department_id = d.id GROUP BY d.id, d.name HAVING MAX(e.salary) > 100000 ORDER BY highest_salary DESC; -- Explanation: JOIN connects employees to their department name. GROUP BY groups by department. MAX(e.salary) finds the top salary per group. HAVING MAX(e.salary) > 100000 keeps only departments where the top salary exceeds 100k. This is better than WHERE e.salary > 100000 because that would filter out any employee under 100k before grouping, changing the meaning of "highest salary in the department".',
              points: 3,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 5,
              prompt: 'Find duplicate email addresses in a "users" table (columns: id, name, email). Write a query that returns the email address and how many times it appears. Only return emails that appear more than once.',
              tagSlugs: ['sql', 'intermediate', 'aggregations', 'group-by', 'having', 'problem-patterns'],
              solution: 'SELECT email, COUNT(*) AS occurrences FROM users GROUP BY email HAVING COUNT(*) > 1 ORDER BY occurrences DESC; -- This is a very common interview question. The key insight is that "duplicates" means GROUP BY the potentially duplicated column and HAVING COUNT(*) > 1. The ORDER BY is optional but shows good habits. A bonus answer showing all duplicate rows: SELECT * FROM users WHERE email IN (SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1) ORDER BY email;',
              points: 2,
              isPublished: false
            }
          ]
        }
      ]
    }
  ]
};
