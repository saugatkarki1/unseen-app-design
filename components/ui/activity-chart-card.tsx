"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Prop definition for individual data points
interface ActivityDataPoint {
    day: string;
    value: number;
}

// Prop definition for the component
interface ActivityChartCardProps {
    title?: string;
    totalValue: string;
    data: ActivityDataPoint[];
    className?: string;
    dropdownOptions?: string[];
    trendText?: string;
}

/**
 * A responsive and animated card component to display weekly activity data.
 * Features a bar chart animated with Framer Motion and supports shadcn theming.
 */
export const ActivityChartCard = ({
    title = "Activity",
    totalValue,
    data,
    className,
    dropdownOptions = ["Weekly", "Monthly", "Yearly"],
    trendText = "+12% from last week",
}: ActivityChartCardProps) => {
    const [selectedRange, setSelectedRange] = React.useState(
        dropdownOptions[0] || ""
    );

    // Find the maximum value in the data to normalize bar heights
    const maxValue = React.useMemo(() => {
        return data.reduce((max, item) => (item.value > max ? item.value : max), 0);
    }, [data]);

    // Framer Motion variants for animations
    const chartVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // Animate each child (bar) with a delay
            },
        },
    };

    const barVariants = {
        hidden: { scaleY: 0, opacity: 0, transformOrigin: "bottom" },
        visible: {
            scaleY: 1,
            opacity: 1,
            transformOrigin: "bottom",
            transition: {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1] as [number, number, number, number], // Cubic bezier for a smooth bounce effect
            },
        },
    };

    return (
        <Card
            className={cn("w-full flex flex-col", className)}
            aria-labelledby="activity-card-title"
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle id="activity-card-title">{title}</CardTitle>
                    {dropdownOptions.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1 text-sm"
                                    aria-haspopup="true"
                                >
                                    {selectedRange}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {dropdownOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option}
                                        onSelect={() => setSelectedRange(option)}
                                    >
                                        {option}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <div className="flex flex-col gap-3">
                    {/* Total Value */}
                    <div className="flex items-end gap-3">
                        <p className="text-5xl font-bold tracking-tighter text-foreground">
                            {totalValue}
                        </p>
                        <CardDescription className="flex items-center gap-1 pb-1">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            {trendText}
                        </CardDescription>
                    </div>

                    {/* Bar Chart */}
                    <motion.div
                        key={selectedRange} // Re-trigger animation when range changes
                        className="flex flex-1 min-h-[120px] w-full items-end justify-between gap-2 sm:gap-3 mt-2"
                        variants={chartVariants}
                        initial="hidden"
                        animate="visible"
                        aria-label="Activity chart"
                    >
                        {data.map((item, index) => (
                            <div
                                key={index}
                                className="flex h-full w-full flex-col items-center justify-end gap-2 group"
                                role="presentation"
                            >
                                <div className="relative w-full flex-1 flex items-end">
                                    <motion.div
                                        className={cn(
                                            "w-full rounded-md bg-primary min-h-[4px] transition-all duration-300",
                                            item.value === 0 && "bg-muted/30"
                                        )}
                                        style={{
                                            height: `${maxValue > 0 ? Math.max((item.value / maxValue) * 100, 2) : 2}%`,
                                        }}
                                        variants={barVariants}
                                        aria-label={`${item.day}: ${item.value}`}
                                    />
                                    {/* Tooltip on hover */}
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-primary-foreground text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {item.value}
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">
                                    {item.day}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ActivityChartCard;
