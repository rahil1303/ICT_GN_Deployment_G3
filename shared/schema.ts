import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  assistanceNote: text("assistance_note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passes = pgTable("passes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // weekly, monthly, day
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  price: integer("price").notNull(), // in cents
  isActive: boolean("is_active").default(true),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // single, day
  ticketId: text("ticket_id").notNull().unique(),
  validUntil: timestamp("valid_until").notNull(),
  isValidated: boolean("is_validated").default(false),
  price: integer("price").notNull(), // in cents
});

export const journeys = pgTable("journeys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  routeData: json("route_data"), // store route details
  departureTime: timestamp("departure_time"),
  arrivalTime: timestamp("arrival_time"),
  status: text("status").default("planned"), // planned, active, completed
  isSaved: boolean("is_saved").default(false),
});

export const validationEvents = pgTable("validation_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  ticketId: integer("ticket_id").references(() => tickets.id),
  eventType: text("event_type").notNull(), // check_in, check_out, exception
  location: text("location"),
  timestamp: timestamp("timestamp").defaultNow(),
  routeInfo: text("route_info"),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // service_disruption, pass_expiry, journey_reminder, emergency
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedbackSubmissions = pgTable("feedback_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // bug, feature, accessibility, general
  message: text("message").notNull(),
  voiceRecording: text("voice_recording"), // base64 or file path
  status: text("status").default("pending"), // pending, reviewed, resolved
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique(),
  theme: text("theme").default("high-contrast"), // high-contrast, dark-mode
  language: text("language").default("en"), // en, es, fr
  speechRate: integer("speech_rate").default(10), // 0.5-2.0 mapped to 5-20
  vibrationEnabled: boolean("vibration_enabled").default(true),
  vibrationIntensity: integer("vibration_intensity").default(2), // 1-3
  autoReadAlerts: boolean("auto_read_alerts").default(true),
  locationEnabled: boolean("location_enabled").default(true),
  autoRequestAssistance: boolean("auto_request_assistance").default(false),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPassSchema = createInsertSchema(passes).omit({ id: true });
export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true });
export const insertJourneySchema = createInsertSchema(journeys).omit({ id: true });
export const insertValidationEventSchema = createInsertSchema(validationEvents).omit({ id: true, timestamp: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });
export const insertFeedbackSchema = createInsertSchema(feedbackSubmissions).omit({ id: true, createdAt: true });
export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Pass = typeof passes.$inferSelect;
export type InsertPass = z.infer<typeof insertPassSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Journey = typeof journeys.$inferSelect;
export type InsertJourney = z.infer<typeof insertJourneySchema>;
export type ValidationEvent = typeof validationEvents.$inferSelect;
export type InsertValidationEvent = z.infer<typeof insertValidationEventSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type FeedbackSubmission = typeof feedbackSubmissions.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
