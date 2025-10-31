/// <reference lib="deno.unstable" />

import { define } from "../../../utils.ts";
import { getDatabase } from "../../../src/database.ts";
import type { UpdateTimeEntryRequest } from "../../../src/types.ts";
import { SessionUtils } from "src/SessionUtils.ts";

export const handler = define.handlers({
    async GET(ctx) {
        try {
            const user = await SessionUtils.requireApiAuth(ctx.req);
            const { id } = ctx.params;
            const db = await getDatabase();
            const timeEntry = await db.getTimeEntry(user.id, id);

            if (!timeEntry) {
                return new Response(
                    JSON.stringify({ error: "Time entry not found" }),
                    {
                        status: 404,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }

            return new Response(JSON.stringify(timeEntry), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error fetching time entry:", error);
            return new Response(
                JSON.stringify({ error: "Failed to fetch time entry" }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
    },

    async PUT(ctx) {
        try {
            const user = await SessionUtils.requireApiAuth(ctx.req);

            const { id } = ctx.params;
            const body = await ctx.req.json() as UpdateTimeEntryRequest;

            const db = await getDatabase();
            const timeEntry = await db.updateTimeEntry(user.id, id, body);

            if (!timeEntry) {
                return new Response(
                    JSON.stringify({ error: "Time entry not found" }),
                    {
                        status: 404,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }

            return new Response(JSON.stringify(timeEntry), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error updating time entry:", error);
            return new Response(
                JSON.stringify({ error: "Failed to update time entry" }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
    },

    async DELETE(ctx) {
        try {
            const user = await SessionUtils.requireApiAuth(ctx.req);
            
            const { id } = ctx.params;
            const db = await getDatabase();

            await db.deleteTimeEntry(user.id, id);

            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error deleting time entry:", error);
            return new Response(
                JSON.stringify({ error: "Failed to delete time entry" }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
    },
});
