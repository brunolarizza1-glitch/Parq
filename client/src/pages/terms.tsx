import { Link } from "wouter";
import { ArrowLeft, FileText, Scale, Users, Shield } from "lucide-react";
import Footer from "@/components/footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl opacity-90">Last updated: December 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          
          {/* Introduction */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <FileText className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Agreement to Terms</h2>
            </div>
            <p className="text-muted-foreground">
              Welcome to Parq! These Terms of Service ("Terms") govern your use of our 
              parking marketplace platform. By using our service, you agree to these Terms.
            </p>
          </section>

          {/* Service Description */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Our Service</h2>
            <p className="text-muted-foreground mb-4">
              Parq is a marketplace that connects parking space owners ("Hosts") with 
              people looking for parking ("Drivers"). We provide the platform but are 
              not a party to the parking arrangements between users.
            </p>
            <h3 className="text-lg font-semibold mb-4">For Drivers</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
              <li>Search and book available parking spaces</li>
              <li>Make secure payments through our platform</li>
              <li>Communicate with hosts about bookings</li>
              <li>Leave reviews and ratings</li>
            </ul>
            <h3 className="text-lg font-semibold mb-4">For Hosts</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>List parking spaces for rent</li>
              <li>Set pricing and availability</li>
              <li>Receive payments for bookings</li>
              <li>Manage guest access to your property</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <Users className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">User Accounts</h2>
            </div>
            <h3 className="text-lg font-semibold mb-4">Account Creation</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
              <li>You must be at least 18 years old to use our service</li>
              <li>Provide accurate and complete information during registration</li>
              <li>Verify your identity with government-issued ID</li>
              <li>Keep your account information up to date</li>
            </ul>
            
            <h3 className="text-lg font-semibold mb-4">Account Security</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>You are responsible for maintaining account security</li>
              <li>Do not share your login credentials with others</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>We may suspend accounts that violate these Terms</li>
            </ul>
          </section>

          {/* Booking Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Booking and Payment Terms</h2>
            
            <h3 className="text-lg font-semibold mb-4">Making Bookings</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
              <li>Bookings are confirmed when payment is processed</li>
              <li>You agree to the host's specific terms and conditions</li>
              <li>Cancellation policies vary by listing and are clearly displayed</li>
              <li>No-shows may result in charges and account restrictions</li>
            </ul>

            <h3 className="text-lg font-semibold mb-4">Payments</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
              <li>All payments are processed securely through our platform</li>
              <li>Service fees and taxes are clearly disclosed before booking</li>
              <li>Refunds are subject to the applicable cancellation policy</li>
              <li>Hosts receive payments within 24 hours of booking completion</li>
            </ul>

            <h3 className="text-lg font-semibold mb-4">Pricing</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Hosts set their own pricing for parking spaces</li>
              <li>Prices may vary based on demand and special events</li>
              <li>All fees are disclosed before booking confirmation</li>
              <li>Dynamic pricing may apply during high-demand periods</li>
            </ul>
          </section>

          {/* Host Responsibilities */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Host Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide accurate descriptions and photos of parking spaces</li>
              <li>Ensure parking spaces are available as listed</li>
              <li>Maintain spaces in safe and accessible condition</li>
              <li>Respond promptly to driver communications</li>
              <li>Comply with local laws and regulations</li>
              <li>Report any incidents or safety concerns</li>
              <li>Honor confirmed bookings or provide appropriate notice</li>
            </ul>
          </section>

          {/* Driver Responsibilities */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Driver Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Use parking spaces only as authorized in your booking</li>
              <li>Respect the host's property and follow house rules</li>
              <li>Park only approved vehicles in the designated space</li>
              <li>Leave the parking space in the same condition</li>
              <li>Report any damages or incidents immediately</li>
              <li>Arrive and depart within the booked time frame</li>
              <li>Treat hosts and other users with respect</li>
            </ul>
          </section>

          {/* Prohibited Activities */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Prohibited Activities</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              The following activities are strictly prohibited:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Listing spaces you don't own or have permission to rent</li>
              <li>Providing false information about your identity or vehicle</li>
              <li>Using the platform for illegal activities</li>
              <li>Discriminating against users based on protected characteristics</li>
              <li>Attempting to circumvent our payment system</li>
              <li>Harassing or threatening other users</li>
              <li>Violating local parking laws or regulations</li>
              <li>Creating multiple accounts to circumvent restrictions</li>
            </ul>
          </section>

          {/* Liability and Insurance */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <Scale className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Liability and Insurance</h2>
            </div>
            
            <h3 className="text-lg font-semibold mb-4">Platform Liability</h3>
            <p className="text-muted-foreground mb-4">
              Parq acts as a marketplace platform. We are not responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
              <li>The condition or safety of parking spaces</li>
              <li>The accuracy of listing descriptions</li>
              <li>Disputes between drivers and hosts</li>
              <li>Vehicle damage or theft</li>
              <li>Personal injury on host property</li>
            </ul>

            <h3 className="text-lg font-semibold mb-4">Insurance Coverage</h3>
            <p className="text-muted-foreground mb-4">
              We provide limited protection programs:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Host property damage coverage up to $1,000,000</li>
              <li>Booking guarantee for confirmed reservations</li>
              <li>24/7 safety support line</li>
              <li>Dispute resolution assistance</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              All content on our platform, including text, graphics, logos, and software, 
              is owned by Parq or our licensors. You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Copy, modify, or distribute our content without permission</li>
              <li>Use our trademarks or logos without authorization</li>
              <li>Reverse engineer or attempt to access our source code</li>
              <li>Create derivative works based on our platform</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Account Termination</h2>
            <p className="text-muted-foreground mb-4">
              Either party may terminate this agreement:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
              <li>You may close your account at any time</li>
              <li>We may suspend or terminate accounts that violate these Terms</li>
              <li>Outstanding bookings will be honored unless safety concerns exist</li>
              <li>Refunds will be processed according to our policies</li>
            </ul>
            
            <p className="text-muted-foreground">
              Upon termination, your right to use the platform ceases immediately, 
              but these Terms will continue to apply to past use of our service.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Dispute Resolution</h2>
            <p className="text-muted-foreground mb-4">
              We encourage users to resolve disputes directly. If that's not possible:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Contact our support team for mediation assistance</li>
              <li>Disputes may be resolved through binding arbitration</li>
              <li>Class action lawsuits are not permitted</li>
              <li>California law governs these Terms</li>
            </ul>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Changes to These Terms</h2>
            <p className="text-muted-foreground">
              We may update these Terms from time to time. We'll notify you of 
              significant changes via email or through our platform. Your continued 
              use of our service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about these Terms, contact us:
            </p>
            <div className="bg-muted p-6 rounded-lg">
              <p className="font-semibold mb-2">Legal Team</p>
              <p className="text-muted-foreground">Email: legal@parq.com</p>
              <p className="text-muted-foreground">Phone: 1-800-PARQ-HELP</p>
              <p className="text-muted-foreground">
                Address: 123 Legal Street, Suite 100, CA 94105
              </p>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}