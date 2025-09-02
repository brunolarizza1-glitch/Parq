import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, MapPin, Users, Shield, DollarSign, Calendar } from "lucide-react";

type UserType = "lister" | "renter" | "both";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  const handleContinue = () => {
    if (selectedType) {
      setLocation(`/profile-setup?type=${selectedType}`);
    }
  };

  const userTypes = [
    {
      type: "renter" as UserType,
      title: "Find Parking",
      description: "I need to find parking for my car",
      icon: Car,
      features: [
        "Search for open spaces",
        "Book instantly with safe payment",
        "See real-time availability",
        "Check in and out on your phone",
        "Rate and review spaces"
      ],
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      type: "lister" as UserType,
      title: "Rent My Space",
      description: "I want to rent out my parking space to make money",
      icon: MapPin,
      features: [
        "List as many spaces as you want",
        "Set your own prices",
        "Manage bookings easily",
        "Get paid safely",
        "Host protection included"
      ],
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      iconColor: "text-green-600"
    },
    {
      type: "both" as UserType,
      title: "Both",
      description: "I want to rent out spaces and find parking when I need it",
      icon: Users,
      features: [
        "All parking features",
        "All hosting features",
        "One simple dashboard",
        "Switch modes easily",
        "Total flexibility"
      ],
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Parq
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Let's set up your account
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            How would you like to use Parq?
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {userTypes.map((userType) => {
              const Icon = userType.icon;
              const isSelected = selectedType === userType.type;
              
              return (
                <Card
                  key={userType.type}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? "ring-2 ring-pink-500 ring-offset-2 " + userType.color
                      : userType.color
                  }`}
                  onClick={() => setSelectedType(userType.type)}
                  data-testid={`user-type-${userType.type}`}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto rounded-full ${userType.color.replace('bg-', 'bg-').replace('50', '100')} flex items-center justify-center mb-4`}>
                      <Icon className={`h-8 w-8 ${userType.iconColor}`} />
                    </div>
                    <CardTitle className="text-xl mb-2">{userType.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {userType.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2">
                      {userType.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${userType.iconColor.replace('text-', 'bg-')}`} />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {userType.type === "lister" && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600 dark:text-gray-300">ID verification required</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button
              onClick={handleContinue}
              disabled={!selectedType}
              className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 text-lg font-medium"
              data-testid="button-continue"
            >
              Continue
            </Button>
          </div>

          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <Shield className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold mb-2">Secure & Verified</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  All users undergo identity verification for safety
                </p>
              </div>
              <div className="flex flex-col items-center">
                <DollarSign className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold mb-2">Secure Payments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Protected transactions with instant payouts
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Calendar className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold mb-2">Flexible Booking</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Book by the hour, day, or month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}