import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Shield, 
  MapPin, 
  Clock, 
  CreditCard, 
  Star, 
  Phone, 
  Search, 
  Car,
  CheckCircle,
  Zap,
  Users,
  Lock,
  DollarSign,
  Camera,
  Bell,
  Eye,
  TrendingUp,
  FileText,
  Award
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Find Parking Near You",
    description: "We find parking near you automatically or search any location",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    icon: Search,
    title: "Search Your Way",
    description: "Filter by price, features, space type, and open times to find the perfect spot",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    icon: CreditCard,
    title: "Safe Payments",
    description: "Your payments are safe and secure with many ways to pay",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    icon: Clock,
    title: "Book Right Away",
    description: "Book parking spots instantly with live availability and quick confirmation",
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  {
    icon: Shield,
    title: "Verified Users",
    description: "All users show their driver's license to keep everyone safe",
    color: "text-red-600",
    bgColor: "bg-red-100"
  },
  {
    icon: Star,
    title: "Reviews & Ratings",
    description: "Rate and review parking spots to help others find the best ones",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100"
  }
];

const hostFeatures = [
  {
    icon: DollarSign,
    title: "Earn Passive Income",
    description: "Turn your unused parking space into a steady income stream",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    icon: Camera,
    title: "Photo Management",
    description: "Upload multiple photos to showcase your parking space",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    icon: Lock,
    title: "Access Control",
    description: "Generate secure access codes and manage entry permissions",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    description: "Get instant alerts for bookings, check-ins, and payments",
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description: "Track earnings, occupancy rates, and performance metrics",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100"
  },
  {
    icon: Users,
    title: "Guest Management",
    description: "View guest details, license plates, and booking history",
    color: "text-pink-600",
    bgColor: "bg-pink-100"
  }
];

const safetyFeatures = [
  {
    icon: Eye,
    title: "24/7 Monitoring",
    description: "All spaces are monitored with security cameras and emergency contacts"
  },
  {
    icon: FileText,
    title: "Insurance Coverage",
    description: "Comprehensive insurance protection for both hosts and guests"
  },
  {
    icon: Phone,
    title: "Emergency Support",
    description: "Round-the-clock customer support for urgent issues"
  },
  {
    icon: Award,
    title: "Trust & Safety",
    description: "Background checks and verification for all platform users"
  }
];

export default function Features() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-white">
              Everything You Need for Parking
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover the comprehensive features that make Parq the most trusted parking marketplace. 
              Whether you're looking for parking or listing your space, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button asChild size="lg" className="btn-primary shadow-medium hover:shadow-hard">
                <Link href="/search">Find Parking</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="glass-effect border-white/20 text-white hover:bg-white/10 transition-all">
                <Link href="/list-space">List Your Space</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              For Drivers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find, book, and access parking spaces with ease using our driver-focused features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader>
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Host Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              For Hosts
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful tools to manage your parking space and maximize your earnings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hostFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader>
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Security */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Safety & Security
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your safety is our top priority. We've built comprehensive security features 
              to ensure peace of mind for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started is simple. Follow these easy steps to park or earn.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* For Drivers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                <Car className="w-8 h-8 inline-block mr-3 text-blue-600" />
                For Drivers
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Search & Filter</h4>
                    <p className="text-gray-600">Find parking spaces near your destination using location-based search and filters.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Book Instantly</h4>
                    <p className="text-gray-600">Select your time slot and book with secure payment processing.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Park & Go</h4>
                    <p className="text-gray-600">Use the access code to enter and enjoy hassle-free parking.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Hosts */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                <DollarSign className="w-8 h-8 inline-block mr-3 text-green-600" />
                For Hosts
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">List Your Space</h4>
                    <p className="text-gray-600">Create a listing with photos, location, and pricing details.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Set Availability</h4>
                    <p className="text-gray-600">Choose when your space is available and set your rates.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Earn Money</h4>
                    <p className="text-gray-600">Receive payments automatically and track your earnings.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of drivers and hosts who trust Parq for their parking needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/search">
                <Search className="w-5 h-5 mr-2" />
                Find Parking Now
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/list-space">
                <DollarSign className="w-5 h-5 mr-2" />
                Start Earning
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}