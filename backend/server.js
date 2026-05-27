import express from "express";
import cors from "cors";
import { watchRouter } from "./routes/watch.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

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