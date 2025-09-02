import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/footer";
import { ArrowLeft, Users, Heart, Scale, Shield, AlertTriangle } from "lucide-react";

export default function CommunityGuidelines() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile/legal" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Legal
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Community Guidelines</h1>
          </div>
          <p className="text-muted-foreground">Creating a safe and respectful parking community</p>
        </div>

        {/* Core Principles */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Our Community Values
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              ParkEasy thrives when everyone feels welcome and safe. These guidelines help create 
              a positive experience for all users - whether you're finding a parking spot or hosting one.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* No Discrimination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                No Discrimination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-foreground">Equal treatment for all</h4>
                  <p className="text-sm text-muted-foreground">
                    Discrimination based on race, ethnicity, religion, gender, sexual orientation, 
                    disability, or any other protected characteristic is strictly prohibited.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Fair access</h4>
                  <p className="text-sm text-muted-foreground">
                    All users deserve equal access to parking opportunities and should be treated with respect.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Inclusive environment</h4>
                  <p className="text-sm text-muted-foreground">
                    We're committed to building an inclusive community where everyone feels welcome.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* No Harassment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                No Harassment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-foreground">Respectful communication</h4>
                  <p className="text-sm text-muted-foreground">
                    All interactions must be professional and respectful. Threatening, abusive, 
                    or inappropriate behavior will result in account suspension.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Privacy boundaries</h4>
                  <p className="text-sm text-muted-foreground">
                    Respect other users' privacy and personal boundaries. Don't share personal 
                    information without consent.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Report inappropriate behavior</h4>
                  <p className="text-sm text-muted-foreground">
                    If you experience or witness harassment, report it immediately to our support team.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Follow Local Laws */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-green-600" />
                Follow Local Laws
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-foreground">Legal compliance</h4>
                  <p className="text-sm text-muted-foreground">
                    All users must comply with local, state, and federal laws including parking 
                    regulations, zoning laws, and tax requirements.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Parking regulations</h4>
                  <p className="text-sm text-muted-foreground">
                    Respect all posted parking signs, time limits, and permit requirements. 
                    Users are responsible for any parking violations.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Property rights</h4>
                  <p className="text-sm text-muted-foreground">
                    Only list parking spaces you own or have explicit permission to rent. 
                    Respect private property and neighborhood rules.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Tax obligations</h4>
                  <p className="text-sm text-muted-foreground">
                    Hosts are responsible for reporting income and paying applicable taxes 
                    on earnings from parking space rentals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enforcement */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Enforcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Violations of these guidelines may result in:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Warning and guidance on policy compliance</li>
              <li>Temporary account suspension</li>
              <li>Permanent account termination</li>
              <li>Legal action when appropriate</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              We review all reports thoroughly and fairly. Users have the right to appeal enforcement actions.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mt-6">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-foreground mb-2">Questions or Concerns?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you have questions about these guidelines or need to report a violation
            </p>
            <Button asChild data-testid="button-contact-legal">
              <a href="mailto:legal@parkeasy.com">
                Contact Legal Team
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}