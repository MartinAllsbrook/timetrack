# Time Track

A time tracking application that helps you monitor how you spend your time.

**Features:**
- Tracks how long you do something
- Persistent data storage so you don't loose your stuff when you refresh the page
- Projects buckets so you can group your entries
<!-- - Responsive design should work on all devices -->

## Usage

Try it live at: **https://timetrack.martinallsbrook.deno.net/**, or build and run the project yourself following the tutorial below.

## Tech Stack

- **[Deno](https://deno.land/)** - JavaScript/TypeScript runtime
- **[Fresh](https://fresh.deno.dev/)** - The Next.js clone by Deno
- **[Preact](https://preactjs.com/)** - Fast 3kB alternative to React, comes with Signals which I like
- **[Tailwind CSS](https://tailwindcss.com/)** - Anti-pattern CSS framework
- **[Vite](https://vitejs.dev/)** - Build tool with HMR
- **[Deno KV](https://deno.com/kv)** - Database that comes with deno


**Why this stack?**
- **Deno** - Insanely easy to setup with Deno and Fresh
<!-- - **Zero configuration** - No complex build tools or bundler setup required
- **TypeScript-first** - Full type safety out of the box
- **Edge-ready** - Deploys instantly to Deno Deploy's global edge network
- **Lightweight** - Minimal bundle size for blazing-fast loading times -->

## Build

### Prerequisites
- Install [Deno](https://deno.land/) (I'm using 2.5.3 as of writing this, you could probably use the latest version unless I haven't updated it in a while)

### Steps
1. Clone this repository:
   ```bash
   git clone https://github.com/MartinAllsbrook/timetrack.git
   cd timetrack
   ```

2. Start the development server:
   ```bash
   deno task start
   ```

3. Open your browser and navigate to `http://127.0.0.1:5173/`, or whatever URL Vite gives u

That's it! The application will be running locally with hot reload enabled for development.

### Optional: Production Build
To run in production mode:
```bash
deno task build
deno task preview
```