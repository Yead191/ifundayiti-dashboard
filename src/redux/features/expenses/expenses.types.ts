export type ExpensePaymentStatus = 'paid' | 'unpaid' | 'cancelled';

export type ExpensePaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'card'
  | 'direct'
  | 'other';

export type ExpenseCategory = 'business' | 'event' | 'program' | 'other';

export type ExpenseSubcategory =
  | 'phone_bill'
  | 'business_cards'
  | 'rental'
  | 'food'
  | 'event_expense'
  | 'utilities'
  | 'office_supplies'
  | 'marketing'
  | 'transportation'
  | 'software'
  | 'other';

export const CATEGORY_SUBCATEGORIES_MAP: Record<ExpenseCategory, ExpenseSubcategory[]> = {
  business: [
    'office_supplies',
    'phone_bill',
    'business_cards',
    'software',
    'marketing',
    'utilities',
    'other',
  ],
  event: ['event_expense', 'rental', 'food', 'transportation', 'other'],
  program: ['food', 'transportation', 'rental', 'other'],
  other: ['other'],
};

export const SUBCATEGORY_LABELS: Record<ExpenseSubcategory, string> = {
  phone_bill: 'Phone & Internet Bill',
  business_cards: 'Business Cards & Print',
  rental: 'Facility & Equipment Rental',
  food: 'Food & Refreshments',
  event_expense: 'Event Production & Logistics',
  utilities: 'Office Utilities & Power',
  office_supplies: 'Office Supplies & Stationery',
  marketing: 'Marketing, Ads & Promo',
  transportation: 'Travel & Transportation',
  software: 'Software Subscriptions & Cloud',
  other: 'Other Miscellaneous Expense',
};

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  business: 'Business Operations',
  event: 'Events & Gatherings',
  program: 'Programs & Grants',
  other: 'Other Expenditures',
};

export interface IExpenseUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

export interface IExpense {
  _id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  subcategory: ExpenseSubcategory;
  payment_status: ExpensePaymentStatus;
  payment_method: ExpensePaymentMethod;
  expenseDate: string; // ISO date string
  reference?: string;
  notes?: string;
  transactionId?: string;
  recordedBy?: IExpenseUser;
  createdAt: string;
  updatedAt: string;
}

export interface IExpenseStats {
  totalExpenses: number;
  totalAmount: number;
  totalPaidAmount: number;
  paidCount: number;
  totalUnpaidAmount: number;
  unpaidCount: number;
  totalCancelledAmount: number;
  cancelledCount: number;
  byCategory: {
    business: number;
    event: number;
    program: number;
    other: number;
  };
  thisMonthAmount: number;
  thisMonthPaidAmount: number;
}

export interface ExpensePagination {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface GetExpensesParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  category?: ExpenseCategory | 'all';
  subcategory?: ExpenseSubcategory | 'all';
  payment_status?: ExpensePaymentStatus | 'all';
  payment_method?: ExpensePaymentMethod | 'all';
  startDate?: string;
  endDate?: string;
  sort?: string;
}

export interface ExpensesListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  pagination: ExpensePagination;
  data: IExpense[];
}

export interface SingleExpenseResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IExpense;
}

export interface ExpenseStatsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IExpenseStats;
}

export interface CreateExpensePayload {
  title: string;
  amount: number;
  category: ExpenseCategory;
  subcategory: ExpenseSubcategory;
  payment_status: ExpensePaymentStatus;
  payment_method: ExpensePaymentMethod;
  expenseDate: string;
  reference?: string;
  notes?: string;
}

export interface UpdateExpensePayload extends Partial<CreateExpensePayload> {}

export interface UpdateExpenseStatusPayload {
  payment_status: ExpensePaymentStatus;
}
