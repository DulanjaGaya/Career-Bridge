import type { Task } from "@prisma/client";

const weights: Record<string, number> = {
  RESUME: 25,
  INTERNSHIP: 35,
  INTERVIEW: 30,
  GENERAL: 10,
};

export function computeReadinessScore(tasks: Task[]): {
  score: number;
  breakdown: { category: string; completed: number; total: number; contribution: number }[];
} {
  const byCat = new Map<string, Task[]>();
  for (const t of tasks) {
    const list = byCat.get(t.category) ?? [];
    list.push(t);
    byCat.set(t.category, list);
  }

  const breakdown: {
    category: string;
    completed: number;
    total: number;
    contribution: number;
  }[] = [];

  let totalWeight = 0;
  let weightedSum = 0;

  for (const [category, list] of byCat) {
    const w = weights[category] ?? 15;
    const total = list.length;
    const completed = list.filter((x) => x.completed).length;
    const ratio = total === 0 ? 0 : completed / total;
    const contribution = ratio * w;
    weightedSum += contribution;
    totalWeight += w;
    breakdown.push({ category, completed, total, contribution });
  }

  if (totalWeight === 0) {
    return { score: 0, breakdown: [] };
  }

  const score = Math.round((weightedSum / totalWeight) * 100);
  return { score: Math.min(100, Math.max(0, score)), breakdown };
}
