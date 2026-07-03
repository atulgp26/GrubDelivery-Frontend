"use client";

import { useState } from "react";
import { EMAIL_PATTERN } from "@/components/features/auth/validation";
import { COUNTRIES, DEFAULT_STATE_OPTIONS, STATES_BY_COUNTRY } from "../data/regionData";

export interface NewOwnerFormData {
  fullName: string;
  organisationName: string;
  countryCode: string;
  dialCode: string;
  phone: string;
  email: string;
  country: string;
  countryLabel: string;
  state: string;
  stateLabel: string;
}

const INITIAL_FORM: NewOwnerFormData = {
  fullName: "",
  organisationName: "",
  countryCode: "IN",
  dialCode: "+91",
  phone: "",
  email: "",
  country: "",
  countryLabel: "",
  state: "",
  stateLabel: "",
};

const FULL_NAME_MAX_LENGTH = 50;
const ORGANISATION_NAME_MAX_LENGTH = 80;
const INDIA_LOCAL_DIGITS = 10;
const ORGANISATION_SANITIZE_REGEX = /[^\p{L}\p{N}\s&'.,()-]/gu;
const FULL_NAME_NUMERIC_REGEX = /\d/;
const toDigits = (value: string): string => value.replace(/\D/g, "");

const sanitizeFullNameInput = (value: string): string =>
  value.slice(0, FULL_NAME_MAX_LENGTH);

const hasNumericInFullName = (value: string): boolean =>
  FULL_NAME_NUMERIC_REGEX.test(value);

const sanitizeOrganisationInput = (value: string): string =>
  value.replace(ORGANISATION_SANITIZE_REGEX, "").slice(0, ORGANISATION_NAME_MAX_LENGTH);

const sanitizePhoneInput = (value: string): string => {
  let digits = toDigits(value);
  digits = digits.replace(/^0+/, "");
  return digits.slice(0, INDIA_LOCAL_DIGITS);
};

const normalizeIndianContact = (value: string): string | null => {
  const digits = toDigits(value);
  if (digits.length === INDIA_LOCAL_DIGITS) return digits;
  return null;
};

export function useTransferForm() {
  const [form, setForm] = useState<NewOwnerFormData>(INITIAL_FORM);

  const set = (field: keyof NewOwnerFormData) => (value: string) =>
    setForm((prev) => {
      if (field === "fullName") {
        return { ...prev, fullName: sanitizeFullNameInput(value) };
      }

      if (field === "organisationName") {
        return { ...prev, organisationName: sanitizeOrganisationInput(value) };
      }

      if (field === "phone") {
        return { ...prev, phone: sanitizePhoneInput(value) };
      }

      if (field === "email") {
        return { ...prev, email: value.trim().slice(0, 100) };
      }

      return { ...prev, [field]: value };
    });

  const handleCountryChange = (value: string) => {
    const label = COUNTRIES.find((c) => c.value === value)?.label ?? value;
    setForm((prev) => ({ ...prev, country: value, countryLabel: label, state: "", stateLabel: "" }));
  };

  const handleStateChange = (value: string) => {
    const stateOptions = STATES_BY_COUNTRY[form.country] ?? DEFAULT_STATE_OPTIONS;
    const label = stateOptions.find((s) => s.value === value)?.label ?? value;
    setForm((prev) => ({ ...prev, state: value, stateLabel: label }));
  };

  const trimmedFullName = form.fullName.trim();
  const trimmedOrganisationName = form.organisationName.trim();
  const trimmedEmail = form.email.trim();
  const normalizedContact = normalizeIndianContact(form.phone);

  const isEmailValid = trimmedEmail !== "" && EMAIL_PATTERN.test(trimmedEmail);
  const isContactValid = normalizedContact !== null;

  const isFullNameValid =
    trimmedFullName !== "" && !hasNumericInFullName(form.fullName);

  const isValid =
    isFullNameValid &&
    trimmedOrganisationName !== "" &&
    isContactValid &&
    isEmailValid &&
    form.country !== "" &&
    form.state !== "";

  const stateOptions = form.country
    ? STATES_BY_COUNTRY[form.country] ?? DEFAULT_STATE_OPTIONS
    : [];

  const reset = () => setForm(INITIAL_FORM);

  return {
    form,
    setForm,
    set,
    handleCountryChange,
    handleStateChange,
    isValid,
    isFullNameValid,
    isEmailValid,
    isContactValid,
    stateOptions,
    reset,
  };
}
