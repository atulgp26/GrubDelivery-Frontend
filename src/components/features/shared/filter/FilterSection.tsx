import Image from "next/image";

interface FilterOption {
  name: string;
  textColor: string;
}

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (name: string) => void;
  gridCols?: "2" | "3";
  getColorVar: (name: string) => string;
}

export default function FilterSection({
  title,
  options,
  selected,
  onToggle,
  gridCols = "3",
  getColorVar,
}: FilterSectionProps) {
  return (
    <div className="border-t border-[var(--color-stroke-neutral)] px-6 py-4 flex flex-col gap-3">
      <p className="font-normal text-[var(--color-neutral-secondary)] text-sm leading-[22px]">
        {title}
      </p>
      <div className={`grid w-full gap-y-2 ${gridCols === "3" ? "grid-cols-3" : "grid-cols-2"} gap-x-4`}>
        {options.map((option) => {
          const isChecked = selected.includes(option.name);
          const colorVar = getColorVar(option.name);

          return (
            <div
              key={option.name}
              className="flex items-center gap-3 cursor-pointer rounded-md"
              onClick={() => onToggle(option.name)}
            >
              <div className="flex items-center h-7 py-[2px]">
                <div
                  className={`flex items-center justify-center w-[20px] h-[20px] rounded-[4px] p-[3px] ${
                    isChecked ? "" : "bg-white border border-[var(--color-stroke-neutral)]"
                  }`}
                  style={
                    isChecked
                      ? {
                          backgroundColor: `var(${colorVar})`,
                        }
                      : {}
                  }
                >
                  {isChecked && (
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Image
                        src="/Employee/Table/Default/Table/Row/Table/Cell/check.svg"
                        alt="Checked"
                        width={16}
                        height={16}
                      />
                    </div>
                  )}
                </div>
              </div>
              <span className="font-normal text-[var(--color-neutral-secondary)] text-lg leading-7">
                {option.name}
              </span>
            </div>
          );
        })}
        {gridCols === "2" && options.length % 2 !== 0 && (
          <div className="h-7" />
        )}
      </div>
    </div>
  );
}
