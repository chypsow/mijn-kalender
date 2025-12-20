/**
 * updateConfigFromExport.mjs
 *
 * Usage (from project folder):
 *   node updateConfigFromExport.mjs --source export-file.txt [--config config.json] [--keys key1,key2] [--no-overwrite]
 *
 * Examples:
 *   node updateConfigFromExport.mjs --source ./localstorage-export-2025-12-08.txt
 *   node updateConfigFromExport.mjs --source ./export.txt --keys=shiftPatroon,startDatums --no-overwrite
 *
 * Behaviour:
 *  - Reads the JSON payload from --source (file containing the exported localStorage object).
 *  - Loads (or creates) config.json (path via --config, default ./config.json).
 *  - Merges selected keys (or all keys) from payload into config.json.
 *    If --no-overwrite is given, existing keys in config.json are preserved.
 *  - Writes back config.json (pretty-printed).
 *
 * Note: This script runs in Node.js (not in the browser). It expects the export file
 *       to contain a JSON object mapping localStorage keys to values (objects or raw).
 */

import fs from "fs/promises";
import path from "path";

function parseArgs(argv) {
    const args = {};
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a.startsWith("--")) {
            const [k, v] = a.split("=");
            switch (k) {
                case "--source":
                    args.source = v ?? argv[++i];
                    break;
                case "--config":
                    args.config = v ?? argv[++i];
                    break;
                case "--keys":
                    args.keys = (v ?? argv[++i]).split(",").map(s => s.trim()).filter(Boolean);
                    break;
                case "--no-overwrite":
                    args.overwrite = false;
                    break;
                case "--help":
                case "-h":
                    args.help = true;
                    break;
                default:
                    // unknown option - ignore
                    break;
            }
        }
    }
    return args;
}

function usage() {
    console.log(`
Usage:
  node updateConfigFromExport.mjs --source export-file.txt [--config config.json] [--keys key1,key2] [--no-overwrite]

Description:
  Merge selected keys from an exported localStorage JSON file into config.json.
`);
}

async function readJsonFile(filePath) {
    const txt = await fs.readFile(filePath, { encoding: "utf8" });
    return JSON.parse(txt);
}

async function writeJsonFile(filePath, obj) {
    const content = JSON.stringify(obj, null, 2) + "\n";
    await fs.writeFile(filePath, content, { encoding: "utf8" });
}

async function main() {
    const args = parseArgs(process.argv);
    // standaardbestand (Windows-pad). Pas aan indien gewenst.
    const defaultSource = 'C:\\Users\\chyps\\OneDrive\\Attachments\\Instellingen mijn kalender\\Downloaded-items Ploeg1.txt';

    if (args.help) {
        usage();
        process.exit(0);
    }

    // gebruik opgegeven source of de standaardwaarde
    if (!args.source) {
        console.log(`Geen --source opgegeven. Gebruik standaardbestand: ${defaultSource}`);
        args.source = defaultSource;
    }

    const sourcePath = path.resolve(args.source);
    const configPath = path.resolve(args.config ?? "./config.json");
    const defaultKeys = ['beginrechtVerlof','shiftPatroon','startDatums','verlofdagenPloeg1'];
    const keysFilter = args.keys ?? defaultKeys;
    const overwrite = args.overwrite !== false; // default true

    try {
        const payload = await readJsonFile(sourcePath);
        if (typeof payload !== "object" || payload === null) {
            console.error("Source file does not contain a top-level object.");
            process.exit(2);
        }

        // Ensure config.json exists (create empty object if not)
        let config = {};
        try {
            config = await readJsonFile(configPath);
            if (typeof config !== "object" || config === null) config = {};
        } catch (err) {
            // file missing or invalid -> start with empty config
            config = {};
        }

        const keys = keysFilter || Object.keys(payload);
        const summary = { updated: [], skipped: [], added: [] };

        for (const key of keys) {
            if (!(key in payload)) continue;
            const value = payload[key];

            if (config.hasOwnProperty(key)) {
                if (!overwrite) {
                    summary.skipped.push(key);
                    continue;
                }
                // overwrite existing key
                config[key] = value;
                summary.updated.push(key);
            } else {
                // add new key
                config[key] = value;
                summary.added.push(key);
            }
        }

        await writeJsonFile(configPath, config);
        console.log(`Wrote config to: ${configPath}`);
        console.log(`Summary: updated=${summary.updated.length}, added=${summary.added.length}, skipped=${summary.skipped.length}`);
        if (summary.updated.length) console.log("Updated:", summary.updated.join(", "));
        if (summary.added.length) console.log("Added:", summary.added.join(", "));
        if (summary.skipped.length) console.log("Skipped:", summary.skipped.join(", "));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message ?? err);
        process.exit(2);
    }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith("updateConfigFromExport.mjs")) {
    main();
}