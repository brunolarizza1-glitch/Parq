import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, Phone, Camera, Lock, UserCheck } from "lucide-react";
import Footer from "@/components/footer";

export default function Safety() {
  const safetyFeatures = [
    {
      icon: UserCheck,
      title: "Identity Verification",
      description: "All users verify their identity with government-issued ID and phone number.",
    },
    {
      icon: Camera,
      title: "Photo Verification",
      description: "Every parking space includes verified photos and exact location details.",
    },
    {
      icon: Lock,
      title: "Secure Payments",
      description: "All payments are processed securely through encrypted channels.",
    },
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Our support team is available around the clock for any safety concerns.",
    }
  ];

  const driverTips = [
    "Always check the parking space photos and description before booking",
    "Arrive during daylight hours when possible for better visibility",
    "Keep your booking confirmation handy to show the host if needed",
    "Take photos of your car when you park for your own records",
    "Report any safety concerns to our support team immediately",
    "Trust your instincts - if something doesn't feel right, contact us"
  ];

  const hostTips = [
    "Provide accurate photos and clear descriptions of your space",
    "Install adequate lighting for evening bookings",
    "Meet guests in person when possible for first-time bookings",
    "Keep your contact information up to date",
    "Report any concerning behavior to our support team",
    "Consider installing security cameras in common areas"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Safety & Security</h1>
          <p className="text-xl opacity-90">Your safety is our top priority. Learn about our safety measures and best practices.</p>
        </div>
      </div>

      {/* Safety Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built-in Safety Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've implemented multiple layers of security to ensure a safe experience for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyFeatures.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <CardTitle className="text-red-800">Emergency Situations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                If you experience any emergency or feel unsafe, contact local authorities immediately.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-red-600 mr-2" />
                  <span className="font-semibold text-red-800">Emergency: 911</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-red-600 mr-2" />
                  <span className="font-semibold text-red-800">Parq Safety: 1-800-PARQ-911</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Safety Best Practices</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Driver Tips */}
            <div>
              <div className="flex items-center mb-6">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-2xl font-semibold">For Drivers</h3>
              </div>
              
              <div className="space-y-3">
                {driverTips.map((tip, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Host Tips */}
            <div>
              <div className="flex items-center mb-6">
                <Shield className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-2xl font-semibold">For Hosts</h3>
              </div>
              
              <div className="space-y-3">
                {hostTips.map((tip, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Community Guidelines</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Be Respectful</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Treat all community members with respect and kindness.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Communicate Clearly</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Keep communication professional and related to parking arrangements.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Follow the Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Respect parking duration, space boundaries, and local regulations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Insurance & Protection */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Insurance & Protection</h2>
            <p className="text-lg text-muted-foreground">
              Additional protection for peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Host Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Property damage coverage up to $1M</li>
                  <li>• Liability protection for hosts</li>
                  <li>• 24/7 claims support</li>
                  <li>• Legal assistance when needed</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Driver Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Booking guarantee protection</li>
                  <li>• Dispute resolution support</li>
                  <li>• Secure payment processing</li>
                  <li>• 24/7 customer support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Report Issues */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Report Safety Concerns</h2>
          <p className="text-xl mb-8 opacity-90">
            If you encounter any safety issues, please report them immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              Report an Issue
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Contact Safety Team
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}