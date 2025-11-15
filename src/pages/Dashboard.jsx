import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/AuthContext.jsx";
import { BarLoader } from "react-spinners";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { PlusCircle, Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ExpenseSummary } from "../components/ExpenseSummary.jsx";
import { BalanceSummary } from "../components/BalanceSummary.jsx";
import { GroupList } from "../components/GroupList.jsx";
import API from "../utils/api.js";

export default function Dashboard() {
  const { user } = useAuthContext();
  const name = user?.name || "";

  // Replace Convex hooks with local state + fetch from your Node backend later
  const [balances, setBalances] = useState(null);
  const [groups, setGroups] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [balancesRes, groupsRes, totalSpentRes, monthlySpendingRes] = await Promise.all([
          API.get("/dashboard/balances"),
          API.get("/dashboard/groups"),
          API.get("/dashboard/total-spent"),
          API.get("/dashboard/monthly-spending"),
        ]);

        setBalances(balancesRes.data);
        setGroups(groupsRes.data);
        setTotalSpent(totalSpentRes.data);
        setMonthlySpending(monthlySpendingRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {isLoading ? (
        <div className="w-full py-12 flex justify-center">
          <BarLoader width={"100%"} color="#36d7b7" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex  justify-between flex-col sm:flex-row sm:items-center gap-4">
            <h1 className="text-5xl gradient-title">{`Welcome${name ? `, ${name}` : ""}`}</h1>
            <Button asChild className="bg-black text-white hover:bg-gray-800">
              <Link to="/expenses/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add expense
              </Link>
            </Button>
          </div>

          {/* Balance overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {balances?.totalBalance > 0 ? (
                    <span className="text-green-600">
                      +${balances?.totalBalance.toFixed(2)}
                    </span>
                  ) : balances?.totalBalance < 0 ? (
                    <span className="text-red-600">
                      -${Math.abs(balances?.totalBalance).toFixed(2)}
                    </span>
                  ) : (
                    <span>$0.00</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {balances?.totalBalance > 0
                    ? "You are owed money"
                    : balances?.totalBalance < 0
                    ? "You owe money"
                    : "All settled up!"}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  You are owed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${balances?.youAreOwed?.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {balances?.oweDetails?.youAreOwedBy?.length || 0} people
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  You owe
                </CardTitle>
              </CardHeader>
              <CardContent>
                {balances?.oweDetails?.youOwe?.length > 0 ? (
                  <>
                    <div className="text-2xl font-bold text-red-600">
                      ${balances?.youOwe?.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      To {balances?.oweDetails?.youOwe?.length || 0} people
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">$0.00</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      You don't owe anyone
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main dashboard content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Expense summary */}
              <ExpenseSummary
                monthlySpending={monthlySpending}
                totalSpent={totalSpent}
              />
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Balance details */}
              <Card className="shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Balance Details</CardTitle>
                    <Button variant="link" asChild className="p-0">
                      <Link to="/balances">
                        View all
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <BalanceSummary balances={balances} />
                </CardContent>
              </Card>

              {/* Groups */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Groups</CardTitle>
                    <Button variant="link" asChild className="p-0">
                      <Link to="/contacts">
                        View all
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <GroupList groups={groups} />
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
                    <Link to="/contacts?createGroup=true">
                      <Users className="mr-2 h-4 w-4" />
                      Create new group
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
