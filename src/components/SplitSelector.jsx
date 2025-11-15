import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/AuthContext.jsx";
import { Avatar } from "./ui/avatar.jsx";
import { Input } from "./ui/input.jsx";
import { Slider } from "./ui/slider.jsx";

export function SplitSelector({ type, amount, participants, paidByUserId, onSplitsChange }) {
  const { user } = useAuthContext();
  const currentUserId = user?.id;
  const [splits, setSplits] = useState([]);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (!amount || amount <= 0 || !participants || participants.length === 0) return;

    const validParticipants = participants.filter((p) => p && p.id);
    let newSplits = [];

    if (type === "equal") {
      const shareAmount = amount / validParticipants.length;
      newSplits = validParticipants.map((p) => ({
        userId: p.id,
        name: p.name,
        email: p.email,
        imageUrl: p.imageUrl,
        amount: shareAmount,
        percentage: 100 / validParticipants.length,
        paid: p.id === paidByUserId,
      }));
    } else if (type === "percentage") {
      const evenPercentage = 100 / validParticipants.length;
      newSplits = validParticipants.map((p) => ({
        userId: p.id,
        name: p.name,
        email: p.email,
        imageUrl: p.imageUrl,
        amount: (amount * evenPercentage) / 100,
        percentage: evenPercentage,
        paid: p.id === paidByUserId,
      }));
    } else if (type === "exact") {
      const evenAmount = amount / validParticipants.length;
      newSplits = validParticipants.map((p) => ({
        userId: p.id,
        name: p.name,
        email: p.email,
        imageUrl: p.imageUrl,
        amount: evenAmount,
        percentage: amount > 0 ? (evenAmount / amount) * 100 : 0,
        paid: p.id === paidByUserId,
      }));
    }

    setSplits(newSplits);
    setTotalAmount(newSplits.reduce((s, x) => s + x.amount, 0));
    setTotalPercentage(newSplits.reduce((s, x) => s + x.percentage, 0));
    onSplitsChange?.(newSplits);
  }, [type, amount, participants, paidByUserId, onSplitsChange]);

  const updatePercentageSplit = (userId, newPercentage) => {
    const updated = splits.map((s) =>
      s.userId === userId
        ? { ...s, percentage: newPercentage, amount: (amount * newPercentage) / 100 }
        : s
    );
    setSplits(updated);
    setTotalAmount(updated.reduce((s, x) => s + x.amount, 0));
    setTotalPercentage(updated.reduce((s, x) => s + x.percentage, 0));
    onSplitsChange?.(updated);
  };

  const updateExactSplit = (userId, newAmount) => {
    const parsed = parseFloat(newAmount) || 0;
    const updated = splits.map((s) =>
      s.userId === userId
        ? { ...s, amount: parsed, percentage: amount > 0 ? (parsed / amount) * 100 : 0 }
        : s
    );
    setSplits(updated);
    setTotalAmount(updated.reduce((s, x) => s + x.amount, 0));
    setTotalPercentage(updated.reduce((s, x) => s + x.percentage, 0));
    onSplitsChange?.(updated);
  };

  const isPercentageValid = Math.abs(totalPercentage - 100) < 0.01;
  const isAmountValid = Math.abs(totalAmount - amount) < 0.01;

  return (
    <div className="space-y-4 mt-4">
      {splits.map((split) => (
        <div
          key={split.userId}
          className="flex items-center gap-4 border-b pb-2 last:border-none"
        >
          {/* Fixed width name column */}
          <div className="flex items-center gap-2 w-40 shrink-0">
            <Avatar className="h-7 w-7" />
            <span
              className="text-sm truncate"
              title={split.userId === currentUserId ? "You" : split.name}
            >
              {split.userId === currentUserId ? "You" : split.name}
            </span>
          </div>

          {/* Content area expands evenly */}
          {type === "equal" && (
            <div className="flex-1 text-right text-sm">
              ${split.amount.toFixed(2)} ({split.percentage.toFixed(1)}%)
            </div>
          )}

          {type === "percentage" && (
            <div className="flex flex-1 items-center gap-4">
              <Slider
                value={[split.percentage]}
                min={0}
                max={100}
                step={1}
                onValueChange={(v) => updatePercentageSplit(split.userId, v[0])}
                className="flex-1"
              />
              <div className="flex items-center gap-1 min-w-[100px]">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={split.percentage.toFixed(1)}
                  onChange={(e) =>
                    updatePercentageSplit(split.userId, parseFloat(e.target.value) || 0)
                  }
                  className="w-16 h-8"
                />
                <span className="text-sm text-muted-foreground">%</span>
                <span className="text-sm ml-1">${split.amount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {type === "exact" && (
            <div className="flex flex-1 items-center justify-end gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={split.amount.toFixed(2)}
                onChange={(e) => updateExactSplit(split.userId, e.target.value)}
                className="w-24 h-8"
              />
              <span className="text-sm text-muted-foreground ml-1">
                ({split.percentage.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Totals */}
      <div className="flex justify-between border-t pt-3 mt-3">
        <span className="font-medium">Total</span>
        <div className="text-right">
          <span className={`font-medium ${!isAmountValid ? "text-amber-600" : ""}`}>
            ${totalAmount.toFixed(2)}
          </span>
          {type !== "equal" && (
            <span
              className={`text-sm ml-2 ${!isPercentageValid ? "text-amber-600" : ""}`}
            >
              ({totalPercentage.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>

      {/* Validation messages */}
      {type === "percentage" && !isPercentageValid && (
        <div className="text-sm text-amber-600 mt-2">
          The percentages should add up to 100%.
        </div>
      )}
      {type === "exact" && !isAmountValid && (
        <div className="text-sm text-amber-600 mt-2">
          The sum of all splits (${totalAmount.toFixed(2)}) should equal the total
          amount (${amount.toFixed(2)}).
        </div>
      )}
    </div>
  );
}
