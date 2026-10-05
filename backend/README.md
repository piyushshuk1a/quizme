# QuizMe Backend

This is the backend for the QuizMe application, built using **Express.js**. It provides APIs for managing quizzes, users, and other related functionalities.

## Table of Contents

- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)

---

## Getting Started

Follow these instructions to set up and run the QuizMe backend on your local machine for development and testing purposes.

---

## Prerequisites

Ensure you have the following installed:

- **Node.js** (v22, use .nvmrc for exact version)
- **npm** (Node Package Manager)

---

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd quizme
   ```

2. Install dependencies

   ```bash
   npm install
   ```

---

## Running the Application

### Development Mode

To run the application in development mode with hot-reloading:

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

---

## Scripts

The following scripts are available in the package.json:

`dev`: Runs the application in development mode with hot-reloading.

`start`: Starts the application in production mode.

`build`: Compiles the TypeScript code into JavaScript.

`type-check`: Checks for TypeScript type errors without emitting files.

`lint`: Runs ESLint to check for code quality issues.

`lint:fix`: Fixes linting issues automatically.

`format`: Formats the code using Prettier.

`format:check`: Checks if the code is formatted correctly.

---

## Environment Variables

The application uses environment variables for configuration. Create a .env file in the root directory and define the following variables:

You can use the .env.example file as a reference.

## AI quiz generation

Set `OPENAI_API_KEY` in the **backend** environment and restart the backend.
`OPENAI_MODEL` defaults to `gpt-4o-mini`; an override must support the Responses API
and strict JSON Schema output. Never put the key in a `VITE_` variable or commit it.
An empty key leaves manual quiz creation available and returns a helpful 503 from AI generation.

Signed-in users can open **Create New Quiz → AI Generation**, enter a prompt,
choose 1–20 questions and a difficulty, then select **Generate Quiz**. Questions,
choices, and correct answers populate the existing editor. Existing work is replaced
only after confirmation; users review/edit and explicitly save or publish the result.
The existing **AI-Powered Quiz** button opens this tab directly.

`POST /api/quizzes/generate` accepts `{ "prompt": "Photosynthesis for class 8", "questionCount": 5, "complexity": "Medium" }`.
The endpoint authenticates the user, validates input/output, limits output size, and
times out after 60 seconds. It returns an unsaved draft; no database write occurs.
Requests send the prompt to OpenAI with `store: false`. Answers still need human review.
See [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

The bundled limit is five requests per minute and one in-flight request per user,
per backend process. Multi-instance deployments should enforce a shared limit at
the gateway and configure provider spending limits. Provider failures do not expose
API keys or raw provider messages.

Run `npm test`, `npm run build`, and `npm run lint` in `backend`.
Run `npm test`, `npm run build`, and `npm run lint` in `frontend`.
