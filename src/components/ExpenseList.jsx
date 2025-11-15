import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getCategoryById, getCategoryIcon } from "../lib/ExpenseCategories";
import { deleteExpense } from "../utils/api";

export function ExpenseList({
  expenses,
  currentUserId,
  showOtherPerson = true,
  isGroupExpense = false,
  otherPersonId = null,
  userLookupMap = {},
  onExpenseDeleted = () => {},
}) {
  if (!expenses || !expenses.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No expenses found
        </CardContent>
      </Card>
    );
  }

  const getUserDetails = (userId) => {
    return {
      name: userId === currentUserId ? "You" : userLookupMap[userId]?.name || "Other User",
      imageUrl: userLookupMap[userId]?.imageUrl || null,
      id: userId,
    };
  };

  const canDeleteExpense = (expense) => {
    return currentUserId && (expense.createdBy === currentUserId || expense.paidByUserId === currentUserId);
  };

  const handleDeleteExpense = async (expenseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await deleteExpense(expenseId);
      toast.success("Expense deleted successfully");
      onExpenseDeleted(expenseId);
    } catch (err) {
      toast.error("Failed to delete expense: " + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {expenses.map((expense) => {
        const payer = getUserDetails(expense.paidByUserId);
        const isCurrentUserPayer = expense.paidByUserId === currentUserId;
        const category = getCategoryById(expense.category);
        const CategoryIcon = getCategoryIcon(category.id);
        const showDeleteOption = canDeleteExpense(expense);

        return (
          <Card key={expense._id} className="hover:bg-muted/30 transition-colors">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CategoryIcon className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <h3 className="font-medium">{expense.description}</h3>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
                      {showOtherPerson && (
                        <>
                          <span>•</span>
                          <span>{isCurrentUserPayer ? "You" : payer.name} paid</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-medium">${expense.amount.toFixed(2)}</div>
                    {isGroupExpense ? (
                      <Badge variant="outline" className="mt-1">Group expense</Badge>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {isCurrentUserPayer ? (
                          <span className="text-green-600">You paid</span>
                        ) : (
                          <span className="text-red-600">{payer.name} paid</span>
                        )}
                      </div>
                    )}
                  </div>

                  {showDeleteOption && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100"
                      onClick={() => handleDeleteExpense(expense._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete expense</span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-3 text-sm">
                <div className="flex gap-2 flex-wrap">
                  {expense.splits.map((split, idx) => {
                    const splitUser = getUserDetails(split.userId);
                    const isCurrentUser = split.userId === currentUserId;
                    const shouldShow =
                      showOtherPerson || (!showOtherPerson && (isCurrentUser || split.userId === otherPersonId));

                    if (!shouldShow) return null;

                    return (
                      <Badge key={idx} variant={split.paid ? "outline" : "secondary"} className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={splitUser.imageUrl} />
                          <AvatarFallback>{splitUser.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <span>{isCurrentUser ? "You" : splitUser.name}: ${split.amount.toFixed(2)}</span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
