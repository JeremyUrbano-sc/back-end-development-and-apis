import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { authenticate } from "./middleware/authenticate.js";
import { authorizeModification } from "./middleware/authorize.js";
import {
  findByUsername,
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie,
} from "./utils/db.js";

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "secret";

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const user = findByUsername(username);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" },
  );

  return res.status(200).json({ token });
});

app.use("/api/watchlist", authenticate);

app.get("/api/watchlist/:userId", (req, res) => {
  const watchlist = getWatchlist(Number(req.params.userId));
  if (watchlist === null) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.status(200).json(watchlist);
});

app.post("/api/watchlist/:userId/movies", authorizeModification, (req, res) => {
  const movie = addMovie(Number(req.params.userId), req.body || {});
  if (movie === null) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.status(201).json(movie);
});

app.put(
  "/api/watchlist/:userId/movies/:movieId",
  authorizeModification,
  (req, res) => {
    const updated = updateMovie(
      Number(req.params.userId),
      Number(req.params.movieId),
      req.body || {},
    );
    if (updated === null) {
      return res.status(404).json({ error: "Movie not found" });
    }
    return res.status(200).json(updated);
  },
);

app.delete(
  "/api/watchlist/:userId/movies/:movieId",
  authorizeModification,
  (req, res) => {
    const removed = deleteMovie(
      Number(req.params.userId),
      Number(req.params.movieId),
    );
    if (removed === null) {
      return res.status(404).json({ error: "Movie not found" });
    }
    return res.status(200).json({ message: "Movie removed" });
  },
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
