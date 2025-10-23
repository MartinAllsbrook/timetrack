/// <reference lib="deno.unstable" />

import { define } from "../../../utils.ts";
import { getDatabase } from "../../../src/database.ts";

export const handler = define.handlers({
    async POST(_ctx) {
        try {
            const db = await getDatabase();
            await db.clearActiveSession();

            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error stopping time tracking:", error);
            return new Response(
                JSON.stringify({ error: "Failed to stop time tracking" }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
    },

    async GET(_ctx) {
        try {
            const db = await getDatabase();
            const activeSession = await db.getActiveSession();

            return new Response(JSON.stringify({ activeSession }), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error fetching active session:", error);
            return new Response(
                JSON.stringify({ error: "Failed to fetch active session" }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
    },
});
