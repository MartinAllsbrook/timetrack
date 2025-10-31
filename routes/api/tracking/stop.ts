/// <reference lib="deno.unstable" />

import { define } from "../../../utils.ts";
import { getDatabase } from "../../../src/database.ts";
import { SessionUtils } from "src/SessionUtils.ts";

export const handler = define.handlers({
    async POST(_ctx) {
        try {
            const user = await SessionUtils.requireApiAuth(_ctx.req);

            const db = await getDatabase();
            await db.clearActiveSession(user.id);

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
            const user = await SessionUtils.requireApiAuth(_ctx.req);

            const db = await getDatabase();
            const activeSession = await db.getActiveSession(user.id);

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
