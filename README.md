# Federal Permit Management Portal

A modern federal government permit management portal proof-of-concept that integrates with DocuSign Maestro to automate interagency review workflows.

## Overview

This application demonstrates how federal agencies can streamline permit application processing through automated document workflows. It features a government-style UI (inspired by USWDS) and real DocuSign Maestro integration for routing permits through multi-agency review processes.

## Features

- **Dashboard** - Overview of all permits with status tracking
- **Intake Portal** - Upload and submit new permit applications with automated data extraction
- **Agency Review** - Track permit progress through interagency review workflow
- **Archive** - View all DocuSign API requests/responses for troubleshooting
- **Settings** - Configure DocuSign Maestro credentials and quick links

## DocuSign Maestro Integration

The application integrates with DocuSign Maestro to trigger automated workflows when permits are submitted. The integration:

- Sends permit data (applicant, project name, participating agencies) to Maestro
- Supports graceful fallback to simulation mode when credentials aren't configured
- Logs all API requests/responses for debugging in the Archive page

### Maestro Variables

The workflow expects these variables:
- `Submitter Email` (Email) - Participant who receives signing requests
- `originating_applicant` (Text) - The entity submitting the permit
- `project_name` (Text) - Name of the project
- `participating_agencies` (Array) - List of agencies for routing (e.g., DOT, EPA, CEQ)

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Styling**: USWDS-inspired government design system

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - `DOCUSIGN_ACCESS_TOKEN` - Your DocuSign access token
   - `DOCUSIGN_ACCOUNT_ID` - Your DocuSign account ID
   - `DOCUSIGN_WORKFLOW_ID` - Your Maestro workflow ID
4. Run the development server: `npm run dev`
5. Open http://localhost:5000

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DOCUSIGN_ACCESS_TOKEN` | OAuth access token from DocuSign |
| `DOCUSIGN_ACCOUNT_ID` | Your DocuSign account ID |
| `DOCUSIGN_WORKFLOW_ID` | Maestro workflow definition ID |

## Demo Mode

If DocuSign credentials are not configured, the application runs in simulation mode, allowing you to explore all features without a live API connection.

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and helpers
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # In-memory data storage
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Data models
└── README.md
```

## License

This is a proof-of-concept demonstration project.
