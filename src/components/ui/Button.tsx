import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-(--gp-button-gap-sm) whitespace-nowrap transition-all [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive [&:hover_span]:underline [&:hover_span]:underline-offset-2 [&:hover_p]:underline [&:hover_p]:underline-offset-2",
	{
		variants: {
			variant: {
				primary: "",
				success: "",
				warning: "",
				error: "",
				neutral: "",
			},
			appearance: {
				solid: "shadow-(--gp-shadow-xs)",
				outlined: "bg-transparent border",
				ghost: "bg-transparent",
			},
			size: {
				default:
					"h-[32px] px-(--gp-button-padding-x-sm) py-(--gp-button-padding-y-sm) text-(--gp-button-font-size-sm) leading-(--gp-button-line-height-sm) rounded-(--gp-radius-base) has-[>svg]:px-3",
				sm: "h-8 rounded-(--gp-radius-md) gap-(--gp-space-s) px-3 py-2 text-[12px] leading-[14px] has-[>svg]:px-2.5",
				md: "h-[40px] px-(--gp-button-padding-x-md) py-(--gp-button-padding-y-md) text-(--gp-button-font-size-md) leading-(--gp-button-line-height-md) rounded-(--gp-radius-base) has-[>svg]:px-4",
				lg: "h-[48px] px-(--gp-button-padding-x-lg) py-(--gp-button-padding-y-lg) text-(--gp-button-font-size-lg) leading-(--gp-button-line-height-lg) rounded-(--gp-radius-base) has-[>svg]:px-4",
				xl: "h-[56px] px-(--gp-button-padding-x-xl) py-(--gp-button-padding-y-xl) text-(--gp-button-font-size-xl) leading-(--gp-button-line-height-xl) rounded-(--gp-radius-base) has-[>svg]:px-6",
				icon: "size-9 rounded-(--gp-radius-base)",
			},
			state: {
				default: "cursor-pointer",
				hover: "cursor-pointer",
				press: "cursor-pointer active:ring-2 active:ring-[rgb(var(--neutral-300))]",
				active: "cursor-pointer",
				disabled: "pointer-events-none opacity-50 cursor-not-allowed",
			},
		},
		compoundVariants: [
			{
				variant: "primary",
				appearance: "solid",
				className:
					"bg-(--gp-color-brand-primary) text-(--gp-color-text-on-primary) border border-(--gp-color-brand-border) hover:bg-[rgb(var(--theme-600))] active:bg-[rgb(var(--theme-700))] disabled:bg-(--gp-color-bg-button-primary-disabled) disabled:border-(--gp-color-border-neutral) disabled:text-(--gp-color-text-disabled)",
			},
			{
				variant: "success",
				appearance: "solid",
				className:
					"bg-[rgb(var(--success-450))] text-[rgb(var(--white))] hover:bg-[rgb(var(--success-500))] active:bg-[rgb(var(--success-700))]",
			},
			{
				variant: "warning",
				appearance: "solid",
				className:
					"bg-[rgb(var(--warning-450))] text-[rgb(var(--white))] hover:bg-[rgb(var(--warning-500))] active:bg-[rgb(var(--warning-700))]",
			},
			{
				variant: "error",
				appearance: "solid",
				className:
					"bg-[rgb(var(--error-450))] text-[rgb(var(--white))] hover:bg-[rgb(var(--error-500))] active:bg-[rgb(var(--error-700))]",
			},
			{
				variant: "neutral",
				appearance: "solid",
				className:
					"bg-[rgb(var(--neutral-450))] text-[rgb(var(--white))] hover:bg-[rgb(var(--neutral-500))] active:bg-[rgb(var(--neutral-700))]",
			},
			{
				variant: "primary",
				appearance: "outlined",
				className:
					"border-(--gp-color-brand-border) text-(--gp-color-text-brand) hover:bg-[rgb(var(--theme-50))] hover:border-[rgb(var(--theme-600))] hover:text-[rgb(var(--theme-600))] active:bg-[rgb(var(--theme-100))] active:border-[rgb(var(--theme-700))] active:text-[rgb(var(--theme-700))] disabled:border-(--gp-color-border-neutral) disabled:bg-(--gp-color-bg-neutral-secondary) disabled:text-(--gp-color-text-disabled)",
			},
			{
				variant: "success",
				appearance: "outlined",
				className:
					"border-[rgb(var(--success-450))] text-[rgb(var(--success-450))] hover:bg-[rgb(var(--success-50))] hover:border-[rgb(var(--success-500))] hover:text-[rgb(var(--success-500))] active:bg-[rgb(var(--success-100))] active:border-[rgb(var(--success-700))] active:text-[rgb(var(--success-700))]",
			},
			{
				variant: "warning",
				appearance: "outlined",
				className:
					"border-[rgb(var(--warning-450))] text-[rgb(var(--warning-450))] hover:bg-[rgb(var(--warning-50))] hover:border-[rgb(var(--warning-500))] hover:text-[rgb(var(--warning-500))] active:bg-[rgb(var(--warning-100))] active:border-[rgb(var(--warning-700))] active:text-[rgb(var(--warning-700))]",
			},
			{
				variant: "error",
				appearance: "outlined",
				className:
					"border-[rgb(var(--error-450))] text-[rgb(var(--error-450))] hover:bg-[rgb(var(--error-50))] hover:border-[rgb(var(--error-500))] hover:text-[rgb(var(--error-500))] active:bg-[rgb(var(--error-100))] active:border-[rgb(var(--error-700))] active:text-[rgb(var(--error-700))]",
			},
			{
				variant: "neutral",
				appearance: "outlined",
				className:
					"border-[rgb(var(--neutral-450))] text-[rgb(var(--neutral-450))] hover:bg-[rgb(var(--neutral-50))] hover:border-[rgb(var(--neutral-500))] hover:text-[rgb(var(--neutral-500))] active:bg-[rgb(var(--neutral-100))] active:border-[rgb(var(--neutral-700))] active:text-[rgb(var(--neutral-700))]",
			},
			{
				variant: "primary",
				appearance: "ghost",
				className:
					"text-[rgb(var(--theme-450))] hover:bg-[rgb(var(--theme-50))] hover:text-[rgb(var(--theme-600))] active:bg-[rgb(var(--theme-100))] active:text-[rgb(var(--theme-700))]",
			},
			{
				variant: "success",
				appearance: "ghost",
				className:
					"text-[rgb(var(--success-450))] hover:bg-[rgb(var(--success-50))] hover:text-[rgb(var(--success-500))] active:bg-[rgb(var(--success-100))] active:text-[rgb(var(--success-700))]",
			},
			{
				variant: "warning",
				appearance: "ghost",
				className:
					"text-[rgb(var(--warning-450))] hover:bg-[rgb(var(--warning-50))] hover:text-[rgb(var(--warning-500))] active:bg-[rgb(var(--warning-100))] active:text-[rgb(var(--warning-700))]",
			},
			{
				variant: "error",
				appearance: "ghost",
				className:
					"text-[rgb(var(--error-450))] hover:bg-[rgb(var(--error-50))] hover:text-[rgb(var(--error-500))] active:bg-[rgb(var(--error-100))] active:text-[rgb(var(--error-700))]",
			},
			{
				variant: "neutral",
				appearance: "ghost",
				className:
					"text-[rgb(var(--neutral-450))] hover:bg-[rgb(var(--neutral-50))] hover:text-[rgb(var(--neutral-500))] active:bg-[rgb(var(--neutral-100))] active:text-[rgb(var(--neutral-700))]",
			},
		],
		defaultVariants: {
			variant: "primary",
			appearance: "solid",
			size: "default",
			state: "default",
		},
	}
);

function Button({
	className,
	variant,
	appearance,
	size,
	state = "default",
	asChild = false,
	disabled,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		state?: "default" | "hover" | "press" | "active" | "disabled";
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";
	const finalState = disabled ? "disabled" : state;

	return (
		<Comp
			data-slot="button"
			className={cn(
				buttonVariants({ variant, appearance, size, state: finalState, className })
			)}
			disabled={disabled}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
export default Button;
