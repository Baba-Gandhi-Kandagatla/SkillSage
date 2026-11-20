# SkillSage

SkillSage lets a college run the same core interview across a batch while giving each student follow-up questions based on their résumé and answers. Administrators control the question mix and interview window. Students can revisit their responses, marks and feedback after submission.

![A sample Java interview with a question, response field and code entry.](docs/images/interview-workspace.jpg)

## From roster to feedback

1. College administrators import a roster, assign batches and configure interviews with predefined questions and counts for technical and coding questions. They start or pause an interview manually.
2. A student uploads a Word résumé. The API extracts text with Mammoth and saves a short summary as context. An attempt starts with the first predefined question when one is configured, or with a generated opening question.
3. The API stores each exchange and evaluates the answer. After the predefined set, it uses the résumé, subject, topic and exchange history to request the next technical or coding question. The React client supports typed answers, dictation through `react-speech-recognition` in compatible browsers, and code entry with Ace.
4. After submission, the student can review question-level and overall feedback. Administrators can inspect interview results across the batch.

## Implementation

| Area | Code and behavior |
| --- | --- |
| Client | [React and TypeScript client](frontend/src) with Vite, Ace and Recharts. The interview UI also handles fullscreen and visibility changes. |
| API and storage | [Express controllers](backend/src/controllers) and [Sequelize models](backend/src/models) persist interview definitions, individual attempts, exchanges and assessments in PostgreSQL. |
| Model calls | The [OpenAI helper](backend/src/Api-helper/helper.ts) selects `o3-mini`, requests structured JSON and retries unsuccessful calls up to three attempts. Successful responses record input and output tokens and an estimated cost by task. |
| Deployment | [Docker Compose](docker-compose.yaml) runs prebuilt client and API images and expects a separately configured database. [Kubernetes manifests](Kubernetes) describe deployments, services, frontend configuration and ingress. [AWS deployment material](deployment) includes an EC2 script and design recommendations. |

## Local development

Use Node.js with npm, a dedicated PostgreSQL development database and an OpenAI key with access to the model configured in the helper. Startup uses Sequelize schema synchronization with `alter: true`.

1. Create `backend/.env`. Set `DATABASE_ONLINE=false`, then set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` and `DB_PASSWORD` for your database. Set `PORT=5000`, `COOKIE_NAME`, independent `COOKIE_SECRET` and `JWT_SECRET` values, and the server-side model key `O1_KEY`. Set `GOD_PASSWORD` for the platform administration flow. The hosted database path uses `DATABASE_ONLINE=true` and `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`.
2. Create `frontend/public/env.js` for local development with the following content. The client reads this object before assigning its localhost API URL. A remote deployment also needs to remove the localhost override in `frontend/src/App.tsx`.

   ```js
   window.env = { API_URL: "http://localhost:5000/api/v1" };
   ```

3. From `backend/`, run `npm ci`, `npm run build` and `node dist/index.js`. From `frontend/` in another terminal, run `npm ci` and `npm run dev`. Open `http://localhost:5173` and use a development college and sample accounts.

## Team, usage and tests

Four people developed SkillSage over roughly a year. Baba Gandhi Kandagatla and one teammate co-developed the backend. Two teammates focused on the frontend.

The team reports **200–300 concurrent interviews** during internal college use and a separate Playwright exercise involving approximately **1,500 simulated sessions**, with real model requests staggered across interview stages. The [browser scenarios](playwright) and [four-worker configuration](playwright.config.ts) illustrate interactions with the application. The checked-in last-run record reports a failure and contains no scale measurements. Reproducing the larger exercise would require a sanitized test dataset, the ramp-up schedule and measured latency and error rates.
