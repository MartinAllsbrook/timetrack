/// <reference lib="deno.unstable" />

import { define } from "../../utils.ts";
import { getDatabase } from "../../src/database.ts";
import type { CreateProjectRequest } from "../../src/types.ts";
import { SessionUtils } from "../../src/SessionUtils.ts";

export const handler = define.handlers({
    async GET(ctx) {
        try {
            const user = await SessionUtils.requireApiAuth(ctx.req);
            
            const db = await getDatabase();
            const projects = await db.getProjectsWithStats(user.id);

            return new Response(JSON.stringify(projects), {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error fetching projects:", error);
            return new Response(
                JSON.stringify({ error: "Failed to fetch projects" }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
    },

    async POST(ctx) {
        try {
            const user = await SessionUtils.requireApiAuth(ctx.req);

            const body = await ctx.req.json() as CreateProjectRequest;

            if (!body.name || body.name.trim() === "") {
                return new Response(
                    JSON.stringify({ error: "Project name is required" }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }

            const db = await getDatabase();
            const project = await db.createProject(user.id, body);

            return new Response(JSON.stringify(project), {
                status: 201,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Error creating project:", error);
            return new Response(
                JSON.stringify({ error: "Failed to create project" }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
    },
});
