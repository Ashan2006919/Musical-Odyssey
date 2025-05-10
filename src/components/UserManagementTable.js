"use client";

import { useState, useEffect, useRef, useReducer } from "react";
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
import { useVirtualizer } from "@tanstack/react-virtual"; // Import useVirtualizer
import { useDebounce } from "use-debounce"; // Install if not already installed

const initialState = {
  users: [],
  searchQuery: "",
  searchType: "name",
  sorting: [],
  columnVisibility: {},
  rowSelection: {},
  isDialogOpen: false,
  selectedUser: null,
  adminKey: "",
  isDemoteDialogOpen: false,
  userToDemote: null,
  isDeleteDialogOpen: false,
  userToDelete: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_USERS":
      return { ...state, users: action.payload };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    // Add other cases as needed
    default:
      return state;
  }
}

export default function UserManagementTable() {
  const { data: session } = useSession(); // Get session data
  const loggedInUserId = session.user.omid; // Extract the logged-in user's omid

  const [state, dispatch] = useReducer(reducer, initialState);

  const parentRef = useRef(); // Ref for virtual scrolling

  const [debouncedSearchQuery] = useDebounce(state.searchQuery, 300);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      dispatch({ type: "SET_USERS", payload: data.users || [] }); // Fallback to an empty array
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
      dispatch({ type: "SET_USERS", payload: [] }); // Ensure users is always an array
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
    if (!state.users || state.users.length === 0) return []; // Fallback to an empty array
    return state.users.filter((user) => {
      if (!debouncedSearchQuery) return true;
      const valueToSearch =
        state.searchType === "name"
          ? user.name
          : state.searchType === "email"
          ? user.email
          : user.omid;
      return valueToSearch
        ?.toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase());
    });
  }, [state.users, debouncedSearchQuery, state.searchType]);

  const rowVirtualizer = useVirtualizer({
    count: filteredUsers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  console.log(rowVirtualizer.getVirtualItems());

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
      header: "name",
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
          dispatch({ type: "SET_SELECTED_USER", payload: user });
          dispatch({ type: "SET_IS_DIALOG_OPEN", payload: true });
        };

        const openMakeUserDialog = () => {
          dispatch({ type: "SET_USER_TO_DEMOTE", payload: user });
          dispatch({ type: "SET_IS_DEMOTE_DIALOG_OPEN", payload: true });
        };

        const confirmDeleteUser = (user) => {
          dispatch({ type: "SET_USER_TO_DELETE", payload: user });
          dispatch({ type: "SET_IS_DELETE_DIALOG_OPEN", payload: true });
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
    if (!state.selectedUser) {
      toast.error("No user selected.");
      return;
    }

    try {
      const response = await fetch("/api/admin/makeAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: state.selectedUser.omid,
          key: state.adminKey,
        }),
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

    dispatch({ type: "SET_IS_DIALOG_OPEN", payload: false });
    dispatch({ type: "SET_ADMIN_KEY", payload: "" });
  };

  const handleMakeUser = async () => {
    if (!state.userToDemote) {
      toast.error("No user selected.");
      return;
    }

    try {
      const response = await fetch("/api/admin/makeUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: state.userToDemote.omid,
          key: state.adminKey,
        }),
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

    dispatch({ type: "SET_IS_DEMOTE_DIALOG_OPEN", payload: false });
    dispatch({ type: "SET_ADMIN_KEY", payload: "" });
  };

  const handleDeleteUser = async () => {
    if (!state.userToDelete) {
      toast.error("No user selected.");
      return;
    }

    try {
      const response = await fetch(`/api/admin/deleteUser`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: state.userToDelete.omid }),
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

    dispatch({ type: "SET_IS_DELETE_DIALOG_OPEN", payload: false });
    dispatch({ type: "SET_USER_TO_DELETE", payload: null });
  };

  const table = useReactTable({
    data: filteredUsers,
    columns,
    onSortingChange: (sorting) =>
      dispatch({ type: "SET_SORTING", payload: sorting }),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: (columnVisibility) =>
      dispatch({ type: "SET_COLUMN_VISIBILITY", payload: columnVisibility }),
    onRowSelectionChange: (rowSelection) =>
      dispatch({ type: "SET_ROW_SELECTION", payload: rowSelection }),
    state: {
      sorting: state.sorting,
      columnVisibility: state.columnVisibility,
      rowSelection: state.rowSelection,
    },
  });

  return (
    <div className="rounded-md border p-4 shadow-md">
      <div className="flex items-center gap-4 mb-4">
        <Input
          type="text"
          placeholder={`Search by ${state.searchType}...`}
          value={state.searchQuery}
          onChange={(e) =>
            dispatch({ type: "SET_SEARCH_QUERY", payload: e.target.value })
          }
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
            <DropdownMenuItem
              onClick={() =>
                dispatch({ type: "SET_SEARCH_TYPE", payload: "name" })
              }
            >
              name
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                dispatch({ type: "SET_SEARCH_TYPE", payload: "email" })
              }
            >
              Email
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                dispatch({ type: "SET_SEARCH_TYPE", payload: "omid" })
              }
            >
              User ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div ref={parentRef} className="overflow-y-auto max-h-[400px]">
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
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = table.getRowModel().rows[virtualRow.index];
              return (
                <TableRow
                  key={row.id}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                    height: "50px", // Ensure consistent row height
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={state.isDialogOpen}
        onOpenChange={(isOpen) =>
          dispatch({ type: "SET_IS_DIALOG_OPEN", payload: isOpen })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Admin Key</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter key..."
            value={state.adminKey}
            onChange={(e) =>
              dispatch({ type: "SET_ADMIN_KEY", payload: e.target.value })
            }
            className="mb-4"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                dispatch({ type: "SET_IS_DIALOG_OPEN", payload: false })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleMakeAdmin}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={state.isDemoteDialogOpen}
        onOpenChange={(isOpen) =>
          dispatch({ type: "SET_IS_DEMOTE_DIALOG_OPEN", payload: isOpen })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Admin Key</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter key..."
            value={state.adminKey}
            onChange={(e) =>
              dispatch({ type: "SET_ADMIN_KEY", payload: e.target.value })
            }
            className="mb-4"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                dispatch({ type: "SET_IS_DEMOTE_DIALOG_OPEN", payload: false })
              }
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleMakeUser}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={state.isDeleteDialogOpen}
        onOpenChange={(isOpen) =>
          dispatch({ type: "SET_IS_DELETE_DIALOG_OPEN", payload: isOpen })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this user?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                dispatch({ type: "SET_IS_DELETE_DIALOG_OPEN", payload: false })
              }
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
