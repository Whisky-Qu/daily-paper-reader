import importlib.util
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

import yaml

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("daily_policy", ROOT / "scripts/daily_update_policy.py")
policy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(policy)


class DailyUpdatePolicyTests(unittest.TestCase):
    def test_manual_blocks_schedule_but_allows_button(self):
        config = {"daily_update": {"mode": "manual"}}
        self.assertFalse(policy.should_run(config, "schedule"))
        self.assertTrue(policy.should_run(config, "workflow_dispatch"))

    def test_auto_and_legacy_installations_keep_schedule(self):
        for config in ({}, {"daily_update": {"mode": "auto"}}):
            for event in ("schedule", "workflow_dispatch"):
                self.assertTrue(policy.should_run(config, event))

    def test_invalid_config_fails_closed(self):
        for config in (None, [], {"daily_update": False}, {"daily_update": {"mode": "yes"}}):
            with self.subTest(config=config), self.assertRaises(ValueError):
                policy.should_run(config, "schedule")

    def test_real_entrypoint_emits_skip_without_running_pipeline(self):
        with tempfile.TemporaryDirectory() as temp:
            config = Path(temp) / "config.yaml"
            config.write_text("daily_update:\n  mode: manual\n")
            for event, allowed in (("schedule", "false"), ("workflow_dispatch", "true")):
                output = Path(temp) / event
                result = subprocess.run(
                    [sys.executable, str(ROOT / "scripts/daily_update_policy.py"), "--config", str(config), "--event", event],
                    env={**os.environ, "GITHUB_OUTPUT": str(output)}, capture_output=True, text=True,
                )
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(output.read_text(), f"run_daily={allowed}\n")

    def test_workflow_gates_entire_model_job_using_latest_config(self):
        jobs = yaml.safe_load((ROOT / ".github/workflows/daily-paper-reader.yml").read_text())["jobs"]
        self.assertEqual(jobs["run"]["needs"], "update-policy")
        self.assertEqual(jobs["run"]["if"], "needs.update-policy.outputs.run_daily == 'true'")
        self.assertNotIn("env", jobs["update-policy"])
        self.assertEqual(jobs["update-policy"]["steps"][0]["with"]["ref"], "${{ github.ref_name }}")
        self.assertIn("scripts/daily_update_policy.py", jobs["update-policy"]["steps"][-1]["run"])


if __name__ == "__main__":
    unittest.main()
