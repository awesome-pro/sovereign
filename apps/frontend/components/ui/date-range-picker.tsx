'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (date: DateRange | undefined) => void;
  className?: string;
}

const presets = [
  {
    label: 'Today',
    value: 'today',
    getDate: () => {
      const today = new Date();
      return {
        from: today,
        to: today,
      };
    },
  },
  {
    label: 'Yesterday',
    value: 'yesterday',
    getDate: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        from: yesterday,
        to: yesterday,
      };
    },
  },
  {
    label: 'Last 7 days',
    value: 'last-7',
    getDate: () => {
      const today = new Date();
      const last7 = new Date();
      last7.setDate(last7.getDate() - 6);
      return {
        from: last7,
        to: today,
      };
    },
  },
  {
    label: 'Last 30 days',
    value: 'last-30',
    getDate: () => {
      const today = new Date();
      const last30 = new Date();
      last30.setDate(last30.getDate() - 29);
      return {
        from: last30,
        to: today,
      };
    },
  },
  {
    label: 'This week',
    value: 'this-week',
    getDate: () => {
      const today = new Date();
      const startOfWeek = new Date();
      startOfWeek.setDate(today.getDate() - today.getDay());
      return {
        from: startOfWeek,
        to: today,
      };
    },
  },
  {
    label: 'This month',
    value: 'this-month',
    getDate: () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        from: startOfMonth,
        to: today,
      };
    },
  },
];

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handlePresetChange = (preset: string) => {
    const selectedPreset = presets.find((p) => p.value === preset);
    if (selectedPreset) {
      const range = selectedPreset.getDate();
      onChange?.(range);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, 'LLL dd, y')} -{' '}
                  {format(value.to, 'LLL dd, y')}
                </>
              ) : (
                format(value.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="px-4 py-3 border-b">
            <div className="space-y-2">
              <Select onValueChange={handlePresetChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {presets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            className="p-3"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
