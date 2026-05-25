"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DataTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
	children: React.ReactNode;
}

export function DataTable({ children, className, ...props }: DataTableProps) {
	return (
		<table
			className={cn(
				"w-full border-collapse border-spacing-0 bg-white",
				className
			)}
			{...props}
		>
			{children}
		</table>
	);
}

export interface DataTableHeaderProps
	extends React.HTMLAttributes<HTMLTableSectionElement> {
	children: React.ReactNode;
}

export function DataTableHeader({
	children,
	className,
	...props
}: DataTableHeaderProps) {
	return (
		<thead className={className} {...props}>
			<tr className="border-b border-[var(--gp-color-border-neutral)]">
				{children}
			</tr>
		</thead>
	);
}


export interface DataTableHeaderCellProps
	extends React.ThHTMLAttributes<HTMLTableCellElement> {
	children?: React.ReactNode;
	width?: string | number;
}

export function DataTableHeaderCell({
	children,
	className,
	width,
	...props
}: DataTableHeaderCellProps) {
	return (
		<th
			className={cn(
				"px-[var(--gp-padding-l)] py-[var(--gp-padding-m)] text-left font-[var(--gp-font-text)] text-[14px] leading-[22px] text-[var(--gp-color-text-neutral-tertiary)]",
				className
			)}
			style={{ fontWeight: 400, width: width }}
			{...props}
		>
			{children}
		</th>
	);
}


export interface DataTableBodyProps
	extends React.HTMLAttributes<HTMLTableSectionElement> {
	children: React.ReactNode;
}

export function DataTableBody({
	children,
	className,
	...props
}: DataTableBodyProps) {
	return (
		<tbody className={cn("[&>tr:last-child]:border-b-0", className)} {...props}>
			{children}
		</tbody>
	);
}

export interface DataTableRowProps
	extends React.HTMLAttributes<HTMLTableRowElement> {
	children: React.ReactNode;
}

export function DataTableRow({
	children,
	className,
	...props
}: DataTableRowProps) {
	return (
		<tr
			className={cn(
				"group border-b border-[var(--gp-color-border-neutral)] last:border-b-0 hover:bg-[#EFF1F0] transition-colors",
				className
			)}
			{...props}
		>
			{children}
		</tr>
	);
}

export interface DataTableCellProps
	extends React.TdHTMLAttributes<HTMLTableCellElement> {
	children?: React.ReactNode;
	width?: string | number;
}

export function DataTableCell({
	children,
	className,
	width,
	...props
}: DataTableCellProps) {
	return (
		<td
			className={cn(
				"px-[var(--gp-padding-l)] py-[var(--gp-padding-m)]",
				className
			)}
			style={{ width }}
			{...props}
		>
			{children}
		</td>
	);
}
