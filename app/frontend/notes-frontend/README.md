# CloudForge Notes — Frontend

The CloudForge Notes frontend is built with React and Vite.

## Requirements

- Node.js 24
- npm

## Development

Install dependencies:

    npm ci

Start the Vite development server:

    npm run dev

Vite displays the local URL in the terminal (typically http://localhost:5173).

## Tests

Run the frontend tests:

    npm test

Run tests in watch mode:

    npm run test:watch

## Production build

Create an optimized production build:

    npm run build

The generated files are written to the build/ directory.

Preview the production build:

    npm run preview

## API configuration

Set VITE_API_URL when building if an explicit API base URL is required.
When empty, the application uses relative API paths such as /api/notes/.
