import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertParkingSpaceSchema, insertBookingSchema, insertReviewSchema, profileSetupSchema, bookingExtensionSchema, issueReportSchema } from "@shared/schema";
import { authenticateSupabase, optionalAuth, syncSupabaseUser } from "./auth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes - handle both authenticated and unauthenticated requests
  app.get('/api/auth/user', optionalAuth, async (req: any, res) => {
    if (!req.user?.id) {
      return res.json(null);
    }
    
    try {
      const userId = req.user.id;
      
      // Sync user from Supabase if needed
      await syncSupabaseUser(req.user);
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.json(null);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.json(null);
    }
  });

  // Profile setup route
  app.post("/api/profile/setup", authenticateSupabase, async (req, res) => {
    try {
      const profileData = profileSetupSchema.parse(req.body);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const updatedUser = await storage.completeUserProfile(userId, profileData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error completing profile setup:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid profile data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to complete profile setup" });
    }
  });

  // Object storage routes for file uploads
  app.get("/objects/:objectPath(*)", authenticateSupabase, async (req, res) => {
    const userId = req.user?.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", authenticateSupabase, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Driver's license verification upload
  app.put("/api/driver-license", authenticateSupabase, async (req, res) => {
    if (!req.body.driverLicenseImageUrl) {
      return res.status(400).json({ error: "driverLicenseImageUrl is required" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.driverLicenseImageUrl,
        {
          owner: userId,
          visibility: "private", // Driver's license should be private
        }
      );

      // Update user verification status
      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUserVerificationInfo(userId, {
          driverLicenseImageUrl: objectPath,
          verificationStatus: "pending", // Set to pending for admin review
        });
      }

      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting driver's license:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User vehicle update route
  app.patch("/api/users/:id/vehicle", authenticateSupabase, async (req, res) => {
    try {
      const userId = req.user?.id;
      const targetUserId = req.params.id;
      
      // Only allow users to update their own vehicle info
      if (userId !== targetUserId) {
        return res.status(403).json({ error: "Cannot update another user's vehicle information" });
      }

      const vehicleData = z.object({
        vehicleMake: z.string().optional(),
        vehicleModel: z.string().optional(), 
        vehicleColor: z.string().optional(),
        vehicleLicensePlate: z.string().optional()
      }).parse(req.body);

      const updatedUser = await storage.updateUserVehicleInfo(userId, vehicleData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating vehicle info:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid vehicle data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update vehicle information" });
    }
  });

  // User notification preferences update route
  app.patch("/api/users/:id/notifications", authenticateSupabase, async (req, res) => {
    try {
      const userId = req.user?.id;
      const targetUserId = req.params.id;
      
      // Only allow users to update their own notification preferences
      if (userId !== targetUserId) {
        return res.status(403).json({ error: "Cannot update another user's notification preferences" });
      }

      const notificationData = z.object({
        notificationBookingUpdates: z.boolean().optional(),
        notificationHostAlerts: z.boolean().optional(),
        notificationPromotions: z.boolean().optional()
      }).parse(req.body);

      const updatedUser = await storage.updateUserNotificationPreferences(userId, notificationData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating notification preferences:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid notification data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update notification preferences" });
    }
  });

  // Parking Spaces routes
  app.get("/api/parking-spaces", async (req, res) => {
    try {
      const filters = {
        city: req.query.city as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        spaceType: req.query.spaceType as string,
        amenities: req.query.amenities ? (req.query.amenities as string).split(',') : undefined,
        latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
        longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
        radius: req.query.radius ? parseFloat(req.query.radius as string) : undefined,
      };

      const spaces = await storage.getParkingSpaces(filters);
      res.json(spaces);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parking spaces" });
    }
  });

  app.get("/api/parking-spaces/:id", async (req, res) => {
    try {
      const space = await storage.getParkingSpace(req.params.id);
      if (!space) {
        return res.status(404).json({ message: "Parking space not found" });
      }
      res.json(space);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parking space" });
    }
  });

  app.post("/api/parking-spaces", async (req, res) => {
    try {
      const validatedSpace = insertParkingSpaceSchema.parse(req.body);
      const space = await storage.createParkingSpace(validatedSpace);
      res.status(201).json(space);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid space data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create parking space" });
      }
    }
  });

  app.patch("/api/parking-spaces/:id", async (req, res) => {
    try {
      const space = await storage.getParkingSpace(req.params.id);
      if (!space) {
        return res.status(404).json({ message: "Parking space not found" });
      }
      
      const updatedSpace = await storage.updateParkingSpace(req.params.id, req.body);
      res.json(updatedSpace);
    } catch (error) {
      console.error("Error updating parking space:", error);
      res.status(500).json({ message: "Failed to update parking space" });
    }
  });

  app.delete("/api/parking-spaces/:id", async (req, res) => {
    try {
      const space = await storage.getParkingSpace(req.params.id);
      if (!space) {
        return res.status(404).json({ message: "Parking space not found" });
      }
      
      await storage.deleteParkingSpace(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting parking space:", error);
      res.status(500).json({ message: "Failed to delete parking space" });
    }
  });

  app.get("/api/users/:id/parking-spaces", async (req, res) => {
    try {
      const spaces = await storage.getParkingSpacesByOwner(req.params.id);
      res.json(spaces);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user's parking spaces" });
    }
  });

  // Bookings routes
  app.get("/api/bookings", async (req, res) => {
    try {
      const ownerId = req.query.ownerId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      if (ownerId) {
        // Get bookings for owner's spaces
        const userSpaces = await storage.getParkingSpacesByOwner(ownerId);
        let allBookings: any[] = [];
        
        for (const space of userSpaces) {
          const spaceBookings = await storage.getBookingsBySpace(space.id);
          allBookings = [...allBookings, ...spaceBookings];
        }
        
        // Sort by creation date and limit if requested
        allBookings.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        
        if (limit) {
          allBookings = allBookings.slice(0, limit);
        }
        
        res.json(allBookings);
      } else {
        // For demo purposes, show sample bookings
        const userBookings = await storage.getUserBookings("sample-user-123");
        res.json(userBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/user/:userId", async (req, res) => {
    try {
      const bookings = await storage.getBookingsByUser(req.params.userId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user bookings" });
    }
  });

  app.post("/api/bookings", authenticateSupabase, async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const booking = await storage.createBooking({ ...bookingData, userId });
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBookingWithSpace(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.patch("/api/bookings/:id", authenticateSupabase, async (req, res) => {
    try {
      const bookingId = req.params.id;
      const userId = req.user?.id;
      
      // Validate the update data
      const updateData = z.object({
        status: z.enum(["pending", "confirmed", "active", "completed", "cancelled"])
      }).parse(req.body);
      
      // Get the booking and verify ownership
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // For demo purposes, allow updates without strict ownership check
      // In production, you'd verify: booking.userId === userId
      
      const updatedBooking = await storage.updateBookingStatus(bookingId, updateData.status);
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update booking" });
      }
    }
  });

  // Booking extension route
  app.post("/api/bookings/extend", async (req, res) => {
    try {
      const extensionData = bookingExtensionSchema.parse(req.body);
      const userId = "sample-user-123"; // Demo user

      // Get the booking and verify ownership
      const booking = await storage.getBooking(extensionData.bookingId);
      if (!booking || booking.userId !== userId) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Get the parking space for pricing
      const space = await storage.getParkingSpace(booking.spaceId);
      if (!space) {
        return res.status(404).json({ error: "Parking space not found" });
      }

      // Calculate extension cost
      const extensionCost = extensionData.additionalHours * parseFloat(space.pricePerHour);
      
      // Update booking with extension
      const updatedBooking = await storage.extendBooking(
        extensionData.bookingId,
        extensionData.newEndTime,
        extensionCost,
        extensionData.additionalHours
      );

      res.json(updatedBooking);
    } catch (error) {
      console.error("Error extending booking:", error);
      res.status(500).json({ message: "Failed to extend booking" });
    }
  });

  // Issue reporting route
  app.post("/api/bookings/report-issue", async (req, res) => {
    try {
      const issueData = issueReportSchema.parse(req.body);
      const userId = "sample-user-123"; // Demo user

      // Get the booking and verify ownership
      const booking = await storage.getBooking(issueData.bookingId);
      if (!booking || booking.userId !== userId) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Update booking with issue report
      const updatedBooking = await storage.reportBookingIssue(
        issueData.bookingId,
        issueData.issueType,
        issueData.description
      );

      res.json(updatedBooking);
    } catch (error) {
      console.error("Error reporting issue:", error);
      res.status(500).json({ message: "Failed to report issue" });
    }
  });

  // Reviews routes
  app.get("/api/parking-spaces/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsBySpace(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedReview = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedReview);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid review data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create review" });
      }
    }
  });

  // User profile route for authenticated users
  app.get("/api/users/profile", authenticateSupabase, async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID not found in token" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Referral system routes
  app.post("/api/referrals/create", async (req, res) => {
    try {
      const userId = "sample-user-123"; // Demo user
      const referral = await storage.createReferral(userId);
      res.json(referral);
    } catch (error) {
      console.error("Error creating referral:", error);
      res.status(500).json({ message: "Failed to create referral" });
    }
  });

  app.get("/api/referrals/user/:userId", async (req, res) => {
    try {
      const referrals = await storage.getReferralsByUser(req.params.userId);
      res.json(referrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.post("/api/referrals/complete", async (req, res) => {
    try {
      const { referralCode, refereeId } = req.body;
      await storage.completeReferral(referralCode, refereeId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error completing referral:", error);
      res.status(500).json({ message: "Failed to complete referral" });
    }
  });

  // Vehicle management routes
  app.get("/api/vehicles/user/:userId", async (req, res) => {
    try {
      const vehicles = await storage.getUserVehicles(req.params.userId);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const vehicle = await storage.createVehicle(req.body);
      res.json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      res.status(500).json({ message: "Failed to create vehicle" });
    }
  });

  // Waitlist routes
  app.post("/api/waitlist", async (req, res) => {
    try {
      const entry = await storage.addToWaitlist(req.body);
      res.json(entry);
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      res.status(500).json({ message: "Failed to add to waitlist" });
    }
  });

  app.get("/api/waitlist/space/:spaceId", async (req, res) => {
    try {
      const entries = await storage.getWaitlistBySpace(req.params.spaceId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching waitlist:", error);
      res.status(500).json({ message: "Failed to fetch waitlist" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
