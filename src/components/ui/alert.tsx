import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import { IoMdClose } from "react-icons/io";

// Local icon assets (permanent)
const checkIcon = "/check-circle.svg";
const exclamationIcon = "/exclamation-triangle.svg"; // Red for critical errors
const warningIcon = "/Employee/exclamation-triangle.svg"; // Amber for warnings/conflicts

const alertVariants = cva(
	"flex items-center gap-[var(--gp-space-m)] px-[var(--gp-padding-m)] py-[var(--gp-padding-s)] rounded-[var(--gp-radius-base)] shadow-[var(--gp-shadow-popup)] border w-full text-sm",
	{
		variants: {
			variant: {
				success: "bg-green-50 border-green-500 text-green-700",
				error: "bg-[var(--gp-color-bg-colored-secondary)] text-[var(--gp-color-text-brand-active)] border-[var(--gp-color-border-brand-primary)]",
				warning: "bg-[#FFECD7] border-[#F4AD49] text-[#BB812C]",
				neutral: "bg-gray-50 border-gray-300 text-gray-700",
			},
			appearance: {
				solid: "",
				outlined: "bg-transparent",
				ghost: "bg-transparent border-transparent",
			},
		},
		compoundVariants: [
			{
				variant: "warning",
				className: "shadow-[0_0_4px_0_rgba(0,0,0,0.10),4px_4px_8px_0_rgba(0,0,0,0.12)]",
			},
		],
		defaultVariants: {
			variant: "neutral",
			appearance: "solid",
		},
	}
);

export interface AlertProps
	extends React.HTMLAttributes<HTMLDivElement>,
	VariantProps<typeof alertVariants> {
	autoDismiss?: boolean;
	onDismiss?: () => void;
	dismissTime?: number;
	showClose?: boolean;
}

function Alert({ className, variant, appearance, children, autoDismiss = true, onDismiss, dismissTime = 3000, showClose = true, ...props }: AlertProps) {
	React.useEffect(() => {
		if (autoDismiss && onDismiss) {
			const timer = setTimeout(() => {
				onDismiss();
			}, dismissTime);
			return () => clearTimeout(timer);
		}
	}, [autoDismiss, onDismiss, dismissTime]);

	return (
		<div
			role="alert"
			className={cn(alertVariants({ variant, appearance }), className)}
			{...props}
		>
			{/* ICON */}
			{variant === "success" && (
				<div className="shrink-0 size-[var(--gp-icon-size)] flex items-center justify-center">
					<img src={checkIcon} alt="success" className="size-full object-contain" />
				</div>
			)}
			{variant === "error" && (
				<div className="shrink-0 size-[var(--gp-icon-size)] flex items-center justify-center">
					<img src={exclamationIcon} alt="error" className="size-full object-contain" />
				</div>
			)}
			{variant === "warning" && (
				<div className="shrink-0 size-[var(--gp-icon-size)] flex items-center justify-center">
					<img src={warningIcon} alt="warning" className="size-full object-contain" />
				</div>
			)}

			{/* TEXT CONTENT */}
			<div className="flex-1 flex items-center gap-[var(--gp-space-l)]">
				{children}
			</div>

			{/* CLOSE BUTTON */}
			{showClose && onDismiss && (
				<button 
					type="button"
					onClick={() => {
						onDismiss();
					}}
					className="shrink-0 text-current hover:opacity-70 transition-opacity p-1 relative z-10"
					aria-label="Dismiss alert"
				>
					<IoMdClose className="w-5 h-5" />
				</button>
			)}
		</div>
	);
}


function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h5
			className={cn(
				"text-[var(--gp-text-size-lg)] leading-[var(--gp-text-line-height-lg)]",
				className
			)}
			style={{
				fontFamily: "var(--gp-font-heading)",
				fontWeight: "var(--gp-font-weight-heading)",
				fontFeatureSettings: "'frac' 1"
			}}
			{...props}
		/>
	);
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
	truncate?: boolean;
}

function AlertDescription({ className, truncate = false, ...props }: AlertDescriptionProps) {
	return (
		<p
			className={cn(
				"text-[var(--gp-text-size-md)] leading-[var(--gp-text-line-height-md)]",
				truncate && "block overflow-hidden text-ellipsis whitespace-nowrap",
				className
			)}
			style={{
				fontFamily: "var(--gp-font-text)",
				fontWeight: "var(--gp-font-weight-text)",
				fontFeatureSettings: "'frac' 1"
			}}
			{...props}
		/>
	);
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
