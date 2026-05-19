export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EMAIL_RULES = {
  required: "Email is required",
  pattern: {
    value: EMAIL_PATTERN,
    message: "Please enter a valid email address",
  },
};
