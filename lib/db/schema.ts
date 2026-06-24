import { pgTable, text, integer, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const questionTypeEnum = pgEnum("question_type", ["code", "text"]);
export const candidateStatusEnum = pgEnum("candidate_status", ["pending", "in_progress", "completed", "passed", "failed"]);
export const interviewStatusEnum = pgEnum("interview_status", ["draft", "active", "closed"]);
export const recordingTypeEnum = pgEnum("recording_type", ["screen", "webcam"]);
export const flagTypeEnum = pgEnum("flag_type", ["tab_switch", "app_switch"]);

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: questionTypeEnum("type").notNull(),
  language: text("language"),
  codeStarter: text("code_starter"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviews = pgTable("interviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  timeLimitMinutes: integer("time_limit_minutes").notNull(),
  status: interviewStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviewQuestions = pgTable("interview_questions", {
  interviewId: uuid("interview_id").notNull().references(() => interviews.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
});

export const candidates = pgTable("candidates", {
  id: uuid("id").defaultRandom().primaryKey(),
  interviewId: uuid("interview_id").notNull().references(() => interviews.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  token: text("token").notNull().unique(),
  status: candidateStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const answers = pgTable("answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  candidateId: uuid("candidate_id").notNull().references(() => candidates.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  answerText: text("answer_text"),
  code: text("code"),
  language: text("language"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recordings = pgTable("recordings", {
  id: uuid("id").defaultRandom().primaryKey(),
  candidateId: uuid("candidate_id").notNull().references(() => candidates.id, { onDelete: "cascade" }),
  type: recordingTypeEnum("type").notNull(),
  storagePath: text("storage_path").notNull(),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const flags = pgTable("flags", {
  id: uuid("id").defaultRandom().primaryKey(),
  candidateId: uuid("candidate_id").notNull().references(() => candidates.id, { onDelete: "cascade" }),
  type: flagTypeEnum("type").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scores = pgTable("scores", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  candidateId: uuid("candidate_id").notNull().references(() => candidates.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companiesRelations = relations(companies, ({ many }) => ({
  questions: many(questions),
  interviews: many(interviews),
  scores: many(scores),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  company: one(companies, { fields: [questions.companyId], references: [companies.id] }),
  interviewQuestions: many(interviewQuestions),
  answers: many(answers),
  scores: many(scores),
}));

export const interviewsRelations = relations(interviews, ({ one, many }) => ({
  company: one(companies, { fields: [interviews.companyId], references: [companies.id] }),
  interviewQuestions: many(interviewQuestions),
  candidates: many(candidates),
}));

export const interviewQuestionsRelations = relations(interviewQuestions, ({ one }) => ({
  interview: one(interviews, { fields: [interviewQuestions.interviewId], references: [interviews.id] }),
  question: one(questions, { fields: [interviewQuestions.questionId], references: [questions.id] }),
}));

export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  interview: one(interviews, { fields: [candidates.interviewId], references: [interviews.id] }),
  answers: many(answers),
  recordings: many(recordings),
  flags: many(flags),
  scores: many(scores),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  candidate: one(candidates, { fields: [answers.candidateId], references: [candidates.id] }),
  question: one(questions, { fields: [answers.questionId], references: [questions.id] }),
}));

export const recordingsRelations = relations(recordings, ({ one }) => ({
  candidate: one(candidates, { fields: [recordings.candidateId], references: [candidates.id] }),
}));

export const flagsRelations = relations(flags, ({ one }) => ({
  candidate: one(candidates, { fields: [flags.candidateId], references: [candidates.id] }),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  company: one(companies, { fields: [scores.companyId], references: [companies.id] }),
  candidate: one(candidates, { fields: [scores.candidateId], references: [candidates.id] }),
  question: one(questions, { fields: [scores.questionId], references: [questions.id] }),
}));
