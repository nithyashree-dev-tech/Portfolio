const test = require('node:test');
const assert = require('node:assert/strict');

const models = require('../models');

test('portfolio models are exported', () => {
  assert.ok(models.Admin);
  assert.ok(models.Project);
  assert.ok(models.Certification);
  assert.ok(models.Skill);
  assert.ok(models.Experience);
  assert.ok(models.Achievement);
  assert.ok(models.Message);
  assert.ok(models.Profile);
});
