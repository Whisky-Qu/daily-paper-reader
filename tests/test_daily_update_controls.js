const assert = require('node:assert/strict');

global.document = { readyState: 'loading', addEventListener() {}, querySelectorAll() { return []; } };
global.window = {};
require('../app/subscriptions.manager.js');
const manager = window.SubscriptionsManager.__test;
const base = mode => ({
  daily_update: { mode },
  subscriptions: { intent_profiles: [] },
});

(async () => {
  assert.equal(manager.getUpdateMode({}), 'auto');
  assert.throws(() => manager.getUpdateMode({ daily_update: { mode: 'invalid' } }));
  manager.__setDraftConfig(base('auto'));
  manager.selectUpdateMode('manual');
  assert.deepEqual(manager.__getUpdateModeState(), { saved: 'auto', draft: 'manual', dirty: true });

  window.SubscriptionsGithubToken = {
    saveConfig() {},
    async updateConfig() { throw new Error('network unavailable'); },
  };
  const originalError = console.error;
  console.error = () => {};
  try { await manager.saveDraftConfig(); } finally { console.error = originalError; }
  assert.deepEqual(manager.__getUpdateModeState(), { saved: 'auto', draft: 'manual', dirty: true }, 'failed save must not claim manual is active');

  const latest = { ...base('auto'), custom: 'preserved' };
  let written;
  window.SubscriptionsGithubToken.updateConfig = async updater => { written = updater(latest); };
  await manager.saveDraftConfig();
  assert.equal(written.daily_update.mode, 'manual');
  assert.equal(written.custom, 'preserved', 'mode-only save must preserve newer cloud configuration');
  assert.deepEqual(manager.__getUpdateModeState(), { saved: 'manual', draft: 'manual', dirty: false });

  // Another device changed the mode while this tab only edited subscriptions.
  manager.__setDraftConfig(base('auto'));
  window.SubscriptionsManager.markConfigDirty();
  window.SubscriptionsGithubToken.updateConfig = async updater => { written = updater(base('manual')); };
  await manager.saveDraftConfig();
  assert.equal(written.daily_update.mode, 'manual', 'ordinary saves must retain the newest cloud mode');

  let calls = 0;
  let finish;
  window.DPRWorkflowRunner = { runQuickFetchByDays() { calls++; return new Promise(resolve => { finish = resolve; }); } };
  const first = manager.runQuickFetch(10, null);
  const duplicate = await manager.runQuickFetch(10, null);
  assert.equal(duplicate, false);
  assert.equal(calls, 1, 'double click must not dispatch twice');
  finish(true);
  assert.equal(await first, true);
  console.log('daily update control tests passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
