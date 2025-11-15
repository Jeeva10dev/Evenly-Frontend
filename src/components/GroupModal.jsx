import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { X, UserPlus } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Portal } from "@radix-ui/react-portal";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import API from "../utils/api.js";

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
});

export function CreateGroupModal({ isOpen, onClose, onSuccess }) {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user
  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get("/users/current");
        setCurrentUser(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Search users when query changes
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    API.get("/users", { params: { search: searchQuery } })
      .then(({ data }) => { setSearchResults(data.users || []); setIsSearching(false); })
      .catch(() => setIsSearching(false));
  }, [searchQuery]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const addMember = (user) => {
    if (!selectedMembers.some((m) => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setCommandOpen(false);
  };

  const removeMember = (userId) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== userId));
  };

  const onSubmit = async (data) => {
    try {
      const memberIds = selectedMembers.map((m) => m.id);
      const { data: result } = await API.post("/contacts/groups", { name: data.name, description: data.description, members: memberIds });

      toast.success("Group created successfully!");
      reset();
      setSelectedMembers([]);
      onClose();

      if (onSuccess) onSuccess(result.id);
    } catch (error) {
      toast.error("Failed to create group: " + error.message);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedMembers([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              placeholder="Enter group name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter group description"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label>Members</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {/* Current user */}
              {currentUser && (
                <Badge variant="secondary" className="px-3 py-1">
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarImage src={currentUser.imageUrl} />
                    <AvatarFallback>
                      {currentUser.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{currentUser.name} (You)</span>
                </Badge>
              )}

              {/* Selected members */}
              {selectedMembers.map((member) => (
                <Badge
                  key={member.id}
                  variant="secondary"
                  className="px-3 py-1"
                >
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarImage src={member.imageUrl} />
                    <AvatarFallback>
                      {member.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{member.name}</span>
                  <button
                    type="button"
                    onClick={() => removeMember(member.id)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {/* Add member */}
              <Popover open={commandOpen} onOpenChange={setCommandOpen}>
  <PopoverTrigger asChild>
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 gap-1 text-xs"
    >
      <UserPlus className="h-3.5 w-3.5" />
      Add member
    </Button>
  </PopoverTrigger>

  {/* PORTAL: Render outside the dialog so overlay/clipping/z-index aren't issues */}
  <Portal>
    <PopoverContent
      className="p-0 rounded-lg shadow-lg border border-border
                 bg-card text-card-foreground w-[28rem] max-w-[90vw]
                 z-[9999] overflow-hidden"
      align="start"
      sideOffset={8}
    >
      <Command>
        <CommandInput
          placeholder="Search by name or email..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="bg-background text-foreground"
        />
        <CommandList>
          <CommandEmpty>
            {searchQuery.length < 2 ? (
              <p className="py-3 px-4 text-sm text-center text-muted-foreground">
                Type at least 2 characters to search
              </p>
            ) : isSearching ? (
              <p className="py-3 px-4 text-sm text-center text-muted-foreground">
                Searching...
              </p>
            ) : (
              <p className="py-3 px-4 text-sm text-center text-muted-foreground">
                No users found
              </p>
            )}
          </CommandEmpty>

          <CommandGroup heading="Users">
            {searchResults?.map((user) => (
              <CommandItem
                key={user.id}
                value={user.name + user.email}
                onSelect={() => addMember(user)}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback>{user.name?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Portal>
</Popover>
            </div>
            {selectedMembers.length === 0 && (
              <p className="text-sm text-amber-600">
                Add at least one other person to the group
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedMembers.length === 0}
            >
              {isSubmitting ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
