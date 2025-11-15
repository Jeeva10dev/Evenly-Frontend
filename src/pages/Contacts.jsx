import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { getContacts } from "../utils/api";
import { BarLoader } from "react-spinners";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Plus, Users, User } from "lucide-react";
import { CreateGroupModal } from "../components/GroupModal";
import BackButton from "../components/BackButton.jsx";

export default function ContactsPage() {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contactsData, setContactsData] = useState({ users: [], groups: [] });
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch contacts and groups from backend
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await getContacts();
        setContactsData(res.data);
      } catch (err) {
        console.error("Error fetching contacts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  // Handle `?createGroup=true` param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("createGroup") === "true") {
      setIsCreateGroupModalOpen(true);

      // Remove param from URL
      params.delete("createGroup");
      navigate({ pathname: location.pathname, search: params.toString() });
    }
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <BarLoader width={"100%"} color="#36d7b7" />
      </div>
    );
  }

  const { users, groups } = contactsData;

  return (
    <div className="container mx-auto py-6 relative">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <BackButton inline className="mr-1" />
          <h1 className="text-5xl gradient-title">Contacts</h1>
        </div>
        <Button onClick={() => setIsCreateGroupModalOpen(true)} className="bg-black text-white hover:bg-gray-800">
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Individual Contacts */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <User className="mr-2 h-5 w-5" />
            People
          </h2>
          {users.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="py-6 text-center text-muted-foreground">
                No contacts yet. Add an expense with someone to see them here.
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {users.map((user) => (
                <Link key={user.id || user._id} to={`/person/${user.id || user._id}`}>
                  <Card className="hover:bg-muted/30 transition-colors cursor-pointer shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback>
                              {user.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Groups */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Groups
          </h2>
          {groups.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="py-6 text-center text-muted-foreground">
                No groups yet. Create a group to start tracking shared expenses.
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {groups.map((group) => (
                <Link key={group._id || group.id} to={`/groups/${group._id || group.id}`}>
                  <Card className="hover:bg-muted/30 transition-colors cursor-pointer shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-md">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{group.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(group.members && group.members.length) || (group.memberCount) || 0} members
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onSuccess={(groupId) => navigate(`/groups/${groupId}`)}
      />
    </div>
  );
}
