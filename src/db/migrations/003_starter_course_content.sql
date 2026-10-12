UPDATE courses
SET subtitle='Start building accessible web pages with two focused lessons.',
    description='Learn how the web delivers pages, then use semantic HTML to give your content a clear structure that works for people and assistive technology.',
    metadata_json='{"whatYouWillLearn":["Explain how a browser requests and displays a web page","Choose semantic HTML elements for common page sections"],"requirements":["A web browser and a text editor"]}'
WHERE id='course-free-foundations'
  AND subtitle='A short no-payment course for learning and backend flow testing.';

UPDATE lessons
SET description='A browser asks a server for a page using an HTTP request. The server responds with HTML, which the browser turns into the document structure you see on screen. CSS controls its presentation, and JavaScript can update it in response to interaction. Try opening your browser''s developer tools and inspecting the elements of a familiar page.'
WHERE id='lesson-free-1' AND description='Complete the lesson to practice the backend progress flow.';

UPDATE lessons
SET description='Semantic HTML describes the purpose of content. Use a main element for primary content, nav for navigation, headings in order, and buttons for actions. A clear structure helps keyboard users and screen readers. Practice by outlining a simple article with a header, main section, headings, and footer.'
WHERE id='lesson-free-2' AND description='Complete the lesson to practice the backend progress flow.';
