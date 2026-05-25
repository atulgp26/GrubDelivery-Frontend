"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const skeletonVariants = cva(
	"bg-bg-secondary",
	{
		variants: {
			variant: {
				default: "rounded-md",
				circle: "rounded-full",
				text: "rounded h-4",
				avatar: "rounded-full",
				button: "rounded-lg",
				card: "rounded-xl",
			},
			animation: {
				pulse: "animate-pulse",
				wave: "animate-[shimmer_2s_infinite] bg-gradient-to-r from-bg-secondary via-bg-tertiary to-bg-secondary bg-[length:200%_100%]",
				none: "",
			},
		},
		defaultVariants: {
			variant: "default",
			animation: "pulse",
		},
	}
);

export interface SkeletonProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof skeletonVariants> {
	/**
	 * Whether to show the skeleton loader
	 * @default true
	 */
	show?: boolean;
	/**
	 * Custom width for the skeleton
	 */
	width?: string | number;
	/**
	 * Custom height for the skeleton
	 */
	height?: string | number;
	/**
	 * Number of skeleton lines to render (useful for text skeletons)
	 */
	count?: number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
	(
		{
			className,
			variant,
			animation,
			show = true,
			width,
			height,
			count = 1,
			style,
			...props
		},
		ref
	) => {
		if (!show) return null;

		const skeletonStyle = {
			...style,
			...(width && { width: typeof width === "number" ? `${width}px` : width }),
			...(height && { height: typeof height === "number" ? `${height}px` : height }),
		};

		if (count > 1) {
			return (
				<div className="space-y-2" ref={ref}>
					{Array.from({ length: count }).map((_, index) => (
						<div
							key={index}
							data-slot="skeleton"
							className={cn(skeletonVariants({ variant, animation }), className)}
							style={skeletonStyle}
							role="status"
							aria-label="Loading..."
							aria-live="polite"
							{...props}
						/>
					))}
				</div>
			);
		}

		return (
			<div
				ref={ref}
				data-slot="skeleton"
				className={cn(skeletonVariants({ variant, animation }), className)}
				style={skeletonStyle}
				role="status"
				aria-label="Loading..."
				aria-live="polite"
				{...props}
			/>
		);
	}
);

Skeleton.displayName = "Skeleton";

// Convenience components for common patterns
const SkeletonText = React.forwardRef<
	HTMLDivElement,
	Omit<SkeletonProps, "variant">
>(({ count = 3, ...props }, ref) => (
	<Skeleton ref={ref} variant="text" count={count} {...props} />
));

SkeletonText.displayName = "SkeletonText";

const SkeletonCircle = React.forwardRef<
	HTMLDivElement,
	Omit<SkeletonProps, "variant">
>(({ width = 48, height = 48, ...props }, ref) => (
	<Skeleton
		ref={ref}
		variant="circle"
		width={width}
		height={height}
		{...props}
	/>
));

SkeletonCircle.displayName = "SkeletonCircle";

const SkeletonAvatar = React.forwardRef<
	HTMLDivElement,
	Omit<SkeletonProps, "variant">
>(({ width = 40, height = 40, ...props }, ref) => (
	<Skeleton
		ref={ref}
		variant="avatar"
		width={width}
		height={height}
		{...props}
	/>
));

SkeletonAvatar.displayName = "SkeletonAvatar";

const SkeletonButton = React.forwardRef<
	HTMLDivElement,
	Omit<SkeletonProps, "variant">
>(({ width = 100, height = 40, ...props }, ref) => (
	<Skeleton
		ref={ref}
		variant="button"
		width={width}
		height={height}
		{...props}
	/>
));

SkeletonButton.displayName = "SkeletonButton";

export {
	Skeleton,
	SkeletonText,
	SkeletonCircle,
	SkeletonAvatar,
	SkeletonButton,
	skeletonVariants,
};
