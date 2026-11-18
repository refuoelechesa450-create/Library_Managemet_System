const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/database");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, email, membership_id, role, created_at FROM users ORDER BY name"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load users." });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, email, membership_id, password, role = "member" } = req.body;
    if (![name, email, membership_id, password].every(v => String(v || "").trim()) ||
        !["admin", "member"].includes(role) || String(password).length < 8) {
      return res.status(400).json({ message: "Provide name, email, membership ID, a password of at least 8 characters, and a valid role." });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      "INSERT INTO users (name, email, membership_id, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), membership_id.trim(), hash, role]
    );
    res.status(201).json({
      id: result.insertId, name: name.trim(), email: email.trim().toLowerCase(),
      membership_id: membership_id.trim(), role
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Email or membership ID is already in use." });
    console.error(error);
    res.status(500).json({ message: "Could not add user." });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { name, email, membership_id, role, password } = req.body;
    if (![name, email, membership_id].every(v => String(v || "").trim()) ||
        !["admin", "member"].includes(role) ||
        (password && String(password).length < 8)) {
      return res.status(400).json({ message: "Check the user details, role and optional password (minimum 8 characters)." });
    }

    let query = "UPDATE users SET name=?, email=?, membership_id=?, role=?";
    const values = [name.trim(), email.trim().toLowerCase(), membership_id.trim(), role];
    if (password) {
      query += ", password_hash=?";
      values.push(await bcrypt.hash(password, 10));
    }
    query += " WHERE id=?";
    values.push(req.params.id);

    const [result] = await db.execute(query, values);
    if (!result.affectedRows) return res.status(404).json({ message: "User not found." });
    const [rows] = await db.execute(
      "SELECT id, name, email, membership_id, role, created_at FROM users WHERE id=?",
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Email or membership ID is already in use." });
    console.error(error);
    res.status(500).json({ message: "Could not update user." });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  if (Number(req.params.id) === Number(req.user.id)) {
    return res.status(400).json({ message: "You cannot delete the account you are currently using." });
  }
  try {
    const [result] = await db.execute("DELETE FROM users WHERE id=?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete user." });
  }
});

module.exports = router;
