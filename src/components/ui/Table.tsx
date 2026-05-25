import type {
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

interface TableComponentProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

interface TableSectionProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  active?: boolean;
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  className?: string;
}

interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "", ...props }: TableComponentProps) {
  return (
    <table className={`table-fixed !w-full ${className}`} {...props}>
      {children}
    </table>
  );
}

export function TableHead({ children, className = "", ...props }: TableSectionProps) {
  return (
    <thead className={`border-b border-[var(--color-stroke-neutral)] ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "", ...props }: TableSectionProps) {
  return (
    <tbody className={`divide-y divide-[var(--color-stroke-neutral)] ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, active = false, className = "", ...props }: TableRowProps) {
  return (
    <tr
      className={`${
        active
          ? "w-full bg-[var(--color-neutral-secondary-bg)] hover:bg-[var(--color-neutral-secondary-bg)]"
          : "hover:bg-[var(--color-neutral-secondary-bg)]"
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "", ...props }: TableCellProps) {
  return (
    <td className={`table-cell ${className}`} {...props}>
      {children}
    </td>
  );
}

export function TableHeaderCell({ children, className = "", ...props }: TableHeaderCellProps) {
  return (
    <th className={`px-4 py-3 text-left text-sm font-normal text-[var(--color-stroke-brand)] ${className}`} {...props}>
      {children}
    </th>
  );
}
