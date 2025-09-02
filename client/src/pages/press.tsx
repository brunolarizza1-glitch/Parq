import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Calendar, Download, ExternalLink, Newspaper, Users, TrendingUp } from "lucide-react";
import Footer from "@/components/footer";

export default function Press() {
  const pressReleases = [
    {
      date: "December 2024",
      title: "Parq Raises $15M Series A to Expand Parking Marketplace Nationwide",
      excerpt: "Funding will accelerate growth in major metropolitan areas and enhance platform features.",
      link: "#"
    },
    {
      date: "October 2024", 
      title: "Parq Launches Mobile App with GPS Integration",
      excerpt: "New mobile app makes finding and booking parking even easier with location-based search.",
      link: "#"
    },
    {
      date: "August 2024",
      title: "Parq Reaches 50,000 Active Users Milestone",
      excerpt: "Platform growth accelerates as more drivers and hosts join the parking marketplace.",
      link: "#"
    },
    {
      date: "June 2024",
      title: "Parq Expands to 100+ Cities Across North America",
      excerpt: "Rapid expansion brings shared parking solutions to more communities.",
      link: "#"
    }
  ];

  const mediaKit = [
    {
      title: "Company Logo Pack",
      description: "High-resolution logos in various formats",
      type: "ZIP",
      size: "2.4 MB"
    },
    {
      title: "Product Screenshots",
      description: "App and web platform screenshots",
      type: "ZIP", 
      size: "8.1 MB"
    },
    {
      title: "Fact Sheet",
      description: "Key company statistics and information",
      type: "PDF",
      size: "245 KB"
    },
    {
      title: "Executive Bios",
      description: "Leadership team biographies and photos",
      type: "PDF",
      size: "1.2 MB"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Active Users" },
    { number: "100+", label: "Cities" },
    { number: "500,000+", label: "Bookings" },
    { number: "$2M+", label: "Host Earnings" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Press & Media</h1>
          <p className="text-xl opacity-90">Latest news, updates, and media resources for Parq.</p>
        </div>
      </div>

      {/* Stats */}
      <section className="py-16 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">By The Numbers</h2>
            <p className="text-lg text-muted-foreground">Parq's impact on the parking industry</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-12">
            <Newspaper className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-3xl font-bold">Latest Press Releases</h2>
          </div>
          
          <div className="grid gap-6">
            {pressReleases.map((release, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground">{release.date}</span>
                      </div>
                      <CardTitle className="text-xl mb-2">{release.title}</CardTitle>
                      <p className="text-muted-foreground">{release.excerpt}</p>
                    </div>
                    <Button variant="outline" className="mt-4 md:mt-0 md:ml-4">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Read More
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="py-16 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Media Kit</h2>
            <p className="text-lg text-muted-foreground">
              Download logos, images, and company information for media use.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediaKit.map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Download className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Badge variant="secondary">{item.type}</Badge>
                    <span className="text-xs text-muted-foreground">{item.size}</span>
                  </div>
                  <Button size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Awards & Recognition</h2>
            <p className="text-lg text-muted-foreground">
              Industry recognition for innovation in urban mobility.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2">TechCrunch Startup of the Year</h3>
                <p className="text-sm text-muted-foreground">2024 Mobility & Transportation Category</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Best Consumer App</h3>
                <p className="text-sm text-muted-foreground">Mobile World Awards 2024</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Newspaper className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Innovation in Smart Cities</h3>
                <p className="text-sm text-muted-foreground">Urban Tech Summit 2024</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact for Media */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Media Inquiries</h2>
          <p className="text-xl mb-8 opacity-90">
            Get in touch with our media team for interviews, quotes, and story opportunities.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div>
              <h3 className="font-semibold mb-2">Press Contact</h3>
              <p className="opacity-90 mb-1">Sarah Johnson</p>
              <p className="opacity-90 mb-1">Director of Communications</p>
              <p className="opacity-90 mb-1">press@parq.com</p>
              <p className="opacity-90">(415) 555-0123</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Partnership Inquiries</h3>
              <p className="opacity-90 mb-1">Michael Chen</p>
              <p className="opacity-90 mb-1">Head of Partnerships</p>
              <p className="opacity-90 mb-1">partnerships@parq.com</p>
              <p className="opacity-90">(415) 555-0124</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}