export type UserRole = 'leader' | 'admin' | 'member' | 'scholar' | 'blogger' | 'ancestor';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'deceased';
export type TransactionType = 'deposit' | 'withdrawal';
export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type ProposalType = 'withdrawal' | 'role_change' | 'member_approval' | 'general' | 'policy';
export type ProposalStatus = 'draft' | 'open' | 'approved' | 'rejected' | 'expired' | 'executed';

export interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  fatherId?: string | User | null;
  isStatic: boolean;
  isAlive: boolean;
  role: UserRole;
  contributions: number;
  status: UserStatus;
  pendingApproval: boolean;
  invitedBy?: string | null;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  transactionId: string;
  type: TransactionType;
  userId: string | User;
  amount: number;
  note?: string;
  approvedBy?: string | User | null;
  proposalId?: string | null;
  status: TransactionStatus;
  month?: string;
  createdAt: string;
}

export interface Vote {
  userId: string | User;
  vote: 'approve' | 'reject';
  comment?: string;
  votedAt: string;
}

export interface Proposal {
  _id: string;
  title: string;
  description: string;
  type: ProposalType;
  createdBy: string | User;
  status: ProposalStatus;
  votes: Vote[];
  requiredApprovals: number;
  deadline: string;
  relatedTransaction?: string | null;
  targetUser?: string | User | null;
  newRole?: UserRole | null;
  approvalCount: number;
  rejectionCount: number;
  executedAt?: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  action: string;
  performedBy?: User;
  targetUser?: User;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

// Tree node shape (react-d3-tree)
export interface TreeNode {
  name: string;
  _id: string;
  attributes?: {
    role?: UserRole;
    status?: string;
    contributions?: number;
    isStatic?: boolean;
    isAlive?: boolean;
    email?: string;
    joinedAt?: string;
    pendingApproval?: boolean;
  };
  children?: TreeNode[];
  __rd3t?: { id: string; depth: number; collapsed: boolean };
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  totalFund: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  balance?: number;
  totalDeposits?: number;
  totalWithdrawals?: number;
  page?: number;
  pages?: number;
}
