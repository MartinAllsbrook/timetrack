import { createDefine } from "fresh";
import type { AuthSession, User } from "./src/types.ts";

// This specifies the type of "ctx.state" which is used to share
// data among middlewares, layouts and routes.
export interface State {
    session: AuthSession;
    user: User | null;
}

export const define = createDefine<State>();
