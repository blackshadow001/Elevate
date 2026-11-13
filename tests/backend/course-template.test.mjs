import test from 'node:test';
import assert from 'node:assert/strict';
import { COURSE_IMPORT_EXAMPLE, parseCourseImportTemplate } from '../../src/lib/courseImportTemplate.ts';

const categories = [{ name: 'Technology & Programming', subcategories: ['APIs & Data'] }];
const template = () => structuredClone(COURSE_IMPORT_EXAMPLE);

test('accepts a completed course template with a video and fill-in-the-blank question', () => {
  const result = parseCourseImportTemplate(template(), categories);
  assert.equal(result.price, 29);
  assert.equal(result.sections[0].lessons[0].videoPath, 'videos/introduction.mp4');
  assert.equal(result.sections[0].lessons[1].activity.questions[0].answer, 'answer');
});

test('rejects paths outside the tutor-selected media folder', () => {
  for (const path of ['../outside.mp4', 'C:\\Users\\Tutor\\video.mp4', '/tmp/video.mp4', 'https://example.com/video.mp4']) {
    const value = template();
    value.sections[0].lessons[0].videoPath = path;
    assert.throws(() => parseCourseImportTemplate(value, categories), /relative file path/);
  }
});

test('rejects incomplete questions and categories that are no longer available', () => {
  const noAnswer = template();
  noAnswer.sections[0].lessons[1].activity.questions[0].answer = '';
  assert.throws(() => parseCourseImportTemplate(noAnswer, categories), /answer/);
  const changedCategory = template();
  changedCategory.category = 'Unlisted Category';
  assert.throws(() => parseCourseImportTemplate(changedCategory, categories), /current category/);
});
