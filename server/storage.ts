import {
  users,
  referrals,
  vehicles,
  quickReplies,
  waitlist,
  type User,
  type UpsertUser,
  type ProfileSetup,
  type ParkingSpace,
  type InsertParkingSpace,
  type Booking,
  type InsertBooking,
  type Review,
  type InsertReview,
  type Referral,
  type Vehicle,
  type QuickReply,
  type WaitlistEntry,
  insertVehicleSchema,
  insertQuickReplySchema,
  insertWaitlistSchema,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { z } from "zod";

export interface IStorage {
  // Users (for Supabase Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserVerificationInfo(id: string, info: { driverLicenseImageUrl?: string; verificationStatus?: string }): Promise<User | undefined>;
  updateUserVehicleInfo(id: string, vehicleInfo: { vehicleMake?: string; vehicleModel?: string; vehicleColor?: string; vehicleLicensePlate?: string }): Promise<User | undefined>;
  updateUserNotificationPreferences(id: string, preferences: { notificationBookingUpdates?: boolean; notificationHostAlerts?: boolean; notificationPromotions?: boolean }): Promise<User | undefined>;
  completeUserProfile(id: string, profileData: ProfileSetup): Promise<User | undefined>;

  // Parking Spaces
  getParkingSpace(id: string): Promise<ParkingSpace | undefined>;
  getParkingSpaces(filters?: {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    spaceType?: string;
    amenities?: string[];
    latitude?: number;
    longitude?: number;
    radius?: number;
  }): Promise<ParkingSpace[]>;
  getParkingSpacesByOwner(ownerId: string): Promise<ParkingSpace[]>;
  createParkingSpace(space: InsertParkingSpace): Promise<ParkingSpace>;
  updateParkingSpace(id: string, updates: Partial<ParkingSpace>): Promise<ParkingSpace | undefined>;
  deleteParkingSpace(id: string): Promise<void>;

  // Bookings
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingWithSpace(id: string): Promise<any>;
  getUserBookings(userId: string): Promise<Booking[]>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getBookingsBySpace(spaceId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  extendBooking(id: string, newEndTime: string, extensionCost: number, additionalHours: number): Promise<Booking | undefined>;
  reportBookingIssue(id: string, issueType: string, description: string): Promise<Booking | undefined>;

  // Reviews
  getReviewsBySpace(spaceId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Referral system methods
  createReferral(referrerId: string): Promise<Referral>;
  getReferralByCode(code: string): Promise<Referral | undefined>;
  completeReferral(referralCode: string, refereeId: string): Promise<void>;
  getReferralsByUser(userId: string): Promise<Referral[]>;
  
  // Vehicle management
  createVehicle(vehicle: z.infer<typeof insertVehicleSchema>): Promise<Vehicle>;
  getUserVehicles(userId: string): Promise<Vehicle[]>;
  updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<Vehicle>;
  
  // Quick replies
  createQuickReply(reply: z.infer<typeof insertQuickReplySchema>): Promise<QuickReply>;
  getQuickRepliesByUser(userId: string): Promise<QuickReply[]>;
  
  // Waitlist
  addToWaitlist(entry: z.infer<typeof insertWaitlistSchema>): Promise<WaitlistEntry>;
  getWaitlistBySpace(spaceId: string): Promise<WaitlistEntry[]>;
}

export class DatabaseStorage implements IStorage {
  private parkingSpaces: Map<string, ParkingSpace>;
  private bookings: Map<string, Booking>;
  private reviews: Map<string, Review>;

  constructor() {
    this.parkingSpaces = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    this.seedData();
  }

  // Users (Database operations for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserVerificationInfo(id: string, info: { driverLicenseImageUrl?: string; verificationStatus?: string }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...info,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserVehicleInfo(id: string, vehicleInfo: { vehicleMake?: string; vehicleModel?: string; vehicleColor?: string; vehicleLicensePlate?: string }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...vehicleInfo,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserNotificationPreferences(id: string, preferences: { notificationBookingUpdates?: boolean; notificationHostAlerts?: boolean; notificationPromotions?: boolean }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async completeUserProfile(id: string, profileData: ProfileSetup): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
        dateOfBirth: new Date(profileData.dateOfBirth),
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zipCode,
        bio: profileData.bio,
        marketingOptIn: profileData.marketingOptIn,
        userType: profileData.userType,
        profileCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Sample data seeding
  private seedData() {
    const mockOwnerId = "sample-owner-123";

    const spaces: ParkingSpace[] = [
      {
        id: "f220709d-5def-46f9-9a82-2c502f905eb8",
        ownerId: mockOwnerId,
        title: "Downtown Covered Garage",
        description: "Secure covered parking in the heart of downtown. Perfect for business meetings or shopping trips.",
        address: "123 Market St",
        unit: null,
        city: "San Francisco",
        postalCode: "94105",
        parkingNotes: "Space #A1, Level 2",
        latitude: "37.7949",
        longitude: "-122.4094",
        pricePerHour: "8.00",
        minimumDuration: 1,
        firstHourDiscount: false,
        discountPercentage: "0",
        images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        amenities: ["covered", "security", "24/7"],
        spaceType: "covered",
        covered: true,
        evCharger: false,
        securityCamera: true,
        access24_7: true,
        lighting: true,
        heightLimit: null,
        isActive: true,
        rating: "4.8",
        reviewCount: 45,
        weeklySchedule: null,
        accessInstructions: "Enter through the main gate and look for space #A1",
        accessCode: "1234",
        accessNotes: "Gate closes at 10 PM",
        accessImages: [],
        createdAt: new Date(),
      },
      {
        id: "ad1f9072-933b-49cd-a80f-7b33bfcdccef",
        ownerId: mockOwnerId,
        title: "Tech Campus Lot B",
        description: "Modern parking lot with EV charging stations. Great for tech workers and visitors.",
        address: "456 Broadway",
        unit: null,
        city: "New York",
        postalCode: "10013",
        parkingNotes: "Lot B, Section 2",
        latitude: "37.7849",
        longitude: "-122.4094",
        pricePerHour: "6.00",
        minimumDuration: 1,
        firstHourDiscount: false,
        discountPercentage: "0",
        images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        amenities: ["ev_charging", "security"],
        spaceType: "surface",
        covered: false,
        evCharger: true,
        securityCamera: true,
        access24_7: false,
        lighting: true,
        heightLimit: null,
        isActive: true,
        rating: "4.6",
        reviewCount: 32,
        weeklySchedule: null,
        accessInstructions: "Park in any available spot and use the charger",
        accessCode: "5678",
        accessNotes: "EV charging available 24/7",
        accessImages: [],
        createdAt: new Date(),
      },
      {
        id: "b8e7f1c3-2d45-4c8b-9a15-6e4d3c2b1a90",
        ownerId: mockOwnerId,
        title: "Luxury Hotel Valet",
        description: "Premium valet parking service at a 5-star hotel. Your car will be taken care of professionally.",
        address: "789 Sunset Blvd",
        unit: null,
        city: "Los Angeles",
        postalCode: "90028",
        parkingNotes: "Valet entrance on Geary St",
        latitude: "37.7749",
        longitude: "-122.4194",
        pricePerHour: "15.00",
        minimumDuration: 2,
        firstHourDiscount: true,
        discountPercentage: "10",
        images: ["https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        amenities: ["valet", "luxury", "covered"],
        spaceType: "valet",
        covered: true,
        evCharger: false,
        securityCamera: true,
        access24_7: true,
        lighting: true,
        heightLimit: null,
        isActive: true,
        rating: "4.9",
        reviewCount: 78,
        weeklySchedule: null,
        accessInstructions: "Pull up to the valet stand and hand over your keys",
        accessCode: null,
        accessNotes: "Valet service includes car wash for stays over 4 hours",
        accessImages: [],
        createdAt: new Date(),
      },
    ];

    spaces.forEach(space => this.parkingSpaces.set(space.id, space));

    // Add sample bookings for demo
    const sampleBookings: Booking[] = [
      {
        id: "sample-booking-1",
        userId: "sample-user-123",
        spaceId: "f220709d-5def-46f9-9a82-2c502f905eb8",
        startTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        endTime: new Date(Date.now() + 1000 * 60 * 90), // 90 minutes from now
        totalPrice: "24.00",
        status: "active",
        originalEndTime: null,
        extensionPrice: null,
        issueType: null,
        issueDescription: null,
        issueReportedAt: null,
        refundAmount: null,
        extendedCount: 0,
        checkedInAt: new Date(Date.now() - 1000 * 60 * 30),
        checkedOutAt: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        id: "sample-booking-2",
        userId: "sample-user-123",
        spaceId: "ad1f9072-933b-49cd-a80f-7b33bfcdccef",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4 hours from now
        totalPrice: "12.00",
        status: "confirmed",
        originalEndTime: null,
        extensionPrice: null,
        issueType: null,
        issueDescription: null,
        issueReportedAt: null,
        refundAmount: null,
        extendedCount: 0,
        checkedInAt: null,
        checkedOutAt: null,
        createdAt: new Date(),
      }
    ];

    sampleBookings.forEach(booking => this.bookings.set(booking.id, booking));
  }

  // Parking Spaces (In-memory for demo)
  async getParkingSpace(id: string): Promise<ParkingSpace | undefined> {
    return this.parkingSpaces.get(id);
  }

  async getParkingSpaces(filters?: {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    spaceType?: string;
    amenities?: string[];
    latitude?: number;
    longitude?: number;
    radius?: number;
  }): Promise<ParkingSpace[]> {
    let spaces = Array.from(this.parkingSpaces.values()).filter(space => space.isActive);

    if (filters) {
      if (filters.city) {
        spaces = spaces.filter(space => 
          space.city.toLowerCase().includes(filters.city!.toLowerCase())
        );
      }
      if (filters.spaceType) {
        spaces = spaces.filter(space => space.spaceType === filters.spaceType);
      }
    }

    return spaces;
  }

  async getParkingSpacesByOwner(ownerId: string): Promise<ParkingSpace[]> {
    return Array.from(this.parkingSpaces.values()).filter(space => space.ownerId === ownerId);
  }

  async createParkingSpace(insertSpace: InsertParkingSpace): Promise<ParkingSpace> {
    const id = randomUUID();
    const space: ParkingSpace = {
      ...insertSpace,
      id,
      unit: insertSpace.unit || null,
      parkingNotes: insertSpace.parkingNotes || null,
      latitude: insertSpace.latitude || "0",
      longitude: insertSpace.longitude || "0",
      amenities: insertSpace.amenities || [],
      // Feature toggles
      covered: insertSpace.covered || false,
      evCharger: insertSpace.evCharger || false,
      securityCamera: insertSpace.securityCamera || false,
      access24_7: insertSpace.access24_7 || false,
      lighting: insertSpace.lighting || false,
      heightLimit: insertSpace.heightLimit || null,
      // Weekly schedule
      weeklySchedule: insertSpace.weeklySchedule || null,
      // Pricing options
      minimumDuration: insertSpace.minimumDuration || 1,
      firstHourDiscount: insertSpace.firstHourDiscount || false,
      discountPercentage: insertSpace.discountPercentage || "0",
      isActive: true,
      rating: "0",
      reviewCount: 0,
      accessInstructions: insertSpace.accessInstructions || null,
      accessCode: insertSpace.accessCode || null,
      accessNotes: insertSpace.accessNotes || null,
      accessImages: insertSpace.accessImages || [],
      createdAt: new Date(),
    };
    this.parkingSpaces.set(id, space);
    return space;
  }

  async updateParkingSpace(id: string, updates: Partial<ParkingSpace>): Promise<ParkingSpace | undefined> {
    const space = this.parkingSpaces.get(id);
    if (!space) return undefined;

    const updatedSpace = { ...space, ...updates };
    this.parkingSpaces.set(id, updatedSpace);
    return updatedSpace;
  }

  async deleteParkingSpace(id: string): Promise<void> {
    this.parkingSpaces.delete(id);
  }

  // Bookings (In-memory for demo)
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.userId === userId);
  }

  async getBookingsBySpace(spaceId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.spaceId === spaceId);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = {
      ...insertBooking,
      id,
      status: "confirmed",
      originalEndTime: null,
      extensionPrice: null,
      issueType: null,
      issueDescription: null,
      issueReportedAt: null,
      refundAmount: null,
      extendedCount: 0,
      checkedInAt: null,
      checkedOutAt: null,
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async getBookingWithSpace(id: string): Promise<any> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const parkingSpace = this.parkingSpaces.get(booking.spaceId) || {
      id: booking.spaceId,
      ownerId: "mock-owner",
      title: "Sample Parking Space",
      description: "A convenient parking space",
      address: "123 Main St",
      city: "Sample City",
      latitude: "37.7749",
      longitude: "-122.4194",
      pricePerHour: "15.00",
      images: [],
      amenities: [],
      spaceType: "street",
      isActive: true,
      rating: "4.5",
      reviewCount: 0,
      accessInstructions: "Enter through the main gate and look for space #5",
      accessCode: "1234",
      accessNotes: "Gate closes at 10 PM",
      accessImages: [],
      createdAt: new Date(),
    };

    return {
      ...booking,
      parkingSpace
    };
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    // Return bookings with associated parking space information
    const userBookings = Array.from(this.bookings.values()).filter(booking => booking.userId === userId);
    
    // For demo purposes, add mock parking space data to each booking
    return userBookings.map(booking => ({
      ...booking,
      parkingSpace: this.parkingSpaces.get(booking.spaceId) || {
        id: booking.spaceId,
        ownerId: "mock-owner",
        title: "Sample Parking Space",
        description: "A convenient parking space",
        address: "123 Main St",
        city: "Sample City",
        latitude: "37.7749",
        longitude: "-122.4194",
        pricePerHour: "15.00",
        images: [],
        amenities: [],
        spaceType: "street",
        isActive: true,
        rating: "4.5",
        reviewCount: 0,
        accessInstructions: "Enter through the main gate and look for space #5",
        accessCode: "1234",
        accessNotes: "Gate closes at 10 PM",
        accessImages: [],
        createdAt: new Date(),
      }
    }));
  }

  async extendBooking(id: string, newEndTime: string, extensionCost: number, additionalHours: number): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const updatedBooking = { 
      ...booking, 
      endTime: new Date(newEndTime),
      originalEndTime: booking.originalEndTime || booking.endTime,
      extensionPrice: ((parseFloat(booking.extensionPrice?.toString() || "0")) + extensionCost).toString(),
      extendedCount: (booking.extendedCount || 0) + additionalHours,
      totalPrice: (parseFloat(booking.totalPrice) + extensionCost).toString(),
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async reportBookingIssue(id: string, issueType: string, description: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const updatedBooking = { 
      ...booking, 
      status: "issue_reported",
      issueType,
      issueDescription: description,
      issueReportedAt: new Date(),
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Reviews (In-memory for demo)
  async getReviewsBySpace(spaceId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.spaceId === spaceId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      comment: insertReview.comment || null,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  // Referral system implementation
  async createReferral(referrerId: string): Promise<Referral> {
    const referralCode = this.generateReferralCode();
    const [referral] = await db
      .insert(referrals)
      .values({
        referrerId,
        referralCode,
        status: "pending",
      })
      .returning();
    return referral;
  }

  async getReferralByCode(code: string): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.referralCode, code));
    return referral || undefined;
  }

  async completeReferral(referralCode: string, refereeId: string): Promise<void> {
    await db
      .update(referrals)
      .set({
        refereeId,
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(referrals.referralCode, referralCode));
  }

  async getReferralsByUser(userId: string): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.referrerId, userId));
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Vehicle management implementation
  async createVehicle(vehicle: z.infer<typeof insertVehicleSchema>): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }

  async getUserVehicles(userId: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.userId, userId));
  }

  async updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    const [updatedVehicle] = await db
      .update(vehicles)
      .set(updates)
      .where(eq(vehicles.id, vehicleId))
      .returning();
    return updatedVehicle;
  }

  // Quick replies implementation
  async createQuickReply(reply: z.infer<typeof insertQuickReplySchema>): Promise<QuickReply> {
    const [newReply] = await db.insert(quickReplies).values(reply).returning();
    return newReply;
  }

  async getQuickRepliesByUser(userId: string): Promise<QuickReply[]> {
    return await db.select().from(quickReplies).where(eq(quickReplies.userId, userId));
  }

  // Waitlist implementation
  async addToWaitlist(entry: z.infer<typeof insertWaitlistSchema>): Promise<WaitlistEntry> {
    const [newEntry] = await db.insert(waitlist).values(entry).returning();
    return newEntry;
  }

  async getWaitlistBySpace(spaceId: string): Promise<WaitlistEntry[]> {
    return await db.select().from(waitlist).where(eq(waitlist.spaceId, spaceId));
  }
}

export const storage = new DatabaseStorage();