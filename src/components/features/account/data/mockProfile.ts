export type MockUser = {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile_number?: string;
  country_code?: string;
  location?: string;
  joining_date?: string;
  created_at?: string;
  role?: string;
};

export let MOCK_PROFILE: MockUser = {
  id: "DEL12sgte3",
  first_name: "Akash",
  last_name: "Sharma",
  email: "akash@gmil.com",
  mobile_number: "98765 43210",
  country_code: "+91",
  location: "-",
  joining_date: "2024-01-12T00:00:00.000Z",
  created_at: "2024-01-12T00:00:00.000Z",
  role: "Owner",
};

export function setMockProfile(next: MockUser) {
  MOCK_PROFILE = next;
}


