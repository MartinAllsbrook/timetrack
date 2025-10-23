/// <reference lib="deno.unstable" />

import { define } from "../../utils.ts";
import { getDatabase } from "../../database.ts";

export const handler = define.handlers({
    async POST(_ctx) {
        try {
            const db = await getDatabase();

            // Create some sample projects
            const sampleProjects = [
                {
                    name: "Web Development",
                    description: "Frontend and backend development work",
                    color: "#3b82f6",
                },
                {
                    name: "Design",
                    description: "UI/UX design and mockups",
                    color: "#8b5cf6",
                },
                {
                    name: "Meetings",
                    description: "Team meetings and client calls",
                    color: "#f59e0b",
                },
                {
                    name: "Research",
                    description: "Technical research and learning",
                    color: "#10b981",
                },
            ];

            const createdProjects = [];
            for (const projectData of sampleProjects) {
                try {
                    const project = await db.createProject(projectData);
                    createdProjects.push(project);
                } catch (error) {
                    console.log(
                        `Project ${projectData.name} might already exist:`,
                        error,
                    );
                }
            }

            return new Response(
                JSON.stringify({
                    success: true,
                    message:
                        `Created ${createdProjects.length} sample projects`,
                    projects: createdProjects,
                }),
                {
                    headers: { "Content-Type": "application/json" },
                },
            );
        } catch (error) {
            console.error("Error setting up sample data:", error);
            return new Response(
                JSON.stringify({ error: "Failed to set up sample data" }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }
    },
});
