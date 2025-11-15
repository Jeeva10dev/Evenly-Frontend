import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getUser } from "../utils/api";
import { BarLoader } from "react-spinners";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { PlusCircle, ArrowLeftRight } from "lucide-react";
import { ExpenseList } from "../components/ExpenseList";
import { SettlementList } from "../components/SettlementList";
import { useAuthContext } from "../hooks/AuthContext.jsx";
import BackButton from "../components/BackButton.jsx";

export default function PersonExpensesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("expenses");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    otherUser: null,
    expenses: [],
    settlements: [],
    balance: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/${id}/expenses`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch user expenses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <BarLoader width={"100%"} color="#36d7b7" />
      </div>
    );
  }

  const { otherUser, expenses, settlements, balance } = data;

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton inline className="mr-1" />
            <Avatar className="h-16 w-16">
              <AvatarImage src={otherUser?.imageUrl} />
              <AvatarFallback>
                {otherUser?.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl gradient-title">{otherUser?.name}</h1>
              <p className="text-muted-foreground">{otherUser?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              className="bg-white text-black border-gray-300 hover:bg-gray-50"
            >
              <Link to={`/settlements/user/${id}`}>
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Settle up
              </Link>
            </Button>
            <Button asChild className="bg-black text-white hover:bg-gray-800">
              <Link to={`/expenses/new`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add expense
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Balance card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              {balance === 0 ? (
                <p>You are all settled up</p>
              ) : balance > 0 ? (
                <p>
                  <span className="font-medium">{otherUser?.name}</span> owes
                  you
                </p>
              ) : (
                <p>
                  You owe <span className="font-medium">{otherUser?.name}</span>
                </p>
              )}
            </div>
            <div
              className={`text-2xl font-bold ${
                balance > 0
                  ? "text-green-600"
                  : balance < 0
                    ? "text-red-600"
                    : ""
              }`}
            >
              ${Math.abs(balance).toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for expenses and settlements */}
      <Tabs
        defaultValue="expenses"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 bg-muted/60 p-1 rounded-lg border">
          <TabsTrigger
            value="expenses"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Expenses ({expenses?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="settlements"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Settlements ({settlements?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          {expenses && expenses.length > 0 ? (
            <ExpenseList
              expenses={expenses}
              currentUserId={user?.id || user?._id}
              showOtherPerson={false}
              otherPersonId={id}
              userLookupMap={{ [otherUser?.id || otherUser?._id]: otherUser }}
            />
          ) : (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No expenses found
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settlements" className="space-y-4">
          {settlements && settlements.length > 0 ? (
            <SettlementList
              settlements={settlements}
              currentUserId={user?.id || user?._id}
              userLookupMap={{ [otherUser?.id || otherUser?._id]: otherUser }}
            />
          ) : (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No settlements found
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
