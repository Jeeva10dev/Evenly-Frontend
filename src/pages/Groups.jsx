import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getGroup,
  getGroupExpenses,
  createGroup,
  updateGroup,
  deleteGroup,
} from "../utils/api";
import { BarLoader } from "react-spinners";
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
import { PlusCircle, ArrowLeftRight, Users } from "lucide-react";
import { ExpenseList } from "../components/ExpenseList";
import { SettlementList } from "../components/SettlementList";
import { GroupBalances } from "../components/GroupBalances";
import { GroupMembers } from "../components/GroupMembers";
import { useAuthContext } from "../hooks/AuthContext.jsx";
import BackButton from "../components/BackButton.jsx";

export default function GroupExpensesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("expenses");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    group: null,
    members: [],
    expenses: [],
    settlements: [],
    balances: [],
    userLookupMap: {},
  });

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const [groupRes, expensesRes] = await Promise.all([
          getGroup(id),
          getGroupExpenses(id),
        ]);

        const groupInfo = groupRes.data?.selectedGroup
          ? groupRes.data
          : { selectedGroup: groupRes.data?.group, groups: [] };

        const details = expensesRes.data;

        setData({
          group: groupInfo.selectedGroup || details.group,
          members: details.members || groupInfo.selectedGroup?.members || [],
          expenses: details.expenses || [],
          settlements: details.settlements || [],
          balances: details.balances || [],
          userLookupMap: details.userLookupMap || {},
        });
      } catch (err) {
        console.error("Error fetching group data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroupData();
  }, [id]);

  // Example: create, update, delete group functions (can be used in modals/buttons)
  const handleCreateGroup = async (groupData) => {
    try {
      await createGroup(groupData);
      // Optionally refetch or navigate
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  const handleUpdateGroup = async (groupId, groupData) => {
    try {
      await updateGroup(groupId, groupData);
      // Optionally refetch
    } catch (err) {
      console.error("Error updating group:", err);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      // Optionally navigate away
    } catch (err) {
      console.error("Error deleting group:", err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <BarLoader width={"100%"} color="#36d7b7" />
      </div>
    );
  }

  const { group, members, expenses, settlements, balances, userLookupMap } =
    data;

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton inline className="mr-1" />
            <div className="bg-primary/10 p-4 rounded-md">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl gradient-title">{group?.name}</h1>
              <p className="text-muted-foreground">{group?.description}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {members.length} members
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              className="bg-white text-black border-gray-300 hover:bg-gray-50"
            >
              <Link to={`/settlements/group/${id}`}>
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

      {/* Grid layout for group details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card className="shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Group Balances</CardTitle>
            </CardHeader>
            <CardContent>
              {balances && balances.length > 0 ? (
                <GroupBalances
                  balances={balances}
                  currentUserId={user?.id || user?._id}
                />
              ) : (
                <div className="text-muted-foreground py-4">
                  No balance history
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Members</CardTitle>
            </CardHeader>
            <CardContent>
              {members && members.length > 0 ? (
                <GroupMembers members={members} />
              ) : (
                <div className="text-muted-foreground py-4">
                  No members found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
              showOtherPerson={true}
              isGroupExpense={true}
              userLookupMap={userLookupMap}
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
              isGroupSettlement={true}
              userLookupMap={userLookupMap}
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
