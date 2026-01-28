import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Permit types for the permitting application
export interface Permit {
  id: string;
  project_name: string;
  location: string;
  applicant: string;
  submitted_date: string;
  status: 'In Intake' | 'Maestro Workflow' | 'EPA Review' | 'Final Sign-off' | 'Approved' | 'Archived';
  progress: number;
  agency_routing: string[];
}

export const insertPermitSchema = z.object({
  project_name: z.string().min(1),
  location: z.string().min(1),
  applicant: z.string().min(1),
  status: z.enum(['In Intake', 'Maestro Workflow', 'EPA Review', 'Final Sign-off', 'Approved', 'Archived']).default('Maestro Workflow'),
  progress: z.number().min(0).max(100).default(15),
  agency_routing: z.array(z.string()).min(1),
});

export type InsertPermit = z.infer<typeof insertPermitSchema>;
