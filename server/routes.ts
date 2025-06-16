import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPassSchema, insertTicketSchema, insertJourneySchema, insertValidationEventSchema, insertAlertSchema, insertFeedbackSchema, insertUserSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware (simplified)
  const requireAuth = (req: any, res: any, next: any) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    req.userId = parseInt(userId as string);
    next();
  };

  // Users
  app.post("/api/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.get("/api/users/profile", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user profile", error });
    }
  });

  // Passes
  app.get("/api/passes", requireAuth, async (req, res) => {
    try {
      const passes = await storage.getUserPasses(req.userId);
      res.json({ passes });
    } catch (error) {
      res.status(500).json({ message: "Failed to get passes", error });
    }
  });

  app.post("/api/passes", requireAuth, async (req, res) => {
    try {
      const passData = insertPassSchema.parse({ ...req.body, userId: req.userId });
      const pass = await storage.createPass(passData);
      res.json({ pass });
    } catch (error) {
      res.status(400).json({ message: "Invalid pass data", error });
    }
  });

  app.get("/api/passes/active", requireAuth, async (req, res) => {
    try {
      const activePass = await storage.getActivePass(req.userId);
      res.json({ activePass });
    } catch (error) {
      res.status(500).json({ message: "Failed to get active pass", error });
    }
  });

  // Tickets
  app.get("/api/tickets", requireAuth, async (req, res) => {
    try {
      const tickets = await storage.getUserTickets(req.userId);
      res.json({ tickets });
    } catch (error) {
      res.status(500).json({ message: "Failed to get tickets", error });
    }
  });

  app.post("/api/tickets", requireAuth, async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse({ 
        ...req.body, 
        userId: req.userId,
        ticketId: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
      const ticket = await storage.createTicket(ticketData);
      res.json({ ticket });
    } catch (error) {
      res.status(400).json({ message: "Invalid ticket data", error });
    }
  });

  app.post("/api/tickets/:ticketId/validate", requireAuth, async (req, res) => {
    try {
      const ticket = await storage.validateTicket(req.params.ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json({ ticket });
    } catch (error) {
      res.status(500).json({ message: "Failed to validate ticket", error });
    }
  });

  app.get("/api/tickets/active", requireAuth, async (req, res) => {
    try {
      const activeTickets = await storage.getActiveTickets(req.userId);
      res.json({ tickets: activeTickets });
    } catch (error) {
      res.status(500).json({ message: "Failed to get active tickets", error });
    }
  });

  // Journeys
  app.get("/api/journeys", requireAuth, async (req, res) => {
    try {
      const journeys = await storage.getUserJourneys(req.userId);
      res.json({ journeys });
    } catch (error) {
      res.status(500).json({ message: "Failed to get journeys", error });
    }
  });

  app.post("/api/journeys", requireAuth, async (req, res) => {
    try {
      const journeyData = insertJourneySchema.parse({ ...req.body, userId: req.userId });
      const journey = await storage.createJourney(journeyData);
      res.json({ journey });
    } catch (error) {
      res.status(400).json({ message: "Invalid journey data", error });
    }
  });

  app.get("/api/journeys/saved", requireAuth, async (req, res) => {
    try {
      const savedJourneys = await storage.getSavedJourneys(req.userId);
      res.json({ journeys: savedJourneys });
    } catch (error) {
      res.status(500).json({ message: "Failed to get saved journeys", error });
    }
  });

  // Validation Events
  app.post("/api/validation-events", requireAuth, async (req, res) => {
    try {
      const eventData = insertValidationEventSchema.parse({ ...req.body, userId: req.userId });
      const event = await storage.createValidationEvent(eventData);
      res.json({ event });
    } catch (error) {
      res.status(400).json({ message: "Invalid validation event data", error });
    }
  });

  app.get("/api/validation-events", requireAuth, async (req, res) => {
    try {
      const history = await storage.getUserValidationHistory(req.userId);
      res.json({ events: history });
    } catch (error) {
      res.status(500).json({ message: "Failed to get validation history", error });
    }
  });

  // Alerts
  app.get("/api/alerts", requireAuth, async (req, res) => {
    try {
      const alerts = await storage.getUserAlerts(req.userId);
      res.json({ alerts });
    } catch (error) {
      res.status(500).json({ message: "Failed to get alerts", error });
    }
  });

  app.post("/api/alerts", requireAuth, async (req, res) => {
    try {
      const alertData = insertAlertSchema.parse({ ...req.body, userId: req.userId });
      const alert = await storage.createAlert(alertData);
      res.json({ alert });
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data", error });
    }
  });

  app.patch("/api/alerts/:id/read", requireAuth, async (req, res) => {
    try {
      const alert = await storage.markAlertRead(parseInt(req.params.id));
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json({ alert });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark alert as read", error });
    }
  });

  // Feedback
  app.post("/api/feedback", requireAuth, async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse({ ...req.body, userId: req.userId });
      const feedback = await storage.createFeedback(feedbackData);
      res.json({ feedback });
    } catch (error) {
      res.status(400).json({ message: "Invalid feedback data", error });
    }
  });

  // Settings
  app.get("/api/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.userId);
      res.json({ settings });
    } catch (error) {
      res.status(500).json({ message: "Failed to get settings", error });
    }
  });

  app.patch("/api/settings", requireAuth, async (req, res) => {
    try {
      const settingsData = insertUserSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateUserSettings(req.userId, settingsData);
      res.json({ settings });
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data", error });
    }
  });

  // Transit Data APIs
  app.get("/api/transit/routes", async (req, res) => {
    // Mock GTFS route data
    const routes = [
      { id: "19", name: "Downtown Express", type: "bus", accessibility: "wheelchair" },
      { id: "22", name: "Hospital Line", type: "bus", accessibility: "low-floor" },
      { id: "5", name: "Tram Line 5", type: "tram", accessibility: "wheelchair" },
    ];
    res.json({ routes });
  });

  app.get("/api/transit/realtime/:routeId", async (req, res) => {
    // Mock real-time data
    const vehicles = [
      {
        vehicleId: `${req.params.routeId}-001`,
        route: req.params.routeId,
        destination: "Downtown",
        eta: Math.floor(Math.random() * 10) + 2,
        accessibility: "wheelchair"
      }
    ];
    res.json({ vehicles });
  });

  app.post("/api/transit/assistance-request", requireAuth, async (req, res) => {
    try {
      const { routeId, stopId, assistanceNote } = req.body;
      // Mock assistance request
      setTimeout(() => {
        // Simulate driver acknowledgment
      }, 2000);
      
      res.json({ 
        success: true, 
        message: "Driver notified of assistance request",
        requestId: `REQ-${Date.now()}`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to request assistance", error });
    }
  });

  app.post("/api/transit/plan", async (req, res) => {
    try {
      const { from, to, time, preferences } = req.body;
      
      // Mock route planning
      const routes = [
        {
          id: 1,
          summary: "Bus 19 → Tram 5",
          duration: 45,
          transfers: 1,
          departureTime: "2:15 PM",
          arrivalTime: "3:00 PM",
          accessibility: preferences.wheelchair ? "Wheelchair accessible" : "Standard",
          steps: [
            { mode: "bus", route: "19", from: from, to: "Transfer Station", duration: 25 },
            { mode: "tram", route: "5", from: "Transfer Station", to: to, duration: 20 }
          ]
        },
        {
          id: 2,
          summary: "Direct Bus 22",
          duration: 35,
          transfers: 0,
          departureTime: "2:30 PM",
          arrivalTime: "3:05 PM",
          accessibility: "Standard vehicle",
          steps: [
            { mode: "bus", route: "22", from: from, to: to, duration: 35 }
          ]
        }
      ];

      res.json({ routes });
    } catch (error) {
      res.status(500).json({ message: "Failed to plan journey", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
