"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextType {
    value: string
    onValueChange: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | null>(null)

function useSelectContext() {
    const context = React.useContext(SelectContext)
    if (!context) {
        throw new Error("Select components must be used within a Select")
    }
    return context
}

interface SelectProps {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
}

function Select({ value, defaultValue = "", onValueChange, children }: SelectProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const [open, setOpen] = React.useState(false)

    const currentValue = value !== undefined ? value : internalValue

    const handleValueChange = React.useCallback(
        (newValue: string) => {
            if (value === undefined) {
                setInternalValue(newValue)
            }
            onValueChange?.(newValue)
            setOpen(false)
        },
        [value, onValueChange],
    )

    return (
        <SelectContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, open, setOpen }}>
            <div className="relative" data-slot="select">
                {children}
            </div>
        </SelectContext.Provider>
    )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    size?: "sm" | "default"
}

function SelectTrigger({ className, size = "default", children, ...props }: SelectTriggerProps) {
    const { open, setOpen } = useSelectContext()

    return (
        <button
            type="button"
            data-slot="select-trigger"
            data-size={size}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className={cn(
                "border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
                size === "default" ? "h-9" : "h-8",
                className,
            )}
            {...props}
        >
            {children}
            <ChevronDownIcon className={cn("size-4 opacity-50 transition-transform", open && "rotate-180")} />
        </button>
    )
}

interface SelectValueProps {
    placeholder?: string
}

function SelectValue({ placeholder }: SelectValueProps) {
    const { value } = useSelectContext()

    return (
        <span data-slot="select-value" className={cn("line-clamp-1", !value && "text-muted-foreground")}>
            {value || placeholder}
        </span>
    )
}

interface SelectContentProps {
    children: React.ReactNode
    className?: string
}

function SelectContent({ children, className }: SelectContentProps) {
    const { open, setOpen } = useSelectContext()
    const contentRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
                const trigger = contentRef.current.parentElement?.querySelector('[data-slot="select-trigger"]')
                if (trigger && !trigger.contains(event.target as Node)) {
                    setOpen(false)
                }
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [open, setOpen])

    if (!open) return null

    return (
        <div
            ref={contentRef}
            data-slot="select-content"
            className={cn(
                "bg-popover text-popover-foreground absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border p-1 shadow-md animate-in fade-in-0 zoom-in-95",
                className,
            )}
        >
            {children}
        </div>
    )
}

interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

function SelectItem({ value, children, className, ...props }: SelectItemProps) {
    const { value: selectedValue, onValueChange } = useSelectContext()
    const isSelected = selectedValue === value

    return (
        <button
            type="button"
            data-slot="select-item"
            data-selected={isSelected}
            onClick={() => onValueChange(value)}
            className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                isSelected && "bg-accent text-accent-foreground",
                className,
            )}
            {...props}
        >
            {children}
        </button>
    )
}

function SelectGroup({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div data-slot="select-group" className={cn("py-1", className)}>
            {children}
        </div>
    )
}

function SelectLabel({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div data-slot="select-label" className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
            {children}
        </div>
    )
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue }
