import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textFieldVariants = cva(
	"flex items-center gap-[var(--gp-text-field-gap-lg)] rounded-[var(--gp-radius-base)] border-[var(--gp-stroke-width-default)] border-solid transition-colors",
	{
		variants: {
			size: {
				sm: "h-[40px] w-[80%] px-4 py-2",
				default:
					"h-[var(--gp-text-field-height-lg)] px-[var(--gp-button-padding-x-lg)] py-[var(--gp-button-padding-y-lg)] border border-[var(--gp-color-border-neutral)]",
				xl: "h-[var(--gp-text-field-height-lg)] px-[var(--gp-button-padding-x-lg)] py-[var(--gp-button-padding-y-lg)] border border-[var(--gp-color-border-neutral)]",
			},
			variant: {
				default:
				"bg-[var(--gp-color-bg-white)] border border-[var(--gp-color-border-neutral)] h-[48px]",
				error:
					"bg-[var(--gp-color-bg-white)] border border-red-500",
			},
			hasHoverEffect: {
				true: "hover:border-[var(--gp-color-brand-primary)] cursor-pointer",
				false: "",
			},
			state: {
				default: "",
				press: "active:ring-2 active:ring-[rgb(var(--neutral-300))]",
				active: "ring-2 ring-[rgb(var(--neutral-300))]",

			},
		},
		defaultVariants: {
			size: "default",
			variant: "default",
			hasHoverEffect: true,
			state: "default",
		},
	}
);

const inputVariants = cva(
	"flex-1 min-w-0 bg-transparent outline-none font-[var(--gp-font-text)] font-[var(--gp-font-weight-text)] text-[var(--gp-text-size-lg)] leading-[var(--gp-text-line-height-lg)] placeholder:text-[var(--gp-color-text-neutral-light)]",
	{
		variants: {},
		defaultVariants: {},
	}
);

export interface TextFieldProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
		VariantProps<typeof textFieldVariants> {
	leadingIcon?: React.ReactNode;
	trailingIcon?: React.ReactNode;
	onLeadingIconClick?: () => void;
	onTrailingIconClick?: () => void;
	error?: string;
	label?: string;
	containerClassName?: string;
	inputContainerClassName?: string;
	leadingIconClassName?: string;
	trailingIconClassName?: string;
	hasHoverEffect?: boolean;
	state?: "default" | "press";
}


const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
	(
		{
			className,
			containerClassName,
			inputContainerClassName,
			size,
			variant,
			state = "default",
			leadingIcon,
			trailingIcon,
			onLeadingIconClick,
			onTrailingIconClick,
			error,
			label,
			id,
			leadingIconClassName,
			trailingIconClassName,
			hasHoverEffect = true,
			onFocus,
			onBlur,
			...props
		},
		ref
	) => {
		const inputId = id || React.useId();
		const errorId = error ? `${inputId}-error` : undefined;
		const [isFocused, setIsFocused] = React.useState(false);

		const finalState = state === "press" && isFocused ? "active" : state;

		const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
			setIsFocused(true);
			onFocus?.(e);
		};

		const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
			setIsFocused(false);
			onBlur?.(e);
		};

		return (
			<div className={cn("flex flex-col gap-2", containerClassName)}>
				{label && (
					<label
						htmlFor={inputId}
						className="font-[var(--gp-font-text)] font-[var(--gp-font-weight-text)] text-[var(--gp-text-size-sm)] text-[var(--gp-color-text-neutral-primary)]"
					>
						{label}
					</label>
				)}
				<div
					className={cn(
						"relative",
						textFieldVariants({ size, variant: error ? "error" : variant, hasHoverEffect, state: finalState }),
						inputContainerClassName,
					)}
				>
					{leadingIcon && (
						onLeadingIconClick ? (
							<button
								type="button"
								onClick={onLeadingIconClick}
								className={cn(
									"shrink-0 size-[var(--gp-icon-size)] flex items-center justify-center text-[var(--gp-color-text-neutral-light)] hover:text-[var(--gp-color-text-neutral-primary)] transition-colors",
									leadingIconClassName
								)}
								tabIndex={-1}
							>
								{leadingIcon}
							</button>
						) : (
							<div className={cn(
								"shrink-0 size-[var(--gp-icon-size)] flex items-center justify-center text-[var(--gp-color-text-neutral-light)]",
								leadingIconClassName
							)}>
								{leadingIcon}
							</div>
						)
					)}
					<input
						id={inputId}
						ref={ref}
						className={cn(inputVariants(), className)}
						aria-invalid={error ? "true" : "false"}
						aria-describedby={errorId}
						style={{ fontFeatureSettings: "'frac' 1" }}
						onFocus={handleFocus}
						onBlur={handleBlur}
						{...props}
					/>
					{trailingIcon && (
						onTrailingIconClick ? (
							<button
								type="button"
								onClick={onTrailingIconClick}
								className={cn(
									"shrink-0 size-[var(--gp-icon-size)] flex items-center justify-center text-[var(--gp-color-text-neutral-light)] hover:text-[var(--gp-color-text-brand)] hover:bg-orange-100 transition-colors rounded-sm",
									trailingIconClassName
								)}
								tabIndex={-1}
							>
								{trailingIcon}
							</button>
						) : (
							<div className={cn(
								"shrink-0 size-[var(--gp-icon-size)] flex items-center justify-center text-[var(--gp-color-text-neutral-light)]",
								trailingIconClassName
							)}>
								{trailingIcon}
							</div>
						)
					)}
				</div>
				{error && (
					<p
						id={errorId}
						className="text-sm text-red-600"
						role="alert"
					>
						{error}
					</p>
				)}
			</div>
		);
	}
);

TextField.displayName = "TextField";

export { TextField, textFieldVariants };
