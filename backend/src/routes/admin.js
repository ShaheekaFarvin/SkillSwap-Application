import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/stats", async (_req, res) => {
  const [[users]] = await pool.query("SELECT COUNT(*) AS count FROM users");
  const [[skills]] = await pool.query("SELECT COUNT(*) AS count FROM skills");
  const [[requests]] = await pool.query("SELECT COUNT(*) AS count FROM swap_requests WHERE status='PENDING'");
  const [[sessions]] = await pool.query("SELECT COUNT(*) AS count FROM sessions WHERE status='COMPLETED'");
  res.json({
    users: users.count,
    skills: skills.count,
    pending_requests: requests.count,
    completed_sessions: sessions.count
  });
});

router.get("/users", async (_req, res) => {
  const [rows] = await pool.query(
    "SELECT user_id,full_name,email,location,role FROM users ORDER BY user_id DESC"
  );
  res.json(rows);
});

router.post("/categories", async (req, res) => {
  const { category_name } = req.body;
  if (!category_name) return res.status(400).json({ message: "Category name is required." });
  await pool.query("INSERT INTO categories (category_name) VALUES (?)", [category_name]);
  res.status(201).json({ message: "Category created." });
});

router.post("/skills", async (req, res) => {
  const { skill_name, category_id } = req.body;
  if (!skill_name || !category_id) return res.status(400).json({ message: "Skill and category are required." });
  await pool.query("INSERT INTO skills (skill_name,category_id) VALUES (?,?)", [skill_name, category_id]);
  res.status(201).json({ message: "Skill created." });
});

export default router;
