import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT user_id,full_name,email,phone,bio,location,role FROM users WHERE user_id=?`,
    [req.user.user_id]
  );
  res.json(rows[0]);
});

router.put("/me", requireAuth, async (req, res) => {
  const { full_name, phone = "", bio = "", location = "" } = req.body;
  if (!full_name) return res.status(400).json({ message: "Name is required." });
  await pool.query(
    "UPDATE users SET full_name=?,phone=?,bio=?,location=? WHERE user_id=?",
    [full_name, phone, bio, location, req.user.user_id]
  );
  res.json({ message: "Profile updated." });
});

router.get("/search", requireAuth, async (req, res) => {
  const q = `%${String(req.query.q || "").trim()}%`;
  const [rows] = await pool.query(
    `SELECT u.user_id,u.full_name,u.location,u.bio,
            GROUP_CONCAT(DISTINCT s.skill_name ORDER BY s.skill_name SEPARATOR ', ') AS skills
     FROM users u
     LEFT JOIN user_skills us ON us.user_id=u.user_id
     LEFT JOIN skills s ON s.skill_id=us.skill_id
     WHERE u.full_name LIKE ? OR u.location LIKE ?
     GROUP BY u.user_id
     ORDER BY u.full_name`,
    [q, q]
  );
  res.json(rows);
});

export default router;
