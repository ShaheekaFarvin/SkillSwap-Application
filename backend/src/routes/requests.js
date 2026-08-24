import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/learning", requireAuth, async (req, res) => {
  const { skill_id, description = "" } = req.body;
  if (!skill_id) return res.status(400).json({ message: "Skill is required." });
  await pool.query(
    `INSERT INTO learning_requests (user_id,skill_id,description,status)
     VALUES (?,?,?,'ACTIVE')`,
    [req.user.user_id, skill_id, description]
  );
  res.status(201).json({ message: "Learning request created." });
});

router.get("/learning/mine", requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT lr.*,s.skill_name FROM learning_requests lr
     JOIN skills s ON s.skill_id=lr.skill_id
     WHERE lr.user_id=? ORDER BY lr.learning_req_id DESC`,
    [req.user.user_id]
  );
  res.json(rows);
});

router.post("/swap", requireAuth, async (req, res) => {
  const { receiver_id, offered_skill_id, requested_skill_id, message = "" } = req.body;
  if (!receiver_id || !offered_skill_id || !requested_skill_id)
    return res.status(400).json({ message: "Receiver and both skills are required." });
  if (Number(receiver_id) === Number(req.user.user_id))
    return res.status(400).json({ message: "You cannot send a request to yourself." });

  await pool.query(
    `INSERT INTO swap_requests
     (requester_id,receiver_id,offered_skill_id,requested_skill_id,message,status)
     VALUES (?,?,?,?,?,'PENDING')`,
    [req.user.user_id, receiver_id, offered_skill_id, requested_skill_id, message]
  );
  res.status(201).json({ message: "Swap request sent." });
});

router.get("/swap", requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT sr.*,
      requester.full_name AS requester_name,
      receiver.full_name AS receiver_name,
      os.skill_name AS offered_skill,
      rs.skill_name AS requested_skill
     FROM swap_requests sr
     JOIN users requester ON requester.user_id=sr.requester_id
     JOIN users receiver ON receiver.user_id=sr.receiver_id
     JOIN skills os ON os.skill_id=sr.offered_skill_id
     JOIN skills rs ON rs.skill_id=sr.requested_skill_id
     WHERE sr.requester_id=? OR sr.receiver_id=?
     ORDER BY sr.request_date DESC`,
    [req.user.user_id, req.user.user_id]
  );
  res.json(rows);
});

router.patch("/swap/:id", requireAuth, async (req, res) => {
  const { status } = req.body;
  if (!["ACCEPTED","REJECTED","CANCELLED"].includes(status))
    return res.status(400).json({ message: "Invalid status." });

  const [rows] = await pool.query(
    "SELECT * FROM swap_requests WHERE swap_request_id=? AND receiver_id=?",
    [req.params.id, req.user.user_id]
  );
  if (!rows.length) return res.status(404).json({ message: "Request not found." });

  await pool.query(
    "UPDATE swap_requests SET status=? WHERE swap_request_id=?",
    [status, req.params.id]
  );
  res.json({ message: `Request ${status.toLowerCase()}.` });
});

router.post("/sessions", requireAuth, async (req, res) => {
  const { swap_request_id, session_date, start_time, duration_minutes, notes = "" } = req.body;
  const [rows] = await pool.query(
    `SELECT * FROM swap_requests WHERE swap_request_id=?
     AND (requester_id=? OR receiver_id=?) AND status='ACCEPTED'`,
    [swap_request_id, req.user.user_id, req.user.user_id]
  );
  if (!rows.length) return res.status(400).json({ message: "An accepted swap request is required." });

  await pool.query(
    `INSERT INTO sessions
     (swap_request_id,session_date,start_time,duration_minutes,status,notes)
     VALUES (?,?,?,?, 'SCHEDULED', ?)`,
    [swap_request_id, session_date, start_time, duration_minutes, notes]
  );
  res.status(201).json({ message: "Session scheduled." });
});

router.get("/sessions", requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT se.*,sr.requester_id,sr.receiver_id,
      a.full_name AS requester_name,b.full_name AS receiver_name,
      os.skill_name AS offered_skill,rs.skill_name AS requested_skill
     FROM sessions se
     JOIN swap_requests sr ON sr.swap_request_id=se.swap_request_id
     JOIN users a ON a.user_id=sr.requester_id
     JOIN users b ON b.user_id=sr.receiver_id
     JOIN skills os ON os.skill_id=sr.offered_skill_id
     JOIN skills rs ON rs.skill_id=sr.requested_skill_id
     WHERE sr.requester_id=? OR sr.receiver_id=?
     ORDER BY se.session_date,se.start_time`,
    [req.user.user_id, req.user.user_id]
  );
  res.json(rows);
});

router.patch("/sessions/:id", requireAuth, async (req, res) => {
  const { status } = req.body;
  if (!["COMPLETED","CANCELLED"].includes(status))
    return res.status(400).json({ message: "Invalid session status." });

  const [rows] = await pool.query(
    `SELECT se.session_id FROM sessions se
     JOIN swap_requests sr ON sr.swap_request_id=se.swap_request_id
     WHERE se.session_id=? AND (sr.requester_id=? OR sr.receiver_id=?)`,
    [req.params.id, req.user.user_id, req.user.user_id]
  );
  if (!rows.length) return res.status(404).json({ message: "Session not found." });

  await pool.query("UPDATE sessions SET status=? WHERE session_id=?", [status, req.params.id]);
  res.json({ message: "Session updated." });
});

router.post("/reviews", requireAuth, async (req, res) => {
  const { session_id, rating, comment = "" } = req.body;
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5)
    return res.status(400).json({ message: "Rating must be between 1 and 5." });

  const [rows] = await pool.query(
    `SELECT se.session_id FROM sessions se
     JOIN swap_requests sr ON sr.swap_request_id=se.swap_request_id
     WHERE se.session_id=? AND se.status='COMPLETED'
     AND (sr.requester_id=? OR sr.receiver_id=?)`,
    [session_id, req.user.user_id, req.user.user_id]
  );
  if (!rows.length) return res.status(400).json({ message: "A completed session is required." });

  await pool.query(
    "INSERT INTO reviews (session_id,reviewer_id,rating,comment) VALUES (?,?,?,?)",
    [session_id, req.user.user_id, rating, comment]
  );
  res.status(201).json({ message: "Review submitted." });
});

export default router;
