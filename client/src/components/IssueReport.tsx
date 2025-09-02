import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { issueReportSchema, type IssueReport, type Booking } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Car, KeyRound, Wrench } from "lucide-react";

interface IssueReportProps {
  booking: Booking;
}

export function IssueReport({ booking }: IssueReportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<IssueReport>({
    resolver: zodResolver(issueReportSchema),
    defaultValues: {
      bookingId: booking.id,
      issueType: undefined,
      description: "",
    },
  });

  const issueReportMutation = useMutation({
    mutationFn: async (data: IssueReport) => {
      return apiRequest("POST", "/api/bookings/report-issue", data);
    },
    onSuccess: () => {
      toast({
        title: "Issue Reported",
        description: "Thank you for reporting this issue. Our team will review it shortly and may provide a refund if applicable.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setIsOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Report Issue",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const issueTypes = [
    {
      value: "blocked" as const,
      label: "Space is Blocked",
      description: "Another vehicle is occupying the space",
      icon: Car,
    },
    {
      value: "no_access" as const,
      label: "Cannot Access",
      description: "Unable to reach or enter the parking space",
      icon: KeyRound,
    },
    {
      value: "damaged" as const,
      label: "Space is Damaged",
      description: "Physical damage prevents safe parking",
      icon: Wrench,
    },
    {
      value: "other" as const,
      label: "Other Issue",
      description: "Something else is wrong with the space",
      icon: AlertTriangle,
    },
  ];

  const canReportIssue = () => {
    // Can report issues for active bookings or recently completed ones
    return ["active", "confirmed"].includes(booking.status);
  };

  const onSubmit = (data: IssueReport) => {
    issueReportMutation.mutate(data);
  };

  if (!canReportIssue()) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          data-testid="button-report-issue"
        >
          <AlertTriangle className="h-4 w-4" />
          Report Issue
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                If there's a problem with your parking space, let us know and we'll help resolve it. 
                Depending on the issue, you may be eligible for a partial or full refund.
              </p>
            </div>

            <FormField
              control={form.control}
              name="issueType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What's the issue?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-issue-type">
                        <SelectValue placeholder="Select the type of issue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {issueTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {type.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe the issue</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide more details about what happened..."
                      className="min-h-[100px]"
                      {...field}
                      data-testid="textarea-issue-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• Our team will review your report within 2 hours</li>
                  <li>• We may contact you for additional information</li>
                  <li>• Eligible cases will receive partial or full refunds</li>
                  <li>• We'll notify you once the issue is resolved</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                  data-testid="button-cancel-report"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={issueReportMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  data-testid="button-submit-report"
                >
                  {issueReportMutation.isPending ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}