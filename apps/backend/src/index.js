import express from "express";
import { createLogger, EVENTS, VERSION } from "@monorepo/shared";

import { db } from "./services/db.js";

const app = express();
const logger = createLogger('Backend');
app.use(express.json());

// API First: Define the profile contract/data
// const MOCK_PROFILE = {
//     name: "Samuel Soita",
//     title: "Software Engineer",
//     version: VERSION,
//     socials: {
//         github: "samuelsoita809",
//         linkedin: "samuel-soita"
//     }
// };

app.get("/api/v1/health", (req, res) => {
    logger.trackEvent(EVENTS.REQUEST_RECEIVED, { path: '/api/v1/health' });
    res.status(200).json({ status: "ok", version: VERSION });
});

app.get("/api/v1/profile", async (req, res) => {
    const profile = await db.getProfile();
    logger.trackEvent(EVENTS.REQUEST_SUCCESS, { path: '/api/v1/profile' });
    res.status(200).json(profile);
});

if (import.meta.url === `file://${process.argv[1]}` || process.env.NODE_ENV === 'production') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => logger.info(`Backend running on port ${PORT}`));
}

export default app;
