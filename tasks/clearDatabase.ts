#!/usr/bin/env -S deno run --allow-read --allow-write --unstable-kv
/// <reference lib="deno.unstable" />

import { yellow } from "jsr:@std/fmt@^1.0.8/colors";

/**
 * Clear Database Script
 * 
 * This script clears all data from the KV database
 * 
 * Usage: 
 * - deno run --allow-read --allow-write --unstable-kv tasks/clearDatabase.ts
 * - deno run --allow-read --allow-write --unstable-kv tasks/clearDatabase.ts --force
 */

async function clearDatabase() {
    console.log("Starting database cleanup...");
    
    try {
        // Open the KV database
        const kv = await Deno.openKv();
        
        let deletedCount = 0;
        
        const list = kv.list({ prefix: [] });

        for await (const entry of list) {
            const key = entry.key;
            await kv.delete(key);
            deletedCount++;
        }
        
        // Close the database connection
        kv.close();
        
        if (deletedCount === 0) {
            console.log("Database was already empty.");
        } else {
            console.log(`Database cleared successfully! Deleted ${deletedCount} entries.`);
        }
        
    } catch (error) {
        console.error("Error clearing database:", error);
        Deno.exit(1);
    }
}

// Confirm before proceeding
function confirmClear(): boolean {
    console.log(yellow("WARNING: This will permanently delete ALL data from the database!"));
    
    const proceed = confirm("Are you sure you want to continue?");
    return proceed;
}

// Main execution
if (import.meta.main) {
    const forceMode = Deno.args.includes("--force");
    
    let confirmed = forceMode;
    if (!forceMode) {
        confirmed = confirmClear();
    }
    
    if (confirmed) {
        if (forceMode) {
            console.log("Running in force mode - skipping confirmation...");
        }
        await clearDatabase();
    } else {
        console.log("Database clear cancelled.");
        Deno.exit(0);
    }
}
