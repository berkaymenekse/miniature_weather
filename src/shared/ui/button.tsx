import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

// 1. VARIANT DEFINITIONS
const buttonVariants = cva(
  "flex-row items-center justify-center rounded-xl px-4 py-3 transition-all active:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        outline: "border border-input bg-background",
        ghost: "bg-transparent",
        destructive: "bg-destructive",
      },
      size: {
        sm: "h-10 px-3",
        default: "h-12 px-4",
        lg: "h-14 px-6",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const textVariants = cva("font-semibold text-center", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
      destructive: "text-destructive-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// 2. TYPES
interface Props extends 
  React.ComponentPropsWithoutRef<typeof Pressable>,
  VariantProps<typeof buttonVariants> {
  label?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

// 3. COMPONENT
export const Button = ({ 
  label, 
  variant, 
  size, 
  leftElement,
  rightElement,
  className,
  ...props 
}: Props) => {
  return (
    <Pressable 
      className={cn(buttonVariants({ variant, size }), className)}
      accessibilityRole="button"
      accessibilityLabel={label || "Button"}
      {...props}
    >
      <View className="flex-row items-center gap-2">
        {leftElement}
        {label && (
          <Text className={cn(textVariants({ variant }), "text-base")}>
            {label}
          </Text>
        )}
        {rightElement}
      </View>
    </Pressable>
  );
};

