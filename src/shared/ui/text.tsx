import React from "react";
import { Text as RNText, type TextProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      default: "font-normal",
      heading: "font-bold",
      subtle: "text-muted-foreground",
      brand: "text-primary font-bold",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "base",
  },
});

interface Props extends TextProps, VariantProps<typeof textVariants> {}

export const Text = ({ className, variant, size, ...props }: Props) => {
  return (
    <RNText
      className={cn(textVariants({ variant, size }), className)}
      {...props}
    />
  );
};

