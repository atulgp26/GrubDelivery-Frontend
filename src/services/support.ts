import httpClient from "./httpClient";
import { SUPPORT_URLS } from "./urls/support";
import type { FaqCategoriesData, FaqsData, FaqSearchData, FaqAnswerData } from "@/types";

const supportService = {
  async getCategories() {
    return httpClient.get<FaqCategoriesData>(SUPPORT_URLS.CATEGORIES);
  },

  async getFaqs(categoryId: string) {
    return httpClient.get<FaqsData>(SUPPORT_URLS.FAQ, { category_id: categoryId });
  },

  async searchFaqs(query: string) {
    return httpClient.get<FaqSearchData>(SUPPORT_URLS.SEARCH, { query });
  },

  async getFaqAnswer(faqId: string) {
    return httpClient.get<FaqAnswerData>(SUPPORT_URLS.ANSWER, { faq_id: faqId });
  },
};

export default supportService;
