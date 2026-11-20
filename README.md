# SkillSage

## Introduction

SkillSage is a technical interview platform for colleges. Administrators can give a cohort a common set of questions while adapting the rest of each interview to the student’s résumé and earlier answers.

## Tech stack

| Area | Code and behavior |
| --- | --- |
| Client | [React and TypeScript client](frontend/src) with Vite, Ace and Recharts. The interview UI also handles fullscreen and visibility changes. |
| API and storage | [Express controllers](backend/src/controllers) and [Sequelize models](backend/src/models) persist interview definitions, individual attempts, exchanges and assessments in PostgreSQL. |
| Model calls | The [OpenAI helper](backend/src/Api-helper/helper.ts) selects `o3-mini`, requests structured JSON and retries unsuccessful calls up to three attempts. Successful responses record input and output tokens and an estimated cost by task. |
| Deployment | [Docker Compose](docker-compose.yaml) runs prebuilt client and API images and expects a separately configured database. [Kubernetes manifests](Kubernetes) describe deployments, services, frontend configuration and ingress. [AWS deployment material](deployment) includes an EC2 script and design recommendations. |

## Features

- **College administration.** Import a student roster, assign batches and control when interviews start or pause.
- **Interview practice.** Combine predefined, technical and coding questions. Students can type, dictate in supported browsers or submit code in the Ace editor.
- **Feedback.** Students can revisit marks and feedback on individual answers. Administrators can review results across a batch.

## The process

1. **Prepare the context.** The API extracts text from a Word résumé with Mammoth, summarizes it and saves the summary for the interview.
2. **Start an attempt.** The first predefined question opens the interview when one is configured. Otherwise, the model generates an opening question from the résumé, subject and topic.
3. **Evaluate and adapt.** The API stores each question and response, records marks and feedback, and uses the exchange history to generate follow-ups after the predefined set. Coding answers have a separate evaluation prompt.
4. **Summarize the attempt.** On submission, the service aggregates the marks and generates overall feedback for review.

### Team and testing

Four people developed SkillSage over roughly a year. Baba Gandhi Kandagatla and one teammate co-developed the backend. Two teammates focused on the frontend.

The team reports **200–300 concurrent interviews** during internal college use and a separate Playwright exercise involving approximately **1,500 simulated sessions**, with real model requests staggered across interview stages. The [browser scenarios](playwright) and [four-worker configuration](playwright.config.ts) illustrate interactions with the application. The checked-in last-run record reports a failure and contains no scale measurements.

## How it can be improved

- **Make the load test reproducible.** Publish a sample roster, session ramp-up schedule, request-latency percentiles and error rates alongside the Playwright scenarios. That would let readers compare a future run with the team-reported exercise.
- **Simplify deployment configuration.** Read the API address from one runtime setting and reserve the localhost address for development. This would let the same frontend build run against a local or hosted API.

## How to run

Use Node.js with npm, a dedicated PostgreSQL development database and an OpenAI key with access to the model configured in the helper. Startup uses Sequelize schema synchronization with `alter: true`.

1. Create `backend/.env`. Set `DATABASE_ONLINE=false`, then set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` and `DB_PASSWORD` for your database. Set `PORT=5000`, `COOKIE_NAME`, independent `COOKIE_SECRET` and `JWT_SECRET` values, and the server-side model key `O1_KEY`. Set `GOD_PASSWORD` for the platform administration flow. The hosted database path uses `DATABASE_ONLINE=true` and `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`.
2. Create `frontend/public/env.js` for local development with the following content. The client reads this object before assigning its localhost API URL. A remote deployment also needs to remove the localhost override in `frontend/src/App.tsx`.

   ```js
   window.env = { API_URL: "http://localhost:5000/api/v1" };
   ```

3. Start the API from the repository root.

   ```sh
   cd backend
   npm ci
   npm run build
   node dist/index.js
   ```

4. From the repository root in a second terminal, start the client.

   ```sh
   cd frontend
   npm ci
   npm run dev
   ```

   Open `http://localhost:5173` and sign in with a development college account or sample student account.

## Screenshots

![A sample Java interview with a question, response field and code entry.](docs/images/interview-workspace.jpg)

The student workspace shows a Java interview question, a text response field and the option to add code.
