import { useState, useEffect } from "react";
import { api } from "../api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  FileText,
  Search,
  Eye,
  Download,
  Filter,
  RefreshCw,
  CheckCircle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "./ui/pagination";
import { toast } from "sonner";

interface PRItem {
  id?: number;

  itemDescription: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
}

interface PR {
  id: number;
  prNumber: string;
  department: string;
  requestedBy: string | number;
  description: string;
  budgetHead: string;
  status: string;
  createdAt: string;
  approvedBy?: string | null;
  approvedOn?: string | null;
  items?: PRItem[];
}

interface PaginatedResponse {
  content: PR[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

interface PRListProps {
  authToken: string;
  userId: number;
  userEmail: string;
}

export function PRList({
  authToken,
  userId,
  userEmail,
}: PRListProps) {
  const [prs, setPrs] = useState<PR[]>([]);
  const [filteredPrs, setFilteredPrs] = useState<PR[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedPR, setSelectedPR] = useState<PR | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] =
    useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Approval state
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] =
    useState(false);
  const [prToApprove, setPrToApprove] = useState<PR | null>(
    null,
  );
  const [isApproving, setIsApproving] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchPRs();
  }, [currentPage, pageSize]);

  useEffect(() => {
    filterPRs();
  }, [prs, searchTerm, statusFilter]);

  const fetchPRs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/procurement/pr?page=${currentPage}&size=${pageSize}`,
        {
          headers: {
            accept: "*/*",
          },
        },
      );

      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setPrs(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        console.error("Failed to fetch PRs");
        // Use mock data if API fails
        const mockData = getMockPRs();
        setPrs(mockData);
        setTotalPages(1);
        setTotalElements(mockData.length);
      }
    } catch (error) {
      console.error("Error fetching PRs:", error);
      // Use mock data if API fails
      const mockData = getMockPRs();
      setPrs(mockData);
      setTotalPages(1);
      setTotalElements(mockData.length);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPRById = async (id: number) => {
    setIsLoadingDetail(true);
    try {
      const response = await api.get(
        `/procurement/pr/${id}`,
        {
          headers: {
            accept: "*/*",
          },
        },
      );

      if (response.ok) {
        const data: PR = await response.json();
        setSelectedPR(data);
      } else {
        console.error("Failed to fetch PR details");
        // Fallback to the PR from list if API fails
        const pr = (prs || []).find((p) => p.id === id);
        if (pr) {
          setSelectedPR(pr);
        }
      }
    } catch (error) {
      console.error("Error fetching PR details:", error);
      // Fallback to the PR from list if API fails
      const pr = (prs || []).find((p) => p.id === id);
      if (pr) {
        setSelectedPR(pr);
      }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const approvePR = async () => {
    if (!prToApprove) return;

    setIsApproving(true);
    try {
      const response = await api.post(
        `/procurement/pr/${prToApprove.id}/approve?approvedBy=${encodeURIComponent(userId)}`,
        undefined,
        {
          headers: {
            accept: "*/*",
          },
        },
      );

      if (response.ok) {
        toast.success("PR Approved Successfully", {
          description: `${prToApprove.prNumber} has been approved`,
        });
        setIsApprovalDialogOpen(false);
        setPrToApprove(null);
        // Refresh the PR list
        await fetchPRs();
      } else {
        const errorText = await response.text();
        toast.error("Failed to Approve PR", {
          description: errorText || "Please try again later",
        });
      }
    } catch (error) {
      console.error("Error approving PR:", error);
      toast.error("Error Approving PR", {
        description: "An error occurred while approving the PR",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const openApprovalDialog = (pr: PR) => {
    setPrToApprove(pr);
    setIsApprovalDialogOpen(true);
  };

  const getMockPRs = (): PR[] => [
    {
      id: 1,
      prNumber: "PR-2024-045",
      department: "Facility Management",
      requestedBy: "Rajesh Kumar",
      description:
        "STP Chemicals - Chlorine tablets for water treatment",
      quantity: 50,
      unit: "kg",
      estimatedCost: 15000,
      budgetHead: "Maintenance",
      status: "RAISED",
      createdAt: "2024-11-24T10:30:00Z",
      approvedBy: null,
      approvedOn: null,
    },
    {
      id: 2,
      prNumber: "PR-2024-044",
      department: "Housekeeping",
      requestedBy: "Sunita Desai",
      description:
        "Housekeeping Materials - Cleaning supplies and equipment",
      quantity: 1,
      unit: "set",
      estimatedCost: 8500,
      budgetHead: "Operational",
      status: "APPROVED",
      createdAt: "2024-11-23T14:20:00Z",
      approvedBy: "president@society.com",
      approvedOn: "2024-11-23T15:30:00Z",
    },
    {
      id: 3,
      prNumber: "PR-2024-043",
      department: "Estate Management",
      requestedBy: "Priya Sharma",
      description:
        "Plumbing Fixtures - Bathroom fittings replacement",
      quantity: 25,
      unit: "piece",
      estimatedCost: 32000,
      budgetHead: "Capex",
      status: "PO_ISSUED",
      createdAt: "2024-11-22T09:15:00Z",
      approvedBy: "treasurer@society.com",
      approvedOn: "2024-11-22T10:00:00Z",
    },
    {
      id: 4,
      prNumber: "PR-2024-042",
      department: "Security",
      requestedBy: "Amit Patel",
      description:
        "Electrical Supplies - CCTV camera maintenance",
      quantity: 12,
      unit: "piece",
      estimatedCost: 12300,
      budgetHead: "Maintenance",
      status: "COMPLETED",
      createdAt: "2024-11-21T16:45:00Z",
      approvedBy: "secretary@society.com",
      approvedOn: "2024-11-21T17:00:00Z",
    },
    {
      id: 5,
      prNumber: "PR-2024-041",
      department: "Facility Management",
      requestedBy: "Rajesh Kumar",
      description:
        "Garden Equipment - Lawn mower and trimming tools",
      quantity: 1,
      unit: "set",
      estimatedCost: 18500,
      budgetHead: "Capex",
      status: "REJECTED",
      createdAt: "2024-11-20T11:00:00Z",
      approvedBy: null,
      approvedOn: null,
    },
  ];

  const filterPRs = () => {
    let filtered = [...prs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (pr) =>
          pr.prNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          pr.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          pr.department
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          pr.requestedBy
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (pr) => pr.status === statusFilter,
      );
    }

    setFilteredPrs(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RAISED":
        return "bg-orange-100 text-orange-700";
      case "APPROVED":
        return "bg-blue-100 text-blue-700";
      case "PO_ISSUED":
        return "bg-purple-100 text-purple-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "RAISED":
        return "Pending Approval";
      case "APPROVED":
        return "Approved";
      case "PO_ISSUED":
        return "PO Issued";
      case "COMPLETED":
        return "Completed";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  };

  const viewPRDetails = async (pr: PR) => {
    setIsDetailDialogOpen(true);
    await fetchPRById(pr.id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size));
    setCurrentPage(0); // Reset to first page when changing page size
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Total PRs</p>
            <p className="text-slate-900 mt-1">
              {totalElements}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Pending</p>
            <p className="text-slate-900 mt-1">
              {
                (prs || []).filter(
                  (pr) => pr.status === "RAISED",
                ).length
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Approved</p>
            <p className="text-slate-900 mt-1">
              {
                (prs || []).filter(
                  (pr) => pr.status === "APPROVED",
                ).length
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">PO Issued</p>
            <p className="text-slate-900 mt-1">
              {
                (prs || []).filter(
                  (pr) => pr.status === "PO_ISSUED",
                ).length
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Completed</p>
            <p className="text-slate-900 mt-1">
              {
                (prs || []).filter(
                  (pr) => pr.status === "COMPLETED",
                ).length
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5 text-blue-600" />
                Purchase Requisitions
              </CardTitle>
              <CardDescription>
                View and manage all purchase requisitions
              </CardDescription>
            </div>
            <Button
              onClick={fetchPRs}
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw
                className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search by PR number, description, department..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-48">
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="RAISED">
                  Pending Approval
                </SelectItem>
                <SelectItem value="APPROVED">
                  Approved
                </SelectItem>
                <SelectItem value="PO_ISSUED">
                  PO Issued
                </SelectItem>
                <SelectItem value="COMPLETED">
                  Completed
                </SelectItem>
                <SelectItem value="REJECTED">
                  Rejected
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PR Number</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead className="text-right">
                    Quantity
                  </TableHead>
                  <TableHead className="text-right">
                    Est. Cost
                  </TableHead>
                  <TableHead>Budget Head</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrs.length > 0 ? (
                  filteredPrs.map((pr) => (
                    <TableRow key={pr.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {pr.prNumber}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-900">
                        {pr.department}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm text-slate-900 truncate">
                            {pr.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-900">
                        {pr.requestedBy}
                      </TableCell>
                      <TableCell className="text-right">
                        {pr.items && pr.items.length > 0 ? (
                          <div>
                            <p className="text-sm text-slate-900">
                              {pr.items.length} item(s)
                            </p>
                            <p className="text-xs text-slate-500">
                              Total:{" "}
                              {pr.items
                                .reduce(
                                  (sum, item) =>
                                    sum + (item.quantity || 0),
                                  0,
                                )
                                .toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-500">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹
                        {pr.items && pr.items.length > 0
                          ? pr.items
                            .reduce(
                              (sum, item) =>
                                sum +
                                (item.estimatedCost || 0),
                              0,
                            )
                            .toLocaleString()
                          : "0"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {pr.budgetHead}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(pr.status)}
                        >
                          {getStatusLabel(pr.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(
                          pr.createdAt,
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewPRDetails(pr)}
                            title="View Details"
                          >
                            <Eye className="size-4" />
                          </Button>
                          {pr.status === "RAISED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openApprovalDialog(pr)
                              }
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Approve PR"
                            >
                              <CheckCircle className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-8 text-slate-500"
                    >
                      {isLoading
                        ? "Loading..."
                        : "No purchase requisitions found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-600">
                Showing {currentPage * pageSize + 1} to{" "}
                {Math.min(
                  (currentPage + 1) * pageSize,
                  totalElements,
                )}{" "}
                of {totalElements} entries
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-600">
                  Rows per page:
                </p>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(currentPage - 1)
                      }
                      className={
                        currentPage === 0
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* Page numbers */}
                  {Array.from(
                    { length: totalPages },
                    (_, i) => i,
                  )
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (page === 0 || page === totalPages - 1)
                        return true;
                      if (Math.abs(page - currentPage) <= 1)
                        return true;
                      return false;
                    })
                    .map((page, idx, arr) => {
                      // Add ellipsis if there's a gap
                      const prevPage = arr[idx - 1];
                      const showEllipsis =
                        prevPage !== undefined &&
                        page - prevPage > 1;

                      return (
                        <div
                          key={page}
                          className="flex items-center"
                        >
                          {showEllipsis && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              onClick={() =>
                                handlePageChange(page)
                              }
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page + 1}
                            </PaginationLink>
                          </PaginationItem>
                        </div>
                      );
                    })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(currentPage + 1)
                      }
                      className={
                        currentPage === totalPages - 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PR Details Dialog */}
      <Dialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Purchase Requisition Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the purchase
              requisition
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="size-8 animate-spin text-blue-600" />
              <p className="ml-3 text-slate-600">
                Loading PR details...
              </p>
            </div>
          ) : (
            selectedPR && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">
                      PR Number
                    </p>
                    <p className="text-slate-900 mt-1">
                      {selectedPR.prNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">
                      Status
                    </p>
                    <Badge
                      className={`${getStatusColor(selectedPR.status)} mt-1`}
                    >
                      {getStatusLabel(selectedPR.status)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">
                      Department
                    </p>
                    <p className="text-slate-900 mt-1">
                      {selectedPR.department}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">
                      Requested By
                    </p>
                    <p className="text-slate-900 mt-1">
                      {selectedPR.requestedBy}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-600">
                    Description
                  </p>
                  <p className="text-slate-900 mt-1">
                    {selectedPR.description}
                  </p>
                </div>

                {/* Items List */}
                {selectedPR.items &&
                  selectedPR.items.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-slate-900">
                      Items / Services (
                      {selectedPR.items.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedPR.items.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm text-slate-900">
                              Item {index + 1}
                            </h4>
                            <Badge
                              variant="outline"
                              className="text-xs"
                            >
                              ₹
                              {(
                                item.estimatedCost || 0
                              ).toLocaleString()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-900 mb-2">
                            {item.itemDescription ||
                              "No description"}
                          </p>
                          <div className="flex gap-4 text-xs text-slate-600">
                            <span>
                              Qty: {item.quantity || 0}{" "}
                              {item.unit || "unit"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-900">
                          Total Estimated Cost:
                        </span>
                        <span className="text-blue-900">
                          ₹
                          {selectedPR.items
                            .reduce(
                              (sum, item) =>
                                sum + (item.estimatedCost || 0),
                              0,
                            )
                            .toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">
                    No items information available
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">
                      Budget Head
                    </p>
                    <p className="text-slate-900 mt-1">
                      {selectedPR.budgetHead}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">
                      Created Date
                    </p>
                    <p className="text-slate-900 mt-1">
                      {new Date(
                        selectedPR.createdAt,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Approval Information (if approved) */}
                {selectedPR.approvedBy && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-green-700">
                          Approved By
                        </p>
                        <p className="text-green-900 mt-1">
                          {selectedPR.approvedBy}
                        </p>
                      </div>
                      {selectedPR.approvedOn && (
                        <div>
                          <p className="text-sm text-green-700">
                            Approved On
                          </p>
                          <p className="text-green-900 mt-1">
                            {new Date(
                              selectedPR.approvedOn,
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1">
                    <Download className="size-4 mr-2" />
                    Download PR
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* PR Approval Dialog */}
      <Dialog
        open={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Approve Purchase Requisition
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this PR?
            </DialogDescription>
          </DialogHeader>
          {prToApprove && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      PR Number
                    </p>
                    <Badge variant="outline">
                      {prToApprove.prNumber}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Department
                    </p>
                    <p className="text-sm text-slate-900">
                      {prToApprove.department}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Requested By
                    </p>
                    <p className="text-sm text-slate-900">
                      {prToApprove.requestedBy}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Estimated Cost
                    </p>
                    <p className="text-slate-900">
                      ₹
                      {prToApprove.items && prToApprove.items.length > 0
                        ? prToApprove.items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0).toLocaleString()
                        : '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900">
                      This PR will be approved by{" "}
                      <span className="font-medium">
                        {userEmail}
                      </span>
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      The requisition will move to the approved
                      status and can proceed to RFQ.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApprovalDialogOpen(false);
                setPrToApprove(null);
              }}
              disabled={isApproving}
            >
              <X className="size-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={approvePR}
              disabled={isApproving}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {isApproving ? (
                <>
                  <RefreshCw className="size-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="size-4 mr-2" />
                  Approve PR
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}