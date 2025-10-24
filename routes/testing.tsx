import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import Testing from "../islands/Testing.tsx";

export default define.page(function Test(_ctx) {
    return (
        <div class="min-h-screen bg-gray-50">
            <Head>
                <title>TimeTrack Testing Page</title>
                <meta
                    name="description"
                    content="Track your time across different projects with TimeTrack"
                />
            </Head>
            <div class="px-4 py-8">
                <Testing />
            </div>
        </div>
    );
});