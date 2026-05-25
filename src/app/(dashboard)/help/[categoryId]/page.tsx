"use client";

import { use } from "react";
import CategoryFaqScreen from "@/components/features/help/CategoryFaqScreen";

interface Props {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{ name?: string; openFaq?: string }>;
}

export default function CategoryFaqPage({ params, searchParams }: Props) {
  const { categoryId } = use(params);
  const { name, openFaq } = use(searchParams);

  return (
    <CategoryFaqScreen
      categoryId={categoryId}
      categoryName={name ?? "Help"}
      openFaqId={openFaq}
    />
  );
}
