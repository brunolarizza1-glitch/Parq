import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ArrowLeft, Search, MessageCircle, Book, Phone, Mail, Clock } from "lucide-react";
import Footer from "@/components/footer";
import { useState } from "react";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      title: "Getting Started",
      icon: Book,
      questions: [
        {
          question: "How do I create an account?",
          answer: "You can sign up using your email address or phone number. Just click 'Sign Up' and follow the simple steps to verify your account."
        },
        {
          question: "Is Parq free to use?",
          answer: "Yes! Creating an account and browsing parking spaces is completely free. You only pay when you book a parking space."
        },
        {
          question: "How do I find parking near me?",
          answer: "Use our search feature to enter your destination. We'll show you available parking spaces nearby with real-time availability and pricing."
        }
      ]
    },
    {
      title: "Booking & Payment",
      icon: MessageCircle,
      questions: [
        {
          question: "How do I book a parking space?",
          answer: "Find a space you like, select your dates and times, then click 'Book Now'. You'll receive instant confirmation with access details."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, debit cards, and digital payment methods like Apple Pay and Google Pay."
        },
        {
          question: "Can I cancel my booking?",
          answer: "Yes, you can cancel most bookings for free up to 24 hours before your reservation starts. Check the specific cancellation policy for each space."
        }
      ]
    },
    {
      title: "For Hosts",
      icon: Phone,
      questions: [
        {
          question: "How do I list my parking space?",
          answer: "Click 'List Your Space' and provide details about your parking spot, including location, availability, and pricing. We'll verify your listing within 24 hours."
        },
        {
          question: "How much can I earn?",
          answer: "Earnings vary by location and demand. Most hosts earn $50-300 per month. Use our earnings calculator to estimate your potential income."
        },
        {
          question: "When do I get paid?",
          answer: "We transfer your earnings directly to your bank account weekly. You can track your earnings in real-time through your host dashboard."
        }
      ]
    }
  ];

  const contactOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      available: "24/7"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      action: "Send Email",
      available: "Response within 2 hours"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      action: "Call Now",
      available: "Mon-Fri 8AM-8PM PST"
    }
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-xl opacity-90">Find answers to common questions or get in touch with our support team.</p>
          
          {/* Search */}
          <div className="relative mt-8 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center mb-6">
                  <category.icon className="w-6 h-6 text-primary mr-3" />
                  <h3 className="text-xl font-semibold">{category.title}</h3>
                </div>
                
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <Card key={faqIndex}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{faq.question}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-lg text-muted-foreground">
              Our support team is here to help you with any questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactOptions.map((option, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <option.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                  <div className="flex items-center justify-center text-xs text-muted-foreground mb-4">
                    <Clock className="w-3 h-3 mr-1" />
                    {option.available}
                  </div>
                  <Button className="w-full">{option.action}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8 text-center">Quick Links</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/features" className="text-center p-4 rounded-lg hover:bg-muted transition-colors">
              <Book className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">How It Works</p>
            </Link>
            
            <Link href="/safety" className="text-center p-4 rounded-lg hover:bg-muted transition-colors">
              <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Safety Tips</p>
            </Link>
            
            <Link href="/profile" className="text-center p-4 rounded-lg hover:bg-muted transition-colors">
              <Phone className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Account Settings</p>
            </Link>
            
            <Link href="/terms" className="text-center p-4 rounded-lg hover:bg-muted transition-colors">
              <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Terms & Privacy</p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}