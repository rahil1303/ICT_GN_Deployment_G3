import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPassSchema, insertTicketSchema, insertJourneySchema, insertValidationEventSchema, insertAlertSchema, insertFeedbackSchema, insertUserSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware (simplified) - Demo mode with default user
  const requireAuth = (req: any, res: any, next: any) => {
    const userId = req.headers['x-user-id'] || '1'; // Default to user 1 for demo
    req.userId = parseInt(userId as string);
    next();
  };

  // Users
  app.post("/api/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/me", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Passes
  app.get("/api/passes", requireAuth, async (req: any, res) => {
    try {
      const passes = await storage.getUserPasses(req.userId);
      res.json(passes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch passes" });
    }
  });

  app.post("/api/passes", requireAuth, async (req: any, res) => {
    try {
      const passData = insertPassSchema.parse(req.body);
      passData.userId = req.userId;
      const pass = await storage.createPass(passData);
      res.json(pass);
    } catch (error) {
      res.status(400).json({ message: "Invalid pass data" });
    }
  });

  app.get("/api/passes/active", requireAuth, async (req: any, res) => {
    try {
      const activePass = await storage.getActivePass(req.userId);
      res.json(activePass);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active pass" });
    }
  });

  // Tickets
  app.get("/api/tickets", requireAuth, async (req: any, res) => {
    try {
      const tickets = await storage.getUserTickets(req.userId);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.post("/api/tickets", requireAuth, async (req: any, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      ticketData.userId = req.userId;
      // Generate unique ticket ID
      ticketData.ticketId = `TKT${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const ticket = await storage.createTicket(ticketData);
      res.json(ticket);
    } catch (error) {
      res.status(400).json({ message: "Invalid ticket data" });
    }
  });

  app.post("/api/tickets/:ticketId/validate", requireAuth, async (req: any, res) => {
    try {
      const { ticketId } = req.params;
      const ticket = await storage.validateTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to validate ticket" });
    }
  });

  app.get("/api/tickets/active", requireAuth, async (req: any, res) => {
    try {
      const activeTickets = await storage.getActiveTickets(req.userId);
      res.json(activeTickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active tickets" });
    }
  });

  // Transit API endpoints
  app.post("/api/transit/plan-journey", async (req, res) => {
    try {
      // Mock journey planning response
      const mockJourneys = [
        {
          id: 1,
          summary: "Bus 42 to Metro Line 1",
          duration: 35,
          transfers: 1,
          departureTime: "10:15 AM",
          arrivalTime: "10:50 AM",
          accessibility: "Wheelchair accessible",
          steps: [
            { mode: "walk", route: "", from: req.body.from, to: "Main St Station", duration: 5 },
            { mode: "bus", route: "42", from: "Main St Station", to: "Downtown Hub", duration: 15 },
            { mode: "metro", route: "Line 1", from: "Downtown Hub", to: req.body.to, duration: 15 }
          ]
        }
      ];
      res.json(mockJourneys);
    } catch (error) {
      res.status(500).json({ message: "Failed to plan journey" });
    }
  });

  app.post("/api/transit/assistance-request", requireAuth, async (req: any, res) => {
    try {
      // Mock assistance request response
      const response = {
        requestId: `REQ${Date.now()}`,
        status: "confirmed",
        estimatedArrival: "2 minutes",
        driverMessage: "I'll assist you with boarding. Please wait at the front door.",
        vehicleInfo: {
          route: req.body.route,
          vehicleId: req.body.vehicleId,
          destination: req.body.destination
        }
      };
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "Failed to request assistance" });
    }
  });

  // Journeys
  app.get("/api/journeys", requireAuth, async (req: any, res) => {
    try {
      const journeys = await storage.getUserJourneys(req.userId);
      res.json(journeys);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journeys" });
    }
  });

  app.post("/api/journeys", requireAuth, async (req: any, res) => {
    try {
      const journeyData = insertJourneySchema.parse(req.body);
      journeyData.userId = req.userId;
      const journey = await storage.createJourney(journeyData);
      res.json(journey);
    } catch (error) {
      res.status(400).json({ message: "Invalid journey data" });
    }
  });

  app.get("/api/journeys/saved", requireAuth, async (req: any, res) => {
    try {
      const savedJourneys = await storage.getSavedJourneys(req.userId);
      res.json(savedJourneys);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saved journeys" });
    }
  });

  // Validation Events
  app.post("/api/validation-events", requireAuth, async (req: any, res) => {
    try {
      const eventData = insertValidationEventSchema.parse(req.body);
      eventData.userId = req.userId;
      const event = await storage.createValidationEvent(eventData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid validation event data" });
    }
  });

  app.get("/api/validation-events", requireAuth, async (req: any, res) => {
    try {
      const events = await storage.getUserValidationHistory(req.userId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch validation history" });
    }
  });

  // Alerts
  app.get("/api/alerts", requireAuth, async (req: any, res) => {
    try {
      const alerts = await storage.getUserAlerts(req.userId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", requireAuth, async (req: any, res) => {
    try {
      const alertData = insertAlertSchema.parse(req.body);
      alertData.userId = req.userId;
      const alert = await storage.createAlert(alertData);
      res.json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data" });
    }
  });

  app.patch("/api/alerts/:id/read", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const alert = await storage.markAlertRead(parseInt(id));
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  // Feedback
  app.post("/api/feedback", requireAuth, async (req: any, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse(req.body);
      feedbackData.userId = req.userId;
      const feedback = await storage.createFeedback(feedbackData);
      res.json(feedback);
    } catch (error) {
      res.status(400).json({ message: "Invalid feedback data" });
    }
  });

  app.get("/api/feedback", requireAuth, async (req: any, res) => {
    try {
      const feedback = await storage.getUserFeedback(req.userId);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Settings
  app.get("/api/settings", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getUserSettings(req.userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", requireAuth, async (req: any, res) => {
    try {
      const settingsData = req.body;
      const settings = await storage.updateUserSettings(req.userId, settingsData);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}