import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";
import { type User, type Earning, type Payout, type PayoutMethod } from "@shared/schema";
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  CreditCard, 
  Info,
  User as UserIcon,
  TrendingUp,
  ArrowRight,
  Banknote,
  BarChart3,
  Download,
  Settings,
  Plus,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Calendar as CalendarIcon,
  TrendingDown
} from "lucide-react";

export default function Payouts() {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const user = authUser as User | undefined;
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <UserIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to view your payouts</p>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Enhanced sample data for demonstration
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Mock earnings data
  const mockEarnings = {
    current: 247.50,
    pending: 89.25,
    available: 158.25,
    thisMonth: 247.50,
    lastMonth: 193.80,
    totalEarned: 1247.35,
    totalPaidOut: 999.10,
    avgMonthly: 186.20
  };

  const recentTransactions = [
    {
      id: "1",
      type: "earning",
      amount: 25.50,
      description: "Parking booking #PB123",
      date: "2024-09-02",
      status: "available"
    },
    {
      id: "2", 
      type: "payout",
      amount: 158.75,
      description: "Weekly payout",
      date: "2024-09-01",
      status: "completed"
    },
    {
      id: "3",
      type: "earning",
      amount: 18.75,
      description: "Parking booking #PB122",
      date: "2024-08-31",
      status: "pending"
    }
  ];

  const upcomingPayouts = [
    {
      amount: 89.25,
      date: "2024-09-08",
      description: "Available earnings"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Host Earnings</h1>
            <p className="text-muted-foreground">Track your parking space earnings and manage payouts</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* MVP Status Alert */}
        <Alert className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>MVP Feature:</strong> Enhanced payout tracking with detailed analytics. This shows sample data for demonstration. 
            Real Stripe Connect integration coming soon for automated payouts.
          </AlertDescription>
        </Alert>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowBalanceDetails(!showBalanceDetails)}
                className="h-6 w-6 p-0"
              >
                {showBalanceDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-available-balance">
                {showBalanceDetails ? `$${mockEarnings.available.toFixed(2)}` : "$•••.••"}
              </div>
              <p className="text-xs text-muted-foreground">Ready for payout</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="text-pending-earnings">
                ${mockEarnings.pending.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Processing (2-3 days)</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{currentMonth}</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-current-month">
                ${mockEarnings.thisMonth.toFixed(2)}
              </div>
              <p className="text-xs text-green-600">
                +27.7% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-earned">
                ${mockEarnings.totalEarned.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payouts">Payout Methods</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Payouts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-green-600" />
                    Upcoming Payouts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingPayouts.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingPayouts.map((payout, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">${payout.amount.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">{payout.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{payout.date}</p>
                            <Badge variant="secondary">Scheduled</Badge>
                          </div>
                        </div>
                      ))}
                      <Button className="w-full" disabled>
                        <Banknote className="w-4 h-4 mr-2" />
                        Auto-payout Enabled
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No upcoming payouts</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {transaction.type === "earning" ? (
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <Banknote className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {transaction.type === "earning" ? "+" : "-"}${transaction.amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{transaction.date}</p>
                          <Badge 
                            variant={
                              transaction.status === "completed" ? "default" : 
                              transaction.status === "available" ? "secondary" : 
                              "outline"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Detailed view of all your earnings and payouts
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {transaction.type === "earning" ? (
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Banknote className="w-5 h-5 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {transaction.type === "earning" ? "+" : "-"}${transaction.amount.toFixed(2)}
                        </p>
                        <Badge 
                          variant={
                            transaction.status === "completed" ? "default" : 
                            transaction.status === "available" ? "secondary" : 
                            "outline"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payout Methods Tab */}
          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payout Methods
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button disabled>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Method
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Payout Method</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-muted-foreground">
                          Payout method setup will be available with Stripe Connect integration.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No payout method connected</h3>
                  <p className="text-muted-foreground mb-6">
                    Connect a bank account or debit card to receive automatic payouts
                  </p>
                  <div className="space-y-4">
                    <Button disabled className="w-full">
                      <Building2 className="w-4 h-4 mr-2" />
                      Add Bank Account
                      <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                    </Button>
                    <Button disabled variant="outline" className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Add Debit Card
                      <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">This Month</span>
                      <span className="text-sm text-green-600">+27.7%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>${mockEarnings.lastMonth.toFixed(2)} last month</span>
                      <span>${mockEarnings.thisMonth.toFixed(2)} this month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Monthly Earnings</span>
                      <span className="font-medium">${mockEarnings.avgMonthly.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Bookings</span>
                      <span className="font-medium">47</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Success Rate</span>
                      <span className="font-medium text-green-600">98.5%</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Platform Fee</span>
                      <span className="font-medium">15%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* How Payouts Work */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How Payouts Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium mb-2">Guest Completes Booking</h4>
                <p className="text-sm text-muted-foreground">
                  Payment is processed when the parking period ends successfully
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-medium mb-2">Earnings Processing</h4>
                <p className="text-sm text-muted-foreground">
                  Your share (85%) is calculated and held for 2-3 business days
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                  <Banknote className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium mb-2">Automatic Payout</h4>
                <p className="text-sm text-muted-foreground">
                  Funds are transferred to your connected account weekly
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}