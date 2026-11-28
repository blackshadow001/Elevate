// Short, original first steps for the six built-in paths. Existing step IDs stay stable.
const lesson = (title, body, kind = 'reading', expected = '', practice = null, block = 'first_idea', choices = []) =>
  ({ title, body, kind, expected: block === 'first_build' ? practice.code : expected, practice: { ...(practice || {}), ...(choices.length ? { choices } : {}) }, block });

export const beginnerIntroductions = {
  'web-development': [
    lesson('Welcome: make a page people can see', 'A website can begin as one file. Your browser reads the file and displays its words. In this path you will make a small page, change its appearance, and later add buttons that respond to people.'),
    lesson('Your first line of HTML', 'HTML gives content a role. Tap the pieces in order to make a main heading. Then look at the live page preview.', 'fill_blank', '', { code: '<h1>Hello, world!</h1>', tokens: ['<h1>', 'Hello, world!', '</h1>'], run: 'Tap the opening tag, the words, then the closing tag.', expect: 'The page shows a large heading: Hello, world!' }, 'first_build'),
    lesson('Spot the heading', 'In <h1>Hello, world!</h1>, which tag makes the words a main heading?', 'fill_blank', 'h1', null, 'first_check', ['h1', 'p', 'a']),
    lesson('Change one thing', 'Replace “Hello, world!” with your name inside the h1 tag, then refresh the page. What changed on the page?', 'fill_blank', 'heading', { code: '<h1>Your name</h1>', run: 'Edit the text between the tags, save, and refresh.', expect: 'Your own words appear as the page heading.' }, 'first_check', ['heading', 'file name', 'browser address']),
  ],
  'full-stack-development': [
    lesson('Welcome: follow one piece of information', 'A full stack app has a screen people use and a server that handles requests. Later, a database remembers information. First, follow a tiny message from the screen to the server and back.'),
    lesson('A tiny request and response', 'Imagine a learner clicks “Save goal.” Tap the two lines in order to show a request going out and a response coming back.', 'fill_blank', '', { code: 'Browser → POST /goals → Server\nBrowser ← { "saved": true } ← Server', tokens: ['Browser → POST /goals → Server', '\nBrowser ← { "saved": true } ← Server'], run: 'Tap the outgoing request, then the incoming response.', expect: 'The browser sends the request; the server returns a response.' }, 'first_build'),
    lesson('Who sends the request?', 'A learner clicks a button. Which part sends the request?', 'fill_blank', 'browser', null, 'first_check', ['browser', 'server', 'database']),
    lesson('Read the reply', 'A server returns { "saved": true }. Which value tells the screen the action succeeded?', 'fill_blank', 'true', { code: '{ "saved": true }', run: 'Look at the value after saved.', expect: 'The value is true.' }, 'first_check', ['true', 'false', 'saved']),
  ],
  'python-basics': [
    lesson('Welcome: tell a computer one small thing', 'Python is a language for giving a computer instructions. You will start by displaying a message, then store values and make decisions. You do not need to know programming words before this first step.'),
    lesson('Print a message', 'The print function displays text. Tap the pieces to make one Python line. The quotation marks tell Python that Hello is text.', 'fill_blank', '', { code: 'print("Hello")', tokens: ['print(', '"Hello"', ')'], run: 'After building the line, save it as hello.py and run python hello.py.', expect: 'The terminal displays Hello without quotation marks.' }, 'first_build'),
    lesson('Find the displayed word', 'What word appears when you run print("Hello")?', 'fill_blank', 'Hello', null, 'first_check', ['Hello', 'print', 'python']),
    lesson('Make it yours', 'Replace Hello with your name inside the quotation marks and run the file again. Which function displayed the text?', 'fill_blank', 'print', { code: 'print("Your name")', run: 'Change the text, save the file, and run python hello.py again.', expect: 'The terminal displays the name you typed.' }, 'first_check', ['print', 'input', 'text']),
  ],
  'data-visualization': [
    lesson('Welcome: turn numbers into an answer', 'A chart helps someone compare values. Before drawing one, ask a small question about the data. You will start with just two numbers, then learn how to clean larger datasets.'),
    lesson('Read a tiny table', 'A chart begins with data. Tap the heading and the two rows to build a tiny table, then compare the numbers.', 'fill_blank', '', { code: 'Day       Notebooks sold\nMonday    3\nTuesday   5', tokens: ['Day       Notebooks sold', '\nMonday    3', '\nTuesday   5'], run: 'Tap the heading first, then Monday and Tuesday.', expect: 'Tuesday has the larger count: 5.' }, 'first_build'),
    lesson('Make the comparison', 'Which day sold more notebooks?', 'fill_blank', 'Tuesday', null, 'first_check', ['Tuesday', 'Monday', 'The same']),
    lesson('Name what we measure', 'In this table, the day identifies a group and the number counts what?', 'fill_blank', 'notebooks', null, 'first_check', ['notebooks', 'days', 'shops']),
  ],
  'git-basics': [
    lesson('Welcome: save the history of your work', 'Git helps you keep checkpoints of a project on your computer. You can see what changed and return to an earlier checkpoint. GitHub is an online place to share a Git project; you do not need it for your first exercise.'),
    lesson('See what changed', 'After you edit a file, Git can tell you what changed. Tap the pieces to build the command that reports the current state. It does not publish anything.', 'fill_blank', '', { code: 'git status', tokens: ['git', ' status'], run: 'Inside a practice repository, run git status in a terminal.', expect: 'Git reports the current branch and any changed or untracked files.' }, 'first_build'),
    lesson('Name the local tool', 'Which tool tracks project history on your own computer?', 'fill_blank', 'Git', null, 'first_check', ['Git', 'GitHub', 'browser']),
    lesson('Check before saving', 'You changed one file. Which command lists changed files before a checkpoint?', 'fill_blank', 'git status', { code: 'git status', run: 'Run the command after changing a file.', expect: 'The changed file appears in the status report.' }, 'first_check', ['git status', 'git push', 'git delete']),
  ],
  'relational-databases': [
    lesson('Welcome: organize information in tables', 'A database stores information so an app can find it later. A relational database groups related facts into tables. Begin with one tiny table before learning SQL and joins.'),
    lesson('Look at two rows', 'A table has columns for kinds of facts and rows for individual records. Tap the pieces in order to make a small people table.', 'fill_blank', '', { code: 'name    age\nAsha    20\nRavi    22', tokens: ['name    age', '\nAsha    20', '\nRavi    22'], run: 'Tap the column names, then each person’s row.', expect: 'Asha is 20 years old.' }, 'first_build'),
    lesson('Find one value', 'What age is recorded for Ravi?', 'fill_blank', '22', null, 'first_check', ['22', '20', '2']),
    lesson('Name the structure', 'Name and age are columns. What is one full record, such as “Asha 20,” called?', 'fill_blank', 'row', null, 'first_check', ['row', 'column', 'chart']),
  ],
};
