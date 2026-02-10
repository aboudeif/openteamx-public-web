import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

interface FiltersBarProps {
  filters: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (filterId: string, values: string[]) => void;
  onClearAll: () => void;
}

export function FiltersBar({ filters, selectedFilters, onFilterChange, onClearAll }: FiltersBarProps) {
  const totalSelected = Object.values(selectedFilters).flat().length;

  const toggleFilter = (filterId: string, value: string) => {
    const current = selectedFilters[filterId] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange(filterId, updated);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => {
        const selected = selectedFilters[filter.id] || [];
        const hasSelection = selected.length > 0;

        return (
          <Popover key={filter.id}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 gap-1.5 font-medium",
                  hasSelection && "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground"
                )}
              >
                {filter.label}
                {hasSelection && (
                  <span className={cn(
                    "ml-1 px-1.5 py-0.5 rounded-full text-xs",
                    hasSelection ? "bg-primary-foreground/20" : "bg-muted"
                  )}>
                    {selected.length}
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="space-y-1">
                {filter.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                  >
                    <Checkbox
                      checked={selected.includes(option.value)}
                      onCheckedChange={() => toggleFilter(filter.id, option.value)}
                    />
                    <span className="flex-1 text-sm">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-xs text-muted-foreground">{option.count}</span>
                    )}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        );
      })}

      {totalSelected > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-9 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Clear all
        </Button>
      )}
    </div>
  );
}
