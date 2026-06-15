import httpClient from "./httpClient";
import api from "./request";
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

  async downloadAttachment(attachmentPath: string, filename: string) {
    const response = await api.get("/delivery/support/faq/attachment/download", {
      params: { path: attachmentPath },
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

export default supportService;
