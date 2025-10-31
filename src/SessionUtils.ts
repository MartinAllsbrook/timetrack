import { getCookies } from "@std/http";
import { User } from "./types.ts";
import { getDatabase } from "./database.ts";

/**
 * Represents the current user's authentication session state
 */
export interface AuthSession {
    /** The authenticated user object, null if not authenticated */
    user: User | null;
    /** Whether the user is currently authenticated */
    isAuthenticated: boolean;
    /** Whether the user has linked their GitHub account */
    isGitHubLinked: boolean;
}

/**
 * Temporary GitHub user data stored in cookies during OAuth flow
 * This data is only valid for a short time (5 minutes) during account setup
 */
export interface GitHubTempData {
    /** GitHub user's unique ID */
    id: number;
    /** GitHub username/login */
    login: string;
    /** URL to the user's GitHub avatar image */
    avatar_url: string;
    /** Display name from GitHub profile */
    name: string;
}

/**
 * Lightweight session utilities for Fresh/Deno authentication
 *
 * This class provides a simple session management system that uses HTTP-only cookies
 * to store user IDs and validate sessions against the database. It's designed to be
 * lightweight and secure without requiring a full session management framework.
 */
export const SessionUtils = {
    /**
     * Extract and validate user session from request cookies (gets user from db using user-id cookie)
     *
     * Checks for a valid user-id cookie and validates it against the database.
     * Returns session information including authentication status and GitHub linking status.
     *
     * @param req - The incoming HTTP request
     * @returns Promise resolving to the user's session state
     */
    getSession: async (req: Request): Promise<AuthSession> => {
        const cookies = getCookies(req.headers);
        const userID = cookies["user-id"];

        // No user cookie found - user is not authenticated
        if (!userID) {
            return {
                user: null,
                isAuthenticated: false,
                isGitHubLinked: false,
            };
        }

        // Validate the user ID against the database
        const db = await getDatabase();
        const user = await db.getUser(userID);

        // User ID cookie exists but user not found in database (invalid/expired session)
        if (!user) {
            return {
                user: null,
                isAuthenticated: false,
                isGitHubLinked: false,
            };
        }

        // Valid session found
        return {
            user,
            isAuthenticated: true,
            isGitHubLinked: !!user.githubId, // Check if GitHub ID exists (indicating linked account)
        };
    },

    /**
     * Create a new guest user session
     *
     * Generates a new guest user with a random name and saves them to the database.
     * This is used when users want to play without creating a full account.
     *
     * @returns Promise resolving to the newly created guest user
     */
    createGuestSession: async (): Promise<User> => {
        const newUserID = crypto.randomUUID();
        const newUser: User = {
            id: newUserID,
            name: `Player${Math.floor(Math.random() * 9000) + 1000}`, // Generate name like "Player1234"
        };

        const db = await getDatabase()
        await db.addUser(newUser);
        return newUser;
    },

    /**
     * Get GitHub temporary data from cookies
     *
     * During the OAuth flow, GitHub user data is temporarily stored in a secure cookie
     * for 5 minutes while the user decides how to link their account. This method
     * retrieves and parses that temporary data.
     *
     * @param req - The incoming HTTP request
     * @returns The GitHub user data if found and valid, null otherwise
     */
    getGitHubTempData: (req: Request): GitHubTempData | null => {
        const cookies = getCookies(req.headers);
        const githubTempData = cookies["github_temp_data"];

        console.log("Raw GitHub temp data from cookie:", githubTempData);

        if (!githubTempData) {
            console.log("No GitHub temp data found in cookies");
            return null;
        }

        try {
            // The data is URL-encoded JSON, so we need to decode then parse
            const decodedData = decodeURIComponent(githubTempData);
            console.log("Decoded GitHub data:", decodedData);

            const parsed = JSON.parse(decodedData);
            console.log("Parsed GitHub data:", parsed);

            return parsed;
        } catch (e) {
            console.error("Failed to parse GitHub temp data:", e);
            return null;
        }
    },

    /**
     * Require authentication - throws redirect response if not authenticated
     *
     * Use this in route handlers that require user authentication. If the user
     * is not authenticated, it will throw a Response object that redirects to
     * the home page, which Fresh will handle as a redirect.
     *
     * @param req - The incoming HTTP request
     * @returns Promise resolving to the authenticated user
     * @throws Response with redirect if not authenticated
     */
    requireAuth: async (req: Request): Promise<User> => {
        const session = await SessionUtils.getSession(req);

        if (!session.isAuthenticated || !session.user) {
            throw new Response("", {
                status: 307,
                headers: { Location: "/" },
            });
        }

        return session.user;
    },

    /**
     * Require authentication for API endpoints
     *
     * Similar to requireAuth but returns a 401 Unauthorized response instead
     * of a redirect, which is more appropriate for API endpoints.
     *
     * @param req - The incoming HTTP request
     * @returns Promise resolving to the authenticated user
     * @throws Response with 401 status if not authenticated
     */
    requireApiAuth: async (req: Request): Promise<User> => {
        const session = await SessionUtils.getSession(req);

        if (!session.isAuthenticated || !session.user) {
            throw new Response("Unauthorized", {
                status: 401,
                headers: { "Content-Type": "text/plain" },
            });
        }

        return session.user;
    }
}