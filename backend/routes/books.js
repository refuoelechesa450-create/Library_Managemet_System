const express = require("express");
const db = require("../config/database");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM books ORDER BY title ASC");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load books." });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    const qty = Number(quantity);
    if (![title, author, genre, isbn].every(v => String(v || "").trim()) ||
        !Number.isInteger(qty) || qty < 0) {
      return res.status(400).json({ message: "Enter all book details and a whole-number quantity of zero or more." });
    }

    const [result] = await db.execute(
      "INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)",
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), qty]
    );
    const [rows] = await db.execute("SELECT * FROM books WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "That ISBN is already registered." });
    console.error(error);
    res.status(500).json({ message: "Could not add the book." });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { title, author, genre, isbn, quantity } = req.body;
    const qty = Number(quantity);
    if (![title, author, genre, isbn].every(v => String(v || "").trim()) ||
        !Number.isInteger(qty) || qty < 0) {
      return res.status(400).json({ message: "Enter all book details and a whole-number quantity of zero or more." });
    }

    const [result] = await db.execute(
      "UPDATE books SET title=?, author=?, genre=?, isbn=?, quantity=? WHERE id=?",
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), qty, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Book not found." });
    const [rows] = await db.execute("SELECT * FROM books WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "That ISBN belongs to another book." });
    console.error(error);
    res.status(500).json({ message: "Could not update the book." });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM books WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Book not found." });
    res.json({ message: "Book deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete the book." });
  }
});

module.exports = router;
