import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Zap, Calendar, MapPin, Clock } from "lucide-react";

interface PricingSuggestion {
  timeSlot: string;
  currentPrice: number;
  suggestedPrice: number;
  confidence: "high" | "medium" | "low";
  reason: string;
  potentialIncrease: number;
}

interface SmartPricingProps {
  spaceId: string;
  currentPrice: number;
  address: string;
  spaceType: string;
}

export function SmartPricing({ spaceId, currentPrice, address, spaceType }: SmartPricingProps) {
  const [suggestions, setSuggestions] = useState<PricingSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock smart pricing analysis
  useEffect(() => {
    const generateSuggestions = () => {
      setIsAnalyzing(true);
      
      // Simulate API delay
      setTimeout(() => {
        const baseSuggestions: PricingSuggestion[] = [
          {
            timeSlot: "Peak Hours (8AM-10AM)",
            currentPrice,
            suggestedPrice: currentPrice * 1.4,
            confidence: "high",
            reason: "High demand during morning commute",
            potentialIncrease: 40,
          },
          {
            timeSlot: "Lunch Rush (12PM-2PM)",
            currentPrice,
            suggestedPrice: currentPrice * 1.2,
            confidence: "medium",
            reason: "Moderate demand for lunch meetings",
            potentialIncrease: 20,
          },
          {
            timeSlot: "Evening Peak (5PM-7PM)",
            currentPrice,
            suggestedPrice: currentPrice * 1.5,
            confidence: "high",
            reason: "Evening commute and dining demand",
            potentialIncrease: 50,
          },
          {
            timeSlot: "Weekend Events",
            currentPrice,
            suggestedPrice: currentPrice * 1.8,
            confidence: "medium",
            reason: "Special events and weekend activities",
            potentialIncrease: 80,
          },
          {
            timeSlot: "Late Night (10PM-6AM)",
            currentPrice,
            suggestedPrice: currentPrice * 0.7,
            confidence: "low",
            reason: "Lower demand during off-hours",
            potentialIncrease: -30,
          },
        ];

        setSuggestions(baseSuggestions);
        setIsAnalyzing(false);
      }, 2000);
    };

    generateSuggestions();
  }, [currentPrice]);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high": return "bg-green-100 text-green-800";
      case "medium": return "bg-blue-100 text-blue-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (increase: number) => {
    if (increase > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const averageIncrease = suggestions.reduce((acc, s) => acc + s.potentialIncrease, 0) / suggestions.length;

  return (
    <Card data-testid="smart-pricing-card" className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Smart Pricing Suggestions
        </CardTitle>
        <CardDescription className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {address}
          </span>
          <span className="flex items-center gap-1">
            <Badge variant="outline">{spaceType}</Badge>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${currentPrice.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Current Rate</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-2xl font-bold text-green-600">
              {averageIncrease > 0 ? "+" : ""}{averageIncrease.toFixed(0)}%
            </div>
            <p className="text-sm text-gray-600">Avg. Potential</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${(currentPrice * (1 + averageIncrease / 100)).toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Suggested Avg.</p>
          </div>
        </div>

        {/* Analysis Status */}
        {isAnalyzing ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing market data and demand patterns...</p>
          </div>
        ) : (
          <>
            {/* Time-based Suggestions */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Dynamic Pricing Recommendations
              </h4>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    data-testid={`pricing-suggestion-${index}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{suggestion.timeSlot}</span>
                        <Badge className={getConfidenceColor(suggestion.confidence)}>
                          {suggestion.confidence} confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{suggestion.reason}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        {getTrendIcon(suggestion.potentialIncrease)}
                        <span className="font-bold text-lg">
                          ${suggestion.suggestedPrice.toFixed(2)}
                        </span>
                      </div>
                      <span className={`text-sm ${
                        suggestion.potentialIncrease > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {suggestion.potentialIncrease > 0 ? "+" : ""}{suggestion.potentialIncrease}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Insights */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                Market Insights
              </h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Nearby spaces charge 15-25% more during peak hours</li>
                <li>• Your location has high foot traffic on weekends</li>
                <li>• Event venues within 0.5 miles boost demand by 40%</li>
                <li>• EV charging capability increases rates by $2-3/hour</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                data-testid="apply-suggestions-button"
              >
                <Zap className="h-4 w-4 mr-2" />
                Apply Smart Pricing
              </Button>
              <Button 
                variant="outline"
                data-testid="customize-pricing-button"
              >
                Customize Rules
              </Button>
            </div>

            {/* Additional Tips */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p className="font-semibold mb-1">Pro Tips:</p>
              <ul className="space-y-1">
                <li>• Enable automatic pricing updates for optimal earnings</li>
                <li>• Monitor booking rates and adjust confidence levels</li>
                <li>• Consider seasonal events and local happenings</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}