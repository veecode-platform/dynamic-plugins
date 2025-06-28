#!/usr/bin/env python3

import json
import os
import subprocess
import yaml
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLUGIN_DIR = ROOT / "plugins"
CHANGED_JSON = ROOT / "changed.json"
OUTPUT_FILE = ROOT / "plugins-output.yaml"

def read_changed_plugins():
    if not CHANGED_JSON.exists():
        return []
    with open(CHANGED_JSON) as f:
        data = json.load(f)
    return [pkg["name"] for pkg in data]

def get_package_info(plugin_path):
    with open(plugin_path / "package.json") as f:
        pkg = json.load(f)
    return pkg["name"], pkg["version"]

def run_command(command, cwd):
    print(f"Running command: {' '.join(command)} in {cwd}")
    result = subprocess.run(command, cwd=cwd)
    if result.returncode != 0:
        raise Exception(f"Command failed: {' '.join(command)}")

def build_dynamic(plugin_path, name):
    print(f"🔨 Building {name}...")

    tsconfig_path = plugin_path / "tsconfig.json"
    if tsconfig_path.exists():
        print(f"Found tsconfig.json for {name}, running 'yarn tsc' first...")
        run_command(["yarn", "tsc"], cwd=plugin_path)

    run_command(["yarn", "build-dynamic-plugin"], cwd=plugin_path)

def publish_plugin(plugin_path, name):
    print(f"📦 Publishing {name}...")
    dist_path = plugin_path / "dist-dynamic"
    run_command(
        ["npm", "publish", "--access", "public"],
        cwd=dist_path
    )

def get_integrity(plugin_path, name):
    print(f"📦 Packing {name} to get integrity hash...")
    result = subprocess.run(
        ["npm", "pack", "--json"],
        cwd=plugin_path,
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        raise Exception(f"❌ Error generating package for {name}")

    output = json.loads(result.stdout)[0]
    return output["integrity"]

def main():
    print("🚀 Starting build and publish process...")

    if OUTPUT_FILE.exists():
        OUTPUT_FILE.unlink()

    changed = read_changed_plugins()
    plugins = sorted(p for p in PLUGIN_DIR.iterdir() if p.is_dir())

    output = []

    for plugin_path in plugins:
        name, version = get_package_info(plugin_path)
        changed_flag = name in changed

        if changed_flag:
            try:
                build_dynamic(plugin_path, name)
                publish_plugin(plugin_path, name)
            except Exception as e:
                print(f"❌ Failed building/publishing {name}: {e}")
                continue

        try:
            integrity = get_integrity(plugin_path, name)
        except Exception as e:
            print(f"❌ Failed generating integrity for {name}: {e}")
            integrity = "unknown"

        output.append({
            "disabled": not changed_flag,
            "package": f"{name}@{version}",
            "integrity": integrity
        })

    with open(OUTPUT_FILE, "w") as f:
        yaml.dump({"plugins": output}, f, default_flow_style=False)

    print(f"✅ Process finished! Output file at: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()