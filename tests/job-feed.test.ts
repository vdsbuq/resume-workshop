import test from 'node:test';import assert from 'node:assert/strict';import {parseJobFeed,usableJob} from '../lib/job-feed';import feed from '../data/jobs.json';
test('feed validates real sources and closed jobs excluded',()=>{assert.ok(parseJobFeed(feed).jobs.length>=15);assert.equal(usableJob({...feed.jobs[0],availability:'closed'}),false);});
test('feed rejects invalid URL and duplicate IDs',()=>{assert.throws(()=>parseJobFeed({...feed,jobs:[{...feed.jobs[0],url:'javascript:alert(1)'}]}));assert.throws(()=>parseJobFeed({...feed,jobs:[feed.jobs[0],feed.jobs[0]]}));});
