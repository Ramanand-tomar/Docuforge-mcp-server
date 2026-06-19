# DocuForge Dashboard

A sleek, modern web interface for managing and interacting with your DocuForge documents. Built with **React** and **Vite**, this dashboard connects seamlessly to the DocuForge REST API.

## Features

- **Document Management**: Create, view, edit, and organize your documents in a clean user interface.
- **AI Integration**: Interface directly with the DocuForge AI service to rewrite and improve your text.
- **Instant Preview**: View the formatted versions of your academic papers before exporting.
- **One-Click Export**: Trigger cloud PDF compilation and receive a download link instantly.

## Getting Started

From the root of the monorepo:

```bash
pnpm install
pnpm -r run build
cd packages/dashboard

# Start the development server
pnpm run dev
```

## Configuration

The dashboard expects the DocuForge REST API to be running locally or in the cloud. You can configure the API endpoint in your `.env` file (if you are running it separately), but by default, it will look for the API on `http://localhost:3000`.
