import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { X, ChevronDown, Search, Check } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Custom Multiselect Component
interface MultiSelectProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    maxHeight?: string;
  }
  
  export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select options",
    maxHeight = "200px",
  }: MultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
  
    const filteredOptions = options.filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    const handleToggle = (option: string) => {
      if (selected.includes(option)) {
        onChange(selected.filter((item) => item !== option));
      } else {
        onChange([...selected, option]);
      }
    };
  
    const handleRemove = (option: string) => {
      onChange(selected.filter((item) => item !== option));
    };
  
    const handleClearAll = () => {
      onChange([]);
    };
  
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white/10 border-white/20 hover:bg-white/20"
          >
            <div className="flex flex-wrap gap-1 max-w-[calc(100%-2rem)]">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selected.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="text-xs bg-primary/20 text-primary border-primary/30"
                  >
                    {item}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item);
                      }}
                    />
                  </Badge>
                ))
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20"
              />
            </div>
            {selected.length > 0 && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">
                  {selected.length} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No tools found
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option}
                    className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                    onClick={() => handleToggle(option)}
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <div
                        className={`w-4 h-4 border rounded flex items-center justify-center ${
                          selected.includes(option)
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground"
                        }`}
                      >
                        {selected.includes(option) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      <span className="text-sm">{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }
  
  