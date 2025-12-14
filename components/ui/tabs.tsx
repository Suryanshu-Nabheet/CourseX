"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("w-full", className)} {...props} />
));
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  activeValue?: string;
  setActiveValue?: (value: string) => void;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  (
    { className, value, activeValue, setActiveValue, onClick, ...props },
    ref
  ) => {
    const isActive = value === activeValue;
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "bg-white text-black shadow-sm"
            : "text-gray-500 hover:text-gray-900",
          className
        )}
        onClick={(e) => {
          setActiveValue?.(value);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  activeValue?: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, activeValue, ...props }, ref) => {
    if (value !== activeValue) return null;
    return (
      <div
        ref={ref}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

// Wrapper to manage state
const TabsContainer = ({
  defaultValue,
  className,
  children,
}: {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}) => {
  const [activeValue, setActiveValue] = React.useState(defaultValue);

  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Pass state down to TabsList and TabsContent
          if (child.type === TabsList) {
            return React.cloneElement(child as React.ReactElement<any>, {
              children: React.Children.map(
                (child.props as any).children,
                (trigger) => {
                  if (React.isValidElement(trigger)) {
                    return React.cloneElement(
                      trigger as React.ReactElement<any>,
                      {
                        activeValue,
                        setActiveValue,
                      }
                    );
                  }
                  return trigger;
                }
              ),
            });
          }
          if (child.type === TabsContent) {
            return React.cloneElement(child as React.ReactElement<any>, {
              activeValue,
            });
          }
        }
        return child;
      })}
    </div>
  );
};

export { TabsContainer as Tabs, TabsList, TabsTrigger, TabsContent };
