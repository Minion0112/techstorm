"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "rounded-base! border-2 border-border bg-main p-3 font-heading shadow-shadow",
        className,
      )}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption_label:
          "flex justify-center pt-1 relative items-center w-full text-main-foreground text-sm font-heading",
        nav: "gap-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "noShadow" }),
          "size-7 bg-transparent p-0 absolute left-1",
        ),
        button_next: cn(
          buttonVariants({ variant: "noShadow" }),
          "size-7 bg-transparent p-0 absolute right-1",
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-main-foreground rounded-base w-9 font-base text-[0.8rem]",
        weeks: "flex flex-col w-full mt-2",
        week: "flex w-full",
        day: cn(
          buttonVariants({ variant: "noShadow" }),
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-black/50 [&:has([aria-selected])]:text-white! [&:has([aria-selected].range_end)]:rounded-r-base",
          props.mode === "range"
            ? "[&:has(>.range_end)]:rounded-r-base [&:has(>.range_start)]:rounded-l-base [&:has([aria-selected])]:bg-black/50! first:[&:has([aria-selected])]:rounded-l-base last:[&:has([aria-selected])]:rounded-r-base"
            : "[&:has([aria-selected])]:rounded-base [&:has([aria-selected])]:bg-black/50",
        ),
        day_button: cn(
          "size-9 p-0 font-base aria-selected:opacity-100"
        ),
        range_start:
          "range_start aria-selected:bg-black! aria-selected:text-white rounded-base",
        range_end:
          "range_end aria-selected:bg-black! aria-selected:text-white rounded-base",
        selected: "bg-black! text-white! rounded-base",
        today: "bg-secondary-background text-foreground!",
        outside:
          "outside text-main-foreground opacity-50 aria-selected:bg-none",
        disabled: "text-main-foreground opacity-50 rounded-base",
        range_middle: "aria-selected:bg-black/50! aria-selected:text-white",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="size-4" />
          }
          return <ChevronRight className="size-4" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
