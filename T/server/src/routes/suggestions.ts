import { Router } from "express";
import { z } from "zod";
import { suggestAchievementPhrasing, suggestProfessionalSummary } from "../suggestions.js";

const router = Router();

router.post("/achievement", (req, res) => {
  const parsed = z.object({ text: z.string().min(1).max(4000) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const suggestion = suggestAchievementPhrasing(parsed.data.text);
  res.json({ suggestion, model: "rule-based-demo" });
});

router.post("/summary", (req, res) => {
  const parsed = z.object({ text: z.string().max(4000) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const suggestion = suggestProfessionalSummary(parsed.data.text);
  res.json({ suggestion, model: "rule-based-demo" });
});

export default router;
