export interface BoxListItem {
  id: number;
  name: string;
  code: string;
  department: string;
  power: string;
  status: string;
  added: string;
}

export const mockBoxListData: BoxListItem[] = [
  {
    id: 1,
    name: "BOX-2456",
    code: "#DL12345",
    department: "Blood bank",
    power: "ON",
    status: "warning",
    added: "Today",
  },
  {
    id: 2,
    name: "BOX-2457",
    code: "#DL12346",
    department: "Blood bank",
    power: "ON",
    status: "warning",
    added: "Today",
  },
  {
    id: 3,
    name: "BOX-2458",
    code: "#DL12347",
    department: "Blood bank",
    power: "ON",
    status: "warning",
    added: "Today",
  },
  {
    id: 4,
    name: "BOX-2459",
    code: "#DL12348",
    department: "Blood bank",
    power: "ON",
    status: "warning",
    added: "Today",
  },
  {
    id: 5,
    name: "BOX-2460",
    code: "#DL12349",
    department: "Blood bank",
    power: "ON",
    status: "warning",
    added: "Today",
  },
];
