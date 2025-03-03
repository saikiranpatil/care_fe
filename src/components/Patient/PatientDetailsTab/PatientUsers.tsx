import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import CareIcon from "@/CAREUI/icons/CareIcon";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Avatar } from "@/components/Common/Avatar";
import UserSelector from "@/components/Common/UserSelector";

import routes from "@/Utils/request/api";
import mutate from "@/Utils/request/mutate";
import query from "@/Utils/request/query";
import { UserBase } from "@/types/user/user";

import { PatientProps } from ".";

interface AddUserSheetProps {
  patientId: string;
}

function AddUserSheet({ patientId }: AddUserSheetProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserBase>();
  const [selectedRole, setSelectedRole] = useState<string>("");

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: query(routes.role.list),
    enabled: open,
  });

  const { mutate: assignUser } = useMutation({
    mutationFn: (body: { user: string; role: string }) =>
      mutate(routes.patient.users.addUser, {
        pathParams: { patientId },
        body,
      })(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patientUsers", patientId],
      });
      toast.success("User added to patient successfully");
      setOpen(false);
      setSelectedUser(undefined);
      setSelectedRole("");
    },
    onError: (error) => {
      const errorData = error.cause as { errors: { msg: string }[] };
      errorData.errors.forEach((er) => {
        toast.error(er.msg);
      });
    },
  });

  const handleAddUser = () => {
    if (!selectedUser || !selectedRole) {
      toast.error("Please select both user and role");
      return;
    }

    assignUser({
      user: selectedUser.id,
      role: selectedRole,
    });
  };

  const handleUserChange = (user: UserBase) => {
    setSelectedUser(user);
    setSelectedRole("");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <CareIcon icon="l-plus" className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add User to Patient</SheetTitle>
          <SheetDescription>
            Search for a user and assign a role to add them to the patient.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Search User</h3>
            <UserSelector
              selected={selectedUser}
              onChange={handleUserChange}
              placeholder="Search users..."
              noOptionsMessage="No users found"
            />
          </div>
          {selectedUser && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar
                    name={`${selectedUser.first_name} ${selectedUser.last_name}`}
                    imageUrl={selectedUser.profile_picture_url}
                    className="h-12 w-12"
                  />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium text-lg">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {selectedUser.email}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <span className="text-sm text-gray-500">Username</span>
                    <p className="text-sm font-medium">
                      {selectedUser.username}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">User Type</span>
                    <p className="text-sm font-medium">
                      {selectedUser.user_type}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.results?.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex flex-col">
                          <span>{role.name}</span>
                          {role.description && (
                            <span className="text-xs text-gray-500">
                              {role.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleAddUser}
                disabled={!selectedRole}
              >
                Add to Patient
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export const PatientUsers = (props: PatientProps) => {
  const { id } = props;
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ["patientUsers", id],
    queryFn: query(routes.patient.users.listUsers, {
      pathParams: { patientId: id },
    }),
  });

  const { mutate: removeUser } = useMutation({
    mutationFn: (user: string) =>
      mutate(routes.patient.users.removeUser, {
        pathParams: { patientId: id },
        body: { user },
      })({ user }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patientUsers", id],
      });
      toast.success("User removed successfully");
    },
    onError: (error) => {
      const errorData = error.cause as { errors: { msg: string }[] };
      errorData.errors.forEach((er) => {
        toast.error(er.msg);
      });
    },
  });

  return (
    <div className="mt-4 px-4 md:px-0" data-test-id="patient-users">
      <div className="group my-2 w-full">
        <div className="h-full space-y-2">
          <div className="flex flex-row items-center justify-between">
            <div className="mr-4 text-xl font-bold text-secondary-900">
              Users
            </div>
            <AddUserSheet patientId={id} />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users?.results?.map((user: UserBase) => (
              <div
                key={user.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar
                      name={`${user.first_name} ${user.last_name}`}
                      className="h-10 w-10"
                      imageUrl={user.profile_picture_url}
                    />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">{user.username}</p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <CareIcon icon="l-trash" className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {user.first_name}{" "}
                          {user.last_name} from this patient? This action cannot
                          be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeUser(user.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="text-sm">
                    <div className="text-gray-500">Phone Number</div>
                    <div className="font-medium">{user.phone_number}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-500">User Type</div>
                    <div className="font-medium">{user.user_type}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
