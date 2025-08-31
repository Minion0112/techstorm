# GEMINI.md

## Project Overview

This is a Next.js application that allows users to create and join teams. It uses Supabase for authentication and database storage, and Tailwind CSS for styling. The application has a "Matrix-style" theme.

The main features of the application are:

*   User authentication with Google
*   User profiles
*   Team creation and management
*   Real-time updates using Supabase subscriptions

## Building and Running

To build and run the project, you need to have Node.js and npm installed.

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Set up environment variables:**

    Create a `.env.local` file in the root of the project and add the following environment variables:

    ```
    NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.

4.  **Run the production build:**

    ```bash
    npm run build
    ```

5.  **Start the production server:**

    ```bash
    npm run start
    ```

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. The configuration is in `tailwind.config.js`.
*   **Components:** Reusable components are located in the `components` directory.
*   **Supabase:** The Supabase client is initialized in `lib/supabase/browser-client.ts` and `lib/supabase/server-client.ts`.
*   **Authentication:** Authentication is handled by Supabase. The authentication flow is implemented in the `app/auth` directory.
*   **Middleware:** The `middleware.ts` file refreshes the user's session on every request.
