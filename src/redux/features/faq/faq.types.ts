export interface IFAQItem {
  question: string;
  answer: string;
}

export interface IFAQ {
  _id: string;
  title: string;
  items: IFAQItem[];
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FAQPagination {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface FAQListResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: IFAQ[];
  pagination?: FAQPagination;
}

export interface SingleFAQResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: IFAQ;
}

export interface CreateFAQPayload {
  title: string;
  items?: IFAQItem[];
  isActive?: boolean;
  order?: number;
}

export interface UpdateFAQPayload {
  title?: string;
  items?: IFAQItem[];
  isActive?: boolean;
  order?: number;
}

export interface GetFAQsParams {
  isActive?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}
