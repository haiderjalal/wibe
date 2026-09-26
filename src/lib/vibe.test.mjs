// Vibe interview scoring checks. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { QUESTIONS, scoreVibe, validateAnswers, MAX_TAGS } from "./vibe.ts";

const base = {
  energy: ["late"],
  pair_sip: ["live"],
  pair_time: ["night"],
  pair_food: ["street"],
  pair_make: ["games"],
  social: ["crowd"],
  intents: ["friends"],
  topics: ["music"],
  avoid: [],
};

test("valid answers pass and malformed ones are rejected", () => {
  assert.equal(validateAnswers(base), null);
  assert.match(validateAnswers({ ...base, energy: [] }), /Pick one/);
  assert.match(validateAnswers({ ...base, energy: ["cozy", "late"] }), /Pick one/);
  assert.match(validateAnswers({ ...base, topics: ["music", "tech", "art", "books"] }), /Pick between/);
  assert.match(validateAnswers({ ...base, intents: ["dating"] }), /Unknown answer/);
  assert.match(validateAnswers({ ...base, orientation: ["x"] }), /Unknown question/);
});

test("late-night answers make a Night Owl", () => {
  assert.equal(scoreVibe(base).archetype, "night_owl");
});

test("networking intent makes a Connector and leads the tags", () => {
  const r = scoreVibe({ ...base, energy: ["balanced"], pair_time: ["sunrise"], intents: ["networking"], topics: ["tech"] });
  assert.equal(r.archetype, "connector");
  assert.equal(r.tags[0], "Networking");
});

test("tags only reflect explicit picks and are capped", () => {
  const r = scoreVibe(base);
  assert.ok(r.tags.length <= MAX_TAGS);
  assert.ok(r.tags.includes("Late nights") && r.tags.includes("New friends"));
  assert.deepEqual(r.intents, ["friends"]);
  assert.ok(r.interests.includes("live_music") && r.interests.includes("street_food"));
});

test("no question asks about identity or orientation", () => {
  const text = JSON.stringify(QUESTIONS).toLowerCase();
  for (const word of ["gay", "straight", "bisexual", "orientation", "gender", "religion", "sexual"]) assert.ok(!text.includes(word), word);
});
