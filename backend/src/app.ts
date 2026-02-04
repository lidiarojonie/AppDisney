import express from "express";
import cors from "cors";
import type { Db } from "./db.js";
import { createMovieRouter } from "./movies/movies.routers.js";

export function createApp(db: Db) {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get("/health", (_req, res) => {
        res.json({ ok: true, world: "Disney" });
    });

    app.use("/api/movies", createMovieRouter(db));

    return app;
}