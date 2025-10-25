/// <reference lib="deno.unstable" />

import { define } from "../../utils.ts";
import { getDatabase } from "../../src/database.ts";
import type { CreateProjectRequest, UpdateProjectRequest } from "../../src/types.ts";
import { Update } from "vite";

export const handler = define.handlers({
    async GET(_ctx) {
        try {
            const db = await getDatabase();
            const projects = await db.getProjectsWithStats();

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

    async PUT(ctx) {
        try {
            const body = await ctx.req.json() as UpdateProjectRequest;
            if (!body.id || body.id.trim() === "") {
                return new Response(
                    JSON.stringify({ error: "Project ID is required" }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }
            const db = await getDatabase();
            const updatedProject = await db.updateProject(body.id, body); // TODO: if the project does not exist, this will be null idk if we should handle that lol
            return new Response(JSON.stringify(updatedProject), {
                status: 200,
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

    async POST(ctx) {
        try {
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
            const project = await db.createProject(body);

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
