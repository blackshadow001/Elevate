// Two authored checks per module. The order matches comprehensiveCurriculum.mjs.
// Each set includes the correct answer and two plausible alternatives.
const pair = (first, second, explanation) => ({ choices: [first, second], explanation });

export const guidedQuizChoices = {
  'web-development': [
    pair(['head', 'body', 'title'], ['200', '403', '404'], 'The body contains what appears on the page. HTTP 404 means a requested resource could not be found.'),
    pair(['id', 'for', 'name'], ['button', 'span', 'a'], 'A label’s for value matches an input id. The a element links to a destination.'),
    pair(['margin', 'padding', 'gap'], ['content-box', 'border-box', 'inline-box'], 'Padding is space inside a border. With border-box, padding is included in the declared width.'),
    pair(['flex', 'grid', 'block'], ['max-width', 'min-width', 'min-height'], 'Grid handles rows and columns. A min-width media query applies at and above its threshold.'),
    pair(['setTimeout', 'addEventListener', 'querySelector'], ['innerHTML', 'textContent', 'value'], 'An event listener runs when an action happens. textContent inserts plain text without treating it as HTML.'),
    pair(['status', 'ok', 'json'], ['http', 'ftp', 'https'], 'response.ok reports a successful HTTP status. Public sites should use HTTPS.'),
  ],
  'full-stack-development': [
    pair(['GET', 'POST', 'DELETE'], ['200', '201', '404'], 'POST commonly creates a resource; 201 means a resource was created.'),
    pair(['loading', 'success', 'empty'], ['form', 'label', 'input'], 'Disable duplicate submission while loading. A label names its matching form control.'),
    pair(['PUT', 'PATCH', 'GET'], ['401', '404', '500'], 'PATCH commonly changes part of a resource. A missing resource normally returns 404.'),
    pair(['primary', 'foreign', 'unique'], ['transaction', 'migration', 'session'], 'A foreign key refers to a row in another table. A migration is a tracked schema change.'),
    pair(['authentication', 'authorization', 'validation'], ['Secure', 'SameSite', 'HttpOnly'], 'Authorization decides access to a record. HttpOnly prevents browser JavaScript from reading the cookie.'),
    pair(['backup', 'cache', 'token'], ['login', 'health', 'signup'], 'Back up data before a production migration, then use a health endpoint to verify readiness.'),
  ],
  'python-basics': [
    pair(['int', 'str', 'bool'], ['TypeError', 'ValueError', 'KeyError'], 'input() returns text. Converting invalid text with int() raises ValueError.'),
    pair(['if', 'elif', 'while'], ['continue', 'return', 'break'], 'elif checks another branch. break exits the current loop immediately.'),
    pair(['list', 'tuple', 'set'], ['items', 'get', 'keys'], 'A set stores unique values. dict.get can return a default when a key is absent.'),
    pair(['yield', 'return', 'print'], ['class', 'def', 'import'], 'return gives a result to the caller. def starts a function definition.'),
    pair(['with', 'try', 'for'], ['json', 'csv', 'pathlib'], 'A with block closes the file handle. The csv module reads and writes comma-separated rows.'),
    pair(['argparse', 'unittest', 'logging'], ['README', 'LICENSE', 'requirements.txt'], 'unittest is Python’s standard test module. A README normally explains how to run the project.'),
  ],
  'data-visualization': [
    pair(['numerator', 'denominator', 'sample'], ['observation', 'column', 'axis'], 'The denominator is the bottom of a rate. A dataset row is one observation.'),
    pair(['yes', 'no', 'always'], ['raw data', 'chart title', 'color palette'], 'Missing is not automatically zero. Keep raw data unchanged so cleaning decisions can be checked.'),
    pair(['bar', 'histogram', 'pie'], ['scatter', 'line', 'bar'], 'A histogram shows a numeric distribution. A line chart follows ordered values such as time.'),
    pair(['sort', 'sum', 'filter'], ['wide', 'tidy', 'nested'], 'sum totals values. Tidy data normally keeps each observation in one row.'),
    pair(['color', 'unit', 'font'], ['caption', 'alt text', 'legend'], 'A numeric axis needs its unit. Alt text summarizes a meaningful chart for nonvisual readers.'),
    pair(['yes', 'no', 'sometimes'], ['method', 'theme', 'legend'], 'Correlation alone does not prove cause. Describe the method used to generate a chart.'),
  ],
  'git-basics': [
    pair(['git log', 'git status', 'git push'], ['git commit', 'git add', 'git fetch'], 'git status shows changed files; git add selects changes for the next commit.'),
    pair(['git diff', 'git show', 'git branch'], ['README', '.gitignore', 'package.json'], 'git show displays a commit patch. .gitignore lists patterns Git should ignore.'),
    pair(['git branch', 'git switch -c', 'git checkout --'], ['git merge', 'git fetch', 'git clone'], 'git switch -c creates and selects a branch. git merge combines branch histories.'),
    pair(['git pull', 'git fetch', 'git merge'], ['git commit', 'git push', 'git status'], 'git fetch downloads history without merging. git push publishes local commits.'),
    pair(['git reset', 'git revert', 'git clean'], ['git restore', 'git push', 'git tag'], 'git revert creates a new commit that undoes a published one. git restore can discard local unstaged edits.'),
    pair(['git push', 'git tag', 'git diff'], ['git branch', 'git status', 'git merge'], 'git tag names a release revision. git status reports whether the working tree is clean.'),
  ],
  'relational-databases': [
    pair(['foreign', 'primary', 'unique'], ['primary', 'index', 'foreign'], 'A primary key identifies one row. A foreign key refers to a row in another table.'),
    pair(['CHECK', 'UNIQUE', 'DEFAULT'], ['NULL', 'NOT NULL', 'UNIQUE'], 'UNIQUE blocks repeated values. NOT NULL rejects a missing value.'),
    pair(['GROUP BY', 'WHERE', 'ORDER BY'], ['WHERE', 'LIMIT', 'ORDER BY'], 'WHERE filters rows; ORDER BY sorts the rows returned.'),
    pair(['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN'], ['ORDER BY', 'GROUP BY', 'HAVING'], 'LEFT JOIN keeps left-side rows without matches. GROUP BY combines rows for aggregation.'),
    pair(['SELECT', 'EXPLAIN', 'DELETE'], ['view', 'index', 'trigger'], 'EXPLAIN shows a query plan. An index can speed selected lookups.'),
    pair(['COMMIT', 'BEGIN', 'SAVEPOINT'], ['COMMIT', 'ROLLBACK', 'UPDATE'], 'COMMIT saves a transaction; ROLLBACK discards its uncommitted changes.'),
  ],
};
