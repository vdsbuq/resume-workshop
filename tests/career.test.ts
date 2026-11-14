import test from 'node:test';
import assert from 'node:assert/strict';
import {requirementEvidence,skillRules} from '../lib/career';
test('SQL matches independent skill, not NoSQL',()=>{const sql=skillRules[0].pattern;assert.equal(sql.test('NoSQL'),false);assert.deepEqual(requirementEvidence('掌握SQL\n有项目经验',sql),['掌握SQL']);});
test('evidence excludes unrelated sentences',()=>{assert.deepEqual(requirementEvidence('会Excel。具备沟通能力',skillRules[1].pattern),['会Excel']);});
