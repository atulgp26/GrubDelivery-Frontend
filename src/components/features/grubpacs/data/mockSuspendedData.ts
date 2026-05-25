import type { SuspendedGrubPacItem, Restaurant } from "@/types/domain/grubpacs";

/**
 * Mock suspended GrubPac data - this would typically come from an API
 */
export const mockSuspendedData: SuspendedGrubPacItem[] = [
  {
    id: "1",
    name: "BOX-2456",
    code: "DL12345",
    added: "Yesterday",
    suspended: "Today",
    location: "Blood bank",
    floor: null,
    group: "BLOOD BANK",
  },
  {
    id: "2",
    name: "BOX-2456",
    code: "DL12345",
    added: "Yesterday",
    suspended: "Today",
    location: null,
    floor: null,
    group: "Unassigned",
  },
  {
    id: "3",
    name: "BOX-2456",
    code: "DL12345",
    added: "Yesterday",
    suspended: "Today",
    location: "Blood bank",
    floor: null,
    group: "BLOOD BANK",
  },
  {
    id: "4",
    name: "BOX-2456",
    code: "DL12345",
    added: "Yesterday",
    suspended: "Today",
    location: null,
    floor: null,
    group: "Unassigned",
  },
  {
    id: "5",
    name: "BOX-2456",
    code: "DL12345",
    added: "Yesterday",
    suspended: "Today",
    location: "Blood bank",
    floor: null,
    group: "BLOOD BANK",
  },
  {
    id: "6",
    name: "BOX-2456",
    code: "DL12345",
    added: "Yesterday",
    suspended: "Today",
    location: null,
    floor: null,
    group: "Unassigned",
  },
];

/**
 * Mock restaurant data used in GrubPacs
 */
export const mockRestaurants: Restaurant[] = [
  {
    id: 1,
    name: "Da Pizza Corner",
    address: "D12, Rohini West, Delhi, India, 110012",
    added: "Yesterday",
  },
  {
    id: 2,
    name: "Burger Hub",
    address: "D12, Rohini West, Delhi, India, 110012",
    added: "Yesterday",
  },
  {
    id: 3,
    name: "Sushi Place",
    address: "D12, Rohini West, Delhi, India, 110012",
    added: "Yesterday",
  },
];
