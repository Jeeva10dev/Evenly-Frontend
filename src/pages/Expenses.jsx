import React from "react";
import { ExpenseForm } from "../components/ExpenseForm.jsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Card, CardContent } from "../components/ui/card";
import BackButton from "../components/BackButton.jsx";

export default function NewExpensePage({ onNavigate }) {
  return (
    <div className="container max-w-3xl mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BackButton inline className="mr-1" />
          <h1 className="text-5xl gradient-title">Add a new expense</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Record a new expense to split with others
        </p>
      </div>

      <Card className="shadow-xl">
        <CardContent>
          <Tabs className="pb-3" defaultValue="individual">
            <TabsList className="grid w-full grid-cols-2 bg-muted/60 p-1 rounded-lg border">
              <TabsTrigger
                value="individual"
                className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Individual Expense
              </TabsTrigger>
              <TabsTrigger
                value="group"
                className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Group Expense
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="mt-0">
              <ExpenseForm
                type="individual"
                onSuccess={(id) => {
                  if (onNavigate) onNavigate(`/person/${id}`);
                }}
              />
            </TabsContent>

            <TabsContent value="group" className="mt-0">
              <ExpenseForm
                type="group"
                onSuccess={(id) => {
                  if (onNavigate) onNavigate(`/groups/${id}`);
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
