require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/database");
const { requireAuth } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Create backend/.env using .env.example.");
  process.exit(1);
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api", requireAuth);
app.use("/api/books", require("./routes/books"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/users", require("./routes/users"));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Library API listening on port " + PORT);
});
