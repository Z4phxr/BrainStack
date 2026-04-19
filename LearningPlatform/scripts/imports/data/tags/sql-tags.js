// data/tags/sql-tags.js
module.exports = [
  // Main topic tags
  { name: 'SQL', slug: 'sql', main: true },
  { name: 'Database', slug: 'database', main: true },
  { name: 'PostgreSQL', slug: 'postgresql', main: true },

  // Difficulty tags
  { name: 'Beginner', slug: 'beginner', main: true },
  { name: 'Intermediate', slug: 'intermediate', main: true },
  { name: 'Advanced', slug: 'advanced', main: false },

  // Core SQL concept tags
  { name: 'SELECT', slug: 'select', main: false },
  { name: 'Filtering', slug: 'filtering', main: false },
  { name: 'Sorting', slug: 'sorting', main: false },
  { name: 'Aggregations', slug: 'aggregations', main: false },
  { name: 'GROUP BY', slug: 'group-by', main: false },
  { name: 'HAVING', slug: 'having', main: false },

  // JOIN tags
  { name: 'JOINs', slug: 'joins', main: true },
  { name: 'INNER JOIN', slug: 'inner-join', main: false },
  { name: 'LEFT JOIN', slug: 'left-join', main: false },
  { name: 'NULL Handling', slug: 'null-handling', main: false },

  // Subqueries and CTEs
  { name: 'Subqueries', slug: 'subqueries', main: false },
  { name: 'CTE', slug: 'cte', main: false },
  { name: 'WITH Clause', slug: 'with-clause', main: false },
  { name: 'Correlated Subquery', slug: 'correlated-subquery', main: false },

  // Window functions
  { name: 'Window Functions', slug: 'window-functions', main: true },
  { name: 'ROW_NUMBER', slug: 'row-number', main: false },
  { name: 'RANK', slug: 'rank', main: false },
  { name: 'PARTITION BY', slug: 'partition-by', main: false },
  { name: 'Running Totals', slug: 'running-totals', main: false },
  { name: 'LEAD and LAG', slug: 'lead-lag', main: false },

  // Database concepts
  { name: 'Indexes', slug: 'indexes', main: false },
  { name: 'Primary Key', slug: 'primary-key', main: false },
  { name: 'Foreign Key', slug: 'foreign-key', main: false },
  { name: 'Transactions', slug: 'transactions', main: false },
  { name: 'ACID', slug: 'acid', main: false },
  { name: 'Normalization', slug: 'normalization', main: false },
  { name: 'Schema Design', slug: 'schema-design', main: false },

  // Interview-specific tags
  { name: 'Interview Prep', slug: 'interview-prep', main: true },
  { name: 'CoderPad', slug: 'coderpad', main: false },
  { name: 'Live Coding', slug: 'live-coding', main: false },
  { name: 'Problem Patterns', slug: 'problem-patterns', main: false },
  { name: 'Best Practices', slug: 'best-practices', main: false },
  { name: 'Gotchas', slug: 'gotchas', main: false },
  { name: 'Performance', slug: 'performance', main: false },
];
