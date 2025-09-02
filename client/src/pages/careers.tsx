import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, MapPin, Clock, Users, Code, Heart, Briefcase } from "lucide-react";
import Footer from "@/components/footer";

export default function Careers() {
  const jobOpenings = [
    {
      id: 1,
      title: "Senior Full-Stack Engineer",
      department: "Engineering",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      description: "Build scalable systems for our growing parking marketplace platform.",
    },
    {
      id: 2,
      title: "Product Designer",
      department: "Design",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      description: "Design intuitive experiences for drivers and parking space hosts.",
    },
    {
      id: 3,
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote",
      type: "Full-time",
      description: "Help our community of hosts maximize their earnings and user experience.",
    },
    {
      id: 4,
      title: "Marketing Manager",
      department: "Marketing",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      description: "Drive growth and brand awareness in key metropolitan markets.",
    },
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Careers at Parq</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Join our mission to revolutionize parking. We're building the future of urban mobility.
          </p>
        </div>
      </div>

      {/* Why Work Here */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Work at Parq?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're a fast-growing team solving real problems for millions of drivers and property owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardContent className="p-6 text-center">
                <Code className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Cutting-Edge Tech</h3>
                <p className="text-muted-foreground">
                  Work with modern technologies and build scalable systems that impact millions.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Great Benefits</h3>
                <p className="text-muted-foreground">
                  Competitive salary, equity, health insurance, and unlimited PTO.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Amazing Team</h3>
                <p className="text-muted-foreground">
                  Work with passionate, talented people who care about making a difference.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Open Positions</h2>
          
          <div className="grid gap-6">
            {jobOpenings.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{job.department}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {job.type}
                        </Badge>
                      </div>
                    </div>
                    <Button className="mt-4 md:mt-0">
                      Apply Now
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{job.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Don't see a position that fits? We're always looking for talented people.
            </p>
            <Button variant="outline">
              <Briefcase className="w-4 h-4 mr-2" />
              Send Us Your Resume
            </Button>
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Culture</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe in work-life balance, continuous learning, and making an impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">What We Offer</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Competitive salary and equity package</li>
                <li>• Comprehensive health, dental, and vision insurance</li>
                <li>• Unlimited PTO and flexible working hours</li>
                <li>• Remote-first culture with optional office access</li>
                <li>• Professional development budget</li>
                <li>• Top-tier equipment and tools</li>
                <li>• Regular team events and offsites</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Our Values</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>User-first:</strong> Everything we do serves our community</li>
                <li>• <strong>Move fast:</strong> We iterate quickly and learn from feedback</li>
                <li>• <strong>Own it:</strong> Take responsibility and see things through</li>
                <li>• <strong>Be honest:</strong> Direct communication builds trust</li>
                <li>• <strong>Stay humble:</strong> There's always more to learn</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}