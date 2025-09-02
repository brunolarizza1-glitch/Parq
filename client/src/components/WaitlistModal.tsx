import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clock, DollarSign, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface WaitlistModalProps {
  spaceId: string;
  spaceTitle: string;
  currentPrice: number;
  children: React.ReactNode;
}

export function WaitlistModal({ spaceId, spaceTitle, currentPrice, children }: WaitlistModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    desiredStartTime: "",
    desiredEndTime: "",
    maxPrice: currentPrice.toString(),
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const joinWaitlistMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/waitlist", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/waitlist/space/${spaceId}`] });
      setOpen(false);
      setFormData({
        desiredStartTime: "",
        desiredEndTime: "",
        maxPrice: currentPrice.toString(),
      });
      toast({
        title: "Added to waitlist!",
        description: "We'll notify you when this spot becomes available.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.desiredStartTime || !formData.desiredEndTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    joinWaitlistMutation.mutate({
      spaceId,
      userId: "sample-user-123", // Demo user
      desiredStartTime: new Date(formData.desiredStartTime),
      desiredEndTime: new Date(formData.desiredEndTime),
      maxPrice: parseFloat(formData.maxPrice),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild data-testid="waitlist-trigger">
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="waitlist-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Join Waitlist
          </DialogTitle>
          <DialogDescription>
            Get notified when "{spaceTitle}" becomes available for your desired time.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="start-time">Desired Start Time</Label>
            <Input
              id="start-time"
              type="datetime-local"
              value={formData.desiredStartTime}
              onChange={(e) => setFormData({ ...formData, desiredStartTime: e.target.value })}
              required
              data-testid="waitlist-start-time"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-time">Desired End Time</Label>
            <Input
              id="end-time"
              type="datetime-local"
              value={formData.desiredEndTime}
              onChange={(e) => setFormData({ ...formData, desiredEndTime: e.target.value })}
              required
              data-testid="waitlist-end-time"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-price">Maximum Price per Hour</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="max-price"
                type="number"
                step="0.50"
                min="0"
                value={formData.maxPrice}
                onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                className="pl-10"
                placeholder="0.00"
                data-testid="waitlist-max-price"
              />
            </div>
            <p className="text-sm text-gray-600">
              Current rate: ${currentPrice}/hour
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-800">How it works:</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• We'll monitor availability for your desired time slot</li>
              <li>• You'll get notified instantly when a spot opens up</li>
              <li>• You'll have 15 minutes to book before it goes to the next person</li>
              <li>• No cost to join the waitlist</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={joinWaitlistMutation.isPending}
              className="flex-1"
              data-testid="join-waitlist-button"
            >
              {joinWaitlistMutation.isPending ? "Joining..." : "Join Waitlist"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="cancel-waitlist-button"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}