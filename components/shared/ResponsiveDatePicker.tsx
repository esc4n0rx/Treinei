"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ResponsiveDatePickerProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  placeholder?: string;
}

export function ResponsiveDatePicker({
  selected,
  onSelect,
  disabled,
  placeholder = "Escolha uma data",
}: ResponsiveDatePickerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date: Date | undefined) => {
    onSelect(date);
    setOpen(false); 
  };

  const TriggerButton = (
    <Button variant="outline" className="w-full justify-start text-left font-normal glass">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {selected ? format(selected, "dd/MM/yyyy") : <span>{placeholder}</span>}
    </Button>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {TriggerButton}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 glass-card">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            disabled={disabled}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {TriggerButton}
      </DrawerTrigger>
      <DrawerContent className="glass-card-drawer">
        <div className="p-4 pb-0">
           <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            disabled={disabled}
            initialFocus
            locale={ptBR}
            className="p-0"
          />
        </div>
        <DrawerFooter className="pt-2">
            <DrawerClose asChild>
                <Button variant="outline" className="glass">Cancelar</Button>
            </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}