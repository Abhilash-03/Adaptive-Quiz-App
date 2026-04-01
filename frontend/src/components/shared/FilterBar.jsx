import { Search, X } from "lucide-react";
import {
  Card,
  CardContent,
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

export function FilterBar({ 
  search, 
  onSearchChange, 
  searchPlaceholder = "Search...",
  filters = [],
  onClear,
  children 
}) {
  const hasActiveFilters = filters.some(f => f.value);

  // Handle value change - convert "__all__" back to empty string
  const handleValueChange = (filter, value) => {
    filter.onChange(value === "__all__" ? "" : value);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          {onSearchChange && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters */}
          {filters.map((filter) => (
            <Select
              key={filter.name}
              value={filter.value || "__all__"}
              onValueChange={(value) => handleValueChange(filter, value)}
            >
              <SelectTrigger className={`w-full ${filter.width || "sm:w-40"}`}>
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{filter.allLabel || `All ${filter.placeholder}`}</SelectItem>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {/* Additional content */}
          {children}

          {/* Clear Filters */}
          {hasActiveFilters && onClear && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default FilterBar;
