import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import TimeTracker from "../islands/TimeTracker.tsx";
import { SessionUtils } from "src/SessionUtils.ts";
import { CookieUtils } from "src/CookieUtils.ts";

export const handler = define.handlers({
    async GET(ctx) {
        // Create response headers to set cookies
        const headers = new Headers();
        const session = await SessionUtils.getSession(ctx.req);

        if (session.isAuthenticated && session.user) {
            // User is already authenticated
            const user = session.user;
            return { data: { user }, headers };
        } else {
            const user = await SessionUtils.createGuestSession();
            
            // Set the user session cookie
            CookieUtils.setUserSession(headers, user.id);
            
            console.log("New Guest User Created:", user.name);

            // Create a new guest session
            return { data: { user }, headers };
        }
    }
})

export default define.page(function Home(_ctx) {
    // console.log("Shared value " + ctx.state.shared);

    return (
        <div class="min-h-screen bg-gray-50">
            <Head>
                <title>TimeTrack - Time Tracking App</title>
                <meta
                    name="description"
                    content="Track your time across different projects with TimeTrack"
                />
            </Head>
            <div class="px-4 py-8">
                <TimeTracker />
            </div>
        </div>
    );
});
