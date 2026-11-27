CREATE TABLE guided_paths (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','review','published','archived')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX guided_paths_status_idx ON guided_paths(status,updated_at DESC);
CREATE INDEX guided_paths_owner_idx ON guided_paths(owner_id,status);

CREATE TABLE guided_steps (
  id TEXT PRIMARY KEY,
  path_id TEXT NOT NULL REFERENCES guided_paths(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('reading','fill_blank','code','project')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  starter_code TEXT NOT NULL DEFAULT '',
  answer_json TEXT NOT NULL DEFAULT '{}',
  UNIQUE(path_id,position)
);
CREATE INDEX guided_steps_path_idx ON guided_steps(path_id,position);

CREATE TABLE guided_step_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL REFERENCES guided_steps(id) ON DELETE CASCADE,
  response TEXT NOT NULL DEFAULT '',
  passed INTEGER NOT NULL DEFAULT 0 CHECK(passed IN (0,1)),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY(user_id,step_id)
);
CREATE TABLE guided_path_completions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  path_id TEXT NOT NULL REFERENCES guided_paths(id) ON DELETE CASCADE,
  issued_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(user_id,path_id)
);

INSERT INTO guided_paths(id,slug,title,summary,status) VALUES
('web-foundations-v1','web-development-foundations','Web Development Foundations','Learn HTML and CSS through short steps, instant checks, and a small final project.','published');
INSERT INTO guided_steps(id,path_id,position,kind,title,body,starter_code,answer_json) VALUES
('web-foundations-01','web-foundations-v1',1,'reading','How a web page is built','HTML describes the content of a page. A heading uses <h1>, a paragraph uses <p>, and a link uses <a>. Put visible content inside <body>.','','{}'),
('web-foundations-02','web-foundations-v1',2,'fill_blank','Name the visible page container','Fill the blank: Visible HTML content belongs inside the ____ element.','','{"expected":"body"}'),
('web-foundations-03','web-foundations-v1',3,'code','Make your first page','Write HTML with a heading and a paragraph. Write your own words inside both elements.','<h1>Your heading</h1>','{"requiredTags":["h1","p"]}'),
('web-foundations-04','web-foundations-v1',4,'reading','Add a little style','CSS controls how HTML looks. A rule such as h1 { color: orange; } gives a heading a new color. Place CSS inside a <style> element while you practise.','','{}'),
('web-foundations-05','web-foundations-v1',5,'fill_blank','Choose the CSS property','Fill the blank: The CSS property that changes text colour is ____.','','{"expected":"color"}'),
('web-foundations-06','web-foundations-v1',6,'project','Build a personal introduction','Create a small introduction page. Include a <main> area, a heading, a paragraph, a link, and a <style> block. Make the text your own.','<main>\n  <!-- Build your page here -->\n</main>','{"requiredTags":["style","main","h1","p","a"]}');
