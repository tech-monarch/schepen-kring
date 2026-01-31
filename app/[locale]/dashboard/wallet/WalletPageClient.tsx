"use client";
import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  Plus,
  Wallet,
  Euro,
  Loader2,
  FileText,
  Download,
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import AddMoney from "@/components/AddMoney";
import TransactionDetailModal from "@/components/dashboard/TransactionDetailModal";
import { tokenUtils } from "@/utils/auth";
import { useUser } from "@/hooks/useUser";

// --- UI Components (Recreated based on common patterns) ---

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = ({ children, className, ...props }: CardProps) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardHeader = ({ children, className, ...props }: CardHeaderProps) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
);

interface CardTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const CardTitle = ({ children, className, ...props }: CardTitleProps) => (
  <h3
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h3>
);

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const CardDescription = ({
  children,
  className,
  ...props
}: CardDescriptionProps) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props}>
    {children}
  </p>
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardContent = ({ children, className, ...props }: CardContentProps) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "icon";
}

const Button = ({
  children,
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) => {
  let baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  if (variant === "default") {
    baseClasses +=
      " bg-primary text-primary-foreground shadow hover:bg-primary/90";
  } else if (variant === "ghost") {
    baseClasses += " hover:bg-accent hover:text-accent-foreground";
  } else if (variant === "outline") {
    baseClasses +=
      " border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground";
  }

  if (size === "default") {
    baseClasses += " h-9 px-4 py-2";
  } else if (size === "sm") {
    baseClasses += " h-8 px-3 text-xs";
  } else if (size === "icon") {
    baseClasses += " h-9 w-9";
  }

  return (
    <button className={`${baseClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Avatar = ({ children, className, ...props }: AvatarProps) => (
  <div
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
    {...props}
  >
    {children}
  </div>
);

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = ({ className, ...props }: AvatarImageProps) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    className={`aspect-square h-full w-full ${className}`}
    alt=""
    {...props}
  />
);

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

const AvatarFallback = ({
  children,
  className,
  ...props
}: AvatarFallbackProps) => (
  <span
    className={`flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold ${className}`}
    {...props}
  >
    {children}
  </span>
);

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const Separator = ({
  orientation = "horizontal",
  className,
  ...props
}: SeparatorProps) => (
  <div
    className={`shrink-0 bg-border ${
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"
    } ${className}`}
    {...props}
  />
);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  children: React.ReactNode;
}

const Tabs = ({ children, ...props }: TabsProps) => (
  <div {...props}>{children}</div>
);

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

const TabsContent = ({ children, ...props }: TabsContentProps) => (
  <div {...props}>{children}</div>
);

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

const Table = ({ children, className, ...props }: TableProps) => (
  <div className="relative w-full overflow-auto">
    <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
      {children}
    </table>
  </div>
);

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

const TableHeader = ({ children, className, ...props }: TableHeaderProps) => (
  <thead className={`[&_tr]:border-b ${className}`} {...props}>
    {children}
  </thead>
);

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

const TableBody = ({ children, className, ...props }: TableBodyProps) => (
  <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props}>
    {children}
  </tbody>
);

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

const TableRow = ({ children, className, ...props }: TableRowProps) => (
  <tr
    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
    {...props}
  >
    {children}
  </tr>
);

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

const TableHead = ({ children, className, ...props }: TableHeadProps) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </th>
);

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

const TableCell = ({ children, className, ...props }: TableCellProps) => (
  <td
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </td>
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Badge = ({ children, className, ...props }: BadgeProps) => (
  <div
    className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Dummy PageLoader component
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
  </div>
);

// Data types
interface WalletRes {
  balance: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  role?: {
    id: string;
    name: string;
  };
}

interface Transaction {
  id: string;
  payment_type: "wallet" | "expense";
  description: string; // Changed from mollie_data.description
  reference: string;   // Changed from mollie_payment_id
  paid_at: string;
  amount: number;
  status: string;
}

const ErrorComp = ({ message }: { message: string }) => {
  return (
    <>
      <p className="flex-1 col-span-3 py-20 w-full text-sm text-center text-red-500 border-2">
        {message}
      </p>
    </>
  );
};

export default function WalletPage() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [walletData, setWalletData] = useState<WalletRes>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [walletHistory, setWalletHistory] = useState<Transaction[] | []>();
  const [walletHistoryLoader, setWalletHistoryLoader] = useState<boolean>(true);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [addMoneyModal, setAddMoneyModal] = useState<boolean>(false);
  const [transactionDetailModal, setTransactionDetailModal] =
    useState<boolean>(false);
  const [selectedTransactionId, setSelectedTransactionId] =
    useState<string>("");
  const [apiError, setApiError] = useState<boolean>(false);

  // Use real user data with the same pattern as Profile component
  const { user, isLoading: userLoading } = useUser();
  const [userProfileLoading, setUserProfileLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const router = useRouter();
  const t = useTranslations("WalletPage");

  const wallet = {
    balance: walletData?.balance || 0,
    currency: "EUR",
    status: t("status.active"),
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case t("status.active").toLowerCase():
        return "bg-green-100 text-green-800";
      case t("status.pending").toLowerCase():
        return "bg-yellow-100 text-yellow-800";
      case t("status.paid").toLowerCase():
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    // Format to 2 decimal places without comma separators
    const formattedAmount = amount.toFixed(2);

    // Add currency symbol
    if (currency === "EUR") {
      return `€ ${formattedAmount}`;
    } else if (currency === "USD") {
      return `$ ${formattedAmount}`;
    } else {
      return `${currency} ${formattedAmount}`;
    }
  };

  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check token validity
  useEffect(() => {
    const token = tokenUtils.getToken();
    if (token) {
      // Simple token validation - check if it's a valid JWT format
      const parts = token.split(".");
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          const now = Math.floor(Date.now() / 1000);
          setTokenValid(payload.exp > now);
        } catch (e) {
          setTokenValid(false);
        }
      } else {
        setTokenValid(false);
      }
    } else {
      setTokenValid(false);
    }
  }, []);

  // Fetch additional user profile data if needed
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && !userProfile) {
        setUserProfileLoading(true);
        try {
          const token = tokenUtils.getToken();
          if (!token) {
            console.log(
              "Dashboard Wallet: No token available, skipping profile fetch",
            );
            setUserProfileLoading(false);
            return;
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/profile`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              signal: controller.signal,
            },
          );

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            setUserProfile(data.user || data);
            console.log(
              "Dashboard Wallet: Successfully fetched user profile:",
              data,
            );
          } else if (response.status === 401) {
            console.log(
              "Dashboard Wallet: Unauthorized - token may be invalid or expired",
            );
            // Don't show error, just use local user data
            setUserProfile(null);
          } else {
            console.error(
              "Dashboard Wallet: Failed to fetch user profile:",
              response.status,
            );
            // Don't show error, just use local user data
            setUserProfile(null);
          }
        } catch (err) {
          console.error("Dashboard Wallet: Error fetching user profile:", err);
          // Don't show error, just use local user data
          setUserProfile(null);
        } finally {
          setUserProfileLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user, userProfile]);

  // Fetch wallet balance from API
  useEffect(() => {
    const fetchWallet = async () => {
  setIsPageLoading(true);
  try {
    const token = tokenUtils.getToken(); 
    if (!token) {
      setWalletData({ balance: 0 });// [cite: 74]
      setIsPageLoading(false);
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/wallet/balance`,// [cite: 75]
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,// [cite: 76]
        },
      }
    );

    if (response.ok) {
      const data = await response.json();// [cite: 78]
      // Our Laravel controller sends 'balance' at the root// [cite: 79]
      const balance = typeof data.balance !== 'undefined' ? data.balance : (data.data?.balance || 0);// [cite: 80]
      setWalletData({ balance: parseFloat(balance) });// [cite: 80]
    } else {
      setWalletData({ balance: 0 });// [cite: 82]
    }
  } catch (err) {
    setWalletData({ balance: 0 });// [cite: 84]
    setApiError(true);// [cite: 85]
  } finally {
    setIsPageLoading(false);// [cite: 85]
  }
};
    fetchWallet();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      console.log("🔍 [WALLET TRANSACTIONS] Starting to fetch transactions...");
      setWalletHistoryLoader(true);
      try {
        const token = tokenUtils.getToken(); 

        if (!token) {
          console.error("❌ [WALLET TRANSACTIONS] No token available"); 
          setWalletHistory([]);
          setWalletHistoryLoader(false);
          return;
        }

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/wallet/transactions?per_page=10`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          setWalletHistory([]);
          setWalletHistoryLoader(false);
          return;
        }

        const result = await response.json();

        // In WALLET (2).txt -> fetchTransactions function
        if (result.success && result.data) {
          // Replace the .map logic around line 147:
          const transactions: Transaction[] = result.data.map((txn: any) => ({
            id: txn.id,
            payment_type: txn.payment_type === "credit" ? "wallet" : "expense",
            // Map fields directly from the root of the transaction object
            description: txn.description || "Wallet Deposit",
            reference: txn.mollie_payment_id || "N/A",
            paid_at: txn.paid_at || txn.created_at,
            amount: parseFloat(txn.amount) || 0,
            status: txn.status || "pending",
          }));
          setWalletHistory(transactions);
        } else {
          setWalletHistory([]);
        }
      } catch (error) {
        console.error("❌ [WALLET TRANSACTIONS] Error:", error);
        setWalletHistory([]); 
      } finally {
        setWalletHistoryLoader(false); 
      }
    };
    fetchTransactions();
  }, []);

  // Debug logging for transaction rendering
  console.log("🎨 [WALLET RENDER] walletHistory state:", walletHistory);
  console.log(
    "🎨 [WALLET RENDER] walletHistory length:",
    walletHistory?.length,
  );
  console.log("🎨 [WALLET RENDER] walletHistoryLoader:", walletHistoryLoader);
  console.log("🎨 [WALLET RENDER] isPageLoading:", isPageLoading);

  if (isPageLoading) {
    return <PageLoader />;
  }

  // If user is not authenticated, show error
  if (!userLoading && !user) {
    return (
      <div className="p-4 min-h-screen md:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Authentication Required
            </h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to access your wallet.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen md:p-6">
      <div className="mx-auto space-y-6 max-w-6xl">
        {/* API Error Banner */}
        {apiError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  API Connection Issue
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Unable to connect to the backend server. Showing demo data.
                    Please check your API configuration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Wallet</h1>
            <p className="text-muted-foreground">
              Manage your transactions and balance
            </p>
          </div>
        </div>

        {/* User Info & Balance Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userLoading || userProfileLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-48"></div>
                  </div>
                </div>
              ) : user ? (
                <>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={
                          userProfile?.avatar ||
                          user.profile_picture ||
                          "/Image-1.png"
                        }
                        alt={userProfile?.name || user.name}
                      />
                      <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold text-lg">
                        {(userProfile?.name || user.name)
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {userProfile?.name || user.name || "User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.email || user.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Member Since
                      </span>
                      <span>
                        {userProfile?.created_at || user.created_at
                          ? formatJoinDate(
                              userProfile?.created_at || user.created_at,
                            )
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Account Type
                      </span>
                      <span className="capitalize">
                        {userProfile?.role?.name || user.role?.name || "client"}
                      </span>
                    </div>
                    {userProfile?.phone && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Phone</span>
                        <span>{userProfile.phone}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-red-500">Error Loading User</p>
                  <p className="text-xs text-muted-foreground">
                    Please refresh the page
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Balance Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Current Balance</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                >
                  {balanceVisible ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {balanceVisible
                      ? formatCurrency(wallet.balance, wallet.currency)
                      : "••••••"}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Available Balance
                  </p>
                </div>
                <div className="flex gap-4 justify-center items-center text-sm">
                  <div className="flex gap-1 items-center">
                    <Euro className="w-4 h-4 text-green-600" />
                    <span>{wallet.currency}</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span>Digital Wallet</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Money Management Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Euro className="w-5 h-5 text-blue-600" />
                  Add Money
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <Button
                    onClick={() => setAddMoneyModal(true)}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Plus className="mr-2 w-5 h-5" />
                    Add Money
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallet History */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <CardTitle>Your Transactions</CardTitle>
                <CardDescription>Latest activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          {walletHistory ? (
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsContent value="all" className="mt-4">
                  {walletHistory?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {walletHistory.map((transaction) => (
                          <TableRow
                            key={transaction.id}
                            className="hover:bg-slate-200"
                          >
                            <TableCell>
                              <div className="flex gap-3 items-center">
                                <div
                                  className={`p-2 rounded-full ${
                                    transaction.payment_type === "wallet"
                                      ? "bg-green-100 text-green-600"
                                      : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {transaction.payment_type === "wallet" ? (
                                    <ArrowDownLeft className="w-4 h-4" />
                                  ) : (
                                    <ArrowUpRight className="w-4 h-4" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {transaction.description}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {transaction.reference}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {new Date(
                                    transaction.paid_at,
                                  ).toLocaleDateString("en-GB")}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(
                                    transaction.paid_at,
                                  ).toLocaleTimeString("en-GB")}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`font-medium ${
                                  transaction.payment_type === "wallet"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {transaction.payment_type === "wallet"
                                  ? "+"
                                  : "-"}
                                {formatCurrency(transaction.amount, "EUR")}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusColor(transaction.status)}
                              >
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTransactionId(transaction.id);
                                    setTransactionDetailModal(true);
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <FileText className="w-4 h-4" />
                                  View
                                </Button>
                                {/* <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(
                                      `/invoice/${transaction.id}`,
                                      "_blank"
                                    );
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <Download className="w-4 h-4" />
                                  Download PDF
                                </Button> */}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <ErrorComp message="No transactions found." />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          ) : (
            <div>
              {walletHistoryLoader ? (
                <div className="py-20">
                  {" "}
                  <Loader2 className="mx-auto animate-spin w-6 h-6 text-blue-500" />
                </div>
              ) : (
                <ErrorComp message="Error Fetching wallet History" />
              )}
            </div>
          )}
        </Card>
      </div>
      {addMoneyModal && (
        <AddMoney handleClose={() => setAddMoneyModal(false)} />
      )}
      <TransactionDetailModal
        transactionId={selectedTransactionId}
        isOpen={transactionDetailModal}
        onClose={() => {
          setTransactionDetailModal(false);
          setSelectedTransactionId("");
        }}
      />
    </div>
  );
}
