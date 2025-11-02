"use client";

import { Label } from "./label";
import { useState } from "react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { ChevronDownIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "./input";

export default function DateTimePicker({
  label,
  name,
}: {
  label: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date-picker" className="px-1">
        {label}
      </Label>
      <div className="flex gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              required
              selected={date}
              captionLayout="dropdown"
              onSelect={(date) => {
                setDate(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        {/* Hidden input to store date value in FormData */}
        <input
          type="hidden"
          name={`${name}-date`}
          readOnly
          value={date ? date.toLocaleDateString() : ""}
        />
        <Input
          type="time"
          id="time-picker"
          step="1"
          defaultValue="00:00:00"
          name={`${name}-time`}
          required
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}
