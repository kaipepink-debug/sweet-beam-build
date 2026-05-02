import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PRESET_LABELS, RangePreset } from "@/lib/dateRanges";

export interface RangeFilterValue {
  preset: RangePreset;
  from?: Date;
  to?: Date;
}

interface Props {
  value: RangeFilterValue;
  onChange: (v: RangeFilterValue) => void;
}

const PRESETS: RangePreset[] = ["hoje", "ontem", "7d", "15d", "30d", "mes", "max", "custom"];

export function RangeFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => {
        const active = value.preset === p;
        if (p === "custom") {
          return (
            <Popover key={p} open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "px-3 h-8 rounded-lg text-[12px] font-medium transition-all border flex items-center gap-1.5",
                    active
                      ? "bg-primary/20 text-primary border-primary/40"
                      : "bg-card text-muted-foreground border-border hover:text-foreground"
                  )}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {active && value.from && value.to
                    ? `${format(value.from, "dd/MM", { locale: ptBR })} - ${format(value.to, "dd/MM", { locale: ptBR })}`
                    : "Personalizado"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover" align="end">
                <div className="flex flex-col">
                  <Calendar
                    mode="range"
                    selected={{ from: value.from, to: value.to }}
                    onSelect={(r) => {
                      if (r?.from && r?.to) {
                        onChange({ preset: "custom", from: r.from, to: r.to });
                      } else if (r?.from) {
                        onChange({ preset: "custom", from: r.from, to: r.from });
                      }
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                  <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1 border-t border-border">
                    <span className="text-[11px] text-muted-foreground">
                      Clique 1x para selecionar um único dia
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (value.from) {
                          onChange({ preset: "custom", from: value.from, to: value.from });
                          setOpen(false);
                        }
                      }}
                      disabled={!value.from}
                      className={cn(
                        "px-2.5 h-7 rounded-md text-[11px] font-medium border transition-all",
                        value.from
                          ? "bg-primary/20 text-primary border-primary/40 hover:bg-primary/30"
                          : "bg-card text-muted-foreground border-border opacity-50 cursor-not-allowed"
                      )}
                    >
                      Aplicar dia único
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        }
        return (
          <button
            key={p}
            onClick={() => onChange({ preset: p })}
            className={cn(
              "px-3 h-8 rounded-lg text-[12px] font-medium transition-all border",
              active
                ? "bg-primary/20 text-primary border-primary/40"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            )}
          >
            {PRESET_LABELS[p]}
          </button>
        );
      })}
    </div>
  );
}
