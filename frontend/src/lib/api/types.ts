/**
 * OpenAPI 3.1 Contract Types for IDROK AI Shop Debt Management
 */

export type DecimalAmount = string; // Always formatted as exact decimal string, e.g. "150000.00"

export type UserRole = 'platform_super_admin' | 'shop_owner' | 'shop_manager' | 'cashier';

export interface UserMembership {
  company_id: string;
  company_name: string;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  is_platform_super_admin: boolean;
  memberships: UserMembership[];
}

export interface Company {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface DebtCustomer {
  id: string;
  company_id: string;
  full_name: string;
  phone_number: string;
  address?: string;
  credit_limit: DecimalAmount;
  current_balance: DecimalAmount;
  status: 'active' | 'frozen' | 'archived';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DebtRecord {
  id: string;
  company_id: string;
  customer_id: string;
  customer_name: string;
  amount: DecimalAmount;
  remaining_unpaid: DecimalAmount;
  description: string;
  due_date?: string | null;
  status: 'pending' | 'partially_paid' | 'paid' | 'overdue';
  recorded_by_user_id?: string;
  recorded_by_name?: string;
  created_at: string;
}

export interface RepaymentRecord {
  id: string;
  company_id: string;
  customer_id: string;
  customer_name: string;
  debt_id?: string | null;
  amount: DecimalAmount;
  payment_method: 'cash' | 'card' | 'bank_transfer';
  notes?: string;
  idempotency_key: string;
  recorded_by_user_id?: string;
  recorded_by_name?: string;
  created_at: string;
}

export interface DebtLedgerEntry {
  id: string;
  customer_id: string;
  transaction_type: 'DEBT_ISSUED' | 'REPAYMENT_RECEIVED' | 'BALANCE_ADJUSTMENT';
  amount: DecimalAmount;
  balance_before: DecimalAmount;
  balance_after: DecimalAmount;
  reference_id: string;
  created_at: string;
}

export interface DebtSummary {
  total_outstanding_debt: DecimalAmount;
  active_debtor_count: number;
  total_overdue_debt: DecimalAmount;
  overdue_debtor_count: number;
  today_collected_amount: DecimalAmount;
  today_collections_by_method: {
    cash: DecimalAmount;
    card: DecimalAmount;
    bank_transfer: DecimalAmount;
  };
}
