// Each chapter has two teaching steps, one recall check, and one applied exercise.
// Exercises check for key concepts in the learner's response; they do not execute code.
export const guidedCurriculum = [
  {
    id: 'curriculum-web-v1', slug: 'web-development', title: 'Web Development',
    summary: 'Build accessible, responsive web pages with HTML, CSS and JavaScript, then publish a small site.',
    chapters: [
      { title: 'Chapter 1 · How the web works', steps: [
        ['The browser and the server', 'When you enter a URL, the browser asks a server for a resource using HTTP. The server returns a response with a status and content such as HTML. The browser then requests linked CSS, JavaScript and images. A 200 response means success; a 404 means that resource was not found. Open DevTools Network to see these requests on a real page.'],
        ['The structure of an HTML document', 'HTML gives content meaning. A document starts with <!doctype html>, then <html>, <head> and <body>. Put metadata and a descriptive <title> in the head; put visible content in the body. Use one main heading and semantic regions such as <header>, <main> and <footer> so people and assistive technology can understand the page.'],
        ['Identify the visible region', 'Complete this sentence: The visible content of an HTML page belongs inside the ____ element.', 'body'],
        ['Plan your first document', 'Write a short plan for a personal page. Identify what belongs in the head, what belongs in the body, and the main heading you would use. Explain why the title and heading differ.', ['head', 'body', 'title', 'heading']],
      ] },
      { title: 'Chapter 2 · Semantic HTML and forms', steps: [
        ['Choose elements by meaning', 'Use <h1> through <h6> for a logical heading hierarchy, <p> for paragraphs, <a href="..."> for links and <ul>/<li> for unordered lists. Do not pick an element only because of its default appearance; CSS can change appearance later. Meaningful HTML improves keyboard navigation and search understanding.'],
        ['Make forms usable', 'A form groups controls with <form>. Connect every <label> to its input using matching for and id values. Choose input types such as email where they match the data. Mark required fields and show helpful validation messages. Test the form using only a keyboard before calling it complete.'],
        ['Connect a label', 'Fill in the blank: A label can point to its input with the ____ attribute.', 'for'],
        ['Sketch a contact form', 'Describe a contact form with a name field, an email field and a submit button. Include the form, labels, input types, required validation and the response a user should see after submission.', ['form', 'label', 'email', 'submit']],
      ] },
      { title: 'Chapter 3 · CSS and responsive layout', steps: [
        ['Selectors, properties and the box model', 'CSS rules pair a selector with declarations, such as p { color: navy; }. Each element has content, padding, border and margin. Use box-sizing: border-box to make declared widths easier to reason about. Prefer classes for reusable styling and inspect computed styles when a rule appears not to apply.'],
        ['Layouts that adapt', 'Flexbox is useful for one-dimensional rows or columns; Grid handles two-dimensional arrangements. Start with a narrow layout, then add min-width media queries for wider screens. Use max-width and flexible units so text does not stretch too far. Test at 320px, tablet and laptop widths, and make sure controls remain reachable.'],
        ['Name the layout tool', 'Fill in the blank: CSS ____ is suited to two-dimensional rows and columns.', 'grid'],
        ['Design a responsive card list', 'Describe a card list that is one column on a phone and three columns on a wide screen. Mention grid, a breakpoint, gap and max-width. Explain how long text will wrap instead of causing horizontal scroll.', ['grid', 'gap', 'max-width', 'wrap']],
      ] },
      { title: 'Chapter 4 · JavaScript and publishing', steps: [
        ['Add behavior with JavaScript', 'JavaScript can read the DOM, react to events and update the page. Select an element, add an event listener, then change its text or a class when clicked. Keep data and displayed state in sync. Prefer textContent for user text rather than inserting untrusted HTML with innerHTML.'],
        ['Ship and test a small site', 'Create an index.html, a stylesheet and a script. Check the browser console for errors, test links and forms, and verify the layout on phone and laptop widths. Deploy the static files to a host with HTTPS. After publishing, visit the public URL and repeat the checks; a local preview alone is insufficient.'],
        ['Choose the safe text API', 'Fill in the blank: To insert plain user text into an element, use ____ rather than innerHTML.', 'textContent'],
        ['Final build plan', 'Describe a small personal site with semantic HTML, responsive CSS and one JavaScript interaction. Explain the files you will create, your keyboard and mobile checks, and how you will verify the deployed HTTPS page.', ['html', 'css', 'javascript', 'https']],
      ] },
    ],
  },
  {
    id: 'curriculum-fullstack-v1', slug: 'full-stack-development', title: 'Full Stack Development',
    summary: 'Connect a frontend to an API and database, add authentication, and deploy a complete application.',
    chapters: [
      { title: 'Chapter 1 · Application architecture', steps: [
        ['Trace a request end to end', 'A full stack application has a user interface, server logic and data storage. A browser sends a request to an endpoint; the server validates it, reads or changes data, then sends a response. Draw this flow for a note-taking app. Keep secrets and database credentials on the server, never in browser JavaScript.'],
        ['Design a small feature', 'Define a user story before writing code: “As a learner, I can save a note.” Decide what the UI sends, what the API accepts and what table stores. An API contract names the method, URL, request fields, response fields and possible errors. This prevents the frontend and backend from drifting apart.'],
        ['Choose the server method', 'Fill in the blank: Creating a new resource normally uses the HTTP ____ method.', 'POST'],
        ['Map the feature', 'Describe the save-note request from browser to server to database and back. Include the endpoint, validation, a successful response and one error response.', ['browser', 'server', 'database', 'validation']],
      ] },
      { title: 'Chapter 2 · API and data design', steps: [
        ['Build predictable endpoints', 'Use resource URLs such as /api/notes. GET reads, POST creates, PATCH updates and DELETE removes. Return appropriate status codes: 200 for a successful read, 201 for a creation, 400 or 422 for invalid input and 404 for a missing resource. Validate input on the server even if the browser validates it too.'],
        ['Store related records safely', 'A relational schema might have users and notes tables. Each note has an id, a user_id foreign key, content and timestamps. Use parameterized queries to keep input separate from SQL. Add indexes for frequent lookups, and wrap multi-step changes in transactions so a partial failure does not leave inconsistent data.'],
        ['Prevent injection', 'Fill in the blank: SQL queries should use ____ parameters instead of concatenating user input.', 'parameterized'],
        ['Specify the notes API', 'Write a short contract for GET and POST /api/notes. State the request shape, response shape, owner check, input limits and status codes.', ['GET', 'POST', 'owner', 'status']],
      ] },
      { title: 'Chapter 3 · Authentication and frontend state', steps: [
        ['Identify and authorize users', 'Authentication establishes who a user is; authorization decides what they may do. After login, a secure session cookie can identify the user on later requests. Mark it HttpOnly, Secure on HTTPS and SameSite appropriately. Always check note ownership on the server, not merely by hiding a button in the UI.'],
        ['Handle loading and failures', 'A frontend request has loading, success and error states. Disable repeated submissions while saving, show a useful error when the request fails, and update the list only after success or with a deliberate optimistic rollback. Empty states should tell a new user how to create the first item.'],
        ['Name the permission check', 'Fill in the blank: Deciding whether a signed-in user may edit a note is ____.', 'authorization'],
        ['Plan a protected edit', 'Describe how a signed-in user edits a note. Include session, ownership, server validation and the loading or error message shown by the frontend.', ['session', 'ownership', 'validation', 'error']],
      ] },
      { title: 'Chapter 4 · Testing and deployment', steps: [
        ['Test the important boundaries', 'Test a valid request, invalid input, an unauthenticated request and an attempt to access another user’s record. Exercise the UI at a narrow width and with keyboard navigation. Keep development and production configurations separate, and do not use production secrets in tests.'],
        ['Release with a rollback path', 'Build the app, apply database migrations, back up data and deploy behind HTTPS. Check a health endpoint, a real user flow and application logs. Record the release revision so you can return to the previous version if checks fail. Monitor error rate, memory and response time after the release.'],
        ['Name the schema change', 'Fill in the blank: A versioned database schema change is a ____.', 'migration'],
        ['Final app checklist', 'Create a release checklist for a notes app. Include tests, migration, backup, HTTPS, health check and rollback. Explain how you would verify a learner can save and reopen a note.', ['tests', 'backup', 'https', 'rollback']],
      ] },
    ],
  },
  {
    id: 'curriculum-python-v1', slug: 'python-basics', title: 'Python Basics',
    summary: 'Learn Python syntax, collections, functions, files and error handling through small practical programs.',
    chapters: [
      { title: 'Chapter 1 · Values and control flow', steps: [
        ['Run a Python program', 'Install Python 3, check python --version and run a .py file. Use print() to display a value. Variables refer to values; common types include int, float, str and bool. Convert input explicitly, for example int(input("Age: ")), and expect a ValueError when text is not a valid number.'],
        ['Make decisions and repeat work', 'An if/elif/else block selects a branch. Indentation is part of Python syntax, so keep block spacing consistent. Use for item in items when visiting a sequence and while condition when repetition depends on a condition. Make sure a while loop changes the state that can end it.'],
        ['Choose the Boolean value', 'Fill in the blank: The Python Boolean literal for a true condition is ____.', 'True'],
        ['Plan a number checker', 'Describe a program that reads an integer and prints whether it is positive, negative or zero. Include input conversion, if/elif/else and what happens if input is invalid.', ['input', 'int', 'if', 'invalid']],
      ] },
      { title: 'Chapter 2 · Collections and strings', steps: [
        ['Lists and dictionaries', 'A list stores ordered values, for example scores = [8, 10]. Access an item by zero-based index and use append() to add one. A dictionary maps keys to values, for example student = {"name": "Asha"}. Use .get() when a key might not exist. Choose a list for a sequence and a dictionary for named fields.'],
        ['Transform and summarize data', 'Loop through a collection to filter or aggregate it. sum(scores) totals numbers and len(scores) counts items; check for an empty list before dividing for an average. Strings can be normalized with strip() and lower(). A list comprehension is concise for a simple transformation, but a loop is clearer for several decisions.'],
        ['Avoid a missing key', 'Fill in the blank: The dictionary method that returns a default for a missing key is ____.', 'get'],
        ['Summarize quiz scores', 'Outline a program that stores scores in a list, calculates a total and average, handles an empty list, then prints a readable result.', ['list', 'sum', 'len', 'empty']],
      ] },
      { title: 'Chapter 3 · Functions and modules', steps: [
        ['Write reusable functions', 'Define a function with def and give parameters meaningful names. Use return to send a result to the caller; print only when output is the function’s purpose. Keep each function focused on one task. For example, calculate_average(scores) can return None for an empty list and a numeric average otherwise.'],
        ['Import and organize code', 'A module is a Python file that can be imported. Put reusable functions in one module and the program entry point in another. Use if __name__ == "__main__": for code that should run only when the file is executed directly. Prefer standard-library modules, such as pathlib, before adding dependencies.'],
        ['Return a result', 'Fill in the blank: A function sends a value back to its caller with ____.', 'return'],
        ['Design a reusable helper', 'Describe a function that accepts a list of numbers and returns the average or None when empty. Include def, a parameter, an empty check and return.', ['def', 'scores', 'empty', 'return']],
      ] },
      { title: 'Chapter 4 · Files, errors and a small project', steps: [
        ['Read and write files safely', 'Use pathlib.Path and a with block so files close automatically. For structured records, csv and json are useful standard-library modules. Specify UTF-8 encoding for text. Check whether a file exists and decide whether a missing file should create an empty dataset or show an error.'],
        ['Handle expected failures', 'Use try/except around operations that can reasonably fail, such as parsing user input or reading a file. Catch a specific exception, not every exception. Keep the try block small and give a helpful message. Write a simple test for valid and invalid input so a fix does not break earlier behavior.'],
        ['Name the context manager', 'Fill in the blank: The Python ____ statement closes an opened file when its block ends.', 'with'],
        ['Final project: expense tracker', 'Plan an expense tracker that reads entries from a CSV file, validates an amount, adds a new entry and displays a total. Include a function, a list or dictionary, a with block, and a specific exception handler.', ['csv', 'def', 'with', 'except']],
      ] },
    ],
  },
  {
    id: 'curriculum-dataviz-v1', slug: 'data-visualization', title: 'Data Visualization',
    summary: 'Prepare data, choose honest charts, create clear visuals and communicate findings.',
    chapters: [
      { title: 'Chapter 1 · Questions and data quality', steps: [
        ['Start with a question', 'A chart should answer a specific question, such as “How did monthly sign-ups change?” Identify the audience, the measure, its unit and the time or category dimension. A table of numbers can be better than a chart when the audience needs exact values. Avoid decorating a chart before defining what decision it should support.'],
        ['Inspect and clean the dataset', 'Check column types, duplicates, missing values and unusual outliers. Decide whether missing means zero, unknown or not applicable; those are different. Record any cleaning decisions so another person can reproduce the result. Keep the original dataset unchanged and work from a copy.'],
        ['Name the unknown value', 'Fill in the blank: A blank field with no recorded value is often called a ____ value.', 'missing'],
        ['Prepare a sign-up dataset', 'Describe how you would check a monthly sign-up table before charting it. Include duplicates, missing values, date types and the unit of the metric.', ['duplicates', 'missing', 'date', 'unit']],
      ] },
      { title: 'Chapter 2 · Choose the right chart', steps: [
        ['Compare categories and time', 'Use a bar chart for comparing categories and a line chart for a measure over ordered time. Sort bars when order is not inherent, and start a bar axis at zero so lengths are not misleading. A line chart can use a narrower y-axis when the scale is clearly shown. Avoid pie charts when many similar slices are hard to compare.'],
        ['Show distributions and relationships', 'A histogram groups numeric observations into bins to show a distribution. A scatter plot shows pairs of numeric values and may reveal a relationship or outlier. A correlation is not proof of cause; consider confounding variables. Choose a bin width and axis scale that expose the pattern without hiding variation.'],
        ['Pick a time-series chart', 'Fill in the blank: A ____ chart is a common choice for showing a value over ordered time.', 'line'],
        ['Select three charts', 'Choose chart types for monthly revenue, sales by product and customer age distribution. Explain why line, bar and histogram fit those questions, and name one potential misleading scale.', ['line', 'bar', 'histogram', 'scale']],
      ] },
      { title: 'Chapter 3 · Readable visual design', steps: [
        ['Use labels and color with purpose', 'Give the chart a takeaway title, label axes with units and identify every series. Use color to distinguish meaning, not merely to decorate. Ensure enough contrast and avoid relying on color alone; use direct labels or patterns where possible. Reduce grid lines and 3D effects that compete with the data.'],
        ['Keep comparisons honest', 'Compare like with like: use the same unit, period and denominator. Show percentages together with sample sizes when a tiny group could mislead. Explain whether an axis is truncated and why. Annotate a real event or change only if the data supports the interpretation; do not imply causation from a coincident trend.'],
        ['Name the measurement label', 'Fill in the blank: A chart axis should include the measurement ____ such as rupees or percent.', 'unit'],
        ['Critique a chart', 'Write a critique of a sales chart with no axis labels, a truncated bar axis and five bright colors. Recommend labels, a zero baseline, restrained color and a clear title.', ['labels', 'zero', 'color', 'title']],
      ] },
      { title: 'Chapter 4 · Create and present a chart', steps: [
        ['Build with a tool', 'In a spreadsheet or Python plotting library, load a tidy table with one observation per row. Group or aggregate only after confirming what each row means. Build the chart, then inspect data points against the source table. Export at a readable size and keep source data and the chart specification so it can be updated.'],
        ['Tell the story responsibly', 'Present the key finding, supporting evidence and an important limitation. State the time period and source. If the data is incomplete or a category has few observations, say so. End with a question or decision the audience can act on, rather than a claim stronger than the evidence.'],
        ['Name the data layout', 'Fill in the blank: A tidy data table normally has one observation per ____.', 'row'],
        ['Final chart brief', 'Plan a two-chart report on course enrollments. Specify the source, a line or bar chart, axis units, one finding and one limitation. Explain how you will check plotted values against the table.', ['source', 'chart', 'unit', 'limitation']],
      ] },
    ],
  },
  {
    id: 'curriculum-git-v1', slug: 'git-basics', title: 'Basics of Git',
    summary: 'Track changes, use branches, collaborate safely and recover from common mistakes.',
    chapters: [
      { title: 'Chapter 1 · Repository and commits', steps: [
        ['Understand Git history', 'Git records snapshots of tracked files in a repository. git init starts one; git status shows what changed. A working tree holds edits, a staging area selects changes and a commit saves a snapshot. Make a small change, stage only the intended file and inspect git diff --staged before committing.'],
        ['Write useful commits', 'Use git add to stage and git commit -m to save. A good commit groups one logical change and has a message that explains its purpose. git log --oneline shows the history. Do not commit passwords, local databases, build output or secrets; add generated files to .gitignore before they are accidentally staged.'],
        ['Name the selection area', 'Fill in the blank: Files selected for the next commit are in the ____ area.', 'staging'],
        ['Plan a first commit', 'Describe how you would create a repository, edit README, check status, stage the file, inspect the staged diff and commit it.', ['git init', 'git status', 'git add', 'git commit']],
      ] },
      { title: 'Chapter 2 · Branches and merges', steps: [
        ['Work on a branch', 'A branch is a movable name for a sequence of commits. Create a feature branch with git switch -c feature/name and keep main stable. Commit related work on the branch. Before integrating, compare it with main and run the project checks. A branch does not automatically copy changes to a remote.'],
        ['Integrate and resolve conflicts', 'git merge brings another branch into the current branch. If both branches changed the same lines, Git asks you to resolve a conflict. Read both versions and the surrounding context, edit the file to the desired result, then stage and complete the merge. Run tests after resolving; deleting conflict markers is not enough.'],
        ['Name the integration command', 'Fill in the blank: The Git command that combines another branch into the current branch is ____.', 'merge'],
        ['Resolve a shared edit', 'Outline a merge conflict workflow. Mention branch, conflict markers, the intended combined change, staging and tests before finishing the merge.', ['branch', 'conflict', 'git add', 'tests']],
      ] },
      { title: 'Chapter 3 · Remote collaboration', steps: [
        ['Connect to a remote', 'A remote is a named repository location, often origin. git clone creates a local copy; git fetch downloads remote history without changing your working tree. git pull normally fetches and integrates. Review what changed before pulling into important work, especially when you have uncommitted edits.'],
        ['Push and review changes', 'git push sends local commits to a remote branch. A pull request lets teammates inspect the diff, discuss behavior and run automated checks before merging. Explain the feature and how it was tested. Avoid force-pushing a shared branch because it can replace teammates’ history.'],
        ['Name the download-only command', 'Fill in the blank: git ____ downloads remote history without merging it into your branch.', 'fetch'],
        ['Describe a team contribution', 'Write a safe collaboration sequence from clone to feature branch, commit, push and pull request. Include a review of the diff and project tests.', ['clone', 'branch', 'commit', 'pull request']],
      ] },
      { title: 'Chapter 4 · Undo and release safely', steps: [
        ['Inspect before undoing', 'git diff shows unstaged edits and git diff --staged shows staged edits. git restore can discard local edits, so check the file and make sure those edits are not needed. git revert makes a new commit that reverses a committed change, which is safer for a shared branch than rewriting published history.'],
        ['Tag and verify a release', 'A tag gives a release commit a stable name, such as v1.0.0. Before a release, check git status, run tests and note the commit hash. Push the tag only after the release is ready. If production fails, return to a known good build or revert the change according to the deployment process.'],
        ['Choose shared-history undo', 'Fill in the blank: To reverse a published commit without rewriting shared history, use git ____.', 'revert'],
        ['Final Git workflow', 'Document a release workflow that includes a clean status, branch review, tests, commit hash, tag and a safe rollback using revert or a previous build.', ['status', 'tests', 'tag', 'revert']],
      ] },
    ],
  },
  {
    id: 'curriculum-rdbms-v1', slug: 'relational-databases', title: 'Relational Database Basics',
    summary: 'Model tables and relationships, query with SQL, protect data and reason about transactions.',
    chapters: [
      { title: 'Chapter 1 · Tables, keys and relationships', steps: [
        ['Think in entities and rows', 'A relational database stores related data in tables. A table has columns with types and rows representing records. Model an LMS with learners, courses and enrollments. Give each row a stable primary key; do not use a name as an identifier because names can repeat or change.'],
        ['Connect tables with keys', 'An enrollment row can contain learner_id and course_id foreign keys. This creates two one-to-many relationships and represents a many-to-many relationship between learners and courses. Foreign key constraints prevent references to missing records. Decide what should happen when a linked row is deleted before choosing a cascading rule.'],
        ['Name the row identifier', 'Fill in the blank: A column that uniquely identifies a table row is a ____ key.', 'primary'],
        ['Sketch an LMS schema', 'Describe learners, courses and enrollments tables. Identify primary keys, foreign keys and the many-to-many relationship.', ['learners', 'courses', 'enrollments', 'foreign key']],
      ] },
      { title: 'Chapter 2 · Query data with SQL', steps: [
        ['Read and filter records', 'SELECT chooses columns from a table. WHERE filters rows, ORDER BY sorts and LIMIT caps the result. For example, SELECT title FROM courses WHERE published = 1 ORDER BY title; returns published titles alphabetically. Use explicit columns in application queries so schema changes do not silently expand the response.'],
        ['Join related tables', 'An INNER JOIN returns rows that match in both tables; a LEFT JOIN keeps rows from the left even when no match exists. Join enrollments to courses on the course key to show course titles for one learner. Qualify duplicate column names with table aliases and check the result count so an incorrect join does not multiply rows.'],
        ['Name the matching operation', 'Fill in the blank: SQL ____ combines related rows from multiple tables.', 'JOIN'],
        ['Plan a learner query', 'Write or describe a SELECT that lists one learner’s enrolled course titles. Include FROM enrollments, JOIN courses, a matching key, WHERE learner_id and ORDER BY.', ['SELECT', 'JOIN', 'WHERE', 'ORDER BY']],
      ] },
      { title: 'Chapter 3 · Design and performance', steps: [
        ['Avoid duplicated facts', 'Normalization puts each fact in a sensible place. Store a course title in courses, not copied into every enrollment. This reduces inconsistent updates. A join reconstructs the view when needed. Denormalization can help a measured performance problem, but first understand the source of truth and how copies will stay synchronized.'],
        ['Use indexes deliberately', 'An index speeds selected lookups at the cost of storage and slower writes. Index columns used frequently in WHERE, JOIN or ORDER BY, such as enrollments(learner_id, course_id). Check the query plan and real data size before adding many indexes. Pagination limits result size for large tables; an index does not replace it.'],
        ['Name the lookup structure', 'Fill in the blank: A database ____ can speed a frequent WHERE lookup.', 'index'],
        ['Review an enrollment table', 'Explain why course titles belong in courses, how enrollments references them, and which index helps a learner dashboard. Include normalization, foreign key and query plan.', ['normalization', 'foreign key', 'index', 'query plan']],
      ] },
      { title: 'Chapter 4 · Transactions and safe updates', steps: [
        ['Make changes atomically', 'A transaction groups related changes. BEGIN starts it, COMMIT saves it and ROLLBACK discards it if something fails. For example, an enrollment and its payment record should not leave only one side saved after an error. Keep transactions short to reduce lock contention and check constraints before committing.'],
        ['Protect and recover data', 'Use parameterized queries to separate input from SQL and prevent injection. Grant applications only the permissions they need. Back up the database and test restoration, not just backup creation. Apply schema migrations in order and plan how an old application version behaves if a deployment is rolled back.'],
        ['Name the failure action', 'Fill in the blank: To discard uncommitted transaction changes, use ____.', 'ROLLBACK'],
        ['Final database design', 'Design a small course enrollment database and a safe enrollment operation. Include primary and foreign keys, a parameterized query, transaction, backup and a test restoration plan.', ['primary key', 'foreign key', 'transaction', 'backup']],
      ] },
    ],
  },
];
