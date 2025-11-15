import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";

/**
 * settlements shape:
 * [
 *   {
 *     _id: string;
 *     paidByUserId: string;
 *     receivedByUserId: string;
 *     amount: number;
 *     date: string | Date;
 *     note?: string;
 *   }
 * ]
 *
 * userLookupMap: { [userId]: { id, name, imageUrl? } }
 */
export function SettlementList({
  settlements,
  currentUserId,
  isGroupSettlement = false,
  userLookupMap = {},
}) {
  if (!settlements || settlements.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No settlements found
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

  return (
    <div className="flex flex-col gap-4">
      {settlements.map((settlement) => {
        const payer = getUserDetails(settlement.paidByUserId);
        const receiver = getUserDetails(settlement.receivedByUserId);
        const isCurrentUserPayer = settlement.paidByUserId === currentUserId;
        const isCurrentUserReceiver = settlement.receivedByUserId === currentUserId;

        return (
          <Card
            className="hover:bg-muted/30 transition-colors"
            key={settlement._id}
          >
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Settlement icon */}
                  <div className="bg-primary/10 p-2 rounded-full">
                    <ArrowLeftRight className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <h3 className="font-medium">
                      {isCurrentUserPayer
                        ? `You paid ${receiver.name}`
                        : isCurrentUserReceiver
                          ? `${payer.name} paid you`
                          : `${payer.name} paid ${receiver.name}`}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <span>{format(new Date(settlement.date), "MMM d, yyyy")}</span>
                      {settlement.note && (
                        <>
                          <span>•</span>
                          <span>{settlement.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium">${settlement.amount.toFixed(2)}</div>
                  {isGroupSettlement ? (
                    <Badge variant="outline" className="mt-1">
                      Group settlement
                    </Badge>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {isCurrentUserPayer ? (
                        <span className="text-amber-600">You paid</span>
                      ) : isCurrentUserReceiver ? (
                        <span className="text-green-600">You received</span>
                      ) : (
                        <span>Payment</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
