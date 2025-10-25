import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import _ProjectSelectTesting from "../islands/testing/ProjectSelectTesting.tsx";
import _CurrentEntryEditorTesting from "../islands/testing/CurrentEntryEditorTesting.tsx";
import _ProjectEditorTesting from "../islands/testing/ProjectEditorTesting.tsx";
import CreateProjectModalTesting from "../islands/testing/CreateProjectModalTesting.tsx";

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
                {/* <ProjectSelectTesting /> */}
                {/* <CurrentEntryEditorTesting /> */}
                {/* <ProjectEditorTesting /> */}
                <CreateProjectModalTesting />
            </div>
        </div>
    );
});