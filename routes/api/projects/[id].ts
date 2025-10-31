/// <reference lib="deno.unstable" />

import { define } from "../../../utils.ts";
import { getDatabase } from "../../../src/database.ts";
import type { UpdateProjectRequest } from "../../../src/types.ts";
import { SessionUtils } from "src/SessionUtils.ts";

export const handler = define.handlers({
    async GET(ctx) {
        try {
            const user = await SessionUtils.requireApiAuth(ctx.req);

            const { id } = ctx.params;
            const db = await getDatabase();
            const project = await db.getProject(user.id, id);

            if (!project) {
                return new Response(
                    JSON.stringify({ error: "Project not found" }),
                    {
                        status: 404,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }

            return new Response(JSON.stringify(project), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error fetching project:", error);
            return new Response(
                JSON.stringify({ error: "Failed to fetch project" }),
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
            const body = await ctx.req.json() as UpdateProjectRequest;

            const db = await getDatabase();
            const project = await db.updateProject(user.id, id, body);

            if (!project) {
                return new Response(
                    JSON.stringify({ error: "Project not found" }),
                    {
                        status: 404,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }

            return new Response(JSON.stringify(project), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error updating project:", error);
            return new Response(
                JSON.stringify({ error: "Failed to update project" }),
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

            await db.deleteProject(user.id, id);

            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error deleting project:", error);
            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to delete project";
            return new Response(JSON.stringify({ error: errorMessage }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
    },
});
