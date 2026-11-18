const express = require("express");
const db = require("../config/database");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT t.*, b.title AS current_book_title, u.name AS current_member_name
       FROM transactions t
       LEFT JOIN books b ON b.id=t.book_id
       LEFT JOIN users u ON u.id=t.user_id
       ORDER BY t.created_at DESC, t.id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load transaction history." });
  }
});

// All stock changes are handled in one SQL transaction so stock and history stay consistent.
router.post("/", requireAdmin, async (req, res) => {
  const { book_id, user_id = null, transaction_type, quantity, notes = "" } = req.body;
  const qty = Number(quantity);
  if (!Number.isInteger(Number(book_id)) || !Number.isInteger(qty) || qty <= 0 ||
      !["borrow", "return", "restock"].includes(transaction_type)) {
    return res.status(400).json({ message: "Choose a book, a valid transaction type and a positive whole-number quantity." });
  }
  if (transaction_type === "borrow" && !user_id) {
    return res.status(400).json({ message: "Select the member borrowing the book." });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [bookRows] = await connection.execute(
      "SELECT id, title, quantity FROM books WHERE id=? FOR UPDATE", [book_id]
    );
    if (!bookRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Book not found." });
    }
    const book = bookRows[0];

    let memberName = null;
    if (user_id) {
      const [userRows] = await connection.execute(
        "SELECT id, name FROM users WHERE id=?", [user_id]
      );
      if (!userRows.length) {
        await connection.rollback();
        return res.status(404).json({ message: "Member not found." });
      }
      memberName = userRows[0].name;
    }

    let newQuantity = book.quantity;
    if (transaction_type === "borrow") {
      if (book.quantity < qty) {
        await connection.rollback();
        return res.status(400).json({ message: `Only ${book.quantity} copy/copies are available.` });
      }
      newQuantity -= qty;
    } else {
      newQuantity += qty;
    }

    await connection.execute("UPDATE books SET quantity=? WHERE id=?", [newQuantity, book_id]);
    const [result] = await connection.execute(
      `INSERT INTO transactions
       (book_id, user_id, book_title, member_name, transaction_type, quantity, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [book_id, user_id || null, book.title, memberName, transaction_type, qty, String(notes).slice(0, 500)]
    );

    await connection.commit();
    res.status(201).json({
      id: result.insertId, book_id: Number(book_id), book_title: book.title,
      member_name: memberName, transaction_type, quantity: qty, notes,
      new_stock: newQuantity
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Transaction could not be completed." });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
