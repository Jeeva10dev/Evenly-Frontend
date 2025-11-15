import React, { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { getBalances } from "../utils/api";
import BackButton from "../components/BackButton.jsx";

export default function BalancesPage() {
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBalances() {
      setLoading(true);
      try {
        const res = await getBalances();
        setBalances(res.data);
      } catch (err) {
        console.error("Error fetching balances:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBalances();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-12 flex justify-center">
        <BarLoader width={"100%"} color="#36d7b7" />
      </div>
    );
  }

  if (!balances) return null;

  const { oweDetails } = balances;
  const hasOwed = oweDetails.youAreOwedBy.length > 0;
  const hasOwing = oweDetails.youOwe.length > 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <BackButton inline className="mr-1" />
        <h1 className="text-3xl font-bold">Your Balances</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* You are owed */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowUpCircle className="h-5 w-5 text-green-500 mr-2" />
              You are owed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasOwed ? (
              <div className="space-y-3">
                {oweDetails.youAreOwedBy.map((item) => (
                  <Link
                    to={`/person/${item.userId}`}
                    key={item.userId}
                    className="flex items-center justify-between hover:bg-muted p-3 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={item.imageUrl} />
                        <AvatarFallback>{item?.name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Click to view details
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600 text-lg">
                      ${item.amount.toFixed(2)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No one owes you money</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* You owe */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowDownCircle className="h-5 w-5 text-red-500 mr-2" />
              You owe
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasOwing ? (
              <div className="space-y-3">
                {oweDetails.youOwe.map((item) => (
                  <Link
                    to={`/person/${item.userId}`}
                    key={item.userId}
                    className="flex items-center justify-between hover:bg-muted p-3 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={item.imageUrl} />
                        <AvatarFallback>{item?.name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Click to settle up
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-red-600 text-lg">
                      ${item.amount.toFixed(2)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You don't owe anyone</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Balance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">You are owed</p>
              <p className="text-2xl font-bold text-green-600">
                ${balances.youAreOwed.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">You owe</p>
              <p className="text-2xl font-bold text-red-600">
                ${balances.youOwe.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Net balance</p>
              <p
                className={`text-2xl font-bold ${
                  balances.totalBalance > 0
                    ? "text-green-600"
                    : balances.totalBalance < 0
                    ? "text-red-600"
                    : ""
                }`}
              >
                {balances.totalBalance > 0 ? "+" : ""}
                ${balances.totalBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
