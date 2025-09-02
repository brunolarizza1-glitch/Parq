import { Link } from "wouter";
import { ArrowLeft, Shield, Eye, Lock, Users } from "lucide-react";
import Footer from "@/components/footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl opacity-90">Last updated: December 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          
          {/* Introduction */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Our Commitment to Privacy</h2>
            </div>
            <p className="text-muted-foreground">
              At Parq, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, and protect your personal information when you use our parking marketplace platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <Eye className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Information We Collect</h2>
            </div>
            
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
              <li>Name, email address, and phone number</li>
              <li>Government-issued ID for verification</li>
              <li>Payment information and billing address</li>
              <li>Profile photo and vehicle information</li>
              <li>Location data when using our mobile app</li>
            </ul>

            <h3 className="text-lg font-semibold mb-4">Usage Information</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
              <li>Booking history and preferences</li>
              <li>Communication with other users and support</li>
              <li>Device information and IP address</li>
              <li>App usage analytics and performance data</li>
            </ul>

            <h3 className="text-lg font-semibold mb-4">Property Information (For Hosts)</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Property address and photos</li>
              <li>Parking space details and availability</li>
              <li>Pricing and booking preferences</li>
              <li>Property ownership verification documents</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <Lock className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">How We Use Your Information</h2>
            </div>
            
            <h3 className="text-lg font-semibold mb-4">Service Delivery</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
              <li>Process bookings and payments</li>
              <li>Verify user identity and property ownership</li>
              <li>Facilitate communication between users</li>
              <li>Provide customer support</li>
              <li>Send booking confirmations and updates</li>
            </ul>

            <h3 className="text-lg font-semibold mb-4">Platform Improvement</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
              <li>Analyze usage patterns to improve our service</li>
              <li>Develop new features and functionality</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Personalize your experience</li>
            </ul>

            <h3 className="text-lg font-semibold mb-4">Legal and Safety</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Comply with legal obligations</li>
              <li>Investigate suspicious activities</li>
              <li>Resolve disputes between users</li>
              <li>Maintain platform safety and security</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <Users className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Information Sharing</h2>
            </div>
            
            <h3 className="text-lg font-semibold mb-4">With Other Users</h3>
            <p className="text-muted-foreground mb-4">
              We share limited information to facilitate bookings:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
              <li>Name and profile photo</li>
              <li>Vehicle information (for hosts)</li>
              <li>Contact information for confirmed bookings</li>
              <li>Reviews and ratings</li>
            </ul>

            <h3 className="text-lg font-semibold mb-4">With Service Providers</h3>
            <p className="text-muted-foreground mb-4">
              We work with trusted third parties to provide our service:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
              <li>Payment processors for secure transactions</li>
              <li>Identity verification services</li>
              <li>Cloud hosting and data storage providers</li>
              <li>Customer support and analytics tools</li>
            </ul>

            <h3 className="text-lg font-semibold mb-4">Legal Requirements</h3>
            <p className="text-muted-foreground">
              We may disclose information when required by law, to protect our rights, 
              or to ensure user safety.
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to personal information</li>
              <li>Secure payment processing</li>
              <li>24/7 monitoring for suspicious activity</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Your Privacy Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your information only as long as necessary to provide our services 
              and comply with legal obligations. Account data is typically deleted within 
              30 days of account closure, except for information required for legal or 
              safety purposes.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our service is not intended for children under 18. We do not knowingly 
              collect personal information from children. If you believe we have 
              collected information from a child, please contact us immediately.
            </p>
          </section>

          {/* International Users */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">International Users</h2>
            <p className="text-muted-foreground">
              Your information may be transferred to and processed in countries other 
              than your own. We ensure appropriate safeguards are in place to protect 
              your privacy rights.
            </p>
          </section>

          {/* Policy Updates */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Policy Updates</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We'll notify you 
              of significant changes via email or through our platform. Your continued 
              use of our service constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about this Privacy Policy or want to exercise 
              your privacy rights, contact us:
            </p>
            <div className="bg-muted p-6 rounded-lg">
              <p className="font-semibold mb-2">Privacy Team</p>
              <p className="text-muted-foreground">Email: privacy@parq.com</p>
              <p className="text-muted-foreground">Phone: 1-800-PARQ-HELP</p>
              <p className="text-muted-foreground">
                Address: 123 Privacy Lane, Suite 100, CA 94105
              </p>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}