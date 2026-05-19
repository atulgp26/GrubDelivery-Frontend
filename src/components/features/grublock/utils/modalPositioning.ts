interface PositionConfig {
  modalWidth: number;
  modalHeight: number;
  spacing?: number;
  minMargin?: number;
}

export function calculateModalPositionAboveButton(
  buttonElement: HTMLElement,
  config: PositionConfig
): { top: string; left: string } | Record<string, never> {
  if (!buttonElement) return {} as Record<string, never>;

  const {
    modalWidth = 400,
    modalHeight = 500,
    spacing = 10,
    minMargin = 20,
  } = config;

  const rect = buttonElement.getBoundingClientRect();
  const buttonCenterX = rect.left + rect.width / 2;
  const modalLeft = buttonCenterX - modalWidth / 2;
  const modalTop = rect.top - modalHeight - spacing;

  const adjustedLeft = Math.max(
    minMargin,
    Math.min(modalLeft, window.innerWidth - modalWidth - minMargin)
  );
  const adjustedTop = Math.max(minMargin, modalTop);

  return {
    top: `${adjustedTop}px`,
    left: `${adjustedLeft}px`,
  };
}

export function calculateEmergencyUnlockPosition(
  buttonElement: HTMLElement | null
): { top: boolean; right: boolean } {
  if (!buttonElement) {
    return { top: true, right: false };
  }

  const rect = buttonElement.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  return {
    top: rect.top < viewportHeight / 2,
    right: rect.left > viewportWidth / 2,
  };
}

export function calculateModalPositionAboveButtonRight(
  buttonElement: HTMLElement,
  config: PositionConfig
): { top: string; right: string } | Record<string, never> {
  if (!buttonElement) return {} as Record<string, never>;

  const {
    modalWidth = 400,
    modalHeight = 500,
    spacing = 10,
    minMargin = 20,
  } = config;

  const rect = buttonElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const preferredTop = rect.top - modalHeight - spacing;
  const fallbackBelowTop = rect.bottom + spacing;
  const maxTop = viewportHeight - modalHeight - minMargin;
  const adjustedTop = Math.max(
    minMargin,
    Math.min(preferredTop >= minMargin ? preferredTop : fallbackBelowTop, maxTop)
  );

  const rightFromButton = viewportWidth - rect.right;
  const maxRight = Math.max(minMargin, viewportWidth - modalWidth - minMargin);
  const adjustedRight = Math.max(minMargin, Math.min(rightFromButton, maxRight));

  return {
    top: `${adjustedTop}px`,
    right: `${adjustedRight}px`,
  };
}

export function calculateModalPositionBelowButtonRight(
  buttonElement: HTMLElement,
  config: PositionConfig
): { top: string; right: string } | Record<string, never> {
  if (!buttonElement) return {} as Record<string, never>;

  const {
    modalWidth = 400,
    modalHeight = 500,
    spacing = 10,
    minMargin = 24,
  } = config;

  const rect = buttonElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const preferredTop = rect.bottom + spacing;
  const maxTop = viewportHeight - modalHeight - minMargin;
  // Keep the modal as close as possible to the trigger by clamping within viewport
  // instead of jumping above the trigger when below space is limited.
  const adjustedTop = Math.max(minMargin, Math.min(preferredTop, maxTop));

  const rightFromButton = viewportWidth - rect.right;
  const maxRight = Math.max(minMargin, viewportWidth - modalWidth - minMargin);
  const adjustedRight = Math.max(minMargin, Math.min(rightFromButton, maxRight));

  return {
    top: `${adjustedTop}px`,
    right: `${adjustedRight}px`,
  };
}

export function calculateActionBarModalPositionAboveButton(
  buttonElement: HTMLElement,
  config: PositionConfig
): { top: string; right: string } | Record<string, never> {
  if (!buttonElement) return {} as Record<string, never>;

  const {
    modalWidth = 400,
    modalHeight = 300,
    spacing = 8,
    minMargin = 24,
  } = config;

  // Custom-positioned modals have `mx-4` in Modal.tsx, so the visible card sits 16px left of container right.
  const modalHorizontalMargin = 16;

  const rect = buttonElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const preferredTop = rect.top - modalHeight - spacing;
  const fallbackBelowTop = rect.bottom + spacing;
  const maxTop = viewportHeight - modalHeight - minMargin;
  const adjustedTop = Math.max(
    minMargin,
    Math.min(preferredTop >= minMargin ? preferredTop : fallbackBelowTop, maxTop)
  );

  const rightFromButton = viewportWidth - rect.right;
  const adjustedRight = Math.max(minMargin, rightFromButton - modalHorizontalMargin);

  return {
    top: `${adjustedTop}px`,
    right: `${adjustedRight}px`,
  };
}

