#!/usr/bin/env -S deno run --allow-read --allow-write --unstable-kv
/// <reference lib="deno.unstable" />

/**
 * Clear Database Script
 * 
 * This script clears all data from the KV database including:
 * - All projects
 * - All time entries
 * - Active session data
 * 
 * Usage: 
 *   deno run --allow-read --allow-write --unstable-kv tasks/clearDatabase.ts
 *   deno run --allow-read --allow-write --unstable-kv tasks/clearDatabase.ts --force
 */

async function clearDatabase() {
    console.log("🗑️  Starting database cleanup...");
    
    try {
        // Open the KV database
        const kv = await Deno.openKv();
        
        let deletedCount = 0;
        
        // Clear all projects
        console.log("🔍 Clearing projects...");
        const projectsIter = kv.list({ prefix: ["projects"] });
        for await (const entry of projectsIter) {
            await kv.delete(entry.key);
            deletedCount++;
            console.log(`   Deleted project: ${entry.key}`);
        }
        
        // Clear all time entries
        console.log("🔍 Clearing time entries...");
        const timeEntriesIter = kv.list({ prefix: ["timeEntries"] });
        for await (const entry of timeEntriesIter) {
            await kv.delete(entry.key);
            deletedCount++;
            console.log(`   Deleted time entry: ${entry.key}`);
        }
        
        // Clear active session
        console.log("🔍 Clearing active session...");
        const activeSessionResult = await kv.get(["activeSession"]);
        if (activeSessionResult.value) {
            await kv.delete(["activeSession"]);
            deletedCount++;
            console.log("   Deleted active session");
        } else {
            console.log("   No active session found");
        }
        
        // Close the database connection
        kv.close();
        
        console.log(`✅ Database cleared successfully! Deleted ${deletedCount} entries.`);
        
        if (deletedCount === 0) {
            console.log("📝 Database was already empty.");
        }
        
    } catch (error) {
        console.error("❌ Error clearing database:", error);
        Deno.exit(1);
    }
}

// Confirm before proceeding
function confirmClear(): boolean {
    console.log("⚠️  WARNING: This will permanently delete ALL data from the database!");
    console.log("   - All projects will be removed");
    console.log("   - All time entries will be removed");
    console.log("   - Active session will be cleared");
    console.log("");
    
    const response = prompt("Are you sure you want to continue? (type 'yes' to confirm): ");
    return response?.toLowerCase() === "yes";
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
            console.log("🔧 Running in force mode - skipping confirmation...");
        }
        await clearDatabase();
    } else {
        console.log("❌ Database clear cancelled.");
        Deno.exit(0);
    }
}
