import { App, staticFiles } from "fresh";
import { define, type State } from "./utils.ts";
import { SessionUtils } from "./src/SessionUtils.ts";
import { CookieUtils } from "src/CookieUtils.ts";

export const app = new App<State>();

app.use(staticFiles());

// this can also be defined via a file.
const exampleLoggerMiddleware = define.middleware((ctx) => {
    console.log(`${ctx.req.method} ${ctx.req.url}`);
    return ctx.next();
});
app.use(exampleLoggerMiddleware);

// User session middleware
const sessionMiddleware = define.middleware(async (ctx) => {
    const session = await SessionUtils.getSession(ctx.req);
    
    if (session.isAuthenticated && session.user) {
        // User is already authenticated
        ctx.state.session = session;
        ctx.state.user = session.user;
        return await ctx.next();
    } else {
        // Create guest user and set in state
        const user = await SessionUtils.createGuestSession();
        ctx.state.session = {
            user,
            isAuthenticated: true,
            isGitHubLinked: false,
        };
        ctx.state.user = user;
        
        // Get response from downstream
        const response = await ctx.next();
        
        // Create new headers including the cookie
        const newHeaders = new Headers(response.headers);
        CookieUtils.setUserSession(newHeaders, user.id);
        
        console.log("New Guest User Created:", user.name);
        
        // Return new response with updated headers
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
        });
    }
});
app.use(sessionMiddleware);

// Include file-system based routes here
app.fsRoutes();
