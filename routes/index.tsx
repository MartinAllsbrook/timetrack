import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import TimeTracker from "../islands/TimeTracker.tsx";

export default define.page(function Home(ctx) {
    console.log("Shared value " + ctx.state.shared);

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
