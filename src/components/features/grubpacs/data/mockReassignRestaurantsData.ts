import type { ResourceReassignRow } from "@/components/ui/resource-reassign-table";

/**
 * Mock restaurant data used in the Reassign Group / Restaurant modal
 */
export const mockReassignRestaurantsData: ResourceReassignRow[] = [
  {
    id: "1",
    name: "Pizza Place",
    address: "D12, Rohini West, Delhi, India, 110012",
    updated: "Today",
    added: "12 Jan'24",
    resources: { boxes: 5, drivers: 2, managers: 1 },
  },
  {
    id: "2",
    name: "Pizza Place",
    address: "D12, Rohini West, Delhi, India, 110012",
    updated: "Today",
    added: "12 Jan'24",
    resources: { boxes: 5, drivers: 2, managers: 1 },
  },
  {
    id: "3",
    name: "Burger Barn",
    address: "A5, Sector 18, Noida, India, 201301",
    updated: "Yesterday",
    added: "05 Feb'24",
    resources: { boxes: 3, drivers: 1, managers: 1 },
  },
  {
    id: "4",
    name: "Sushi Stop",
    address: "B7, Connaught Place, New Delhi, India, 110001",
    updated: "2 days ago",
    added: "20 Jan'24",
    resources: { boxes: 7, drivers: 3, managers: 1 },
  },
  {
    id: "5",
    name: "Taco Town",
    address: "C3, Lajpat Nagar, New Delhi, India, 110024",
    updated: "Today",
    added: "15 Mar'24",
    resources: { boxes: 2, drivers: 1, managers: 0 },
  },
];
