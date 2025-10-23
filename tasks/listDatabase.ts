#!/usr/bin/env -S deno run --allow-read --allow-write --unstable-kv
/// <reference lib="deno.unstable" />

import { blue, green, yellow, cyan } from "jsr:@std/fmt@^1.0.8/colors";

/**
 * List Database Script
 * 
 * This script lists all entries in the KV database with basic formatting
 * 
 * Usage: 
 * - deno run --allow-read --allow-write --unstable-kv tasks/listDatabase.ts
 * - deno run --allow-read --allow-write --unstable-kv tasks/listDatabase.ts --verbose
 */

interface DatabaseEntry {
    key: Deno.KvKey;
    value: unknown;
    versionstamp: string;
}

function formatKey(key: Deno.KvKey): string {
    return key.map(part => {
        if (typeof part === "string") {
            return `"${part}"`;
        }
        return String(part);
    }).join(", ");
}

function formatValue(value: unknown, verbose: boolean = false): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    
    if (typeof value === "object") {
        if (verbose) {
            return JSON.stringify(value, null, 2);
        } else {
            // Show a preview of objects
            const preview = JSON.stringify(value);
            return preview.length > 100 ? preview.substring(0, 97) + "..." : preview;
        }
    }
    
    return String(value);
}

function groupEntriesByPrefix(entries: DatabaseEntry[]): Map<string, DatabaseEntry[]> {
    const groups = new Map<string, DatabaseEntry[]>();
    
    for (const entry of entries) {
        const prefix = entry.key[0] ? String(entry.key[0]) : "root";
        if (!groups.has(prefix)) {
            groups.set(prefix, []);
        }
        groups.get(prefix)!.push(entry);
    }
    
    return groups;
}

async function listDatabase(verbose: boolean = false) {
    console.log("Listing database contents...\n");
    
    try {
        // Open the KV database
        const kv = await Deno.openKv();
        
        const entries: DatabaseEntry[] = [];
        const list = kv.list({ prefix: [] });

        for await (const entry of list) {
            entries.push({
                key: entry.key,
                value: entry.value,
                versionstamp: entry.versionstamp
            });
        }
        
        // Close the database connection
        kv.close();
        
        if (entries.length === 0) {
            console.log(yellow("Database is empty."));
            return;
        }
        
        console.log(green(`Found ${entries.length} entries in the database:\n`));
        
        // Group entries by first key segment for better organization
        const groups = groupEntriesByPrefix(entries);
        
        for (const [prefix, groupEntries] of groups) {
            console.log(blue(`prefix: "${prefix}" (${groupEntries.length} entries):`));
            console.log();

            for (const entry of groupEntries) {
                const keyStr = formatKey(entry.key);
                const valueStr = formatValue(entry.value, verbose);
                
                console.log(cyan(`Key: ${keyStr}`));
                if (verbose) {
                    console.log(`Versionstamp: ${entry.versionstamp}`);
                }
                console.log(`Value: ${valueStr}`);
                console.log();
            }
        }
        
        console.log(green(`Total: ${entries.length} entries`));
        
    } catch (error) {
        console.error("Error listing database:", error);
        Deno.exit(1);
    }
}

// Main execution
if (import.meta.main) {
    const verboseMode = Deno.args.includes("--verbose") || Deno.args.includes("-v");
    
    if (verboseMode) {
        console.log("Running in verbose mode...\n");
    }
    
    await listDatabase(verboseMode);
}
