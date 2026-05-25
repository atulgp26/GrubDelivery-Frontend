export type ErrorMessageContext =
  | "otp.verify.login"
  | "otp.verify.profile"
  | "otp.verify.account-delete"
  | "otp.verify.transfer"
  | "otp.resend"
  | "assignment.driver"
  | "assignment.manager"
  | "assignment.employee"
  | "assignment.box"
  | "assignment.resource"
  | "employee.create"
  | "employee.update"
  | "employee.activate"
  | "employee.suspend"
  | "employee.delete"
  | "employee.reactivate"
  | "box.lock"
  | "box.unlock"
  | "box.recipient.update"
  | "logs.load"
  | "boxes.load"
  | "grublock.load";

interface ApiErrorDetails {
  message?: string;
  error?: string;
  status?: number;
  code?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function pickString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

export function extractApiErrorDetails(error: unknown): ApiErrorDetails {
  const details: ApiErrorDetails = {};

  if (typeof error === "string") {
    details.error = pickString(error);
    return details;
  }

  if (error instanceof Error) {
    details.error = pickString(error.message);
  }

  if (!isRecord(error)) return details;

  details.error = pickString(error.error) ?? details.error;
  details.message = pickString(error.message) ?? details.message;
  details.status = typeof error.status === "number" ? error.status : details.status;
  details.code = typeof error.code === "number" ? error.code : details.code;

  const response = error.response;
  if (!isRecord(response)) return details;

  details.status = typeof response.status === "number" ? response.status : details.status;

  const data = response.data;
  if (!isRecord(data)) return details;

  details.error = pickString(data.error) ?? details.error;
  details.message = pickString(data.message) ?? details.message;
  details.code = typeof data.code === "number" ? data.code : details.code;

  return details;
}

function isGenericMessageForContext(context: ErrorMessageContext, message?: string): boolean {
  const normalized = (message ?? "").trim().toLowerCase();
  if (!normalized) return true;

  if (context.startsWith("otp.")) {
    return (
      /^invalid\s+otp\b/.test(normalized) ||
      /^failed\s+to\s+verify\s+otp\b/.test(normalized) ||
      /^otp\s+verification\s+failed\b/.test(normalized)
    );
  }

  return (
    /^failed\s+to\s+assign\b/.test(normalized) ||
    /^failed\s+to\s+reassign\b/.test(normalized) ||
    /^assignment\s+failed\b/.test(normalized) ||
    /^failed\s+to\s+(create|update|activate|suspend|delete|reactivate)\b/.test(normalized) ||
    /^failed\s+to\s+(lock|unlock)\b/.test(normalized) ||
    /^failed\s+to\s+update\s+recipient\b/.test(normalized) ||
    /^(failed|unable)\s+to\s+(load|fetch)\b/.test(normalized)
  );
}

function getOtpFallbackMessage(details: ApiErrorDetails): string {
  const text = `${details.error ?? ""} ${details.message ?? ""}`.toLowerCase();

  if (
    details.status === 410 ||
    /expired|timeout|timed\s*out|no\s+longer\s+valid/.test(text)
  ) {
    return "OTP expired. Please request a new OTP and try again.";
  }

  if (
    details.status === 429 ||
    details.code === 429 ||
    /too\s+many\s+attempts|too\s+many\s+requests|rate\s*limit|blocked|temporarily\s+locked/.test(text)
  ) {
    return "Too many OTP attempts. Please wait and request a new OTP.";
  }

  if (/already\s+used|consumed/.test(text)) {
    return "This OTP has already been used. Please request a new OTP.";
  }

  if (/invalid|incorrect|mismatch|does\s+not\s+match|wrong\s+otp/.test(text)) {
    return "OTP does not match. Please re-check the code and try again.";
  }

  if (details.status === 422 || /validation|required|format|4\s*-?digit/.test(text)) {
    return "OTP format is invalid. Please enter a valid 4-digit OTP.";
  }

  return "We could not verify the OTP. Please try again or request a new OTP.";
}

function getResendOtpFallbackMessage(details: ApiErrorDetails): string {
  const text = `${details.error ?? ""} ${details.message ?? ""}`.toLowerCase();
  if (
    details.status === 429 ||
    details.code === 429 ||
    /too\s+many\s+requests|rate\s*limit|wait/.test(text)
  ) {
    return "OTP resend limit reached. Please wait before requesting a new OTP.";
  }
  return "Unable to resend OTP right now. Please try again.";
}

function getAssignmentFallbackMessage(context: ErrorMessageContext, details: ApiErrorDetails): string {
  const text = `${details.error ?? ""} ${details.message ?? ""}`.toLowerCase();
  const target =
    context === "assignment.manager"
      ? "manager"
      : context === "assignment.driver"
        ? "driver"
        : context === "assignment.box"
          ? "box"
          : context === "assignment.resource"
            ? "resource"
            : "employee";

  if (details.status === 409 || /already\s+assigned|conflict|duplicate/.test(text)) {
    return `Could not assign ${target} due to a conflict. The ${target} may already be assigned.`;
  }

  if (/suspend|inactive|disabled|deactiv/.test(text)) {
    return `Could not assign ${target} because the selected ${target} is inactive.`;
  }

  if (/role|permission|not\s+allowed|unauthorized/.test(text)) {
    return `Could not assign ${target} due to role or permission restrictions.`;
  }

  if (details.status === 422 || /validation|required|invalid/.test(text)) {
    return `Could not assign ${target}. Please review the selection and try again.`;
  }

  return `Could not assign ${target}. Please refresh and try again.`;
}

function getEmployeeFallbackMessage(context: ErrorMessageContext, details: ApiErrorDetails): string {
  const text = `${details.error ?? ""} ${details.message ?? ""}`.toLowerCase();

  const actionMap: Record<
    "employee.create" | "employee.update" | "employee.activate" | "employee.suspend" | "employee.delete" | "employee.reactivate",
    string
  > = {
    "employee.create": "create employee",
    "employee.update": "update employee",
    "employee.activate": "activate employee",
    "employee.suspend": "suspend employee",
    "employee.delete": "delete employee",
    "employee.reactivate": "reactivate employee",
  };

  const action = actionMap[context as keyof typeof actionMap] ?? "complete employee action";

  if (details.status === 409 || /already\s+exists|duplicate|conflict/.test(text)) {
    return `Could not ${action} due to a conflict. Please verify employee details and try again.`;
  }

  if (details.status === 422 || /validation|required|invalid/.test(text)) {
    return `Could not ${action}. Please review the entered details and try again.`;
  }

  if (/inactive|suspend|disabled/.test(text) && context === "employee.activate") {
    return "Could not activate employee because the account is not eligible for activation.";
  }

  return `Could not ${action}. Please try again.`;
}

function getBoxFallbackMessage(context: ErrorMessageContext, details: ApiErrorDetails): string {
  const text = `${details.error ?? ""} ${details.message ?? ""}`.toLowerCase();

  if (details.status === 409 || /already\s+locked|already\s+unlocked|conflict/.test(text)) {
    if (context === "box.lock") {
      return "Could not lock box because it is already locked or in a conflicting state.";
    }
    if (context === "box.unlock") {
      return "Could not unlock box because it is already unlocked or in a conflicting state.";
    }
  }

  if (details.status === 422 || /validation|required|invalid/.test(text)) {
    if (context === "box.recipient.update") {
      return "Could not update recipient details. Please verify the entered information and try again.";
    }
    if (context === "box.lock") {
      return "Could not lock box. Please verify recipient details and try again.";
    }
    if (context === "box.unlock") {
      return "Could not unlock box. Please verify the request details and try again.";
    }
  }

  if (context === "box.recipient.update") {
    return "Could not update recipient details. Please try again.";
  }
  if (context === "box.lock") {
    return "Could not lock box. Please try again.";
  }
  return "Could not unlock box. Please try again.";
}

function getLoadFallbackMessage(context: ErrorMessageContext, details: ApiErrorDetails): string {
  const text = `${details.error ?? ""} ${details.message ?? ""}`.toLowerCase();

  if (
    details.status === 429 ||
    details.code === 429 ||
    /too\s+many\s+requests|rate\s*limit/.test(text)
  ) {
    return "Too many requests. Please wait and try again.";
  }

  if (context === "logs.load") {
    return "Unable to load logs right now. Please refresh and try again.";
  }
  if (context === "grublock.load") {
    return "Unable to load GrubLock boxes right now. Please refresh and try again.";
  }
  return "Unable to load boxes right now. Please refresh and try again.";
}

export function getContextualErrorMessage(
  context: ErrorMessageContext,
  error: unknown,
  fallback?: string,
): string {
  const details = extractApiErrorDetails(error);
  const backendMessage = details.error ?? details.message;

  if (!isGenericMessageForContext(context, backendMessage)) {
    return backendMessage as string;
  }

  if (context.startsWith("otp.verify.")) {
    return getOtpFallbackMessage(details);
  }

  if (context === "otp.resend") {
    return getResendOtpFallbackMessage(details);
  }

  if (context.startsWith("assignment.")) {
    return getAssignmentFallbackMessage(context, details);
  }

  if (context.startsWith("employee.")) {
    return getEmployeeFallbackMessage(context, details);
  }

  if (context.startsWith("box.")) {
    return getBoxFallbackMessage(context, details);
  }

  if (context === "logs.load" || context === "boxes.load" || context === "grublock.load") {
    return getLoadFallbackMessage(context, details);
  }

  return fallback ?? "Something went wrong. Please try again.";
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const details = extractApiErrorDetails(error);
  return details.error ?? details.message ?? fallback;
}
