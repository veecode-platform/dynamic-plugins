/* eslint-disable */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

type ChangedPlugin = {
  name: string;
};

type PackageInfo = {
  name: string;
  version: string;
};

type OutputEntry = {
  disabled: boolean;
  name: string;
  version: string;
  integrity: string;
};

const PLUGIN_DIR = path.resolve(__dirname, '../plugins');
const OUTPUT_FILE = path.resolve(__dirname, '../plugins-output.yaml');
const CHANGED_JSON = path.resolve(__dirname, '../changed.json');

/**
 * Lê os plugins modificados a partir de `changed.json`
 */
function readChangedPlugins(): string[] {
  if (!fs.existsSync(CHANGED_JSON)) return [];
  const content = fs.readFileSync(CHANGED_JSON, 'utf-8');
  const parsed = JSON.parse(content) as ChangedPlugin[];
  return parsed.map(pkg => pkg.name);
}

/**
 * Lê name e version do package.json do plugin
 */
function getPackageInfo(pluginPath: string): PackageInfo {
  const pkgPath = path.join(pluginPath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  return { name: pkg.name, version: pkg.version };
}

/**
 * Retorna o hash de integridade de um pacote após rodar `npm pack`
 */
function getIntegrityFromTarball(
  pluginPath: string,
  pkgName: string,
): string | null {
  const packResult = spawnSync('npm', ['pack', '--json'], {
    cwd: pluginPath,
    encoding: 'utf-8', // stdout será string
  });

  if (packResult.status !== 0) {
    console.error(`❌ Erro ao gerar pacote para ${pkgName}`);
    console.error(packResult.stderr);
    return null;
  }

  const outputJson = JSON.parse(packResult.stdout)[0];
  return outputJson.integrity as string;
}

/**
 * Publica o plugin no NPM via dist-dynamic/
 */
function publishPlugin(pluginPath: string, pkgName: string): void {
  console.log(`📦 Publicando ${pkgName}...`);

  const distDynamic = path.join(pluginPath, 'dist-dynamic');
  const publish = spawnSync('npm', ['publish', '--access', 'public'], {
    cwd: distDynamic,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_AUTH_TOKEN: process.env.NODE_AUTH_TOKEN, // necessário no CI
    },
  });

  if (publish.status !== 0) {
    console.error(`❌ Falha ao publicar ${pkgName}`);
    process.exit(1);
  }
}

/**
 * Roda build-dynamic-plugin via yarn
 */
function buildDynamic(pluginPath: string, pkgName: string): void {
  console.log(`🛠️  Buildando ${pkgName}...`);
  const result = spawnSync('yarn', ['build-dynamic-plugin'], {
    cwd: pluginPath,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    console.error(`❌ Falha ao buildar ${pkgName}`);
    process.exit(1);
  }
}

/**
 * Escreve no arquivo plugins-output.yaml
 */
function writeOutputEntry(entry: OutputEntry): void {
  const content = `- disabled: ${entry.disabled}
  package: ${entry.name}@${entry.version}
  integrity: ${entry.integrity}
`;
  fs.appendFileSync(OUTPUT_FILE, content);
}

/**
 * Runner principal
 */
function run(): void {
  console.log('🚀 Iniciando processo de build e publicação...');

  if (fs.existsSync(OUTPUT_FILE)) fs.unlinkSync(OUTPUT_FILE);

  const changed = readChangedPlugins();

  const pluginDirs = fs.readdirSync(PLUGIN_DIR).filter(d => {
    const fullPath = path.join(PLUGIN_DIR, d);
    return fs.statSync(fullPath).isDirectory();
  });

  for (const dir of pluginDirs) {
    const fullPath = path.join(PLUGIN_DIR, dir);
    const { name, version } = getPackageInfo(fullPath);
    const wasChanged = changed.includes(name);

    if (wasChanged) {
      buildDynamic(fullPath, name);
      publishPlugin(fullPath, name);
    }

    const integrity = getIntegrityFromTarball(fullPath, name);
    if (!integrity) continue;

    writeOutputEntry({
      disabled: !wasChanged,
      name,
      version,
      integrity,
    });
  }

  console.log(`✅ Processo finalizado! Output em: ${OUTPUT_FILE}`);
}

run();
