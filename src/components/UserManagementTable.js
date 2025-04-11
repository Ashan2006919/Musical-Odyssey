"use client";

import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToastContainer, toast } from "react-toastify";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import the Avatar component
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"; // Import Dialog components
import { useMemo } from "react"; // Import useMemo for memoization
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import { useSession } from "next-auth/react"; // Import useSession

export default function UserManagementTable() {
  const { data: session } = useSession(); // Get session data
  const loggedInUserId = session.user.omid; // Extract the logged-in user's omid

  const [users, setUsers] = useState([]); // User data
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [searchType, setSearchType] = useState("username"); // Search type (username, email, user ID)
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog state
  const [selectedUser, setSelectedUser] = useState(null); // User to make admin
  const [adminKey, setAdminKey] = useState(""); // Admin key input
  const [isDemoteDialogOpen, setIsDemoteDialogOpen] = useState(false);
  const [userToDemote, setUserToDemote] = useState(null); // User to demote
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete confirmation dialog
  const [userToDelete, setUserToDelete] = useState(null); // User to delete

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch users on component mount
  }, []);

  const handleRefresh = () => {
    fetchUsers(); // Re-fetch user data
    toast.success("Table refreshed!");
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (!searchQuery) return true;
      const valueToSearch =
        searchType === "username"
          ? user.name
          : searchType === "email"
          ? user.email
          : user.omid;
      return valueToSearch?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [users, searchQuery, searchType]);

  // Define table columns
  const columns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "image", // Profile picture column
      header: "Profile Picture",
      cell: ({ row }) => {
        const imageUrl = row.getValue("image");
        const name = row.original.name || "User";

        return (
          <Avatar>
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Username",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "omid",
      header: "User ID",
      cell: ({ row }) => <div>{row.getValue("omid")}</div>,
    },
    {
      accessorKey: "isAdmin",
      header: "Role",
      cell: ({ row }) => (
        <div>{row.getValue("isAdmin") ? "Admin" : "User"}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;

        const openMakeAdminDialog = () => {
          setSelectedUser(user);
          setIsDialogOpen(true);
        };

        const openMakeUserDialog = () => {
          setUserToDemote(user);
          setIsDemoteDialogOpen(true);
        };

        const confirmDeleteUser = (user) => {
          setUserToDelete(user);
          setIsDeleteDialogOpen(true);
        };
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.omid)}
              >
                Copy User ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.isAdmin ? (
                <DropdownMenuItem
                  onClick={openMakeUserDialog}
                  disabled={!loggedInUserId || loggedInUserId === user.omid}
                >
                  Make User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={openMakeAdminDialog}
                  disabled={!loggedInUserId || loggedInUserId === user.omid}
                >
                  Make Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => confirmDeleteUser(user)}
                disabled={!loggedInUserId || loggedInUserId === user.omid}
              >
                Delete User
              </DropdownMenuItem>
              <DropdownMenuItem>View Details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleMakeAdmin = async () => {
    if (!selectedUser) {
      toast.error("No user selected.");
      return;
    }

    try {
      const response = await fetch("/api/admin/makeAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.omid, key: adminKey }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Error making admin:", data.message);
        toast.error(data.message || "Something went wrong");
      } else {
        toast.success(data.message);
        fetchUsers(); // Refresh the table data
      }
    } catch (error) {
      console.error("Error making user an admin:", error);
      toast.error("An error occurred. Please try again.");
    }

    setIsDialogOpen(false);
    setAdminKey("");
  };

  const handleMakeUser = async () => {
    if (!userToDemote) {
      toast.error("No user selected.");
      return;
    }

    try {
      const response = await fetch("/api/admin/makeUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userToDemote.omid, key: adminKey }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Error making user:", data.message);
        toast.error(data.message || "Something went wrong");
      } else {
        toast.success(data.message);
        fetchUsers(); // Refresh the table data
      }
    } catch (error) {
      console.error("Error making admin a user:", error);
      toast.error("An error occurred. Please try again.");
    }

    setIsDemoteDialogOpen(false);
    setAdminKey("");
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) {
      toast.error("No user selected.");
      return;
    }

    try {
      const response = await fetch(`/api/admin/deleteUser`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userToDelete.omid }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Error deleting user:", data.message);
        toast.error(data.message || "Something went wrong");
      } else {
        toast.success(data.message);
        fetchUsers(); // Refresh the table data
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("An error occurred. Please try again.");
    }

    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const table = useReactTable({
    data: filteredUsers,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="rounded-md border p-4 shadow-md">
      <div className="flex items-center gap-4 mb-4">
        <Input
          type="text"
          placeholder={`Search by ${searchType}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow px-4 py-2 border rounded-lg"
        />
        <Button variant="outline" onClick={handleRefresh}>
          Refresh
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Search By <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSearchType("username")}>
              Username
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchType("email")}>
              Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchType("omid")}>
              User ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Admin Key</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter key..."
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="mb-4"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMakeAdmin}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDemoteDialogOpen} onOpenChange={setIsDemoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Admin Key</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter key..."
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="mb-4"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDemoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleMakeUser}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this user?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
