import { z } from "zod";

export const captureSourceSchema = z.enum(["manual", "voice", "email", "slack", "other"]);
export const taskCategorySchema = z.enum(["work", "life", "finance", "health", "side_project", "other"]);
export const taskStatusSchema = z.enum(["new", "in_progress", "done", "archived"]);
export const notificationFrequencySchema = z.enum(["daily", "weekdays"]);

export const captureCreateSchema = z.object({
  raw_text: z.string().min(1),
  source: captureSourceSchema,
  metadata: z.record(z.any()).default({})
});

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  category: taskCategorySchema,
  status: taskStatusSchema,
  due_date: z.string().nullable(),
  effort_minutes: z.number().int(),
  priority: z.number().int().min(0).max(3),
  confidence: z.number(),
  needs_review: z.boolean(),
  notes: z.string().nullable()
});

export const taskPatchSchema = z.object({
  title: z.string().optional(),
  category: taskCategorySchema.optional(),
  status: taskStatusSchema.optional(),
  due_date: z.string().nullable().optional(),
  effort_minutes: z.number().int().optional(),
  priority: z.number().int().min(0).max(3).optional(),
  notes: z.string().nullable().optional()
});

export const decisionItemSchema = z.object({
  rank: z.number().int(),
  task: taskSchema,
  reason: z.string().nullable(),
  risk_if_not_doing: z.string().nullable()
});

export const decisionSchema = z.object({
  id: z.string().uuid(),
  decision_date: z.string(),
  items: z.array(decisionItemSchema)
});

export type CaptureCreate = z.infer<typeof captureCreateSchema>;
export type Task = z.infer<typeof taskSchema>;
export type TaskPatch = z.infer<typeof taskPatchSchema>;
export type Decision = z.infer<typeof decisionSchema>;
