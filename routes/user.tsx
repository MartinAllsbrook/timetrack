import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import { UserInfo } from "islands/UserInfo.tsx";
import { User } from "src/types.ts";
import { PageProps } from "fresh";

interface Props {
    user: User | null;
}

export const handler = define.handlers({
    GET(ctx) {
        console.log();
        const user = ctx.state.user;
        return { data: { user } }
    }
})

export default define.page(function Home({ data }: PageProps<Props>) {

    const { user } = data;

    console.log("User in User Page:", user);

    return (
        <div class="min-h-screen bg-gray-50">
            <Head>
                <title>TimeTrack - User</title>
                <meta
                    name="description"
                    content="Track your time across different projects with TimeTrack"
                />
            </Head>
            <div class="px-4 py-8">
                <UserInfo
                    user={user}
                />
            </div>
        </div>
    );
});