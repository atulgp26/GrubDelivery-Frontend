import { useState, useRef } from "react";
import type { ReactNode, ChangeEvent } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import TableCheckbox from "@/components/ui/TableCheckbox";
import SearchWithSuggestions from "@/components/ui/SearchWithSuggestions";
import TableActionBar from "@/components/ui/TableActionBar";
import { MdArrowBackIos } from "react-icons/md";
import { useRouter } from "next/navigation";
import Collapse from "@/components/ui/Collapse";
import SuspendedGroundfloor from "../table/SuspendedGroundfloor";
import { useModalState } from "@/lib/hooks";
import CheckBox from "@/components/ui/CheckBox";
import FilterButton from "@/components/ui/FilterButton";
import { Button } from "@/components/ui/Button";
import type { GrubPacItem } from "@/components/features/grubpacs/hooks/useGrubPacsListState";

interface SearchSuggestion {
  code?: string;
  name?: string;
  [key: string]: unknown;
}

interface GrubPacsTableBaseProps {
  title: string;
  data: GrubPacItem[];
  groupedData?: Record<string, GrubPacItem[]>;
  columns?: unknown[];
  renderRow: (item: GrubPacItem) => ReactNode;
  onSearch?: (value: string) => void;
  onFilter?: () => void;
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string | number, checked: boolean) => void;
  setIsFilterOpen: (open: boolean) => void;
  isFilterOpen: boolean;
  selectedItems: (string | number)[];
  actionBarProps?: Record<string, unknown>;
  showFilter?: boolean;
  showSearch?: boolean;
  rightActionButton?: ReactNode;
  searchSuggestions?: SearchSuggestion[];
  onSuggestionClick?: (item: SearchSuggestion) => void;
  searchTerm?: string;
}

export default function GrubPacsTableBase({
  title,
  data,
  groupedData,
  columns,
  renderRow,
  onSearch,
  onFilter,
  onSelectAll,
  onSelectItem,
  setIsFilterOpen,
  isFilterOpen,
  selectedItems,
  actionBarProps,
  showFilter = true,
  showSearch = true,
  rightActionButton,
  searchSuggestions = [],
  onSuggestionClick = () => {},
  searchTerm = "",
}: GrubPacsTableBaseProps) {
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [isGrouped, setIsGrouped] = useState(false);
  const { modalState, openModal, closeModal } = useModalState({
    filter: { open: false },
  });
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInternalSearchTerm(value);
    onSearch?.(value);
  };

  const GroupedView = () => {
    const [openGroup, setOpenGroup] = useState<string | null>("unassigned");

    return (
      <div className="space-y-0">
        {/* BLOOD BANK section */}
        <Collapse
          title="BLOOD BANK"
          open={openGroup === "bloodBank"}
          onClick={() =>
            setOpenGroup(openGroup === "bloodBank" ? null : "bloodBank")
          }
          restaurantTable={true}
        >
          {openGroup === "bloodBank" && (
            <SuspendedGroundfloor
              onSelectItem={onSelectItem}
              selectedItems={selectedItems}
              data={groupedData?.["BLOOD BANK"] || []}
              renderRow={renderRow}
            />
          )}
        </Collapse>

        {/* Unassigned section */}
        <Collapse
          title="Unassigned"
          open={openGroup === "unassigned"}
          onClick={() =>
            setOpenGroup(openGroup === "unassigned" ? null : "unassigned")
          }
          restaurantTable={true}
        >
          {openGroup === "unassigned" && (
            <SuspendedGroundfloor
              onSelectItem={onSelectItem}
              selectedItems={selectedItems}
              data={groupedData?.["Unassigned"] || []}
              renderRow={renderRow}
            />
          )}
        </Collapse>
      </div>
    );
  };
  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="neutral"
appearance="ghost"
            onClick={() => router.push("/grubpacs/list")}
            className="rounded transition"
            aria-label="Go back"
          >
            <MdArrowBackIos className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-primary)]">{title}</h1>
        </div>
        {rightActionButton}
      </div>

      <div className="flex items-center justify-between">
        {showSearch && (
          <div className="relative max-w-xs w-full" ref={searchBoxRef}>
            <SearchWithSuggestions
              data={searchSuggestions}
              value={searchTerm ?? internalSearchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setInternalSearchTerm(value);
                onSearch?.(value);
              }}
              onSelect={(item: SearchSuggestion) => {
                onSuggestionClick(item);
                setInternalSearchTerm(item.code || item.name || "");
                onSearch?.(item.code || item.name || "");
              }}
              getLabel={(item: SearchSuggestion) => item.name || ""}
              getSubLabel={(item: SearchSuggestion) => item.code || ""}
              placeholder="Search box"
              clearable={true}
              onClear={() => {
                setInternalSearchTerm("");
                onSearch?.("");
              }}
            />
          </div>
        )}
        <div className="flex items-center space-x-4">
          <span className="text-[var(--color-stroke-brand)] text-sm">
            Showing {data.length} of {data.length}
          </span>
        <div className="flex gap-4 items-center">
          <CheckBox
            checked={isGrouped}
            onChange={(e) => setIsGrouped(e.target.checked)}
          />
          <span className="text-lg text-[var(--color-neutral-secondary)]">
            Grouped
          </span>
        </div>
          <FilterButton open={isFilterOpen} handleFilterClick={() => setIsFilterOpen(!isFilterOpen)}/>
        </div>
      </div>
<div>
  {isGrouped ? <GroupedView/>
:     ( <div className="bg-white rounded-lg overflow-x-auto">
        <Table className="min-w-[720px] table-auto">
          <TableHead>
            <TableRow>
              <TableCell className="w-12 !pl-4">
                <TableCheckbox
                  checked={selectedItems.length === data.length}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell className="!text-[var(--color-stroke-brand)] text-sm font-normal min-w-[240px]">
                Name
              </TableCell>
              <TableCell className="!text-[var(--color-stroke-brand)] text-sm font-normal text-right whitespace-nowrap pr-6">
                Added
              </TableCell>
              <TableCell className="!text-[var(--color-stroke-brand)] text-sm font-normal text-center whitespace-nowrap pr-4">
                Suspended
              </TableCell>
             <TableCell className="text-right pr-6 w-32">{null}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  className="text-center text-gray-400 py-12 text-lg font-medium"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item: GrubPacItem) => renderRow(item))
            )}
          </TableBody>
        </Table>
      </div>)}
    </div>

      <TableActionBar
        selectedCount={selectedItems.length}
        onClearSelection={() => onSelectAll(false)}
        {...actionBarProps}
        suspended={true}
      />
    </div>
  );
}
