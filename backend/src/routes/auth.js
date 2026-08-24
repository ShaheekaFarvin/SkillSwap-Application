import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = Router();

function tokenFor(user) {
  return jwt.sign(
    { user_id: user.user_id, email: user.email, role: user.role, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password, phone = "", bio = "", location = "" } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }
    const [existing] = await pool.query("SELECT user_id FROM users WHERE email = ?", [email]);
    if (existing.length) return res.status(409).json({ message: "Email is already registered." });

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      `INSERT INTO users (full_name,email,password,phone,bio,location,role)
       VALUES (?,?,?,?,?,?, 'USER')`,
      [full_name, email, hash, phone, bio, location]
    );
    const user = { user_id: result.insertId, full_name, email, role: "USER" };
    res.status(201).json({ token: tokenFor(user), user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Registration failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(401).json({ message: "Invalid email or password." });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid email or password." });

    res.json({
      token: tokenFor(user),
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        location: user.location
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Login failed." });
  }
});

export default router;
