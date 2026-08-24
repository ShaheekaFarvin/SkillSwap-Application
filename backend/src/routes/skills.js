import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const q = `%${String(req.query.q || "").trim()}%`;
    const category = req.query.category || null;
    const [rows] = await pool.query(
      `SELECT s.skill_id, s.skill_name, c.category_id, c.category_name,
              COUNT(DISTINCT us.user_id) AS teacher_count
       FROM skills s
       JOIN categories c ON c.category_id = s.category_id
       LEFT JOIN user_skills us ON us.skill_id = s.skill_id
       WHERE s.skill_name LIKE ? AND (? IS NULL OR c.category_id = ?)
       GROUP BY s.skill_id
       ORDER BY s.skill_name`,
      [q, category, category]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not load skills." });
  }
});

router.get("/categories", async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM categories ORDER BY category_name");
  res.json(rows);
});

router.get("/:id/teachers", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.full_name, u.location, u.bio,
              s.skill_name, us.proficiency_level, us.years_experience,
              COALESCE(AVG(r.rating),0) AS rating
       FROM user_skills us
       JOIN users u ON u.user_id = us.user_id
       JOIN skills s ON s.skill_id = us.skill_id
       LEFT JOIN reviews r ON r.reviewer_id <> u.user_id
       WHERE us.skill_id = ?
       GROUP BY u.user_id, s.skill_id
       ORDER BY rating DESC, u.full_name`,
      [req.params.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Could not load teachers." });
  }
});

router.post("/mine", requireAuth, async (req, res) => {
  try {
    const { skill_id, proficiency_level, years_experience = 0 } = req.body;
    await pool.query(
      `INSERT INTO user_skills (user_id,skill_id,proficiency_level,years_experience)
       VALUES (?,?,?,?)`,
      [req.user.user_id, skill_id, proficiency_level, years_experience]
    );
    res.status(201).json({ message: "Skill added." });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "You already added this skill." });
    console.error(e);
    res.status(500).json({ message: "Could not add skill." });
  }
});

router.get("/mine/list", requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT us.*, s.skill_name, c.category_name
     FROM user_skills us
     JOIN skills s ON s.skill_id=us.skill_id
     JOIN categories c ON c.category_id=s.category_id
     WHERE us.user_id=? ORDER BY s.skill_name`,
    [req.user.user_id]
  );
  res.json(rows);
});

router.delete("/mine/:id", requireAuth, async (req, res) => {
  await pool.query("DELETE FROM user_skills WHERE user_skill_id=? AND user_id=?", [
    req.params.id, req.user.user_id
  ]);
  res.json({ message: "Skill removed." });
});

export default router;
