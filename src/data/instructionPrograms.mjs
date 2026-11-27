// Original, runnable practice material for the six built-in guided programs.
// The order of each list matches comprehensiveCurriculum.mjs modules.
const program = (tools, steps, code, run, expect, challenge) => ({ tools, steps, code, run, expect, challenge });

export const instructionPrograms = {
  'web-development': [
    program('A text editor and any modern browser', [
      'Create a folder named event-site and save the program below as index.html.',
      'Open index.html in your browser. Inspect the tab title and the visible heading.',
      'Open Developer Tools → Network, reload, and locate the document request.',
    ], `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Community coding day</title>
</head>
<body>
  <h1>Community coding day</h1>
  <p>Join us on Saturday to build and learn together.</p>
  <a href="https://example.org">Learn more</a>
</body>
</html>`, 'Double-click index.html, or open it from your browser’s File menu.', 'The tab says “Community coding day”; the page shows the heading and paragraph. A file URL has no HTTP status, so use a local web server if you want to inspect an HTTP 200 response.', 'Make a second page about another event with its own title, heading, date, paragraph and link.'),
    program('A text editor and browser', [
      'Replace the body of your event page with the semantic layout below.',
      'Click each label and confirm focus moves to its input.',
      'Submit an empty form, then type a valid email and submit again. The example prevents a real network request.',
    ], `<header><nav aria-label="Main navigation"><a href="#event">Event</a> <a href="#contact">Contact</a></nav></header>
<main>
  <section id="event"><h1>Community coding day</h1><p>Everyone is welcome.</p></section>
  <section id="contact">
    <h2>Get updates</h2>
    <form onsubmit="event.preventDefault(); alert('Form valid — connect a server before collecting addresses')">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" required>
      <button type="submit">Join updates</button>
    </form>
  </section>
</main>`, 'Save index.html and refresh the browser. Use Tab and Enter to test the form.', 'Empty or malformed email is blocked by the browser; a valid email shows the demonstration message. No data is stored.', 'Add a name field with a matching label, a helpful error message, and a meaningful image with alt text.'),
    program('An index.html file and a style.css file', [
      'Link style.css in the HTML head with <link rel="stylesheet" href="style.css">.',
      'Copy the CSS below into style.css and refresh.',
      'Inspect the card in Developer Tools and change its padding to compare the box dimensions.',
    ], `* { box-sizing: border-box; }
body { margin: 0; font: 1rem/1.6 system-ui, sans-serif; color: #172033; }
main { width: min(100% - 2rem, 60rem); margin: 2rem auto; }
.card { padding: 1.5rem; border: 1px solid #cbd5e1; border-radius: 1rem; margin-block: 1rem; }
.card h2 { margin-top: 0; }
a:focus-visible, button:focus-visible { outline: 3px solid #e85d2a; outline-offset: 3px; }`, 'Wrap a page section in <section class="card">…</section> and refresh the browser.', 'The card has space inside its border and a margin outside. Its declared width does not grow when padding is added because of border-box.', 'Add a second card and create a reusable color variable in :root; check readable contrast.'),
    program('The event page, style.css and a browser with responsive view', [
      'Add a container with three .card elements to the page.',
      'Apply the CSS below, then test viewport widths of 320px, 768px and 1366px.',
      'Check document width against viewport width and inspect any horizontal overflow.',
    ], `.cards { display: grid; grid-template-columns: 1fr; gap: 1rem; }
.card { min-width: 0; padding: 1.25rem; border: 1px solid #cbd5e1; border-radius: 1rem; }
@media (min-width: 48rem) {
  .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 72rem) {
  .cards { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}`, 'Use the browser’s device toolbar to resize and reload at each width.', 'Cards form one column on a phone, two on medium screens and three on wide screens, with no clipped text.', 'Add a fourth card with a long title and make sure it wraps without horizontal scrolling.'),
    program('index.html and a browser', [
      'Add a button with id="toggle" and a paragraph with id="status" to the page.',
      'Place the JavaScript below before the closing </body> tag inside <script>…</script>.',
      'Activate the button by mouse and keyboard; watch the status text and aria-pressed value.',
    ], `const button = document.querySelector('#toggle');
const status = document.querySelector('#status');
let attending = false;
button.addEventListener('click', () => {
  attending = !attending;
  button.setAttribute('aria-pressed', String(attending));
  status.textContent = attending ? 'You are attending.' : 'You are not attending.';
});`, 'Refresh the page, press Tab until the button is focused, then press Enter or Space.', 'Each activation switches the visible sentence and the pressed state. No raw HTML is inserted.', 'Add a count of attendees that changes with the toggle but never goes below zero.'),
    program('A browser and a local web server', [
      'Add <button id="load">Load users</button> and <ul id="users"></ul> to your page.',
      'Use the program below in a script tag and inspect Network when you click Load users.',
      'Change the URL temporarily to an invalid path to confirm the error state.',
    ], `const load = document.querySelector('#load');
const list = document.querySelector('#users');
load.addEventListener('click', async () => {
  list.replaceChildren();
  list.textContent = 'Loading…';
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const users = await response.json();
    list.replaceChildren();
    for (const user of users.slice(0, 5)) {
      const item = document.createElement('li');
      item.textContent = user.name;
      list.append(item);
    }
  } catch (error) { list.textContent = 'Could not load users. Try again.'; }
});`, 'Serve the folder locally (for example: python -m http.server 8000) and open http://localhost:8000.', 'The page first shows Loading, then up to five names. If the request fails, it shows a retry message. The public sample API requires internet access.', 'Add a retry button and deploy the site over HTTPS; test the deployed URL on a phone width.'),
  ],
  'full-stack-development': [
    program('Node.js 24 and a terminal', [
      'Create a folder named goal-api and save the program as server.mjs.',
      'Run it, then send the listed curl requests from a second terminal.',
      'Identify the browser/client request, server validation and response status in each case.',
    ], `import { createServer } from 'node:http';
createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'POST' && req.url === '/api/goals') {
    let raw = ''; for await (const chunk of req) raw += chunk;
    let body; try { body = JSON.parse(raw); } catch { res.writeHead(400); return res.end('{"error":"Invalid JSON"}'); }
    if (typeof body.title !== 'string' || !body.title.trim()) {
      res.writeHead(422); return res.end('{"error":"Title required"}');
    }
    res.writeHead(201); return res.end(JSON.stringify({ id: 1, title: body.title.trim() }));
  }
  res.writeHead(404); res.end('{"error":"Not found"}');
}).listen(3001, () => console.log('http://localhost:3001'));`, 'Run node server.mjs. Send POST /api/goals with JSON {"title":"Read one chapter"}; repeat with an empty title.', 'The valid request returns 201 and an object; the empty title returns 422. This first example is in memory and has no authentication or database yet.', 'Draw the full request → validation → database → response flow and add a GET route to the demo server.'),
    program('A browser and the goal API from the previous module', [
      'Create index.html containing a labeled form, list and status message.',
      'Add the script below; point its fetch URL at your API.',
      'Test a successful request and a stopped server. Observe that the entered title remains after failure.',
    ], `<form id="goal-form"><label for="title">Goal</label><input id="title" required><button>Save</button></form>
<p id="message" role="status"></p><ul id="goals"></ul>
<script>
const form = document.querySelector('#goal-form');
const input = document.querySelector('#title');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button'); button.disabled = true;
  document.querySelector('#message').textContent = 'Saving…';
  try {
    const response = await fetch('/api/goals', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({title: input.value}) });
    if (!response.ok) throw new Error('Save failed');
    const goal = await response.json();
    const item = document.createElement('li'); item.textContent = goal.title;
    document.querySelector('#goals').append(item);
    input.value = ''; document.querySelector('#message').textContent = 'Saved';
  } catch { document.querySelector('#message').textContent = 'Could not save. Try again.'; }
  finally { button.disabled = false; }
});
</script>`, 'Serve this HTML from the same origin as the API, or configure a development proxy; cross-origin requests need explicit CORS.', 'A successful save adds a list item and clears the input; a failed save leaves the input in place and shows an error.', 'Add an empty state, keyboard focus styling and a delete control.'),
    program('Node.js 24 and the goal API', [
      'Add the route logic below to your server’s request handler.',
      'Exercise GET, POST and PATCH using curl or an API client.',
      'Send a string for completed and confirm the server rejects it.',
    ], `import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
const goals = new Map(); let nextId = 1;
const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};
createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(readFileSync('index.html'));
  }
  if (req.method === 'GET' && req.url === '/api/goals')
    return send(res, 200, [...goals.values()]);
  let raw = ''; for await (const chunk of req) raw += chunk;
  let body; try { body = JSON.parse(raw); }
  catch { return send(res, 400, { error: 'Invalid JSON' }); }
  if (req.method === 'POST' && req.url === '/api/goals') {
    if (typeof body.title !== 'string' || !body.title.trim())
      return send(res, 422, { error: 'Title required' });
    const goal = { id: nextId++, title: body.title.trim(), completed: false };
    goals.set(goal.id, goal); return send(res, 201, goal);
  }
  const match = /^\\/api\\/goals\\/(\\d+)$/.exec(req.url);
  if (req.method === 'PATCH' && match) {
    if (typeof body.completed !== 'boolean')
      return send(res, 422, { error: 'completed must be Boolean' });
    const goal = goals.get(Number(match[1]));
    if (!goal) return send(res, 404, { error: 'Goal not found' });
    goal.completed = body.completed; return send(res, 200, goal);
  }
  send(res, 404, { error: 'Not found' });
}).listen(3002, () => console.log('http://localhost:3002'));`, 'Save as server.mjs beside index.html, run node server.mjs, and open http://localhost:3002. Then call GET, POST and PATCH from a terminal or API client.', 'Valid create returns 201; valid update changes the in-memory record; malformed completed returns 422; unknown id returns 404. Restarting erases goals until the next database module.', 'Add DELETE and write a four-case test matrix: success, invalid input, missing id and unauthenticated request.'),
    program('SQLite 3 or Node.js 24 with node:sqlite', [
      'Create a disposable goals.sqlite database and run the schema below.',
      'Insert a user and a goal using bound parameters in your application code.',
      'Read goals using the authenticated user id, never an owner id from the browser.',
    ], `PRAGMA foreign_keys = ON;
CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE);
CREATE TABLE goals (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL CHECK(length(trim(title)) > 0),
  completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1))
);
CREATE INDEX goals_owner_idx ON goals(user_id);
INSERT INTO users(email) VALUES ('learner@example.test');
INSERT INTO goals(user_id,title) VALUES (1,'Read one chapter');
SELECT id,title,completed FROM goals WHERE user_id=1;`, 'Run the SQL in sqlite3 goals.sqlite, or with DatabaseSync.exec in a disposable Node script.', 'The SELECT returns one goal. A goal with a nonexistent user id fails when foreign keys are enabled.', 'Write a versioned migration that adds a created_at column without deleting existing goals.'),
    program('Two test user accounts and the goal API', [
      'Create two goals, each owned by a different test user.',
      'Use the server-side authorization check below before PATCH and DELETE.',
      'Try updating the other user’s goal and confirm the database row stays unchanged.',
    ], `function canEditGoal(db, goalId, sessionUserId) {
  const goal = db.prepare('SELECT id,user_id FROM goals WHERE id=?').get(goalId);
  if (!goal) return { status: 404, error: 'Goal not found' };
  if (goal.user_id !== sessionUserId) return { status: 403, error: 'Forbidden' };
  return { status: 200, goal };
}
// Get sessionUserId from a verified server session, not request JSON.
// Use parameterized SQL for the update and a CSRF check for cookie-based writes.`, 'Call canEditGoal before your mutation route. Test owner, another user and missing goal ids.', 'Owner succeeds; another user gets 403; missing goal gets 404. No rejected request changes data.', 'Add tests for missing session, forged owner field and malformed completed value.'),
    program('A staging copy of your app, tests and HTTPS hosting', [
      'Run the automated checks, then create a database backup before migration.',
      'Deploy the new version to staging and run one complete signed-in goal journey.',
      'Check the health URL and logs, and rehearse switching back to the previous release.',
    ], `# Replace these placeholders with your own project commands.
npm test
npm run build
# Back up the database with your database engine's supported backup tool.
# Apply migrations, then start the new release.
curl -i https://your-staging.example/api/health
# Create, list, edit and complete one goal using a test account.`, 'Run each command in staging. Do not copy placeholder URLs into production.', 'Tests and build pass, health returns 200, and the real user journey works. A health response alone does not prove CRUD works.', 'Write a release note with the commit, migration, backup location, smoke-test results and rollback steps.'),
  ],
};

Object.assign(instructionPrograms, {
  'python-basics': [
    program('Python 3 and a terminal', [
      'Save the program as receipt.py in an empty practice folder.',
      'Run it and enter 3 for quantity and 19.95 for price.',
      'Run again with words or a negative number; compare each result.',
    ], `from decimal import Decimal, InvalidOperation

try:
    quantity = int(input('Quantity: ').strip())
    price = Decimal(input('Unit price: ').strip())
    if quantity <= 0 or price < 0:
        raise ValueError('Use a positive quantity and nonnegative price')
    total = price * quantity
    print(f'Total: {total:.2f}')
except (ValueError, InvalidOperation) as error:
    print(f'Invalid entry: {error}')`, 'Run python receipt.py (or py receipt.py on Windows).', 'Quantity 3 and price 19.95 produce Total: 59.85. Invalid text gets a helpful message rather than a traceback.', 'Add a discount percentage and calculate the new total using Decimal.'),
    program('Python 3', [
      'Save the program as classify.py.',
      'Predict the printed classifications before running.',
      'Change the menu input to q and verify the loop exits.',
    ], `numbers = [3, -1, 0, 8]
positive_count = 0
for number in numbers:
    if number > 0:
        label = 'positive'
        positive_count += 1
    elif number < 0:
        label = 'negative'
    else:
        label = 'zero'
    print(number, label)
print('Positive values:', positive_count)

while True:
    choice = input('Enter q to quit: ').strip().lower()
    if choice == 'q':
        break
    print('Try q when you are ready.')`, 'Run python classify.py.', 'The program prints two positive values and exits only when q is entered.', 'Ask for numbers until q, then report positive, negative and zero counts.'),
    program('Python 3', [
      'Save the program as categories.py.',
      'Observe how differently capitalized categories combine.',
      'Try an empty expense list and confirm the result is an empty dictionary.',
    ], `from decimal import Decimal

expenses = [
    {'category': 'Food', 'amount': Decimal('12.50')},
    {'category': ' food ', 'amount': Decimal('7.25')},
    {'category': 'Travel', 'amount': Decimal('5.00')},
]
totals = {}
for expense in expenses:
    key = expense['category'].strip().lower()
    totals[key] = totals.get(key, Decimal('0')) + expense['amount']
for category, amount in sorted(totals.items()):
    print(category, f'{amount:.2f}')`, 'Run python categories.py.', 'Food totals 19.75 and travel totals 5.00. The amounts retain decimal precision.', 'Accept one new expense from input and add it to the grouped totals.'),
    program('Python 3', [
      'Save the functions in expense_math.py.',
      'Create main.py that imports total_by_category and calls it with sample records.',
      'Confirm import does not print anything until main.py calls the function.',
    ], `from decimal import Decimal

def total_by_category(expenses):
    totals = {}
    for expense in expenses:
        category = expense['category'].strip().lower()
        amount = Decimal(str(expense['amount']))
        totals[category] = totals.get(category, Decimal('0')) + amount
    return totals

if __name__ == '__main__':
    sample = [{'category': 'Food', 'amount': '4.50'}]
    print(total_by_category(sample))`, 'Run python expense_math.py, then import it from python -c "import expense_math".', 'Direct execution prints the sample result; importing the module has no side effects.', 'Write a second function that returns the largest category total, including a safe result for an empty list.'),
    program('Python 3 and a writable practice folder', [
      'Save this program as expenses_csv.py.',
      'Run it twice, then inspect expenses.csv with a text editor.',
      'Change a row to contain an invalid amount and handle the resulting error specifically.',
    ], `import csv
from decimal import Decimal, InvalidOperation
from pathlib import Path

file = Path('expenses.csv')
new_file = not file.exists()
with file.open('a', newline='', encoding='utf-8') as handle:
    writer = csv.writer(handle)
    if new_file:
        writer.writerow(['category', 'amount'])
    writer.writerow(['food', '12.50'])

with file.open(newline='', encoding='utf-8') as handle:
    for row in csv.DictReader(handle):
        try:
            print(row['category'], Decimal(row['amount']))
        except (KeyError, InvalidOperation) as error:
            print('Skipped invalid row:', error)`, 'Run python expenses_csv.py twice.', 'The CSV has one header and two data rows. Both rows are read and printed.', 'Add a function that rejects a missing file with a friendly message and writes a backup copy before edits.'),
    program('Python 3 with unittest', [
      'Save the first block as expense_math.py and the second as test_expense_math.py.',
      'Run the test suite and observe each result.',
      'Break the implementation deliberately and confirm a test fails before restoring it.',
    ], `# expense_math.py
from decimal import Decimal
def total(amounts):
    return sum((Decimal(str(value)) for value in amounts), Decimal('0'))

# test_expense_math.py — save this block in a separate file
import unittest
from decimal import Decimal
from expense_math import total
class TotalTests(unittest.TestCase):
    def test_normal(self): self.assertEqual(total(['2.50', '3.25']), Decimal('5.75'))
    def test_empty(self): self.assertEqual(total([]), Decimal('0'))
    def test_invalid(self):
        with self.assertRaises(Exception): total(['oops'])
if __name__ == '__main__': unittest.main()`, 'Create the two files described in the comments, then run python -m unittest -v.', 'Three tests pass. Changing the expected total or implementation makes the matching test fail.', 'Add tests for negative values, CSV persistence and the complete command-line flow.'),
  ],
  'data-visualization': [
    program('Python 3 and a small CSV file', [
      'Create sales.csv with header day,region,amount and rows 1,North,12; 1,South,9; 2,North,15; 2,South,11 (put each row on its own line).',
      'Save the program below as inspect.py and run it.',
      'Define the question you want to answer before choosing a chart.',
    ], `import csv
from pathlib import Path

with Path('sales.csv').open(newline='', encoding='utf-8') as handle:
    rows = list(csv.DictReader(handle))
print('Rows:', len(rows))
print('Fields:', list(rows[0]) if rows else [])
amounts = [float(row['amount']) for row in rows if row['amount'].strip()]
print('Total:', sum(amounts))
print('Missing amounts:', len(rows) - len(amounts))`, 'Run python inspect.py in the same folder as sales.csv.', 'You see row count, fields, total amount and missing-value count. The sample does not validate every malformed number yet.', 'State a measurable question such as “Which region has the highest total?” and document the unit and source.'),
    program('Python 3 and sales.csv', [
      'Keep a copy of the raw file before cleaning.',
      'Run this script to normalize region labels and skip invalid amounts.',
      'Inspect both cleaned.csv and the printed count of skipped rows.',
    ], `import csv
from decimal import Decimal, InvalidOperation

cleaned, rejected = [], []
with open('sales.csv', newline='', encoding='utf-8') as source:
    for row in csv.DictReader(source):
        try:
            amount = Decimal(row['amount'].strip())
            if amount < 0: raise ValueError('negative amount')
            cleaned.append({'day': row['day'].strip(), 'region': row['region'].strip().title(), 'amount': str(amount)})
        except (InvalidOperation, ValueError, KeyError): rejected.append(row)
with open('cleaned.csv', 'w', newline='', encoding='utf-8') as target:
    writer = csv.DictWriter(target, fieldnames=['day','region','amount'])
    writer.writeheader(); writer.writerows(cleaned)
print('Kept:', len(cleaned), 'Rejected:', len(rejected))`, 'Run python clean.py after saving the program as clean.py.', 'The output file has normalized region names and valid nonnegative amounts; rejected rows are counted.', 'Write rejected rows to a separate review.csv and explain whether skipping them could bias your conclusion.'),
    program('Python 3 with matplotlib installed', [
      'Install matplotlib into a virtual environment, then save the code as charts.py.',
      'Run the program and compare what each chart makes easy to see.',
      'Do not use a line chart for unrelated categories.',
    ], `import matplotlib.pyplot as plt

regions = ['North', 'South', 'West']
totals = [45, 32, 28]
days = [1, 2, 3, 4]
daily = [9, 12, 8, 16]
fig, axes = plt.subplots(1, 2, figsize=(9, 4))
axes[0].bar(regions, totals)
axes[0].set(title='Sales by region', ylabel='Amount (sample units)')
axes[1].plot(days, daily, marker='o')
axes[1].set(title='Daily sales trend', xlabel='Day', ylabel='Amount')
fig.tight_layout()
fig.savefig('charts.png', dpi=150)`, 'Run python -m venv .venv; activate it; run python -m pip install matplotlib; then python charts.py.', 'charts.png contains a category comparison and a time trend with labeled axes.', 'Make a histogram of individual sale amounts and explain how it differs from the bar chart.'),
    program('Python 3 with matplotlib and cleaned.csv', [
      'Save this as region_chart.py.',
      'Aggregate amounts by region before plotting.',
      'Rerun after adding a row to cleaned.csv and confirm the chart updates.',
    ], `import csv
from collections import defaultdict
from decimal import Decimal
import matplotlib.pyplot as plt

totals = defaultdict(lambda: Decimal('0'))
with open('cleaned.csv', newline='', encoding='utf-8') as handle:
    for row in csv.DictReader(handle):
        totals[row['region']] += Decimal(row['amount'])
labels = sorted(totals)
values = [float(totals[label]) for label in labels]
fig, ax = plt.subplots()
ax.bar(labels, values)
ax.set(xlabel='Region', ylabel='Sales amount', title='Total sales by region')
fig.tight_layout(); fig.savefig('region-chart.png', dpi=150)`, 'Run python region_chart.py with cleaned.csv in the same folder.', 'region-chart.png uses totals computed from data, not hard-coded values. Regions appear in stable order.', 'Add a percentage share label to each bar and record whether a zero-total region is meaningful.'),
    program('Python 3 with matplotlib', [
      'Save the code as accessible_chart.py and run it.',
      'Inspect the grayscale version and read the accompanying text summary.',
      'Check that the title, units and category labels explain the chart without relying on color.',
    ], `import matplotlib.pyplot as plt

labels = ['North', 'South', 'West']
values = [45, 32, 28]
fig, ax = plt.subplots(figsize=(6, 4))
bars = ax.bar(labels, values, color=['#2c5f85', '#527f9c', '#7ba0b6'])
ax.bar_label(bars, padding=3)
ax.set(title='Example sales by region', ylabel='Sales (sample units)')
ax.set_ylim(0, max(values) * 1.2)
fig.tight_layout(); fig.savefig('accessible-chart.png', dpi=150)
print('North leads at 45 sample units; West is lowest at 28.')`, 'Run python accessible_chart.py.', 'Each bar has a numeric label; the y axis starts at zero; the printed summary states the main comparison.', 'Write alternative text that includes the highest and lowest categories and the unit of measure.'),
    program('Python 3, cleaned.csv and a text editor', [
      'Generate the chart from cleaned.csv, then write a short method note.',
      'Calculate both totals and row counts so a small group is not hidden by a large sum.',
      'Save the report with chart, source, cleaning rules and limitations.',
    ], `import csv
from collections import Counter, defaultdict
from decimal import Decimal

counts = Counter(); totals = defaultdict(lambda: Decimal('0'))
with open('cleaned.csv', newline='', encoding='utf-8') as handle:
    for row in csv.DictReader(handle):
        counts[row['region']] += 1
        totals[row['region']] += Decimal(row['amount'])
for region in sorted(totals):
    print(f'{region}: {counts[region]} rows, total {totals[region]:.2f}')
print('Method: invalid or negative amounts were excluded before aggregation.')`, 'Run python report.py; attach the chart produced in the previous module to a written report.', 'Each region has a count and total. The method discloses exclusions; the report does not claim causation from correlation.', 'Write a one-page report with the question, source, chart, finding, uncertainty and reproducible commands.'),
  ],
});

Object.assign(instructionPrograms, {
  'git-basics': [
    program('Git and a terminal; use a new disposable folder', [
      'Create a folder named git-practice and open a terminal inside it. Check git --version.',
      'Run each command below separately. If Git asks for identity, set user.name and user.email for this practice repository only.',
      'Before each commit, inspect git status and git diff --staged. Compare the first and second commit in git log.',
    ], `git init
git config user.name "Practice Learner"
git config user.email "learner@example.test"
git status
# Create README.md in your editor with the text: My practice repository
git add README.md
git diff --staged
git commit -m "Add project introduction"
# Add a second line to README.md: I am learning Git.
git status
git diff
git add README.md
git diff --staged
git commit -m "Explain learning goal"
git log --oneline -2`, 'Run the commands one at a time in the new folder. Lines beginning with # are directions, not Git commands.', 'git log shows two commits. git status reports a clean working tree after the second commit. git diff --staged showed exactly the changes committed.', 'Create a third file, stage only that file, and explain why an unrelated changed file remains outside the commit.'),
    program('The disposable git-practice repository from module 1', [
      'Create a build folder with a generated file and add build/ to .gitignore.',
      'Make a focused commit, then inspect it with git show HEAD.',
      'Confirm the generated file is ignored but README.md is still tracked.',
    ], `# Create build/output.txt in your editor.
# Create .gitignore containing one line: build/
git status --short
git check-ignore -v build/output.txt
git add .gitignore
git diff --staged
git commit -m "Ignore generated build output"
git show --stat HEAD
git show HEAD
git status --short`, 'Run in git-practice after the first module. Create the two files as directed in comments.', 'git check-ignore names .gitignore as the matching rule. git show displays the focused commit; build/output.txt is absent from status.', 'Write an ignore rule for a temporary log directory, then explain why .gitignore cannot remove a secret from old commits.'),
    program('A disposable repository with a committed README.md', [
      'Commit a baseline README on main, then create a feature branch.',
      'Change the same README line differently on main and the feature branch.',
      'Merge the feature branch into main. Open README.md, resolve the conflict markers, stage and finish the merge.',
    ], `git branch -M main
git switch -c feature/readme
# Edit the first README line to: Practice repository for collaborative learning
git add README.md
git commit -m "Describe collaborative practice"
git switch main
# Edit that same line to: Practice repository for Git beginners
git add README.md
git commit -m "Clarify beginner audience"
git merge feature/readme
# Resolve the conflict in README.md with one sentence that keeps both ideas.
git add README.md
git commit
git status
git log --oneline --graph -5`, 'Run commands individually. The merge intentionally pauses for manual conflict resolution.', 'Before resolution, README.md contains conflict markers. After the final commit, it contains one coherent sentence and git status is clean.', 'Create a second feature branch that changes a different file and compare a conflict-free merge.'),
    program('A Git hosting account and your own harmless practice repository', [
      'Create an empty remote repository in your account; copy its HTTPS URL.',
      'Connect your local practice repository and push a feature branch.',
      'Open a pull request in the hosting site, add summary and test evidence, and inspect the diff.',
    ], `git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-PRACTICE-REPO.git
git remote -v
git fetch origin
git switch -c feature/notes
# Make a small edit to README.md.
git add README.md
git commit -m "Add practice notes"
git push -u origin feature/notes
git log --oneline origin/main..HEAD`, 'Replace the example remote with your own repository URL. Authenticate through your Git hosting provider; do not paste tokens into commands or the course.', 'The remote lists correctly, the feature branch appears online, and the pull request diff contains only your intended edit.', 'Address one review comment with another commit and confirm the same pull request updates.'),
    program('The disposable git-practice repository', [
      'Make and commit a harmless change on a practice branch.',
      'Revert that commit and inspect history: the original and inverse commits both remain.',
      'Create an unstaged edit, inspect its diff, then use restore only if the edit is disposable.',
    ], `git switch -c practice/undo
# Append a temporary sentence to README.md.
git add README.md
git commit -m "Add temporary sentence"
git log -1 --oneline
git revert HEAD
git log --oneline -3
# Append another disposable sentence to README.md without staging it.
git diff README.md
git restore README.md
git status --short`, 'Run each command in the disposable repository. Do not use git restore on work you want to keep.', 'git revert adds a new commit that reverses the first change. git restore removes only the later unstaged edit.', 'Explain which command you would use for an already-pushed mistake on a shared branch, and why.'),
    program('A clean disposable repository with at least one commit', [
      'Confirm the working tree is clean and run any project tests.',
      'Create an annotated tag at the tested commit.',
      'Inspect the tag target and write down the previous known-good commit for rollback.',
    ], `git status --short
git log -1 --oneline
git tag -a v0.1.0 -m "First practice release"
git show --no-patch v0.1.0
git tag --list
# If your practice remote is connected, publish the tag:
git push origin v0.1.0`, 'Run in the disposable repository. If v0.1.0 already exists, use a new version rather than moving a shared tag.', 'git show identifies the tagged commit. The tag is visible remotely only after git push origin v0.1.0.', 'Write a release checklist with tests, deployed commit, health check and rollback verification.'),
  ],
  'relational-databases': [
    program('SQLite 3 CLI or a SQLite editor', [
      'Create a new disposable database named library.sqlite and enable foreign keys.',
      'Run the schema and sample inserts below.',
      'Inspect table structures and count the loans for each member.',
    ], `PRAGMA foreign_keys = ON;
CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL);
CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  book_id INTEGER NOT NULL REFERENCES books(id),
  loaned_at TEXT NOT NULL,
  returned_at TEXT
);
INSERT INTO members(name) VALUES ('Asha'), ('Ravi');
INSERT INTO books(title) VALUES ('Web Basics'), ('SQL Basics');
INSERT INTO loans(member_id,book_id,loaned_at) VALUES (1,2,'2026-01-01');
SELECT m.name,b.title FROM loans l JOIN members m ON m.id=l.member_id JOIN books b ON b.id=l.book_id;`, 'Run sqlite3 library.sqlite, paste the SQL, then use .tables and .schema inside the SQLite CLI.', 'The final query shows Asha and SQL Basics. A loan referencing a nonexistent member fails when foreign keys are on.', 'Draw the member → loan ← book relationship and add a second loan with a valid foreign key.'),
    program('The disposable library.sqlite database', [
      'Enable foreign keys each time you open a new SQLite connection.',
      'Add a unique ISBN and a return-date rule; use a fresh practice database if ALTER TABLE cannot express your change.',
      'Try invalid inserts and record the constraint errors.',
    ], `PRAGMA foreign_keys = ON;
CREATE TABLE editions (
  id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id),
  isbn TEXT NOT NULL UNIQUE,
  published_year INTEGER CHECK(published_year BETWEEN 1450 AND 2100)
);
INSERT INTO editions(book_id,isbn,published_year) VALUES (1,'9780000000001',2024);
-- This duplicate should fail:
INSERT INTO editions(book_id,isbn,published_year) VALUES (1,'9780000000001',2025);
-- This unknown book should fail:
INSERT INTO editions(book_id,isbn,published_year) VALUES (999,'9780000000002',2025);`, 'Paste into sqlite3 library.sqlite one statement at a time; expected errors should not stop the entire exercise.', 'One edition is stored; the duplicate ISBN and invalid foreign key are rejected.', 'Add a CHECK that prevents an empty ISBN, then explain why book title belongs in books rather than every loan.'),
    program('The disposable library.sqlite database', [
      'Run each query separately and inspect the rows it affects.',
      'Before UPDATE or DELETE, run a SELECT with the same WHERE clause.',
      'Use bound parameters in application code; do not build SQL by joining user strings.',
    ], `SELECT id,title FROM books ORDER BY title LIMIT 20;
SELECT id,title FROM books WHERE title LIKE '%SQL%' ORDER BY title;
INSERT INTO books(title) VALUES ('Data Visualization');
SELECT id,title FROM books WHERE title = 'Data Visualization';
UPDATE books SET title = 'Data Visualization Basics' WHERE title = 'Data Visualization';
SELECT id,title FROM books WHERE title = 'Data Visualization Basics';
DELETE FROM books WHERE title = 'Data Visualization Basics';`, 'Run in sqlite3 library.sqlite; use .changes on the CLI to inspect mutation counts.', 'The inserted book changes title once and is then removed; existing books remain.', 'Write a Node or Python query that takes a search term and binds it as a parameter.'),
    program('The disposable library.sqlite database', [
      'Insert at least one member without loans.',
      'Run the LEFT JOIN report and confirm that member appears with zero active loans.',
      'Run the detail report and compare its rows with the aggregate.',
    ], `SELECT m.name, COUNT(l.id) AS active_loans
FROM members AS m
LEFT JOIN loans AS l ON l.member_id=m.id AND l.returned_at IS NULL
GROUP BY m.id,m.name
ORDER BY m.name;

SELECT m.name,b.title,l.loaned_at
FROM loans AS l
JOIN members AS m ON m.id=l.member_id
JOIN books AS b ON b.id=l.book_id
WHERE l.returned_at IS NULL
ORDER BY l.loaned_at;`, 'Run each SELECT in sqlite3 library.sqlite.', 'The first report includes zero-loan members; the second shows only actual active loans.', 'Write a query for books never loaned using LEFT JOIN or NOT EXISTS, then verify it against sample rows.'),
    program('The disposable library.sqlite database', [
      'Inspect the query plan before creating an index.',
      'Add an index for the member lookup and inspect the plan again.',
      'Record whether your tiny practice table is large enough to show a measured speed benefit.',
    ], `EXPLAIN QUERY PLAN SELECT id,book_id FROM loans WHERE member_id=1;
CREATE INDEX loans_member_idx ON loans(member_id);
EXPLAIN QUERY PLAN SELECT id,book_id FROM loans WHERE member_id=1;
SELECT id,book_id FROM loans WHERE member_id=1 LIMIT 20;`, 'Run each statement in sqlite3 library.sqlite.', 'The plan can use loans_member_idx after it exists. With only a few rows, elapsed time may be indistinguishable; the plan is the teaching evidence.', 'Add more sample loans in a disposable copy, compare query time and explain the index’s write/storage cost.'),
    program('A disposable copy of library.sqlite', [
      'Back up the original practice database before testing a transaction.',
      'Run one transaction that inserts a loan, then a second that rolls back.',
      'Check counts after each and restore a backup into a separate file.',
    ], `PRAGMA foreign_keys = ON;
BEGIN IMMEDIATE;
INSERT INTO loans(member_id,book_id,loaned_at) VALUES (2,1,'2026-02-01');
COMMIT;
SELECT COUNT(*) FROM loans;

BEGIN IMMEDIATE;
INSERT INTO loans(member_id,book_id,loaned_at) VALUES (2,2,'2026-02-02');
ROLLBACK;
SELECT COUNT(*) FROM loans;
-- In the sqlite3 CLI: .backup library-backup.sqlite
-- Restore into another file and inspect it; do not overwrite your live practice file.`, 'Run one SQL statement at a time in sqlite3 library.sqlite. Use .backup library-backup.sqlite in the CLI.', 'The committed loan increases the count; the rolled-back loan does not. The backup opens as a separate database.', 'Implement a transaction that first checks a book is available, inserts a loan only when allowed, and records an error otherwise.'),
  ],
});
