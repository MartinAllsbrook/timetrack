import { Cookie, setCookie } from "@std/http";

// Detect if we're running in production to set appropriate security flags
const IS_PRODUCTION = Deno.env.get("ENV") === "production";

console.log("CookieUtils initialized. Production mode:", IS_PRODUCTION);

/**
 * Utility functions for managing secure cookies in the card-war application
 *
 * This class centralizes cookie creation and management with proper security settings.
 * All cookies are configured with appropriate flags for security (httpOnly, secure, sameSite)
 * and different expiration times based on their purpose.
 */
export const CookieUtils = {
    /**
     * Create a secure user session cookie
     *
     * Creates a long-lived cookie to maintain user authentication state.
     * The cookie is configured with security best practices:
     * - httpOnly: Prevents JavaScript access (XSS protection)
     * - secure: Only sent over HTTPS in production
     * - sameSite: Prevents CSRF attacks
     * - maxAge: 1 year expiration
     *
     * @param userID - The user's unique identifier
     * @returns Cookie object configured for user sessions
     */
    createUserCookie: (userID: string): Cookie => {
        return {
            name: "user-id",
            value: userID,
            path: "/",
            httpOnly: true, // Prevent XSS attacks
            secure: IS_PRODUCTION, // HTTPS only in production
            sameSite: "Lax", // CSRF protection while allowing navigation
            maxAge: 60 * 60 * 24 * 365, // 1 year
        };
    },

    /**
     * Set user session cookie on response
     *
     * Convenience method to create and set a user session cookie on the response headers.
     * This is typically called after successful authentication or account creation.
     *
     * @param headers - The response headers to modify
     * @param userID - The user's unique identifier
     */
    setUserSession: (headers: Headers, userID: string): void => {
        const cookie = CookieUtils.createUserCookie(userID);
        setCookie(headers, cookie);
    },

    /**
     * Clear all authentication cookies
     *
     * Removes all authentication-related cookies by setting them to empty values
     * with maxAge=0. This is used during logout to ensure complete session cleanup.
     * Clears:
     * - user-id: The main session cookie
     * - oauth_state: OAuth CSRF protection token
     * - github_temp_data: Temporary GitHub data during OAuth flow
     *
     * @param headers - The response headers to modify
     */
    clearAuthCookies: (headers: Headers): void => {
        const clearUserCookie: Cookie = {
            name: "user-id",
            value: "",
            path: "/",
            httpOnly: true,
            secure: IS_PRODUCTION,
            sameSite: "Lax",
            maxAge: 0, // Immediate expiration
        };

        const clearOAuthCookie: Cookie = {
            name: "oauth_state",
            value: "",
            path: "/",
            httpOnly: true,
            secure: IS_PRODUCTION,
            sameSite: "Lax",
            maxAge: 0,
        };

        const clearGitHubCookie: Cookie = {
            name: "github_temp_data",
            value: "",
            path: "/",
            httpOnly: true,
            secure: IS_PRODUCTION,
            sameSite: "Lax",
            maxAge: 0,
        };

        setCookie(headers, clearUserCookie);
        setCookie(headers, clearOAuthCookie);
        setCookie(headers, clearGitHubCookie);
    },

    /**
     * Create temporary GitHub data cookie
     *
     * During the OAuth flow, GitHub user data needs to be temporarily stored
     * while the user decides how to link their account. This creates a short-lived
     * cookie (5 minutes) with the GitHub user information.
     *
     * The data is JSON stringified and URL encoded for safe cookie storage.
     *
     * @param headers - The response headers to modify
     * @param githubData - The GitHub user data to store temporarily
     */
    setGitHubTempData: (headers: Headers, githubData: object): void => {
        const githubCookie: Cookie = {
            name: "github_temp_data",
            value: encodeURIComponent(JSON.stringify(githubData)), // URL encode the JSON
            path: "/",
            httpOnly: true,
            secure: IS_PRODUCTION,
            sameSite: "Lax",
            maxAge: 300, // 5 minutes - short lived for security
        };

        setCookie(headers, githubCookie);
    }
}
