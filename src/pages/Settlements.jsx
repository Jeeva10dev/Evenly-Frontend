import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Users } from "lucide-react";
import { useParams, useLocation } from "react-router-dom";
import {
  getSettlementData,
  getUser,
  createSettlement as createSettlementApi,
} from "../utils/api";
import SettlementForm from "../components/SettlementForm";
import BackButton from "../components/BackButton.jsx";

/**
 * Props:
 * - entityType: "user" | "group"
 * - entityId: string
 * - getSettlementData: async function({ entityType, entityId }) => returns data
 * - currentUserId: string
 * - createSettlement: async function({ amount, note, paidByUserId, receivedByUserId, groupId? })
 */
export default function SettlementsPage() {
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const isGroup = location.pathname.startsWith("/settlements/group/");
        const entityType = isGroup ? "group" : "user";
        const [{ data: currentUser }, { data: settlement }] = await Promise.all(
          [getUser(), getSettlementData(entityType, id)]
        );

        setData({ ...settlement, currentUser, currentUserId: currentUser.id });
      } catch (err) {
        console.error("Failed to fetch settlement data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, location.pathname]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <BarLoader width="100%" color="#36d7b7" />
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-center py-12 text-red-500">
        Failed to load settlement data.
      </p>
    );
  }

  // Determine entityType and currentUserId if needed
  const entityType = data?.group ? "group" : "user";
  const currentUserId = data?.currentUserId || "";
  const handleSuccess = () => window.location.reload();

  return (
    <div className="container mx-auto py-6 max-w-lg">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BackButton inline className="mr-1" />
          <h1 className="text-5xl gradient-title">Record a settlement</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {entityType === "user"
            ? `Settling up with ${data?.counterpart?.name}`
            : `Settling up in ${data?.group?.name}`}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {entityType === "user" ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={data?.counterpart?.imageUrl} />
                <AvatarFallback>
                  {data?.counterpart?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="bg-primary/10 p-2 rounded-md">
                <Users className="h-6 w-6 text-primary" />
              </div>
            )}
            <CardTitle>
              {entityType === "user"
                ? data?.counterpart?.name
                : data?.group?.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <SettlementForm
            entityType={entityType}
            entityData={data}
            currentUserId={currentUserId}
            createSettlement={createSettlementApi}
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
}
