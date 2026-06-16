import type { ReactNode } from "react";

export interface HelpSearchSuggestion {
  title: string;
  subtitle: string;
  href?: string;
  faqId?: string;
  categoryName?: string;
}

export interface HelpCategory {
  title: string;
  iconPath?: string;
  icon?: ReactNode;
  href?: string;
  className?: string;
}

export interface HelpFaqItem {
  id?: string;
  icon: ReactNode;
  question: string;
  answer: string;
  attachments?: string[];
}

// API types
export interface FaqCategoryIcon {
  id: string;
  name: string;
  bucket_key: string;
  created_at: string;
  updated_at: string;
}

export interface FaqCategoryVertical {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface FaqCategory {
  id: string;
  name: string;
  icon_id: string;
  vertical_id: string;
  description: string | null;
  status: string;
  index: number;
  created_at: string;
  updated_at: string;
  vertical: FaqCategoryVertical;
  icon: FaqCategoryIcon;
  _count: { questions: number };
}

export interface FaqCategoriesData {
  faq_categories: FaqCategory[];
  count: number;
}

export interface FaqItemCategory {
  id: string;
  question_id: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  category: Omit<FaqCategory, "vertical" | "icon" | "_count">;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  publishing_status: string;
  status: string;
  attachments: string[];
  created_at: string;
  updated_at: string;
  categories: FaqItemCategory[];
}

export interface FaqsData {
  faqs: FaqItem[];
  count: number;
}

export interface FaqSearchResult {
  id: string;
  question: string;
  category: string;
}

export interface FaqSearchData {
  faqs: FaqSearchResult[];
  count: number;
}

export interface FaqAnswerData {
  answer: string;
  publishing_status: string;
  status: string;
  attachments: string[];
  faq: {
    id: string;
    question: string;
  };
}

