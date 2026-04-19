// data/courses/sql-course-pt3.js
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
    // MODULE 5: Database Concepts Interviewers Ask About
    // =========================================================
    {
      title: 'Module 5: Database Concepts Interviewers Ask About',
      order: 5,
      isPublished: false,

      lessons: [
        // ---------------------------------------------------------
        // LESSON 5.1: Keys, Indexes, and Query Performance
        // ---------------------------------------------------------
        {
          title: 'Lesson 5.1: Keys, Indexes, and Query Performance',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Theory questions in SQL interviews are not just filler - they test whether you understand how the database works under the hood, which is what separates someone who can write queries from someone who can write queries that work well in production. The two most commonly asked theory topics are **indexes** (why queries are slow and how to fix them) and **keys** (how data integrity is enforced). Both come up in almost every backend and data services interview.'
            },
            {
              blockType: 'text',
              content: 'You already know **primary keys** and **foreign keys** from Module 1. Here is what interviewers want to hear when they ask you to explain them more deeply:\n\n- **Primary Key**: uniquely identifies every row. Automatically creates a clustered index (in most databases). Cannot be NULL. Each table has at most one primary key, though it can be composite (multiple columns together).\n- **Foreign Key**: enforces referential integrity - it ensures a value in column A always references a valid value in column B. If you try to insert an order with a `customer_id` that does not exist in the customers table, the foreign key constraint rejects the insert. This prevents "orphaned" records.\n- **Unique Key**: like a primary key for uniqueness, but allows one NULL. Multiple unique keys allowed per table. Example: `email` column in a users table - must be unique, but is not the primary identifier.'
            },
            {
              blockType: 'text',
              content: 'An **index** is a separate data structure (usually a B-tree) that the database maintains alongside a table to make lookups faster. Think of it like the index at the back of a book - instead of reading every page to find "binary search," you jump straight to the page number listed in the index. Without an index on a column used in WHERE or JOIN, the database performs a **full table scan** - reading every row, which is very slow on large tables.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Two-panel diagram showing query execution with and without an index. Left panel "No Index - Full Table Scan": show a table of 1,000,000 rows, a query "WHERE email = \'alice@example.com\'", and an arrow scanning every row linearly. Label: "Must check all 1M rows. Slow." Right panel "With Index on email": show a B-tree structure on the side, the same query jumping directly to a leaf node, then jumping to the one matching row. Label: "Jumps directly to the match. Fast." Add a time comparison: "Full scan: seconds. Index lookup: milliseconds."',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: 'Types of indexes you should know for interviews:\n\n- **Single-column index**: index on one column - `CREATE INDEX idx_email ON users(email);`\n- **Composite index**: index on multiple columns - `CREATE INDEX idx_dept_salary ON employees(department_id, salary);`. The column order matters - this index efficiently supports WHERE on `department_id`, or WHERE on `department_id AND salary`, but NOT WHERE on `salary` alone.\n- **Unique index**: enforces uniqueness as a side effect of indexing. Created automatically for PRIMARY KEY and UNIQUE constraints.\n- **Clustered index**: determines physical row order on disk. Each table can have only one (PostgreSQL uses the primary key for this automatically).\n- **Non-clustered index**: a separate structure pointing to rows. Multiple allowed per table.'
            },
            {
              blockType: 'text',
              content: 'When to add an index - and when NOT to:\n\n**Add an index when:**\n- A column appears frequently in WHERE clauses\n- A column is used as a JOIN key (foreign keys should almost always be indexed)\n- A column is used in ORDER BY on large tables\n- Queries on that column are slow and the table has many rows\n\n**Do NOT add an index when:**\n- The table is small (full scan is fine under ~10,000 rows)\n- The column has very few distinct values (e.g., a boolean `is_active` column - an index barely helps)\n- The table has very frequent INSERT/UPDATE/DELETE (indexes slow down writes because they must be updated)\n\nKnowing the tradeoff - indexes speed reads but slow writes - is exactly what interviewers want to hear.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'How to Answer "How Would You Optimize This Slow Query?"',
              content: 'In interviews, when asked to optimize a slow query, follow this structure out loud: (1) Check if the WHERE and JOIN columns have indexes. (2) Look for SELECT * - select only the columns you need. (3) Check if you can filter earlier (move conditions to WHERE rather than filtering after a JOIN). (4) Consider if a covering index could help (an index that includes all queried columns so the DB never touches the table at all). This structured answer impresses even senior interviewers.'
            },
            {
              blockType: 'table',
              caption: 'Key Types Reference - What Interviewers Expect You to Know',
              hasHeaders: true,
              headers: ['Key Type', 'Purpose', 'NULL Allowed?', 'How Many Per Table?'],
              rows: [
                ['Primary Key', 'Uniquely identifies each row', 'No', 'Exactly one (can be composite)'],
                ['Foreign Key', 'Links to another table\'s primary key, enforces referential integrity', 'Usually yes', 'Multiple allowed'],
                ['Unique Key', 'Ensures column values are unique', 'Yes (one NULL)', 'Multiple allowed'],
                ['Composite Key', 'Primary or unique key made of 2+ columns', 'Depends on type', 'Multiple allowed']
              ]
            },
            {
              blockType: 'text',
              content: 'The difference between a **clustered** and **non-clustered** index is a classic interview theory question:\n\n- **Clustered index**: the table rows are physically stored on disk in the order of this index. There can only be ONE clustered index per table because data can only be sorted one way. In PostgreSQL, the primary key is the clustered index by default.\n- **Non-clustered index**: a separate data structure that stores the indexed column values and pointers (row IDs) to the actual data rows. A table can have many non-clustered indexes. When a non-clustered index is used, the database first finds the row pointer in the index, then fetches the actual row data from disk (a second lookup).\n\nThe practical implication: clustered index lookups are slightly faster because there is no second fetch step. Non-clustered indexes add some overhead but allow multiple indexes per table.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'What is the main tradeoff of adding indexes to a table?',
              tagSlugs: ['sql', 'intermediate', 'indexes', 'performance'],
              choices: [
                'Indexes improve both read and write performance equally',
                'Indexes speed up reads (SELECT) but slow down writes (INSERT, UPDATE, DELETE)',
                'Indexes only help with queries that use DISTINCT',
                'Indexes eliminate the need for primary keys'
              ],
              correctAnswer: 'Indexes speed up reads (SELECT) but slow down writes (INSERT, UPDATE, DELETE)',
              solution: 'Every index must be updated whenever the indexed data changes. An INSERT, UPDATE, or DELETE on an indexed column requires updating both the table and all relevant indexes. This makes writes slower. The tradeoff is worth it for frequently queried columns on large tables, but adding too many indexes on a write-heavy table degrades overall performance.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'A composite index on columns (department_id, salary) can efficiently support a WHERE clause that filters only on salary (with no filter on department_id).',
              tagSlugs: ['sql', 'intermediate', 'indexes', 'performance', 'gotchas'],
              correctAnswer: 'false',
              solution: 'False. Composite indexes follow a "leftmost prefix" rule - they can only be used efficiently when queries filter on the leftmost column(s) of the index. An index on (department_id, salary) works for: WHERE department_id = X, or WHERE department_id = X AND salary > Y. It does NOT efficiently support WHERE salary > Y alone, because salary is not the leftmost column. For salary-only queries, a separate index on salary would be needed.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'What is the difference between a PRIMARY KEY and a UNIQUE constraint?',
              tagSlugs: ['sql', 'beginner', 'primary-key', 'database'],
              choices: [
                'They are identical - PRIMARY KEY is just another name for UNIQUE',
                'PRIMARY KEY cannot be NULL and there can only be one per table; UNIQUE allows one NULL and multiple per table',
                'UNIQUE enforces referential integrity while PRIMARY KEY only ensures uniqueness',
                'PRIMARY KEY allows NULL values but UNIQUE does not'
              ],
              correctAnswer: 'PRIMARY KEY cannot be NULL and there can only be one per table; UNIQUE allows one NULL and multiple per table',
              solution: 'The key differences: (1) Primary key columns cannot contain NULL - they must always have a value. Unique constraint columns can contain NULL (and in PostgreSQL, multiple NULL values are allowed). (2) Each table can have at most one primary key. Multiple UNIQUE constraints are allowed. (3) Primary keys automatically become the clustered index target. Both ensure no duplicate values for non-NULL entries.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'An interviewer shows you this slow query on a table with 10 million rows:\n\nSELECT u.name, o.amount FROM orders o JOIN users u ON o.user_id = u.id WHERE o.status = \'pending\' AND o.created_at > \'2024-01-01\';\n\nWhat questions would you ask and what optimizations would you suggest?',
              tagSlugs: ['sql', 'intermediate', 'indexes', 'performance', 'interview-prep'],
              solution: 'Step 1 - Ask: Are there indexes on orders.status, orders.created_at, and orders.user_id (the JOIN key)? Is there an index on users.id (the primary key, almost certainly yes)? What does EXPLAIN / EXPLAIN ANALYZE show?\n\nStep 2 - Suggest optimizations:\n1. Add an index on orders.status if not present, or better, a composite index on (status, created_at) to cover both WHERE conditions in one index.\n2. Ensure orders.user_id is indexed - foreign key columns often need separate indexes in PostgreSQL.\n3. Replace SELECT * with only the needed columns (already done here - good).\n4. If status has very few distinct values (e.g., only pending/completed/cancelled), consider a partial index: CREATE INDEX ON orders(created_at) WHERE status = \'pending\'; - this index only covers pending orders, making it smaller and faster.\n5. Run EXPLAIN ANALYZE to confirm which indexes are being used and identify bottlenecks.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ---------------------------------------------------------
        // LESSON 5.2: Transactions and ACID Properties
        // ---------------------------------------------------------
        {
          title: 'Lesson 5.2: Transactions and ACID Properties',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'ACID properties are one of the most commonly asked SQL theory topics in backend and data services interviews. The question "what is ACID?" or "explain database transactions" comes up in roughly half of all SQL-adjacent interviews. The good news is that ACID is conceptually straightforward once you understand WHY it exists - and you can give a confident, structured answer in under two minutes.'
            },
            {
              blockType: 'text',
              content: 'A **transaction** is a sequence of SQL operations treated as a single unit of work. Either ALL operations in the transaction succeed, or NONE of them do. Transactions exist because real-world operations often involve multiple related database changes that must happen together. The classic example: transferring money between bank accounts requires two operations - debit one account and credit another. If only one succeeds (due to a crash, network failure, or error), the data is corrupted.'
            },
            {
              blockType: 'text',
              content: 'Transaction control commands in SQL:\n\n```sql\nBEGIN;                         -- start a transaction\n\nUPDATE accounts\nSET balance = balance - 500\nWHERE account_id = 1;          -- debit Alice\n\nUPDATE accounts\nSET balance = balance + 500\nWHERE account_id = 2;          -- credit Bob\n\nCOMMIT;                        -- permanently save both changes\n\n-- If something goes wrong:\nROLLBACK;                      -- undo ALL changes since BEGIN\n```\n\n`BEGIN` starts the transaction. `COMMIT` makes all changes permanent. `ROLLBACK` reverts all changes as if they never happened. `SAVEPOINT name` creates a checkpoint you can roll back to without losing the entire transaction.'
            },
            {
              blockType: 'text',
              content: '**ACID** stands for four properties that guarantee transaction reliability:\n\n**A - Atomicity**: a transaction is "all or nothing." If any part fails, the entire transaction is rolled back. No partial updates are saved. (The bank transfer example - if crediting Bob fails, debiting Alice is also reversed.)\n\n**C - Consistency**: a transaction brings the database from one valid state to another valid state. All database rules (constraints, foreign keys, data types) must be satisfied before COMMIT. A transaction that would violate a constraint is rejected.\n\n**I - Isolation**: concurrent transactions do not interfere with each other. Each transaction sees a consistent snapshot of the data, as if it were the only transaction running. (Two users booking the last seat on a plane cannot both succeed.)\n\n**D - Durability**: once a transaction is committed, it is permanently saved - even if the server crashes immediately after. Committed data survives power failures and system restarts (via write-ahead logging and other mechanisms).'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Four-box layout explaining ACID with visual metaphors. Box 1 "Atomicity": show a transaction with two steps, one failing - both steps crossed out with a ROLLBACK label. Box 2 "Consistency": show database constraints (foreign key, NOT NULL) being checked before COMMIT - a checkmark for valid, X for invalid. Box 3 "Isolation": two concurrent transactions shown as separate lanes on a road - they do not collide. Box 4 "Durability": COMMIT arrow pointing to a disk/storage icon labeled "Permanently saved even after crash." Each box should have the one-word label in large text and a brief sub-description.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: 'Isolation has levels - interviewers at senior companies may ask about this. The four standard isolation levels (from least to most strict):\n\n1. **READ UNCOMMITTED**: can read data from uncommitted transactions (dirty reads). Almost never used.\n2. **READ COMMITTED**: can only read committed data. Default in PostgreSQL. Prevents dirty reads.\n3. **REPEATABLE READ**: same row read twice in a transaction returns the same value. Prevents dirty reads and non-repeatable reads.\n4. **SERIALIZABLE**: strictest level - transactions behave as if they ran one after another (serially). Prevents all anomalies but has the highest overhead.\n\nFor your interview, knowing "PostgreSQL defaults to READ COMMITTED" and being able to explain dirty reads vs non-repeatable reads will impress most interviewers.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'How to Answer "What is ACID?" in an Interview',
              content: 'Use this structure: "ACID stands for Atomicity, Consistency, Isolation, and Durability. Atomicity means a transaction is all-or-nothing - if one step fails, everything rolls back. Consistency means the database moves from one valid state to another. Isolation means concurrent transactions don\'t see each other\'s intermediate state. Durability means committed data persists even through crashes. A classic example is a bank transfer - both the debit and credit must succeed together, or neither should." Under 60 seconds, complete, clear.'
            },
            {
              blockType: 'text',
              content: 'Common interview follow-up: **"What is a deadlock?"** A deadlock occurs when two transactions each hold a lock that the other one needs, so both wait forever:\n\n- Transaction A locks row 1, then tries to lock row 2\n- Transaction B locks row 2, then tries to lock row 1\n- Neither can proceed - deadlock\n\nDatabases detect deadlocks automatically and kill one of the transactions (the "victim"), which rolls it back so the other can proceed. You can prevent deadlocks by always acquiring locks in the same order across transactions. Knowing this shows real-world database experience.'
            },
            {
              blockType: 'table',
              caption: 'Transaction Commands Quick Reference',
              hasHeaders: true,
              headers: ['Command', 'What It Does', 'When to Use'],
              rows: [
                ['BEGIN', 'Starts a new transaction', 'Before a group of related statements'],
                ['COMMIT', 'Saves all changes permanently', 'When all steps succeeded'],
                ['ROLLBACK', 'Reverts all changes since BEGIN', 'When any step fails or on error'],
                ['SAVEPOINT name', 'Creates a rollback checkpoint within a transaction', 'For partial rollbacks in complex transactions'],
                ['ROLLBACK TO name', 'Reverts to a specific savepoint', 'Undo part of a transaction without losing it all']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'A bank transfer transaction debits account A and credits account B. Halfway through, the server crashes. What does Atomicity guarantee?',
              tagSlugs: ['sql', 'intermediate', 'transactions', 'acid'],
              choices: [
                'The debit is saved because it completed before the crash',
                'Both the debit and credit are rolled back - the database returns to its pre-transaction state',
                'The credit is automatically retried when the server restarts',
                'A partial transfer is saved and flagged for manual review'
              ],
              correctAnswer: 'Both the debit and credit are rolled back - the database returns to its pre-transaction state',
              solution: 'Atomicity means a transaction is all-or-nothing. If the server crashes mid-transaction, the partial work is not committed. When the database restarts, it uses its write-ahead log to detect the incomplete transaction and roll it back automatically. The result is as if the transfer never started - the safest outcome for data integrity.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Which ACID property ensures that two concurrent users booking the last available seat cannot both succeed?',
              tagSlugs: ['sql', 'intermediate', 'transactions', 'acid'],
              choices: [
                'Atomicity - all booking steps complete or none do',
                'Consistency - the booking must not violate seat capacity constraints',
                'Isolation - concurrent transactions do not see each other\'s intermediate state',
                'Durability - the booking is saved permanently after commit'
              ],
              correctAnswer: 'Isolation - concurrent transactions do not see each other\'s intermediate state',
              solution: 'Isolation ensures concurrent transactions do not interfere with each other. When two users try to book the last seat simultaneously, isolation (combined with locking) ensures that only one transaction can lock and modify the seat record at a time. The second transaction will either wait, or see the seat as already taken when it reads the data. Without isolation, both could read "1 seat available" and both succeed - corrupting the data.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'In PostgreSQL, if you execute UPDATE and INSERT statements without wrapping them in BEGIN/COMMIT, each statement runs in its own automatic transaction.',
              tagSlugs: ['sql', 'intermediate', 'transactions', 'acid'],
              correctAnswer: 'true',
              solution: 'True. PostgreSQL (and most SQL databases) operate in "autocommit" mode by default. Every individual SQL statement is automatically wrapped in a transaction that commits if the statement succeeds, or rolls back if it fails. To group multiple statements into one transaction, you must explicitly use BEGIN and COMMIT. This is why a single failed INSERT does not partially commit - autocommit handles it atomically.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Explain what a deadlock is in a database context and describe a scenario where it could occur. How do databases handle it, and how can developers prevent it?',
              tagSlugs: ['sql', 'intermediate', 'transactions', 'database', 'interview-prep'],
              solution: 'A deadlock occurs when two or more transactions each hold locks that the others need, causing all of them to wait indefinitely. Example: Transaction A locks the "orders" row for order_id=1 and then tries to lock the "inventory" row for product_id=5. Simultaneously, Transaction B locks the "inventory" row for product_id=5 and then tries to lock the "orders" row for order_id=1. Neither can proceed - they wait for each other forever.\n\nHow databases handle it: the database\'s deadlock detector (runs periodically) identifies the cycle and selects a "victim" transaction to abort. The victim\'s work is rolled back, releasing its locks, so the other transaction can proceed.\n\nHow developers prevent it: (1) Always acquire locks in the same consistent order across all transactions - if all code locks "orders" before "inventory," circular waits cannot form. (2) Keep transactions short to reduce the window for deadlocks. (3) Use appropriate isolation levels. (4) Use SELECT FOR UPDATE to explicitly acquire row locks at read time instead of at write time.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ---------------------------------------------------------
        // LESSON 5.3: Normalization and Schema Design Basics
        // ---------------------------------------------------------
        {
          title: 'Lesson 5.3: Normalization and Schema Design Basics',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Normalization is the process of structuring a database to reduce redundancy and improve data integrity. Interview questions about normalization range from "what is 1NF/2NF/3NF?" to "how would you design a schema for X?" For a data services role, you need to understand the first three normal forms, recognize why bad schemas cause problems, and be able to suggest better designs. You do not need to memorize Boyce-Codd Normal Form or 4NF for most interviews.'
            },
            {
              blockType: 'text',
              content: 'The problem normalization solves: **data anomalies** in poorly structured tables. Imagine storing order data in one flat table:\n\n```\norder_id | customer_name | customer_email    | product_name | product_price | quantity\n1        | Alice Smith   | alice@example.com | Laptop       | 999.99        | 1\n2        | Alice Smith   | alice@example.com | Mouse        | 29.99         | 2\n3        | Bob Jones     | bob@example.com   | Laptop       | 999.99        | 1\n```\n\nProblems with this: if Alice changes her email, you must update multiple rows (update anomaly). If you delete all of Bob\'s orders, you lose Bob\'s customer info entirely (deletion anomaly). To add a new product, you need a fake order (insertion anomaly). Normalization eliminates these problems by separating data into the right tables.'
            },
            {
              blockType: 'text',
              content: '**First Normal Form (1NF)**: each column holds a single atomic value - no lists, arrays, or repeating groups in a column. Also, each row must be uniquely identifiable (has a primary key).\n\n**Violates 1NF:**\n```\norder_id | products\n1        | "Laptop, Mouse, Keyboard"   -- comma-separated list in one column\n```\n\n**Satisfies 1NF:**\n```\norder_id | product_id\n1        | 101          -- one product per row\n1        | 102\n1        | 103\n```\n\n1NF is mostly enforced automatically by good schema design. The "comma-separated values in a column" antipattern is the most common violation you will see in practice.'
            },
            {
              blockType: 'text',
              content: '**Second Normal Form (2NF)**: satisfies 1NF, AND every non-key column depends on the ENTIRE primary key (not just part of it). This only applies to tables with composite primary keys.\n\n**Violates 2NF** (composite key: order_id + product_id):\n```\norder_id | product_id | product_name | quantity\n```\nHere `product_name` depends only on `product_id`, not on the full composite key `(order_id, product_id)`. This is a partial dependency.\n\n**Satisfies 2NF** - split into two tables:\n```\norder_items: order_id | product_id | quantity\nproducts:    product_id | product_name\n```\nNow every column in `order_items` depends on the full key, and `product_name` has its own home in `products`.'
            },
            {
              blockType: 'text',
              content: '**Third Normal Form (3NF)**: satisfies 2NF, AND no non-key column depends on another non-key column (no transitive dependencies).\n\n**Violates 3NF:**\n```\nemployee_id | employee_name | department_id | department_name\n```\nHere `department_name` depends on `department_id`, which is a non-key column - not the primary key. This is a transitive dependency.\n\n**Satisfies 3NF** - split into two tables:\n```\nemployees:   employee_id | employee_name | department_id\ndepartments: department_id | department_name\n```\nNow every non-key column in each table depends directly on the primary key only. This is the design you have been working with throughout the entire course.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Three-step diagram showing normalization progression. Step 1 "Unnormalized / 1NF violation": one large flat table with columns: order_id, customer_name, customer_email, products (comma-separated list), product_prices. Highlight the comma-separated products column in red. Step 2 "2NF": three tables - orders (order_id, customer_id), order_items (order_id, product_id, quantity), products (product_id, name, price). Arrows show foreign keys. Step 3 "3NF": add customers table (customer_id, name, email) and link orders to it. Show the full clean schema. Title: "Normalization - Breaking One Bad Table into Clean Relational Tables."',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Denormalization - When Breaking the Rules Is Right',
              content: 'Normalization is not always the goal. Denormalization - intentionally adding redundancy - is sometimes used for performance. If you have a reporting query that joins 8 tables and runs millions of times per day, storing pre-computed results in a "flat" summary table can be much faster. Data warehouses and analytics systems often denormalize heavily. In an interview, mentioning that you understand when denormalization is appropriate shows real-world thinking.'
            },
            {
              blockType: 'text',
              content: 'Schema design interview question: "Design a database schema for a blogging platform." Here is how to think through it out loud:\n\n1. **Identify entities** - Users, Posts, Comments, Tags, Categories\n2. **Identify relationships** - A user writes many posts. A post has many comments. A post can have many tags (many-to-many).\n3. **Create tables for entities** - `users`, `posts`, `comments`, `tags`\n4. **Handle many-to-many with a junction table** - `post_tags(post_id, tag_id)`\n5. **Define primary and foreign keys** - every table gets an `id` PK; posts has `user_id` FK; comments has `post_id` FK and `user_id` FK\n6. **Consider data types and constraints** - `title VARCHAR(255) NOT NULL`, `created_at TIMESTAMP DEFAULT NOW()`\n\nThis structured approach - entities, relationships, keys, constraints - is what interviewers want to see.'
            },
            {
              blockType: 'table',
              caption: 'Normal Forms Cheat Sheet - What to Say When Asked',
              hasHeaders: true,
              headers: ['Normal Form', 'Rule', 'Common Violation', 'Fix'],
              rows: [
                ['1NF', 'Each column holds one atomic value; table has a primary key', 'Comma-separated list in a column', 'One value per row; create a child table'],
                ['2NF', 'All non-key columns depend on the FULL primary key', 'Column depends only on part of a composite key', 'Move partial-dependent columns to a separate table'],
                ['3NF', 'No non-key column depends on another non-key column', 'City -> State -> ZipCode chain in one table', 'Extract transitive dependency to its own table']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'A table has columns: order_id, product_id, product_name, quantity. The primary key is (order_id, product_id). Which normal form does this violate and why?',
              tagSlugs: ['sql', 'intermediate', 'normalization', 'schema-design'],
              choices: [
                '1NF - because product_name is a string, not an integer',
                '2NF - because product_name depends only on product_id, not on the full composite key',
                '3NF - because product_name transitively depends on order_id through product_id',
                'It does not violate any normal form'
              ],
              correctAnswer: '2NF - because product_name depends only on product_id, not on the full composite key',
              solution: 'Second Normal Form requires that all non-key columns depend on the ENTIRE primary key. Here, product_name is determined by product_id alone - knowing the order_id tells you nothing extra about the product name. This partial dependency violates 2NF. The fix: move product_name into a separate products table keyed by product_id, and keep only (order_id, product_id, quantity) in the order_items table.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'A many-to-many relationship between two tables (e.g., posts and tags) is typically implemented using a junction (bridge) table.',
              tagSlugs: ['sql', 'intermediate', 'schema-design', 'normalization'],
              correctAnswer: 'true',
              solution: 'True. Relational databases cannot directly represent many-to-many relationships between two tables. The standard solution is a junction table (also called a bridge, associative, or linking table) that holds the primary keys of both tables as foreign keys. For posts and tags, a post_tags table with columns (post_id, tag_id) allows each post to have multiple tags and each tag to belong to multiple posts.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'What is the main practical benefit of normalization for a backend application?',
              tagSlugs: ['sql', 'intermediate', 'normalization', 'database'],
              choices: [
                'Normalized databases are always faster to query',
                'Normalization eliminates the need for indexes',
                'Updates only need to happen in one place, reducing the risk of inconsistent data',
                'Normalization reduces the number of tables, making queries simpler'
              ],
              correctAnswer: 'Updates only need to happen in one place, reducing the risk of inconsistent data',
              solution: 'The primary practical benefit of normalization is eliminating data redundancy, which means each piece of information is stored in exactly one place. When a customer changes their email, you update one row in the customers table - not dozens of rows across orders, shipments, and other tables. This prevents update anomalies where some copies get updated and some do not, leading to inconsistent data.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Design a normalized database schema (list the tables and their key columns) for a simple event ticketing system. Requirements: users can buy tickets to events. Events are held at venues. Each ticket belongs to one user and one event. Events have a ticket price and limited capacity.',
              tagSlugs: ['sql', 'intermediate', 'schema-design', 'normalization', 'interview-prep'],
              solution: 'Tables:\n\nusers (id PK, name, email UNIQUE NOT NULL, created_at)\n\nvenues (id PK, name, address, capacity INT NOT NULL)\n\nevents (id PK, title, description, venue_id FK -> venues.id, start_time TIMESTAMP, ticket_price DECIMAL, total_capacity INT, created_at)\n\ntickets (id PK, user_id FK -> users.id, event_id FK -> events.id, purchased_at TIMESTAMP DEFAULT NOW(), status VARCHAR -- e.g. active/cancelled/used)\n\nKey design decisions explained:\n- Venues are a separate table because they have their own attributes and multiple events can be held at the same venue.\n- Tickets are a separate entity (not just a count on events) because each ticket belongs to a specific user and may have individual status.\n- Capacity enforcement: either check (SELECT COUNT(*) FROM tickets WHERE event_id = X) < event.total_capacity before INSERT, or use a trigger/application-layer check.\n- No price stored on tickets - it comes from the event at purchase time (or denormalize by copying it to tickets if historical price accuracy matters).',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    },

    // =========================================================
    // MODULE 6: CoderPad Interview Simulation
    // =========================================================
    {
      title: 'Module 6: CoderPad Interview Simulation',
      order: 6,
      isPublished: false,

      lessons: [
        // ---------------------------------------------------------
        // LESSON 6.1: The 10 Classic SQL Interview Problem Patterns
        // ---------------------------------------------------------
        {
          title: 'Lesson 6.1: The 10 Classic SQL Interview Problem Patterns',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'After reviewing hundreds of real CoderPad SQL problems from backend and data services interviews, clear patterns emerge. The same ten problem types appear again and again, dressed up in different business scenarios - e-commerce orders, employee salaries, social media posts, event logs. Once you recognize the underlying pattern, the SQL writes itself. This lesson maps every pattern to its SQL solution so you can identify them on sight during an interview.'
            },
            {
              blockType: 'text',
              content: '**Pattern 1: Top N per Group**\n\nQuestion disguise: "Find the top 3 salespeople per region", "Get the 2 most recent orders per customer", "Find the highest-paid employee in each department."\n\nSolution template:\n```sql\nWITH ranked AS (\n    SELECT *,\n        ROW_NUMBER() OVER (\n            PARTITION BY [group_column]\n            ORDER BY [sort_column] DESC\n        ) AS rn\n    FROM [table]\n)\nSELECT * FROM ranked WHERE rn <= [N];\n```\nKey insight: ROW_NUMBER + CTE + WHERE rn <= N. Use RANK instead of ROW_NUMBER if ties should all be included.'
            },
            {
              blockType: 'text',
              content: '**Pattern 2: Find Records With No Match**\n\nQuestion disguise: "Find customers who have never ordered", "Find products with no sales", "Find users who have not logged in this month."\n\nSolution template:\n```sql\n-- LEFT JOIN approach (preferred)\nSELECT a.*\nFROM [main_table] a\nLEFT JOIN [other_table] b ON a.id = b.[foreign_key]\nWHERE b.id IS NULL;\n\n-- NOT EXISTS approach (NULL-safe)\nSELECT a.*\nFROM [main_table] a\nWHERE NOT EXISTS (\n    SELECT 1 FROM [other_table] b\n    WHERE b.[foreign_key] = a.id\n);\n```\nKey insight: LEFT JOIN + IS NULL OR NOT EXISTS. Avoid NOT IN when NULLs might exist in the subquery.'
            },
            {
              blockType: 'text',
              content: '**Pattern 3: Running Totals and Cumulative Aggregates**\n\nQuestion disguise: "Show cumulative revenue by month", "Show running total of orders per customer", "Show employee headcount growth over time."\n\nSolution template:\n```sql\nSELECT\n    [date_column],\n    [value_column],\n    SUM([value_column]) OVER (\n        [PARTITION BY group_column]   -- optional\n        ORDER BY [date_column]\n    ) AS running_total\nFROM [table]\nORDER BY [date_column];\n```\nKey insight: SUM() OVER with ORDER BY inside the window creates a cumulative sum. Adding PARTITION BY resets the running total per group.'
            },
            {
              blockType: 'text',
              content: '**Pattern 4: Month-over-Month or Period Comparison**\n\nQuestion disguise: "Calculate month-over-month revenue growth", "Compare this week vs last week orders", "Find the change in active users from last month."\n\nSolution template:\n```sql\nWITH monthly AS (\n    SELECT DATE_TRUNC(\'month\', [date_col]) AS month,\n           SUM([value]) AS total\n    FROM [table]\n    GROUP BY 1\n)\nSELECT\n    month, total,\n    LAG(total) OVER (ORDER BY month) AS prev_total,\n    total - LAG(total) OVER (ORDER BY month) AS change,\n    ROUND(100.0 * (total - LAG(total) OVER (ORDER BY month))\n          / LAG(total) OVER (ORDER BY month), 2) AS pct_change\nFROM monthly ORDER BY month;\n```\nKey insight: CTE to aggregate by period first, then LAG to get the previous period value.'
            },
            {
              blockType: 'text',
              content: '**Pattern 5: Find Duplicates**\n\nQuestion disguise: "Find duplicate emails", "Find orders entered twice", "Find employees with the same name and department."\n\nSolution template:\n```sql\n-- Find the duplicate value + count\nSELECT [column], COUNT(*) AS cnt\nFROM [table]\nGROUP BY [column]\nHAVING COUNT(*) > 1;\n\n-- Find the full rows that are duplicates\nSELECT * FROM [table]\nWHERE [column] IN (\n    SELECT [column] FROM [table]\n    GROUP BY [column] HAVING COUNT(*) > 1\n);\n```\nKey insight: GROUP BY + HAVING COUNT(*) > 1 is the go-to for finding duplicates.\n\n**Pattern 6: Nth Highest Value**\n\nQuestion disguise: "Find the 2nd highest salary", "Get the 3rd most expensive product", "Find the 5th largest order."\n\nSolution template:\n```sql\nWITH ranked AS (\n    SELECT *, DENSE_RANK() OVER (ORDER BY [value] DESC) AS rnk\n    FROM [table]\n)\nSELECT * FROM ranked WHERE rnk = [N];\n```\nKey insight: DENSE_RANK is safer than RANK here because it never skips rank numbers for ties.'
            },
            {
              blockType: 'text',
              content: '**Pattern 7: Percentage of Total Within Group**\n\nQuestion disguise: "What percentage of total sales does each product represent?", "Show each department\'s share of total headcount", "What fraction of revenue comes from each region?"\n\nSolution template:\n```sql\nSELECT\n    [group_column],\n    SUM([value]) AS group_total,\n    SUM(SUM([value])) OVER () AS grand_total,\n    ROUND(\n        100.0 * SUM([value]) / SUM(SUM([value])) OVER (),\n        2\n    ) AS pct_of_total\nFROM [table]\nGROUP BY [group_column];\n```\nKey insight: `SUM(SUM(...)) OVER ()` is a nested window aggregate - the inner SUM is the GROUP BY aggregate, the outer SUM is the window total across all groups. This is one of the more advanced patterns and impresses interviewers significantly.\n\n**Pattern 8: Compare Each Row to Its Group Average**\n\nQuestion disguise: "Find employees earning above their department average", "Find products priced above the category average", "Find days with above-average traffic."\n\nSolution template:\n```sql\nSELECT *,\n    AVG([value]) OVER (PARTITION BY [group]) AS group_avg\nFROM [table]\nWHERE [value] > AVG([value]) OVER (PARTITION BY [group]);\n-- Note: use a CTE if filtering on the window function\n```'
            },
            {
              blockType: 'text',
              content: '**Pattern 9: Consecutive / Sequential Events**\n\nQuestion disguise: "Find users who logged in on 3 consecutive days", "Find stocks that increased in price 5 days in a row", "Find employees who received raises in back-to-back years."\n\nThis is an advanced pattern that uses ROW_NUMBER and date arithmetic:\n```sql\n-- Find users with 3+ consecutive login days\nWITH numbered AS (\n    SELECT user_id, login_date,\n        login_date - INTERVAL \'1 day\' *\n            ROW_NUMBER() OVER (\n                PARTITION BY user_id ORDER BY login_date\n            ) AS grp\n    FROM logins\n)\nSELECT user_id, MIN(login_date), MAX(login_date),\n       COUNT(*) AS consecutive_days\nFROM numbered\nGROUP BY user_id, grp\nHAVING COUNT(*) >= 3;\n```\nKey insight: subtracting a sequential row number from a date creates the same "group date" for consecutive days. Rows with the same `grp` value form a consecutive streak.\n\n**Pattern 10: Pivot / Crosstab**\n\nQuestion disguise: "Show sales by quarter as columns", "Create a report with months as columns", "Transpose rows to columns."\n\n```sql\nSELECT\n    product_id,\n    SUM(CASE WHEN quarter = \'Q1\' THEN revenue ELSE 0 END) AS q1,\n    SUM(CASE WHEN quarter = \'Q2\' THEN revenue ELSE 0 END) AS q2,\n    SUM(CASE WHEN quarter = \'Q3\' THEN revenue ELSE 0 END) AS q3,\n    SUM(CASE WHEN quarter = \'Q4\' THEN revenue ELSE 0 END) AS q4\nFROM sales\nGROUP BY product_id;\n```\nKey insight: conditional aggregation with CASE WHEN inside SUM creates pivot columns without any special pivot syntax.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Reference card showing all 10 SQL interview problem patterns in a grid layout. For each pattern: (1) Pattern name in bold, (2) one-line description of what the question sounds like, (3) the key SQL technique to use. Layout: 2 columns x 5 rows. Pattern 1: Top N per Group -> ROW_NUMBER + CTE. Pattern 2: No Match -> LEFT JOIN + IS NULL. Pattern 3: Running Totals -> SUM() OVER with ORDER BY. Pattern 4: Period Comparison -> CTE + LAG. Pattern 5: Duplicates -> GROUP BY + HAVING COUNT > 1. Pattern 6: Nth Highest -> DENSE_RANK. Pattern 7: Percentage of Total -> Nested window SUM. Pattern 8: Compare to Group Avg -> AVG() OVER PARTITION BY. Pattern 9: Consecutive Events -> ROW_NUMBER + date arithmetic. Pattern 10: Pivot -> CASE WHEN inside SUM. Style as a developer cheat sheet.',
              align: 'center',
              width: 'lg'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'An interviewer asks: "Find the top 2 products by revenue in each category." Which pattern and SQL technique applies?',
              tagSlugs: ['sql', 'intermediate', 'window-functions', 'problem-patterns', 'interview-prep'],
              choices: [
                'Pattern: Duplicates - use GROUP BY + HAVING COUNT(*) > 1',
                'Pattern: Top N per Group - use ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) in a CTE, then filter WHERE rn <= 2',
                'Pattern: Nth Highest - use DENSE_RANK() over the full table without partitioning',
                'Pattern: Running Totals - use SUM() OVER with ORDER BY revenue'
              ],
              correctAnswer: 'Pattern: Top N per Group - use ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) in a CTE, then filter WHERE rn <= 2',
              solution: 'This is the classic "Top N per Group" pattern. The key elements: PARTITION BY category (reset the row number for each category), ORDER BY revenue DESC (highest first gets row number 1), ROW_NUMBER() (assign sequential numbers within each partition), CTE to make the window result filterable, WHERE rn <= 2 to keep only the top 2. Use RANK() instead if tied products should both be included.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'The interviewer says: "Show each department\'s total salary as a percentage of the company total salary." What is the cleanest SQL technique?',
              tagSlugs: ['sql', 'intermediate', 'window-functions', 'problem-patterns', 'aggregations'],
              choices: [
                'Use a subquery in WHERE to compute the company total first, then divide',
                'Use SUM(salary) GROUP BY department, then in the application layer divide by the grand total',
                'Use SUM(SUM(salary)) OVER () to get the grand total as a window function over the grouped result',
                'Use NTILE(100) to assign percentiles to each department'
              ],
              correctAnswer: 'Use SUM(SUM(salary)) OVER () to get the grand total as a window function over the grouped result',
              solution: 'The "Percentage of Total" pattern uses nested aggregation: GROUP BY computes the department total (inner SUM), then the window function SUM(...) OVER () sums those group totals across all groups (outer SUM) to get the grand total - all in one query without a subquery or CTE. The result: each department row shows its own total and the company-wide total, allowing a clean percentage calculation.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'The "Pivot / Crosstab" pattern in standard SQL uses CASE WHEN expressions inside aggregate functions to create conditional columns.',
              tagSlugs: ['sql', 'intermediate', 'problem-patterns'],
              correctAnswer: 'true',
              solution: 'True. Standard SQL does not have a built-in PIVOT syntax (PostgreSQL does have crosstab via the tablefunc extension, but it is rarely used in interviews). The universal approach is conditional aggregation: SUM(CASE WHEN category = \'X\' THEN value ELSE 0 END) AS x_total. This works in every SQL database and is the expected answer in CoderPad interviews.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Identify the pattern and write the SQL for this interview question:\n\n"Given a \'user_logins\' table (user_id INT, login_date DATE), find all users who logged in on at least 3 consecutive days. Return the user_id, the streak start date, the streak end date, and the number of consecutive days."',
              tagSlugs: ['sql', 'advanced', 'window-functions', 'problem-patterns', 'interview-prep'],
              solution: '-- Pattern: Consecutive / Sequential Events (Pattern 9)\n-- Key insight: subtracting a sequential row_number from a date gives the same "anchor date" for consecutive dates.\n\nWITH deduped AS (\n    -- Remove duplicate logins on the same day for the same user\n    SELECT DISTINCT user_id, login_date FROM user_logins\n),\nnumbered AS (\n    SELECT\n        user_id,\n        login_date,\n        login_date - (ROW_NUMBER() OVER (\n            PARTITION BY user_id\n            ORDER BY login_date\n        ) * INTERVAL \'1 day\') AS streak_group\n    FROM deduped\n)\nSELECT\n    user_id,\n    MIN(login_date) AS streak_start,\n    MAX(login_date) AS streak_end,\n    COUNT(*) AS consecutive_days\nFROM numbered\nGROUP BY user_id, streak_group\nHAVING COUNT(*) >= 3\nORDER BY user_id, streak_start;\n\n-- Why it works: if a user logged in on Jan 1, 2, 3, their row numbers are 1, 2, 3. Subtracting 1,2,3 days from Jan 1,2,3 gives Dec 31, Dec 31, Dec 31 - the same anchor date, forming one group. A gap in logins breaks the sequence, producing a different anchor date.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ---------------------------------------------------------
        // LESSON 6.2: Live Coding Strategy on CoderPad
        // ---------------------------------------------------------
        {
          title: 'Lesson 6.2: Live Coding Strategy - How to Think Out Loud in SQL',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'The difference between a candidate who knows SQL and a candidate who gets the job is often not the final query - it is how they communicate their thinking during the live coding session. CoderPad interviews are as much about your problem-solving process as the correct answer. This lesson covers the exact script to follow when you sit down at CoderPad, plus the most common mistakes that cause good SQL developers to fail interviews they should have passed.'
            },
            {
              blockType: 'text',
              content: 'The 5-step CoderPad framework - do these in order, out loud:\n\n**Step 1: Read and restate the problem** (30 seconds)\n"So you want me to find... and the expected output is... Is that right?"\nThis confirms you understood the question and gives the interviewer a chance to clarify before you write a single line.\n\n**Step 2: Examine the schema** (30-60 seconds)\nLook at every table. Find the foreign keys. Say: "I can see that orders.customer_id references customers.id, so I will need a JOIN there. The result should come from these two tables."\n\n**Step 3: Plan your approach** (30-60 seconds)\n"I am going to start by joining orders and customers, then GROUP BY customer to get the total per customer, then use HAVING to filter for totals above X. Does that sound like a good approach?"\n\n**Step 4: Write the query incrementally** (2-5 minutes)\nStart with FROM and JOIN, run it (if possible), then add WHERE, then GROUP BY, then HAVING, then ORDER BY. Do not try to write the whole thing at once.\n\n**Step 5: Review and sanity-check** (30 seconds)\n"Let me check - the WHERE filters individual rows before grouping, the HAVING filters groups after, and the ORDER BY uses the alias which is fine since it runs last. Looks correct."'
            },
            {
              blockType: 'text',
              content: 'The **incremental building approach** is one of the most powerful strategies for live SQL coding. Instead of writing the full query and hoping it works, build it piece by piece:\n\n```sql\n-- Step 1: Just get the tables joined, verify it looks right\nSELECT * FROM orders o\nJOIN customers c ON o.customer_id = c.id\nLIMIT 5;\n\n-- Step 2: Add the columns you actually need\nSELECT c.name, o.amount, o.created_at\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nLIMIT 5;\n\n-- Step 3: Add filters\n-- Step 4: Add aggregation\n-- Step 5: Add HAVING and ORDER BY\n```\n\nThis way, if you make a mistake, you know exactly which step introduced it. It also shows the interviewer your methodical thinking process - which they value highly.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'What to Say When You Are Stuck',
              content: 'Never sit in silence. If you are stuck, narrate your thinking: "I know I need to find the top value per group - I am thinking ROW_NUMBER with PARTITION BY here, but let me think about whether RANK would be better for handling ties..." Thinking out loud shows you have knowledge and are working through the problem - which is far better than silence. Interviewers often give hints to candidates who are visibly engaged.'
            },
            {
              blockType: 'text',
              content: 'The 7 most common mistakes candidates make on CoderPad SQL interviews:\n\n1. **Jumping straight to writing without reading the schema** - take 30 seconds to understand the tables first.\n2. **Writing the entire query at once** - build incrementally, verify each step.\n3. **Forgetting aliases when joining** - add table aliases immediately when you write a JOIN.\n4. **Using WHERE instead of HAVING for aggregate filters** - WHERE runs before GROUP BY, so aggregate functions are not available in WHERE.\n5. **Forgetting that window functions need a CTE to be filterable** - you cannot write WHERE rn <= 3 in the same query as the ROW_NUMBER().\n6. **Using SELECT *** - always specify which columns you need; it shows clarity of thinking.\n7. **Going silent** - always narrate your thought process, even when stuck.'
            },
            {
              blockType: 'text',
              content: 'How to handle the most common CoderPad scenario: you know roughly what you need but cannot remember the exact syntax.\n\n**Window function syntax forgotten?** Say: "I know this is a window function with ROW_NUMBER, OVER, and PARTITION BY - let me write the structure and fill in the details." Write the skeleton:\n```sql\nROW_NUMBER() OVER (\n    PARTITION BY ???\n    ORDER BY ???\n)\n```\nThis shows you know the concept even if syntax details are fuzzy.\n\n**LAG syntax forgotten?** Say: "I need to look back at the previous row - I believe that is LAG, and it takes the column name and optionally an offset." Write what you know, then fill in.\n\n**Date function uncertain?** Say: "In PostgreSQL I believe the function for truncating to month is DATE_TRUNC. Let me write DATE_TRUNC(\'month\', created_at) and if that is not the exact syntax, I would verify in the documentation." Showing you know the function exists and how to look it up is almost as good as knowing the exact syntax.'
            },
            {
              blockType: 'text',
              content: 'After finishing your query, proactively mention edge cases and improvements. This turns a passing answer into a standout answer:\n\n```sql\n-- Your solution\nSELECT customer_id, SUM(amount) AS total\nFROM orders\nGROUP BY customer_id\nHAVING SUM(amount) > 1000;\n```\n\n"My query works for the core requirement. A few things I would consider in production: (1) Should cancelled orders be excluded? I would add WHERE status != \'cancelled\'. (2) This could be slow without an index on customer_id - I would check that. (3) If amount could be NULL for some orders, SUM would ignore those NULLs - I would use COALESCE(amount, 0) to be explicit. Would you like me to add any of these?"\n\nThese additions demonstrate production thinking, not just interview thinking.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Visual flowchart of the 5-step CoderPad SQL interview framework. Show it as a vertical flow with labeled boxes: Box 1 "Read & Restate" (30s) - icon of a document being read. Box 2 "Examine Schema" (30-60s) - icon of a table with arrows between tables. Box 3 "Plan Approach" (30-60s) - speech bubble icon with "I will JOIN then GROUP BY then HAVING". Box 4 "Write Incrementally" (2-5 min) - code icon with multiple steps. Box 5 "Review & Sanity Check" (30s) - checkmark icon. Arrows connect each box. On the side, two columns: "DO" (green checkmarks) and "DON\'T" (red X marks) listing the key behaviors.',
              align: 'center',
              width: 'md'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'During a CoderPad interview, what is the BEST first action after reading the problem?',
              tagSlugs: ['sql', 'beginner', 'interview-prep', 'live-coding', 'coderpad'],
              choices: [
                'Immediately start writing the SELECT statement',
                'Ask for clarification on what the expected output looks like',
                'Examine the schema to find table relationships and foreign keys, then restate the problem',
                'Write the most complex solution you know to impress the interviewer'
              ],
              correctAnswer: 'Examine the schema to find table relationships and foreign keys, then restate the problem',
              solution: 'The strongest first step is examining the schema (identifying tables, columns, and foreign keys) and then restating the problem to confirm your understanding. This gives you the information you need to choose the right JOINs and approach, and it signals to the interviewer that you think before you code. Jumping straight to writing is the most common mistake.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'You are writing a SQL query live and realize you cannot remember the exact syntax for LAG(). What is the best response?',
              tagSlugs: ['sql', 'beginner', 'interview-prep', 'live-coding', 'coderpad'],
              choices: [
                'Go silent and stare at the screen until it comes to you',
                'Tell the interviewer the problem is too hard',
                'Explain that you know the concept and function name, write the skeleton, and mention you would verify the exact syntax in documentation',
                'Switch to a completely different approach that avoids LAG()'
              ],
              correctAnswer: 'Explain that you know the concept and function name, write the skeleton, and mention you would verify the exact syntax in documentation',
              solution: 'The worst thing you can do is go silent. Narrating your knowledge - "I know LAG() accesses the previous row\'s value and I believe the syntax is LAG(column, offset, default) OVER (ORDER BY...)" - demonstrates real understanding. Interviewers know that nobody memorizes every syntax perfectly. Showing you know the concept, can look things up, and can explain your approach is exactly what they are evaluating.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'After finishing your SQL solution in a live interview, you should proactively mention edge cases and potential improvements even if not asked.',
              tagSlugs: ['sql', 'intermediate', 'interview-prep', 'best-practices'],
              correctAnswer: 'true',
              solution: 'True. Proactively mentioning edge cases (NULL handling, cancelled records, missing index warnings, performance on large tables) demonstrates production thinking and senior-level instincts. It turns a correct but basic answer into an impressive one. This is one of the key differentiators between candidates who get offers and those who do not, especially for data services roles where data quality matters.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Walk through how you would approach this CoderPad problem from start to finish, describing every step you would take and say out loud:\n\n"Given tables \'employees\' (id, name, salary, department_id, hire_date) and \'departments\' (id, name), find departments where the average salary has increased compared to the average salary of employees hired more than 2 years ago."',
              tagSlugs: ['sql', 'advanced', 'interview-prep', 'live-coding', 'coderpad', 'problem-patterns'],
              solution: 'Step 1 - Restate: "I need to compare two averages per department: (1) current average salary of all employees, and (2) the average salary of employees hired more than 2 years ago. If (1) > (2), the average has increased. Is that correct?"\n\nStep 2 - Schema: "I see employees has department_id linking to departments.id. I will need a JOIN. The key filter is hire_date vs current date."\n\nStep 3 - Plan: "I will use two CTEs: one for current dept averages, one for historical averages (hire_date < 2 years ago). Then join them and filter where current > historical."\n\nStep 4 - Write:\nWITH current_avg AS (\n    SELECT department_id, AVG(salary) AS avg_sal\n    FROM employees\n    GROUP BY department_id\n),\nold_avg AS (\n    SELECT department_id, AVG(salary) AS avg_sal\n    FROM employees\n    WHERE hire_date < CURRENT_DATE - INTERVAL \'2 years\'\n    GROUP BY department_id\n)\nSELECT d.name, c.avg_sal AS current_avg, o.avg_sal AS old_avg\nFROM current_avg c\nJOIN old_avg o ON c.department_id = o.department_id\nJOIN departments d ON c.department_id = d.id\nWHERE c.avg_sal > o.avg_sal\nORDER BY (c.avg_sal - o.avg_sal) DESC;\n\nStep 5 - Edge cases: "Departments with no employees hired more than 2 years ago would not appear (INNER JOIN). If that is a concern, I would use LEFT JOIN and handle NULL. Also, CURRENT_DATE is PostgreSQL syntax for today."',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ---------------------------------------------------------
        // LESSON 6.3: Full Mock Interview Problems
        // ---------------------------------------------------------
        {
          title: 'Lesson 6.3: Full Mock Interview Problems with Walkthrough',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'This final lesson is your dress rehearsal. The following problems are structured exactly like real CoderPad SQL interview questions - a schema is provided, a business question is asked, and you need to produce a correct, well-written SQL query. For each problem, try to solve it yourself first before reading the walkthrough. Time yourself: aim for 5-8 minutes per problem. That is the realistic window you will have in a real interview.'
            },
            {
              blockType: 'text',
              content: '**Mock Problem 1: E-commerce Revenue Analysis**\n\nSchema:\n```\ncustomers  (id, name, email, country, created_at)\norders     (id, customer_id, status, created_at)\norder_items(id, order_id, product_id, quantity, unit_price)\nproducts   (id, name, category)\n```\n\nQuestion: "For each product category, find the total revenue from completed orders in 2024, the number of distinct customers who bought from that category, and the average order value. Only show categories with at least 10 distinct customers. Sort by total revenue descending."\n\nWalkthrough:\n```sql\nSELECT\n    p.category,\n    SUM(oi.quantity * oi.unit_price)  AS total_revenue,\n    COUNT(DISTINCT o.customer_id)     AS distinct_customers,\n    ROUND(\n        SUM(oi.quantity * oi.unit_price)\n        / COUNT(DISTINCT o.id),\n        2\n    )                                 AS avg_order_value\nFROM order_items oi\nINNER JOIN orders o     ON oi.order_id  = o.id\nINNER JOIN products p   ON oi.product_id = p.id\nWHERE o.status = \'completed\'\n  AND o.created_at >= \'2024-01-01\'\n  AND o.created_at <  \'2025-01-01\'\nGROUP BY p.category\nHAVING COUNT(DISTINCT o.customer_id) >= 10\nORDER BY total_revenue DESC;\n```\nKey decisions: `COUNT(DISTINCT o.customer_id)` counts unique customers not orders. `SUM(oi.quantity * oi.unit_price)` is the revenue formula. `COUNT(DISTINCT o.id)` for average order value counts unique orders, not line items.'
            },
            {
              blockType: 'text',
              content: '**Mock Problem 2: Employee Ranking**\n\nSchema:\n```\nemployees  (id, name, salary, department_id, hire_date, manager_id)\ndepartments(id, name, location)\n```\n\nQuestion: "For each department, find the top 2 highest-paid employees. Show the department name, employee name, salary, and their rank within the department. If two employees tie, both should be shown with the same rank."\n\nWalkthrough:\n```sql\nWITH dept_ranks AS (\n    SELECT\n        e.name         AS employee_name,\n        e.salary,\n        d.name         AS department_name,\n        RANK() OVER (\n            PARTITION BY e.department_id\n            ORDER BY e.salary DESC\n        )              AS salary_rank\n    FROM employees e\n    INNER JOIN departments d ON e.department_id = d.id\n)\nSELECT department_name, employee_name, salary, salary_rank\nFROM dept_ranks\nWHERE salary_rank <= 2\nORDER BY department_name, salary_rank;\n```\nKey decision: RANK() not ROW_NUMBER() because the question says "if two employees tie, both should be shown with the same rank." ROW_NUMBER would arbitrarily pick one. The CTE is necessary because WHERE cannot filter on window function results in the same query.'
            },
            {
              blockType: 'text',
              content: '**Mock Problem 3: User Retention Analysis**\n\nSchema:\n```\nusers    (id, name, email, created_at)\nlogins   (id, user_id, logged_in_at)\n```\n\nQuestion: "Find the month-over-month retention rate: for each month, what percentage of users who were active last month are also active this month? \'Active\' means they logged in at least once that month."\n\nWalkthrough:\n```sql\nWITH monthly_active AS (\n    SELECT\n        user_id,\n        DATE_TRUNC(\'month\', logged_in_at) AS active_month\n    FROM logins\n    GROUP BY user_id, DATE_TRUNC(\'month\', logged_in_at)\n),\nretention AS (\n    SELECT\n        curr.active_month,\n        COUNT(DISTINCT curr.user_id)  AS active_users,\n        COUNT(DISTINCT prev.user_id)  AS retained_users\n    FROM monthly_active curr\n    LEFT JOIN monthly_active prev\n        ON curr.user_id = prev.user_id\n        AND prev.active_month = curr.active_month - INTERVAL \'1 month\'\n    GROUP BY curr.active_month\n)\nSELECT\n    active_month,\n    active_users,\n    retained_users,\n    ROUND(\n        100.0 * retained_users / NULLIF(active_users, 0),\n        2\n    ) AS retention_rate_pct\nFROM retention\nORDER BY active_month;\n```\nKey techniques: self-join on `monthly_active` to match current month users with their previous month activity. `NULLIF(active_users, 0)` prevents division by zero if a month has no active users. `COUNT(DISTINCT prev.user_id)` counts only those who appear in both months (LEFT JOIN means missing prev_month users show as NULL and are not counted by COUNT).'
            },
            {
              blockType: 'text',
              content: '**Mock Problem 4: Data Cleaning Query**\n\nSchema:\n```\ntransactions(id, account_id, amount, transaction_type, created_at)\n```\n\nQuestion: "Find accounts that have duplicate transactions - same account_id, same amount, same transaction_type, where the created_at timestamps are within 60 seconds of each other. Return the account_id and the count of suspicious duplicate pairs."\n\nWalkthrough:\n```sql\nSELECT\n    t1.account_id,\n    COUNT(*) AS suspicious_pairs\nFROM transactions t1\nINNER JOIN transactions t2\n    ON  t1.account_id        = t2.account_id\n    AND t1.amount            = t2.amount\n    AND t1.transaction_type  = t2.transaction_type\n    AND t1.id                < t2.id    -- avoid counting (A,B) and (B,A) as two pairs\n    AND ABS(EXTRACT(EPOCH FROM (t2.created_at - t1.created_at))) <= 60\nGROUP BY t1.account_id\nHAVING COUNT(*) > 0\nORDER BY suspicious_pairs DESC;\n```\nKey techniques: self-join to compare each transaction to others in the same account. `t1.id < t2.id` ensures each pair is counted once. `EXTRACT(EPOCH FROM ...)` converts an interval to seconds in PostgreSQL - a useful date/time trick to know. `ABS()` handles both orderings of the timestamps.'
            },
            {
              blockType: 'callout',
              variant: 'success',
              title: 'You Are Ready',
              content: 'You have now covered every major SQL concept that appears in data services and backend engineer interviews: SELECT and filtering, aggregations, all JOIN types, subqueries, CTEs, window functions, database theory (indexes, ACID, normalization), the 10 classic problem patterns, and live coding strategy. The next step is practice - run these queries on a live PostgreSQL environment (try db-fiddle.com or sqlfiddle.com), and do at least 5-10 problems on platforms like LeetCode SQL, Mode Analytics, or HackerRank SQL. Good luck - you are more prepared than most candidates walking into that interview.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Course completion summary diagram. Central hexagon labeled "SQL Interview Ready." Six surrounding hexagons connected by lines, each representing a completed module: "Foundations (SELECT, WHERE, GROUP BY)", "JOINs (INNER, LEFT, Multi-table)", "Subqueries & CTEs", "Window Functions (ROW_NUMBER, LAG, RANK)", "Database Concepts (Indexes, ACID, Normalization)", "CoderPad Strategy (10 Patterns + Live Coding)". Each hexagon has a small icon representing the topic. Title: "Complete SQL Interview Preparation Map."',
              align: 'center',
              width: 'md'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'In Mock Problem 2, why was RANK() chosen over ROW_NUMBER() for finding top 2 employees per department?',
              tagSlugs: ['sql', 'intermediate', 'window-functions', 'rank', 'interview-prep'],
              choices: [
                'RANK() is always faster than ROW_NUMBER()',
                'ROW_NUMBER() does not work with PARTITION BY',
                'The question said tied employees should both appear with the same rank - ROW_NUMBER() assigns unique numbers and would arbitrarily drop one tied employee',
                'RANK() is required when using a CTE wrapper'
              ],
              correctAnswer: 'The question said tied employees should both appear with the same rank - ROW_NUMBER() assigns unique numbers and would arbitrarily drop one tied employee',
              solution: 'Reading the requirements carefully is critical. "Both should be shown with the same rank" is the signal to use RANK() or DENSE_RANK(), not ROW_NUMBER(). ROW_NUMBER() gives unique sequential numbers - if two employees tie at rank 2, one gets 2 and the other gets 3, and the WHERE rn <= 2 filter would drop the person assigned 3. RANK() correctly gives both a rank of 2.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'In Mock Problem 4, the condition "t1.id < t2.id" in the self-join prevents each duplicate pair from being counted twice.',
              tagSlugs: ['sql', 'intermediate', 'joins', 'problem-patterns'],
              correctAnswer: 'true',
              solution: 'True. Without the t1.id < t2.id condition, a self-join would match each pair in both directions: (transaction A, transaction B) AND (transaction B, transaction A). This would double-count every pair. By requiring t1.id < t2.id, we ensure each pair only appears once in a consistent order - t1 is always the earlier-ID transaction. This is a standard self-join deduplication technique.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 3,
              prompt: 'Final mock interview problem - solve it completely:\n\nSchema: "posts" (id, user_id, created_at, likes_count), "users" (id, username, country)\n\nQuestion: "Find the top 3 most liked posts per country in 2024. Return country, username, post id, likes_count, and rank. Handle ties correctly (tied posts should share the same rank)."',
              tagSlugs: ['sql', 'advanced', 'window-functions', 'joins', 'problem-patterns', 'interview-prep'],
              solution: 'WITH ranked_posts AS (\n    SELECT\n        u.country,\n        u.username,\n        p.id           AS post_id,\n        p.likes_count,\n        RANK() OVER (\n            PARTITION BY u.country\n            ORDER BY p.likes_count DESC\n        ) AS country_rank\n    FROM posts p\n    INNER JOIN users u ON p.user_id = u.id\n    WHERE p.created_at >= \'2024-01-01\'\n      AND p.created_at <  \'2025-01-01\'\n)\nSELECT country, username, post_id, likes_count, country_rank\nFROM ranked_posts\nWHERE country_rank <= 3\nORDER BY country, country_rank, likes_count DESC;\n\nPattern recognized: Top N per Group. Key decisions: RANK() for tie handling (not ROW_NUMBER). PARTITION BY u.country resets ranking for each country. INNER JOIN links posts to user country. WHERE in the CTE filters 2024 posts before ranking (more efficient than filtering after). The final ORDER BY country, country_rank gives a clean, readable result.',
              points: 3,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Reflect on your preparation: List the 3 SQL concepts or patterns from this course that you feel least confident about. For each one, write a brief description of what it does and when you would use it - as if explaining to the interviewer.',
              tagSlugs: ['sql', 'interview-prep', 'beginner'],
              solution: 'This is a self-assessment exercise with no single correct answer. Strong example answers might include:\n\n1. Correlated subqueries - "A correlated subquery references a column from the outer query, making it re-execute once per outer row. I would use it when I need to compare each row to a value computed from its own group, like finding employees earning above their own department average. The tradeoff is performance - it runs N times."\n\n2. The consecutive events pattern - "I subtract a sequential ROW_NUMBER from a date column. Consecutive dates minus 1,2,3,... produce the same anchor date, grouping them together. A gap in dates breaks the sequence, creating a different anchor."\n\n3. SUM(SUM()) OVER () for percentage of total - "The inner SUM is the GROUP BY aggregate per group. The outer SUM with OVER() adds all group totals together to get the grand total, without needing a separate subquery."\n\nReviewing concepts you are least sure of is the most efficient use of your final study time before the interview.',
              points: 2,
              isPublished: false
            }
          ]
        }
      ]
    }
  ]
};
