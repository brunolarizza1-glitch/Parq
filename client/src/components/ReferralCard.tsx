import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift, Users, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Referral } from "@shared/schema";

interface ReferralCardProps {
  userId: string;
}

export function ReferralCard({ userId }: ReferralCardProps) {
  const [referralCode, setReferralCode] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's referrals
  const { data: referrals = [], isLoading } = useQuery<Referral[]>({
    queryKey: [`/api/referrals/user/${userId}`],
  });

  // Create new referral code
  const createReferralMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/referrals/create"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/referrals/user/${userId}`] });
      toast({
        title: "Referral code created!",
        description: "Your new referral code is ready to share.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create referral code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const primaryReferral = referrals.find(r => r.status === "pending") || referrals[0];
  const completedReferrals = referrals.filter(r => r.status === "completed").length;
  const totalEarnings = completedReferrals * 10; // $10 per referral

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy referral code.",
        variant: "destructive",
      });
    }
  };

  const shareReferral = () => {
    if (!primaryReferral) return;
    
    const shareText = `Join Parq and we both get $10! Use my code: ${primaryReferral.referralCode}`;
    const shareUrl = `${window.location.origin}?ref=${primaryReferral.referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: "Join Parq - Get $10!",
        text: shareText,
        url: shareUrl,
      });
    } else {
      copyToClipboard(`${shareText} ${shareUrl}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="referral-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-green-600" />
          Referral Program
        </CardTitle>
        <CardDescription>
          Earn $10 for every friend you refer. They get $10 too!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
              <DollarSign className="h-5 w-5" />
              {totalEarnings}
            </div>
            <p className="text-sm text-gray-600">Earned</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600">
              <Users className="h-5 w-5" />
              {completedReferrals}
            </div>
            <p className="text-sm text-gray-600">Friends Joined</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {referrals.filter(r => r.status === "pending").length}
            </div>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>

        {/* Referral Code Section */}
        {primaryReferral ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="referral-code">Your Referral Code</Label>
              <div className="flex mt-1 gap-2">
                <Input
                  id="referral-code"
                  value={primaryReferral.referralCode}
                  readOnly
                  className="font-mono text-lg font-semibold bg-green-50 border-green-200"
                  data-testid="referral-code-input"
                />
                <Button
                  onClick={() => copyToClipboard(primaryReferral.referralCode)}
                  variant="outline"
                  size="icon"
                  data-testid="copy-referral-button"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={shareReferral}
                className="flex-1"
                data-testid="share-referral-button"
              >
                <Gift className="h-4 w-4 mr-2" />
                Share & Earn $10
              </Button>
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <p className="font-semibold mb-1">How it works:</p>
              <ul className="space-y-1 text-xs">
                <li>• Share your code with friends</li>
                <li>• They sign up and complete their first booking</li>
                <li>• You both get $10 in account credits</li>
                <li>• Credits can be used for any parking reservation</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-gray-600">Get started with the referral program!</p>
            <Button
              onClick={() => createReferralMutation.mutate()}
              disabled={createReferralMutation.isPending}
              data-testid="create-referral-button"
            >
              {createReferralMutation.isPending ? "Creating..." : "Create Referral Code"}
            </Button>
          </div>
        )}

        {/* Recent Referrals */}
        {referrals.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Recent Referrals</h4>
            <div className="space-y-2">
              {referrals.slice(0, 3).map((referral) => (
                <div
                  key={referral.id}
                  className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded"
                >
                  <span className="font-mono text-sm">{referral.referralCode}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      referral.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : referral.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {referral.status === "completed" ? "Earned $10" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}