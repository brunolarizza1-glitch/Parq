import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // User type and profile completion
  userType: varchar("user_type"), // "lister", "renter", "both"
  profileCompleted: boolean("profile_completed").default(false),
  // Contact information
  phoneNumber: varchar("phone_number"),
  dateOfBirth: timestamp("date_of_birth"),
  // Address information
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  country: varchar("country").default("US"),
  // Driver's license verification fields (required for both types)
  isVerified: boolean("is_verified").default(false),
  driverLicenseNumber: varchar("driver_license_number"),
  driverLicenseState: varchar("driver_license_state"),
  driverLicenseImageUrl: varchar("driver_license_image_url"),
  verificationStatus: varchar("verification_status").default("pending"), // pending, approved, rejected
  verificationNotes: text("verification_notes"),
  verifiedAt: timestamp("verified_at"),
  // Driver license plates and insurance attestation
  licensePlates: text("license_plates").array().default([]),
  insuranceAttested: boolean("insurance_attested").default(false),
  insuranceAttestedAt: timestamp("insurance_attested_at"),
  // Vehicle information
  vehicleMake: varchar("vehicle_make"),
  vehicleModel: varchar("vehicle_model"),
  vehicleColor: varchar("vehicle_color"),
  vehicleLicensePlate: varchar("vehicle_license_plate"),
  // Notification preferences
  notificationBookingUpdates: boolean("notification_booking_updates").default(true),
  notificationHostAlerts: boolean("notification_host_alerts").default(true),
  notificationPromotions: boolean("notification_promotions").default(false),
  // Stripe Connect for hosts
  stripeAccountId: varchar("stripe_account_id"),
  stripeAccountVerified: boolean("stripe_account_verified").default(false),
  payoutEnabled: boolean("payout_enabled").default(false),
  // Additional profile fields
  bio: text("bio"),
  preferredLanguage: varchar("preferred_language").default("en"),
  marketingOptIn: boolean("marketing_opt_in").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const parkingSpaces = pgTable("parking_spaces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  unit: text("unit"),
  city: text("city").notNull(),
  postalCode: varchar("postal_code").notNull(),
  parkingNotes: text("parking_notes"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }).notNull(),
  minimumDuration: integer("minimum_duration").default(1),
  firstHourDiscount: boolean("first_hour_discount").default(false),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0"),
  images: text("images").array().notNull(),
  amenities: text("amenities").array().notNull().default([]),
  spaceType: text("space_type").notNull(), // driveway, garage, lot, street-permit
  // Feature toggles
  covered: boolean("covered").default(false),
  evCharger: boolean("ev_charger").default(false),
  securityCamera: boolean("security_camera").default(false),
  access24_7: boolean("access_24_7").default(false),
  lighting: boolean("lighting").default(false),
  heightLimit: text("height_limit"),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  // Weekly schedule (JSON object)
  weeklySchedule: jsonb("weekly_schedule"),
  // Access instructions for renters
  accessInstructions: text("access_instructions"),
  accessCode: varchar("access_code"),
  accessNotes: text("access_notes"),
  accessImages: text("access_images").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  spaceId: varchar("space_id").notNull().references(() => parkingSpaces.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  originalEndTime: timestamp("original_end_time"), // Track extensions
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  extensionPrice: decimal("extension_price", { precision: 10, scale: 2 }).default("0"),
  status: text("status").notNull().default("pending"), // pending, confirmed, active, completed, cancelled, issue_reported
  issueType: varchar("issue_type"), // blocked, no_access, damaged, other
  issueDescription: text("issue_description"),
  issueReportedAt: timestamp("issue_reported_at"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  extendedCount: integer("extended_count").default(0), // Number of extensions
  checkedInAt: timestamp("checked_in_at"),
  checkedOutAt: timestamp("checked_out_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  spaceId: varchar("space_id").notNull().references(() => parkingSpaces.id),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Calendar blocked dates for host management
export const blockedDates = pgTable("blocked_dates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  spaceId: varchar("space_id").notNull().references(() => parkingSpaces.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: varchar("reason"), // maintenance, personal_use, unavailable
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Dynamic pricing rules for spaces
export const pricingRules = pgTable("pricing_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  spaceId: varchar("space_id").notNull().references(() => parkingSpaces.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications system
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // booking_confirmed, booking_reminder, extension_alert, issue_reported, payment_received
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  bookingId: varchar("booking_id").references(() => bookings.id),
  spaceId: varchar("space_id").references(() => parkingSpaces.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Referral system
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  refereeId: varchar("referee_id").references(() => users.id),
  referralCode: varchar("referral_code").notNull().unique(),
  status: varchar("status").notNull().default("pending"), // pending, completed, credited
  referrerCreditAmount: decimal("referrer_credit_amount", { precision: 10, scale: 2 }).default("10.00"),
  refereeCreditAmount: decimal("referee_credit_amount", { precision: 10, scale: 2 }).default("10.00"),
  completedAt: timestamp("completed_at"),
  creditedAt: timestamp("credited_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Waitlist system
export const waitlist = pgTable("waitlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  spaceId: varchar("space_id").notNull().references(() => parkingSpaces.id),
  desiredStartTime: timestamp("desired_start_time").notNull(),
  desiredEndTime: timestamp("desired_end_time").notNull(),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
  status: varchar("status").notNull().default("active"), // active, notified, cancelled, expired
  notifiedAt: timestamp("notified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vehicle profiles for compatibility
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  make: varchar("make").notNull(),
  model: varchar("model").notNull(),
  year: integer("year").notNull(),
  vehicleType: varchar("vehicle_type").notNull(), // sedan, suv, truck, motorcycle, ev, etc.
  length: decimal("length", { precision: 5, scale: 2 }), // in feet
  width: decimal("width", { precision: 5, scale: 2 }), // in feet
  height: decimal("height", { precision: 5, scale: 2 }), // in feet
  isElectric: boolean("is_electric").default(false),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Host quick replies templates
export const quickReplies = pgTable("quick_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  category: varchar("category"), // directions, policies, amenities, etc.
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Host earnings and payout tracking
export const earnings = pgTable("earnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hostId: varchar("host_id").notNull().references(() => users.id),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  spaceId: varchar("space_id").notNull().references(() => parkingSpaces.id),
  grossAmount: decimal("gross_amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, available, paid
  payoutId: varchar("payout_id"),
  earningDate: timestamp("earning_date").notNull(),
  availableAt: timestamp("available_at").notNull(), // When funds become available
  createdAt: timestamp("created_at").defaultNow(),
});

// Payout transactions
export const payouts = pgTable("payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hostId: varchar("host_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("USD"),
  status: varchar("status").notNull().default("processing"), // processing, completed, failed
  payoutMethod: varchar("payout_method").notNull(), // bank_account, debit_card
  payoutMethodId: varchar("payout_method_id"), // External provider ID
  transactionId: varchar("transaction_id"), // External transaction ID
  failureReason: text("failure_reason"),
  earningsCount: integer("earnings_count").notNull(), // Number of earnings included
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  expectedArrival: timestamp("expected_arrival"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payout methods for hosts
export const payoutMethods = pgTable("payout_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hostId: varchar("host_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // bank_account, debit_card
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  // Bank account fields
  bankName: varchar("bank_name"),
  accountType: varchar("account_type"), // checking, savings
  routingNumber: varchar("routing_number"),
  accountNumberLast4: varchar("account_number_last4"),
  // Debit card fields
  cardBrand: varchar("card_brand"), // visa, mastercard, etc.
  cardLast4: varchar("card_last4"),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  // External provider fields
  stripePaymentMethodId: varchar("stripe_payment_method_id"),
  verificationStatus: varchar("verification_status").default("pending"), // pending, verified, failed
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event pricing for special occasions
export const eventPricing = pgTable("event_pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  spaceId: varchar("space_id").notNull().references(() => parkingSpaces.id),
  eventName: varchar("event_name").notNull(),
  eventType: varchar("event_type").notNull(), // concert, sports, conference, festival
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  multiplier: decimal("multiplier", { precision: 4, scale: 2 }).default("1.5"), // 1.5x normal price
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Arrival PIN system for space access
export const arrivalPins = pgTable("arrival_pins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  pin: varchar("pin", { length: 6 }).notNull(),
  isUsed: boolean("is_used").default(false),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Spot Guarantee system for safety
export const spotGuarantees = pgTable("spot_guarantees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  status: varchar("status").notNull().default("active"), // active, claimed, processed, rejected
  issueType: varchar("issue_type").notNull(), // blocked_spot, no_access, space_not_as_described
  description: text("description").notNull(),
  evidence: text("evidence").array().default([]), // photo URLs
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  uberCreditAmount: decimal("uber_credit_amount", { precision: 10, scale: 2 }).default("25.00"),
  destination: text("destination"), // where they were going
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment records for audit trail
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  stripePaymentIntentId: varchar("stripe_payment_intent_id").unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("usd"),
  status: varchar("status").notNull(), // succeeded, failed, pending, refunded
  paymentMethod: varchar("payment_method"), // card, apple_pay, google_pay
  refundId: varchar("refund_id"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});


// Admin dispute resolution
export const disputes = pgTable("disputes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  complainantId: varchar("complainant_id").notNull().references(() => users.id),
  respondentId: varchar("respondent_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // access_issue, damage_claim, payment_dispute, behavior_issue
  description: text("description").notNull(),
  evidence: text("evidence").array().default([]),
  status: varchar("status").notNull().default("open"), // open, investigating, resolved, escalated
  resolution: text("resolution"),
  adminUserId: varchar("admin_user_id").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas  
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertParkingSpaceSchema = createInsertSchema(parkingSpaces).omit({
  id: true,
  createdAt: true,
  rating: true,
  reviewCount: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertBlockedDateSchema = createInsertSchema(blockedDates).omit({
  id: true,
  createdAt: true,
});

export const insertPricingRuleSchema = createInsertSchema(pricingRules).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Extension and issue reporting schemas
export const bookingExtensionSchema = z.object({
  bookingId: z.string(),
  newEndTime: z.string(),
  additionalHours: z.number().positive(),
});

export const issueReportSchema = z.object({
  bookingId: z.string(),
  issueType: z.enum(["blocked", "no_access", "damaged", "other"]),
  description: z.string().min(10, "Please provide more details about the issue"),
});

// Checkout validation schema
export const checkoutSchema = z.object({
  cardNumber: z.string().min(13, "Please enter a valid card number").max(19, "Card number is too long").regex(/^[0-9\s]+$/, "Card number can only contain numbers and spaces"),
  expiryDate: z.string().min(5, "Please enter a valid expiry date (MM/YY)").regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Please enter expiry date in MM/YY format"),
  cvv: z.string().min(3, "Please enter a valid CVV").max(4, "CVV must be 3 or 4 digits").regex(/^[0-9]+$/, "CVV can only contain numbers"),
  cardholderName: z.string().min(1, "Cardholder name is required").max(100, "Name must be less than 100 characters").regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, apostrophes, and hyphens"),
});

// Booking validation schema
export const bookingValidationSchema = z.object({
  startTime: z.string().min(1, "Please select a start time"),
  endTime: z.string().min(1, "Please select an end time"),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
}).refine((data) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
}).refine((data) => {
  const start = new Date(data.startTime);
  const now = new Date();
  return start > now;
}, {
  message: "Start time must be in the future",
  path: ["startTime"],
});

// Insert schemas for new features
export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertWaitlistSchema = createInsertSchema(waitlist).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
}).extend({
  make: z.string().min(1, "Vehicle make is required").max(50, "Make must be less than 50 characters"),
  model: z.string().min(1, "Vehicle model is required").max(50, "Model must be less than 50 characters"),
  color: z.string().min(1, "Vehicle color is required").max(30, "Color must be less than 30 characters"),
  licensePlate: z.string().min(2, "License plate is required").max(10, "License plate must be less than 10 characters").regex(/^[A-Z0-9\s-]+$/, "License plate can only contain letters, numbers, spaces, and dashes"),
});

export const insertQuickReplySchema = createInsertSchema(quickReplies).omit({
  id: true,
  createdAt: true,
});

export const insertEarningSchema = createInsertSchema(earnings).omit({
  id: true,
  createdAt: true,
});

export const insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
  createdAt: true,
});

export const insertPayoutMethodSchema = createInsertSchema(payoutMethods).omit({
  id: true,
  createdAt: true,
});

export const insertEventPricingSchema = createInsertSchema(eventPricing).omit({
  id: true,
  createdAt: true,
});

export const insertArrivalPinSchema = createInsertSchema(arrivalPins).omit({
  id: true,
  createdAt: true,
});

export const insertSpotGuaranteeSchema = createInsertSchema(spotGuarantees).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertDisputeSchema = createInsertSchema(disputes).omit({
  id: true,
  createdAt: true,
});

// Driver signup with license plates
export const driverSignupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  licensePlates: z.array(z.string().min(2, "Valid license plate required")).min(1, "At least one license plate required"),
  insuranceAttested: z.boolean().refine((val) => val === true, "Must attest to having valid insurance"),
});

// Referral code generation schema
export const referralSignupSchema = z.object({
  referralCode: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
});

// Profile completion schemas
export const profileSetupSchema = z.object({
  userType: z.enum(["lister", "renter", "both"]),
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters").regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, apostrophes, and hyphens"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters").regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, apostrophes, and hyphens"),
  phoneNumber: z.string().min(10, "Valid phone number required").max(15, "Phone number too long").regex(/^[\+]?[1-9][\d]{0,15}$/, "Valid phone number required"),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
  }, "Must be at least 18 years old"),
  address: z.string().min(5, "Street address required").max(100, "Address too long"),
  city: z.string().min(1, "City is required").max(50, "City must be less than 50 characters").regex(/^[a-zA-Z\s'-]+$/, "City can only contain letters, spaces, apostrophes, and hyphens"),
  state: z.string().min(2, "State required").max(2, "Invalid state"),
  zipCode: z.string().min(5, "ZIP code required").max(10, "ZIP code too long").regex(/^[A-Za-z0-9\s-]+$/, "Valid ZIP code required"),
  bio: z.string().optional(),
  marketingOptIn: z.boolean().default(false),
});

export const driverLicenseSchema = z.object({
  driverLicenseNumber: z.string().min(5, "License number is required"),
  driverLicenseState: z.string().min(2, "License state is required"),
  driverLicenseImageUrl: z.string().url("Valid image URL is required"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type ProfileSetup = z.infer<typeof profileSetupSchema>;
export type DriverLicense = z.infer<typeof driverLicenseSchema>;
export type DriverSignup = z.infer<typeof driverSignupSchema>;
export type ParkingSpace = typeof parkingSpaces.$inferSelect;
export type InsertParkingSpace = z.infer<typeof insertParkingSpaceSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type BlockedDate = typeof blockedDates.$inferSelect;
export type InsertBlockedDate = z.infer<typeof insertBlockedDateSchema>;
export type PricingRule = typeof pricingRules.$inferSelect;
export type InsertPricingRule = z.infer<typeof insertPricingRuleSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type BookingExtension = z.infer<typeof bookingExtensionSchema>;
export type IssueReport = z.infer<typeof issueReportSchema>;
export type Referral = typeof referrals.$inferSelect;
export type WaitlistEntry = typeof waitlist.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type QuickReply = typeof quickReplies.$inferSelect;
export type Earning = typeof earnings.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type PayoutMethod = typeof payoutMethods.$inferSelect;
export type EventPricing = typeof eventPricing.$inferSelect;
export type ArrivalPin = typeof arrivalPins.$inferSelect;
export type SpotGuarantee = typeof spotGuarantees.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Dispute = typeof disputes.$inferSelect;
