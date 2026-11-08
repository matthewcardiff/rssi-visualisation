import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../public/vh26-reporting.js', import.meta.url), 'utf8');

test('admin Presenter showcase has five clearly labelled examples for all eleven departments', () => {
  const fixtureBlock = source.match(/const presenterShowcaseExamples = \{([\s\S]*?)\n  \};/);
  assert.ok(fixtureBlock, 'showcase fixtures are present');
  for (const department of ['Managed Environments', 'Civils', 'Rail Operations', 'S&T', 'Welding', 'MMA', 'HS2', 'Montel', 'TWS', 'HSQE', 'Bids/RFQs']) {
    const escaped = department.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const entry = fixtureBlock[1].match(new RegExp("['\\\"]" + escaped + "['\\\"]\\s*:\\s*\\{([^}]+)\\}"));
    assert.ok(entry, `${department} has a showcase fixture`);
    for (const section of ['Pipeline', 'Delivery', 'Programme', 'Risks', 'Resources']) {
      assert.match(entry[1], new RegExp(section + ":\\s*'[^']+'"), `${department} ${section} has an illustrative example`);
    }
  }
});

test('showcase toggle is role gated, clearly labelled, and changes Presenter cards only', () => {
  assert.ok(source.includes("['administrator','meeting_host','executive']"), 'the toggle is restricted to host and administrator roles');
  assert.match(source, /Show illustrative examples/);
  assert.match(source, /Hide illustrative examples/);
  assert.match(source, /SHOWCASE DATA · fictional examples · no live report changes/);
  assert.match(source, /ILLUSTRATIVE EXAMPLE · /);
  assert.match(source, /presenterShowcaseOriginals/);
  const apply = source.slice(source.indexOf('function applyPresenterShowcase'), source.indexOf('function suppressSyntheticPresenterCards'));
  assert.doesNotMatch(apply, /presenterApi\(/, 'showcase mode must not send report writes');
});
