import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Shield, MapPin, Clock, CreditCard, Star, Users, CheckCircle, Smartphone, DollarSign } from "lucide-react";
import Footer from "@/components/footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
            🚀 Now available as a mobile app
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Find parking<br />
            <span className="text-white">in seconds</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Book parking instantly. Stop circling the block.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 w-full sm:w-auto">
              <Link href="/search">
                Find Parking Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-green-600 text-white hover:bg-green-700 text-lg px-8 py-4 w-full sm:w-auto">
              <Link href="/host-signup">
                List Your Space
                <DollarSign className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
          <div className="mt-4">
            <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white">
              <Link href="/login">
                Already have an account? Sign In
              </Link>
            </Button>
          </div>
          <p className="text-sm mt-4 opacity-75">Multiple cities - hourly bookings available now</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why use Parq?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The easy way to find parking and earn money
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Safe & Verified</h3>
                <p className="text-gray-600">
                  All users show their driver's license. Every parking spot is checked and safe.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Booking</h3>
                <p className="text-gray-600">
                  Book parking spots in seconds with our mobile app. Live availability and instant confirmation.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Save Up to 60%</h3>
                <p className="text-gray-600">
                  Get the best parking rates in the city. Plus, earn money by sharing your own parking space.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in under 3 minutes
            </p>
          </div>

          {/* For Drivers */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-8 text-blue-600">For Drivers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h4 className="text-lg font-semibold mb-2">Search & Find</h4>
                <p className="text-gray-600">Enter where you're going and find open parking spots nearby</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h4 className="text-lg font-semibold mb-2">Book Right Away</h4>
                <p className="text-gray-600">Pick your time, book instantly, and get directions to your spot</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h4 className="text-lg font-semibold mb-2">Park & Go</h4>
                <p className="text-gray-600">Arrive, park safely, and enjoy your destination worry-free</p>
              </div>
            </div>
          </div>

          {/* For Hosts */}
          <div>
            <h3 className="text-2xl font-bold text-center mb-8 text-green-600">For Space Owners</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h4 className="text-lg font-semibold mb-2">List Your Space</h4>
                <p className="text-gray-600">Add photos, set your price, and describe your parking space</p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h4 className="text-lg font-semibold mb-2">Get Bookings</h4>
                <p className="text-gray-600">Approve bookings and earn money from your unused space</p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h4 className="text-lg font-semibold mb-2">Earn Money</h4>
                <p className="text-gray-600">Get paid automatically and earn up to $300+ per month</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-200">Happy Users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">25K+</div>
              <div className="text-blue-200">Parking Spaces</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">100+</div>
              <div className="text-blue-200">Cities</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">4.9★</div>
              <div className="text-blue-200">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Everything you need for stress-free parking
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Real-time availability</h3>
                    <p className="text-gray-600">See what's available right now, no guessing</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">24/7 customer support</h3>
                    <p className="text-gray-600">Get help whenever you need it</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Contactless check-in</h3>
                    <p className="text-gray-600">Use your phone to access your parking space</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Flexible cancellation</h3>
                    <p className="text-gray-600">Plans change? Cancel up to 1 hour before</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
                <p className="text-gray-600 mb-6">Join thousands of users who've made parking effortless</p>
                <Button asChild size="lg" className="w-full">
                  <Link href="/signup">
                    Create Free Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-3">No credit card required • Free to join</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}