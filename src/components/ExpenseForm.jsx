import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthContext } from "../hooks/AuthContext.jsx";
import API from "../utils/api.js";
import { Input } from "./ui/input.jsx";
import { Button } from "./ui/button.jsx";
import { Label } from "./ui/label.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.jsx";
import { SplitSelector } from "./SplitSelector.jsx";
import { CategorySelector } from "./CategorySelector.jsx";
import { GroupSelector } from "./GroupSelector.jsx";
import { ParticipantSelector } from "./ParticipantSelector.jsx";
import { getAllCategories } from "../lib/ExpenseCategories.jsx";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ for navigation

const schema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Amount must be a positive number",
    }),
  category: z.string().optional(),
  date: z.date(),
  paidByUserId: z.string().min(1, "Payer is required"),
  splitType: z.enum(["equal", "percentage", "exact"]),
  groupId: z.string().optional(),
});

export function ExpenseForm({ type = "individual", onSuccess }) {
  const { user } = useAuthContext();
  const navigate = useNavigate(); // ✅ React Router hook

  const [participants, setParticipants] = useState(
    type === "group"
      ? []
      : user
        ? [
            {
              id: user.id,
              name: user.name,
              email: user.email,
              imageUrl: user.imageUrl,
            },
          ]
        : []
  );
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [splits, setSplits] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const categories = getAllCategories();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      date: new Date(),
      paidByUserId: user?.id || "",
      splitType: "equal",
      groupId: undefined,
    },
  });

  const amountValue = watch("amount");
  const paidByUserId = watch("paidByUserId");

  useEffect(() => {
    if (user) {
      setParticipants([
        {
          id: user.id,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
        },
      ]);
    }
  }, [user]);

  useEffect(() => {
    if (type !== "group") return;
    (async () => {
      setIsGroupsLoading(true);
      try {
        const { data } = await API.get("/dashboard/groups");
        setGroups(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsGroupsLoading(false);
      }
    })();
  }, [type]);

  const onSubmit = async (data) => {
    const amount = parseFloat(data.amount);
    const formattedSplits = splits.map((s) => ({
      userId: s.userId,
      amount: s.amount,
      paid: s.userId === data.paidByUserId,
    }));

    const total = formattedSplits.reduce((sum, s) => sum + s.amount, 0);
    if (Math.abs(total - amount) > 0.01) {
      toast.error(
        "Split amounts don't add up to the total. Please adjust your splits."
      );
      return;
    }

    const groupId = type === "individual" ? undefined : data.groupId;

    try {
      console.log("Sending expense:", {
        description: data.description,
        amount,
        category: data.category || "Other",
        date: new Date(data.date).toISOString(),
        paidByUserId: data.paidByUserId,
        splitType: data.splitType,
        splits: formattedSplits,
        groupId,
      });

      toast.success("Expense created successfully!");

      // ✅ Reset form and local state
      reset();
      setSelectedGroup(null);
      setSplits([]);
      if (type === "group") {
        setParticipants([]);
      } else {
        setParticipants(
          user
            ? [
                {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  imageUrl: user.imageUrl,
                },
              ]
            : []
        );
      }

      // ✅ Redirect after short delay
      setTimeout(() => {
        if (type === "group" && groupId) {
          navigate(`/groups/${id}`);
        } else {
          navigate(`/person/${user?.id}`);
        }
      }, 1000);

      if (onSuccess) onSuccess(type === "individual" ? null : groupId);
    } catch (e) {
      console.error(e);
      toast.error("Failed to add expense. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Description & Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Lunch, movie tickets, etc."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0.01"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>
        </div>

        {/* Category + Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <CategorySelector
              categories={categories}
              onChange={(cat) => setValue("category", cat)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? new Date(field.value).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => field.onChange(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>
        </div>

        {/* Group Selector */}
        {type === "group" && (
          <div className="space-y-2">
            <Label>Group</Label>
            <GroupSelector
              groups={groups}
              isLoading={isGroupsLoading}
              onChange={(group) => {
                if (!selectedGroup || selectedGroup.id !== group.id) {
                  setSelectedGroup(group);
                  setValue("groupId", group.id);
                  if (
                    Array.isArray(group.members) &&
                    group.members.length > 0
                  ) {
                    setParticipants(group.members);
                    setValue("paidByUserId", group.members[0].id);
                  } else {
                    setParticipants([]);
                    setValue("paidByUserId", "");
                  }
                }
              }}
            />
            {!selectedGroup && (
              <p className="text-xs text-amber-600">
                Please select a group to continue
              </p>
            )}
          </div>
        )}

        {/* Participants */}
        {type === "individual" && (
          <div className="space-y-2">
            <Label>Participants</Label>
            <ParticipantSelector
              participants={participants}
              onParticipantsChange={setParticipants}
              currentUser={{ id: user?.id }}
            />
          </div>
        )}

        {/* Paid By */}
        <div className="space-y-2">
          <Label>Paid by</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register("paidByUserId")}
          >
            <option value="">Select who paid</option>
            {participants
              .filter((p) => p && p.id)
              .map((p) => (
                <option key={`paidby-${p.id}`} value={p.id}>
                  {p.id === user?.id ? "You" : p.name}
                </option>
              ))}
          </select>
          {errors.paidByUserId && (
            <p className="text-sm text-red-500">
              {errors.paidByUserId.message}
            </p>
          )}
        </div>

        {/* Split Type */}
        <div className="space-y-2">
          <Label>Split type</Label>
          <Tabs
            defaultValue="equal"
            onValueChange={(v) => setValue("splitType", v)}
          >
            <TabsList className="grid w-full grid-cols-3 bg-muted/60 p-1 rounded-lg border">
              <TabsTrigger value="equal">Equal</TabsTrigger>
              <TabsTrigger value="percentage">Percentage</TabsTrigger>
              <TabsTrigger value="exact">Exact</TabsTrigger>
            </TabsList>
            <TabsContent value="equal" className="pt-4">
              <SplitSelector
                type="equal"
                amount={parseFloat(amountValue) || 0}
                participants={participants}
                paidByUserId={paidByUserId}
                onSplitsChange={setSplits}
              />
            </TabsContent>
            <TabsContent value="percentage" className="pt-4">
              <SplitSelector
                type="percentage"
                amount={parseFloat(amountValue) || 0}
                participants={participants}
                paidByUserId={paidByUserId}
                onSplitsChange={setSplits}
              />
            </TabsContent>
            <TabsContent value="exact" className="pt-4">
              <SplitSelector
                type="exact"
                amount={parseFloat(amountValue) || 0}
                participants={participants}
                paidByUserId={paidByUserId}
                onSplitsChange={setSplits}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || participants.length <= 1}
        >
          {isSubmitting ? "Creating..." : "Create Expense"}
        </Button>
      </div>
    </form>
  );
}
