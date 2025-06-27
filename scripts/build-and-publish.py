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

def build_dynamic(plugin_path, name):
    print(f"🛠️  Buildando {name}...")
    result = subprocess.run(["yarn", "build-dynamic-plugin"], cwd=plugin_path)
    if result.returncode != 0:
        raise Exception(f"❌ Falha ao buildar {name}")

def publish_plugin(plugin_path, name):
    print(f"📦 Publicando {name}...")
    dist_path = plugin_path / "dist-dynamic"
    result = subprocess.run(
        ["npm", "publish", "--access", "public"],
        cwd=dist_path,
        env={**os.environ, "NODE_AUTH_TOKEN": os.environ.get("NODE_AUTH_TOKEN", "")}
    )
    if result.returncode != 0:
        raise Exception(f"❌ Falha ao publicar {name}")

def get_integrity(plugin_path, name):
    result = subprocess.run(["npm", "pack", "--json"], cwd=plugin_path, capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"❌ Erro ao gerar pacote para {name}")
    output = json.loads(result.stdout)[0]
    return output["integrity"]

def main():
    print("🚀 Iniciando processo de build e publicação...")

    if OUTPUT_FILE.exists():
        OUTPUT_FILE.unlink()

    changed = read_changed_plugins()
    plugins = sorted(p for p in PLUGIN_DIR.iterdir() if p.is_dir())

    output = []

    for plugin_path in plugins:
        name, version = get_package_info(plugin_path)
        changed_flag = name in changed

        if changed_flag:
            build_dynamic(plugin_path, name)
            publish_plugin(plugin_path, name)

        integrity = get_integrity(plugin_path, name)

        output.append({
            "disabled": not changed_flag,
            "package": f"{name}@{version}",
            "integrity": integrity
        })

    with open(OUTPUT_FILE, "w") as f:
        yaml.dump({"plugins": output}, f, default_flow_style=False)

    print(f"✅ Processo finalizado! Output em: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
