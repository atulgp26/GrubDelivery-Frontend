export type AccountEmployee = {
  id: string;
  client_id: string;
  organization_name: string | null;
  country: string;
  state: string;
  email: string;
  mobile_number: string;
  country_code: string;
  status: string;
  created_at: string;
  updated_at: string;
  vertical_id: string;
  profile_pic: string | null;
  full_name: string;
  first_name: string;
  last_name: string;
  restaurant_id: string | null;
  restaurant_name: string | null;
  employee_display_id: string;
};

export type AccountProfileData = {
  employee: AccountEmployee;
  role: string;
  id: string;
  client_id: string;
};

export type { AccountRoleKey } from "@/lib/constants/account";

export type FieldsState = {
  name: string;
  email: string;
  contact: string;
  password: string;
  facility: string;
  joiningDate?: string;
};

export type EditFields = {
  name: string;
  email: string;
  contact: string;
  password: string;
  facility: string;
};

export type UserDataState = {
  name: string;
  id: string;
  employeeDisplayId?: string;
  basicDetails: { email: string; contact: string; password: string };
  professionalDetails: { role: string; facility: string; joiningDate: string };
  createdAt: string;
};
