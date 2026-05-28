import express from "express";
import cors from "cors";

import { watchRouter } from "./routes/watch.routes.js";
import { episodesRouter } from "./routes/episodes.routes.js";
import { animesRouter } from "./routes/animes.routes.js";

const app = express();

app.use(cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));

app.options(/.*/, cors());

app.use(express.json());

app.use("/api", episodesRouter);
app.use("/api", animesRouter);
app.use("/api", watchRouter);

app.get("/", (req, res) => {
    res.send("API running");
});

process.on("uncaughtException", (err) => {
    console.error("💥 UNCAUGHT:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("💥 PROMISE ERROR:", err);
});

app.listen(3000, () => {
    console.log("Server running http://localhost:3000");
});