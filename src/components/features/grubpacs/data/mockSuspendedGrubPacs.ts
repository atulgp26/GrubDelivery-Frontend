export interface SuspendedGrubPac {
  id: string;
  name: string;
  identifier: string;
  added: string;
  suspended: string;
  hasBox: boolean;
  restaurant: string;
}

export const MOCK_SUSPENDED_GRUBPACS: SuspendedGrubPac[] = [
  {
    id: "suspended-gp-1",
    name: "BOX-2457",
    identifier: "#DL12346 | DL2BD1235",
    added: "Today",
    suspended: "Yesterday",
    hasBox: true,
    restaurant: "DA PIZZA PLACE",
  },
  {
    id: "suspended-gp-2",
    name: "BOX-2458",
    identifier: "#DL12347 | DL2BD1236",
    added: "Yesterday",
    suspended: "Today",
    hasBox: false,
    restaurant: "Unassigned",
  },
  {
    id: "suspended-gp-3",
    name: "BOX-2459",
    identifier: "#DL12348 | DL2BD1237",
    added: "Today",
    suspended: "2 days ago",
    hasBox: true,
    restaurant: "DA PIZZA PLACE",
  },
  {
    id: "suspended-gp-4",
    name: "BOX-2460",
    identifier: "#DL12349 | DL2BD1238",
    added: "Yesterday",
    suspended: "Yesterday",
    hasBox: false,
    restaurant: "Unassigned",
  },
  {
    id: "suspended-gp-5",
    name: "BOX-2461",
    identifier: "#DL12350 | DL2BD1239",
    added: "Today",
    suspended: "Today",
    hasBox: true,
    restaurant: "DA PIZZA PLACE",
  },
  {
    id: "suspended-gp-6",
    name: "BOX-2462",
    identifier: "#DL12351 | DL2BD1240",
    added: "2 days ago",
    suspended: "2 days ago",
    hasBox: false,
    restaurant: "Unassigned",
  },
  {
    id: "suspended-gp-7",
    name: "BOX-2463",
    identifier: "#DL12352 | DL2BD1241",
    added: "Yesterday",
    suspended: "Yesterday",
    hasBox: true,
    restaurant: "DA PIZZA PLACE",
  },
  {
    id: "suspended-gp-8",
    name: "BOX-2464",
    identifier: "#DL12353 | DL2BD1242",
    added: "Today",
    suspended: "Today",
    hasBox: false,
    restaurant: "Unassigned",
  },
  {
    id: "suspended-gp-9",
    name: "BOX-2465",
    identifier: "#DL12354 | DL2BD1243",
    added: "Today",
    suspended: "2 days ago",
    hasBox: true,
    restaurant: "DA PIZZA PLACE",
  },
  {
    id: "suspended-gp-10",
    name: "BOX-2466",
    identifier: "#DL12355 | DL2BD1244",
    added: "Yesterday",
    suspended: "Yesterday",
    hasBox: false,
    restaurant: "Unassigned",
  },
];
