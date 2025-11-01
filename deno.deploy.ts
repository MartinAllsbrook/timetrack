// Deno Deploy configuration
// This file ensures that the unstable KV API is available in production

export default {
  // Enable unstable features including KV
  unstable: ["kv"],
  
  // Entry point for your application
  entrypoint: "_fresh/server.js",
  
  // Environment variables (if needed)
  // env: {},
};