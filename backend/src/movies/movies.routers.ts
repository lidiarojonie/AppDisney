import { Router, Request, Response } from "express";
import type { Db } from "../db.js";

export function createMovieRouter(db: Db) {
    const r = Router();

    // Obtener todas las películas
    r.get("/", (_req: Request, res: Response) => {
        db.all(
            "SELECT DISTINCT * FROM movies ORDER BY title ASC",
            [],
            (err: any, rows: any[]) => {
                if (err) {
                    res.status(500).json({ ok: false, error: "database_error" });
                    return;
                }
                res.json({ ok: true, movies: rows });
            },
        );
    });

    // RUTA DINÁMICA
    r.get("/:genreName", (req: Request, res: Response) => {
        const genreName = req.params.genreName;
        db.all(
            "SELECT DISTINCT * FROM movies WHERE genre_id = ? ORDER BY title ASC",
            [genreName],
            (err: any, rows: any[]) => {
                if (err) {
                    res.status(500).json({ ok: false, error: "database_error" });
                    return;
                }
                res.json({ ok: true, movies: rows });
            },
        );
    });

    return r;
}