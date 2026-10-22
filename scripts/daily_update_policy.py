"""Decide whether a scheduled daily run may call the paper pipeline."""

import argparse
import os
from pathlib import Path

import yaml


def update_mode(config):
    if not isinstance(config, dict):
        raise ValueError("config.yaml must contain a mapping")
    settings = config.get("daily_update", {})
    if not isinstance(settings, dict):
        raise ValueError("daily_update must contain a mapping")
    # Existing installations keep their schedule until they explicitly choose manual.
    mode = settings.get("mode", "auto")
    if mode not in ("manual", "auto"):
        raise ValueError("daily_update.mode must be manual or auto")
    return mode


def should_run(config, event):
    mode = update_mode(config)
    if event not in ("schedule", "workflow_dispatch"):
        raise ValueError("unsupported daily workflow event")
    return event == "workflow_dispatch" or mode == "auto"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", default="config.yaml")
    parser.add_argument("--event", default=os.environ.get("GITHUB_EVENT_NAME", ""))
    args = parser.parse_args()
    config = yaml.safe_load(Path(args.config).read_text(encoding="utf-8"))
    allowed = should_run(config, args.event)
    output = os.environ.get("GITHUB_OUTPUT")
    if output:
        with open(output, "a", encoding="utf-8") as stream:
            stream.write(f"run_daily={str(allowed).lower()}\n")
    print(f"Update mode: {update_mode(config)}; event: {args.event}; run: {allowed}")
    if not allowed:
        print("Manual mode: scheduled paper processing and model calls are skipped.")


if __name__ == "__main__":
    main()
