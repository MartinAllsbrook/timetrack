/// <reference lib="deno.unstable" />

import { define } from "../../utils.ts";
import { getDatabase } from "../../database.ts";
import type { CreateTimeEntryRequest } from "../../types.ts";

export const handler = define.handlers({
    async GET(_ctx) {
        try {
            const db = await getDatabase();
            const entries = await db.getTimeEntriesWithProjects();

            return new Response(JSON.stringify(entries), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error fetching time entries:", error);
            return new Response(
                JSON.stringify({ error: "Failed to fetch time entries" }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
    },

    async POST(ctx) {
        try {
            const body = await ctx.req.json() as CreateTimeEntryRequest;

            if (!body.projectId) {
                return new Response(
                    JSON.stringify({ error: "Project ID is required" }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }

            const db = await getDatabase();

            // Check if there's an active session and end it first
            const activeSession = await db.getActiveSession();
            if (activeSession) {
                await db.clearActiveSession();
            }

            const timeEntry = await db.createTimeEntry(body);

            return new Response(JSON.stringify(timeEntry), {
                status: 201,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error creating time entry:", error);
            return new Response(
                JSON.stringify({ error: "Failed to create time entry" }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
    },
});
