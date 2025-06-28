#!/usr/bin/env python3

import json
import os
import subprocess
import sys
import yaml
from pathlib import Path


try:
    from packaging.version import Version
except ImportError:
    print("❌ Missing required dependency: packaging")
    print("💡 Run: pip install packaging")
    sys.exit(1)

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
    pkg_path = plugin_path / "package.json"
    with open(pkg_path) as f:
        pkg = json.load(f)
    return pkg["name"], pkg["version"]

def bump_patch(version_str):
    v = Version(version_str)
    return f"{v.major}.{v.minor}.{v.micro + 1}"

def bump_version(plugin_path, old_version):
    new_version = bump_patch(old_version)
    pkg_path = plugin_path / "package.json"
    with open(pkg_path) as f:
        data = json.load(f)
    data["version"] = new_version
    with open(pkg_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"🔧 Bumped version from {old_version} → {new_version}")
    return new_version

def run_command(command, cwd):
    print(f"▶️ Running: {' '.join(command)} in {cwd}")
    result = subprocess.run(command, cwd=cwd)
    if result.returncode != 0:
        raise Exception(f"❌ Command failed: {' '.join(command)}")

def build_dynamic(plugin_path, name):
    print(f"🔨 Building {name}...")
    if (plugin_path / "tsconfig.json").exists():
        run_command(["yarn", "tsc"], cwd=plugin_path)
    run_command(["yarn", "build-dynamic-plugin"], cwd=plugin_path)

def publish_plugin(plugin_path, name):
    print(f"📦 Publishing {name}...")
    dist_path = plugin_path / "dist-dynamic"
    run_command(["npm", "publish", "--access", "restricted"], cwd=dist_path)

def get_integrity(plugin_path, name):
    print(f"📦 Packing {name} to get integrity hash...")
    result = subprocess.run(
        ["npm", "pack", "--json"],
        cwd=plugin_path,
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        raise Exception(f"❌ Failed to generate package for {name}")
    output = json.loads(result.stdout)[0]
    return output["integrity"]

def main():
    print("🚀 Starting build and publish process...\n")

    if OUTPUT_FILE.exists():
        OUTPUT_FILE.unlink()

    changed = read_changed_plugins()
    plugins = sorted(p for p in PLUGIN_DIR.iterdir() if p.is_dir())
    output = []

    for plugin_path in plugins:
        try:
            name, version = get_package_info(plugin_path)
            changed_flag = name in changed

            if changed_flag:
                new_version = bump_version(plugin_path, version)
                build_dynamic(plugin_path, name)
                publish_plugin(plugin_path, name)
                version = new_version

            integrity = get_integrity(plugin_path, name)

        except Exception as e:
            print(f"❌ Failed processing {plugin_path.name}: {e}")
            integrity = "unknown"
            version = version if 'version' in locals() else "0.0.0"
            name = name if 'name' in locals() else plugin_path.name

        output.append({
            "disabled": name not in changed,
            "package": f"{name}@{version}",
            "integrity": integrity
        })

    with open(OUTPUT_FILE, "w") as f:
        yaml.dump({"plugins": output}, f, default_flow_style=False)

    print(f"\n✅ Finished! Output written to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
