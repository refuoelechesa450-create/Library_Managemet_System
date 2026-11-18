require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./config/database");

async function seed() {
  try {
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email=?", ["admin@library.local"]
    );
    if (existing.length) {
      console.log("Administrator account already exists; no changes made.");
      return;
    }

    const hash = await bcrypt.hash("Admin123!", 10);
    await db.execute(
      `INSERT INTO users (name, email, membership_id, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      ["Library Administrator", "admin@library.local", "ADMIN-001", hash, "admin"]
    );
    console.log("Demo administrator created: admin@library.local / Admin123!");
    console.log("Change this password after signing in.");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}
seed();
