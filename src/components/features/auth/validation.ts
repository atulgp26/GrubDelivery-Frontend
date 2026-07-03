export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;
export const PASSWORD_RULES_MESSAGE =
  "Password must be 8–72 characters with uppercase, lowercase, number, and special character";

export const EMAIL_RULES = {
  required: "Email is required",
  pattern: {
    value: EMAIL_PATTERN,
    message: "Please enter a valid email address",
  },
};
