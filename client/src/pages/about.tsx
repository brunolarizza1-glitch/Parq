import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Users, Target, Award, Heart } from "lucide-react";
import Footer from "@/components/footer";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Parq</h1>
          <p className="text-xl opacity-90">Making parking simple, secure, and affordable for everyone.</p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              To eliminate parking stress by connecting drivers with available spaces, 
              while helping property owners earn extra income from their unused parking spots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">50,000+</h3>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">100+</h3>
                <p className="text-sm text-muted-foreground">Cities Served</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">99.9%</h3>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">4.8/5</h3>
                <p className="text-sm text-muted-foreground">User Rating</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Story</h2>
          <div className="prose prose-lg mx-auto">
            <p>
              Parq was founded in 2023 with a simple observation: millions of drivers waste time 
              and fuel circling city blocks looking for parking, while thousands of driveways, 
              lots, and spaces sit empty.
            </p>
            <p>
              Our founders experienced the frustration firsthand - arriving late to meetings, 
              missing events, and paying exorbitant parking fees in busy urban areas. They knew 
              there had to be a better way.
            </p>
            <p>
              Today, Parq connects drivers with verified parking spaces in real-time, while 
              helping property owners monetize their unused spaces. We've saved our users 
              millions of hours and helped generate substantial extra income for our hosts.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community First</h3>
              <p className="text-muted-foreground">
                We believe in building a community where drivers and hosts both benefit.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Reliability</h3>
              <p className="text-muted-foreground">
                Every booking is guaranteed, every space is verified, every experience matters.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Simplicity</h3>
              <p className="text-muted-foreground">
                Parking should be simple. We eliminate complexity with intuitive design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Parking Revolution</h2>
          <p className="text-xl mb-8 opacity-90">
            Whether you're looking for parking or have space to share, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
              <Link href="/search">Find Parking</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/list-space">List Your Space</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}