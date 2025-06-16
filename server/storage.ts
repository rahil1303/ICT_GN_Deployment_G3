import { 
  users, passes, tickets, journeys, validationEvents, alerts, feedbackSubmissions, userSettings,
  type User, type InsertUser, type Pass, type InsertPass, type Ticket, type InsertTicket,
  type Journey, type InsertJourney, type ValidationEvent, type InsertValidationEvent,
  type Alert, type InsertAlert, type FeedbackSubmission, type InsertFeedback,
  type UserSettings, type InsertUserSettings
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Passes
  getUserPasses(userId: number): Promise<Pass[]>;
  createPass(pass: InsertPass): Promise<Pass>;
  getActivePass(userId: number): Promise<Pass | undefined>;

  // Tickets
  getUserTickets(userId: number): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  validateTicket(ticketId: string): Promise<Ticket | undefined>;
  getActiveTickets(userId: number): Promise<Ticket[]>;

  // Journeys
  getUserJourneys(userId: number): Promise<Journey[]>;
  createJourney(journey: InsertJourney): Promise<Journey>;
  updateJourney(id: number, journey: Partial<InsertJourney>): Promise<Journey | undefined>;
  getSavedJourneys(userId: number): Promise<Journey[]>;

  // Validation Events
  createValidationEvent(event: InsertValidationEvent): Promise<ValidationEvent>;
  getUserValidationHistory(userId: number): Promise<ValidationEvent[]>;

  // Alerts
  getUserAlerts(userId: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertRead(id: number): Promise<Alert | undefined>;

  // Feedback
  createFeedback(feedback: InsertFeedback): Promise<FeedbackSubmission>;
  getUserFeedback(userId: number): Promise<FeedbackSubmission[]>;

  // Settings
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private passes: Map<number, Pass> = new Map();
  private tickets: Map<number, Ticket> = new Map();
  private journeys: Map<number, Journey> = new Map();
  private validationEvents: Map<number, ValidationEvent> = new Map();
  private alerts: Map<number, Alert> = new Map();
  private feedback: Map<number, FeedbackSubmission> = new Map();
  private settings: Map<number, UserSettings> = new Map();
  
  private currentId = 1;

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    
    // Create default settings
    await this.updateUserSettings(id, {});
    
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Passes
  async getUserPasses(userId: number): Promise<Pass[]> {
    return Array.from(this.passes.values()).filter(pass => pass.userId === userId);
  }

  async createPass(insertPass: InsertPass): Promise<Pass> {
    const id = this.currentId++;
    const pass: Pass = { ...insertPass, id };
    this.passes.set(id, pass);
    return pass;
  }

  async getActivePass(userId: number): Promise<Pass | undefined> {
    const now = new Date();
    return Array.from(this.passes.values()).find(
      pass => pass.userId === userId && 
               pass.isActive && 
               new Date(pass.validFrom) <= now && 
               new Date(pass.validUntil) >= now
    );
  }

  // Tickets
  async getUserTickets(userId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(ticket => ticket.userId === userId);
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = this.currentId++;
    const ticket: Ticket = { ...insertTicket, id };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async validateTicket(ticketId: string): Promise<Ticket | undefined> {
    const ticket = Array.from(this.tickets.values()).find(t => t.ticketId === ticketId);
    if (ticket) {
      ticket.isValidated = true;
      this.tickets.set(ticket.id, ticket);
    }
    return ticket;
  }

  async getActiveTickets(userId: number): Promise<Ticket[]> {
    const now = new Date();
    return Array.from(this.tickets.values()).filter(
      ticket => ticket.userId === userId && new Date(ticket.validUntil) >= now
    );
  }

  // Journeys
  async getUserJourneys(userId: number): Promise<Journey[]> {
    return Array.from(this.journeys.values()).filter(journey => journey.userId === userId);
  }

  async createJourney(insertJourney: InsertJourney): Promise<Journey> {
    const id = this.currentId++;
    const journey: Journey = { ...insertJourney, id };
    this.journeys.set(id, journey);
    return journey;
  }

  async updateJourney(id: number, journeyData: Partial<InsertJourney>): Promise<Journey | undefined> {
    const journey = this.journeys.get(id);
    if (!journey) return undefined;
    
    const updatedJourney = { ...journey, ...journeyData };
    this.journeys.set(id, updatedJourney);
    return updatedJourney;
  }

  async getSavedJourneys(userId: number): Promise<Journey[]> {
    return Array.from(this.journeys.values()).filter(
      journey => journey.userId === userId && journey.isSaved
    );
  }

  // Validation Events
  async createValidationEvent(insertEvent: InsertValidationEvent): Promise<ValidationEvent> {
    const id = this.currentId++;
    const event: ValidationEvent = { ...insertEvent, id, timestamp: new Date() };
    this.validationEvents.set(id, event);
    return event;
  }

  async getUserValidationHistory(userId: number): Promise<ValidationEvent[]> {
    return Array.from(this.validationEvents.values())
      .filter(event => event.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Alerts
  async getUserAlerts(userId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentId++;
    const alert: Alert = { ...insertAlert, id, createdAt: new Date() };
    this.alerts.set(id, alert);
    return alert;
  }

  async markAlertRead(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.isRead = true;
      this.alerts.set(id, alert);
    }
    return alert;
  }

  // Feedback
  async createFeedback(insertFeedback: InsertFeedback): Promise<FeedbackSubmission> {
    const id = this.currentId++;
    const feedback: FeedbackSubmission = { ...insertFeedback, id, createdAt: new Date() };
    this.feedback.set(id, feedback);
    return feedback;
  }

  async getUserFeedback(userId: number): Promise<FeedbackSubmission[]> {
    return Array.from(this.feedback.values())
      .filter(feedback => feedback.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Settings
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    return this.settings.get(userId);
  }

  async updateUserSettings(userId: number, settingsData: Partial<InsertUserSettings>): Promise<UserSettings> {
    const currentSettings = this.settings.get(userId);
    const settings: UserSettings = {
      id: currentSettings?.id || this.currentId++,
      userId,
      theme: "high-contrast",
      language: "en",
      speechRate: 10,
      vibrationEnabled: true,
      vibrationIntensity: 2,
      autoReadAlerts: true,
      locationEnabled: true,
      autoRequestAssistance: false,
      ...currentSettings,
      ...settingsData
    };
    
    this.settings.set(userId, settings);
    return settings;
  }
}

export const storage = new MemStorage();
