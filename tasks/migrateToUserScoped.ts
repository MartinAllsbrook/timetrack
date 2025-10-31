#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --unstable-kv

import { getDatabase } from "../src/database.ts";

/**
 * Migration script to convert existing flat database structure to user-scoped structure.
 * This script will:
 * 1. Find all existing users in the database
 * 2. If no users exist, create a default user
 * 3. Migrate all existing projects, time entries, and active sessions to the first user
 */

async function main() {
    console.log("🔄 Starting migration to user-scoped database structure...");
    
    const db = await getDatabase();
    
    // Get all existing users
    const userIds = await db.getAllUserIds();
    console.log(`📊 Found ${userIds.length} existing users`);
    
    let targetUserId: string;
    
    if (userIds.length === 0) {
        console.log("\n❗ No users found in the database.");
        const createDefault = prompt("Would you like to create a default user? (y/n): ");
        
        if (createDefault?.toLowerCase() === 'y' || createDefault?.toLowerCase() === 'yes') {
            const userName = prompt("Enter a name for the default user: ") || "Default User";
            const defaultUser = {
                id: crypto.randomUUID(),
                name: userName
            };
            
            await db.addUser(defaultUser);
            targetUserId = defaultUser.id;
            console.log(`👤 Created default user: ${defaultUser.name} (${defaultUser.id})`);
        } else {
            console.log("❌ Cannot proceed without a user. Please create a user first.");
            Deno.exit(1);
        }
    } else {
        // Display all users and let user choose
        console.log("\n👥 Available users:");
        for (let i = 0; i < userIds.length; i++) {
            const user = await db.getUser(userIds[i]);
            console.log(`${i + 1}. ${user?.name} (${userIds[i]})`);
        }
        
        console.log(`${userIds.length + 1}. Create a new user`);
        
        while (true) {
            const choice = prompt(`\nSelect a user (1-${userIds.length + 1}): `);
            const choiceNum = parseInt(choice || "");
            
            if (choiceNum >= 1 && choiceNum <= userIds.length) {
                targetUserId = userIds[choiceNum - 1];
                const user = await db.getUser(targetUserId);
                console.log(`👤 Selected user: ${user?.name} (${targetUserId})`);
                break;
            } else if (choiceNum === userIds.length + 1) {
                const userName = prompt("Enter a name for the new user: ");
                if (!userName) {
                    console.log("❌ User name is required.");
                    continue;
                }
                
                const newUser = {
                    id: crypto.randomUUID(),
                    name: userName
                };
                
                await db.addUser(newUser);
                targetUserId = newUser.id;
                console.log(`👤 Created new user: ${newUser.name} (${newUser.id})`);
                break;
            } else {
                console.log("❌ Invalid choice. Please try again.");
            }
        }
    }
    
    // Confirm before proceeding
    console.log(`\n⚠️  This will migrate ALL existing projects, time entries, and active sessions to user: ${targetUserId}`);
    const confirm = prompt("Are you sure you want to proceed? (y/n): ");
    
    if (confirm?.toLowerCase() !== 'y' && confirm?.toLowerCase() !== 'yes') {
        console.log("❌ Migration cancelled.");
        Deno.exit(0);
    }
    
    // Run the migration
    await db.migrateToUserScopedData(targetUserId);
    
    console.log("✅ Migration completed successfully!");
    console.log(`🎯 All data has been assigned to user: ${targetUserId}`);
    console.log("\n📝 Next steps:");
    console.log("1. Update your API routes to include user context");
    console.log("2. Update your frontend to pass user IDs to database operations");
    console.log("3. Test the application to ensure everything works correctly");
}

if (import.meta.main) {
    try {
        await main();
    } catch (error) {
        console.error("❌ Migration failed:", error);
        Deno.exit(1);
    }
}