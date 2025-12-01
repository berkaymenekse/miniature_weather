import React from "react";
import { View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn } from "@/shared/lib/utils";

interface ScreenProps extends ViewProps {
  safeArea?: boolean;
  centered?: boolean;
}

export const Screen = ({ 
  className, 
  safeArea = true, 
  centered = false,
  children, 
  ...props 
}: ScreenProps) => {
  const Wrapper = safeArea ? SafeAreaView : View;

  return (
    <Wrapper
      className={cn(
        "flex-1 bg-background",
        centered && "items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
    </Wrapper>
  );
};

export const Row = ({ className, ...props }: ViewProps) => (
  <View className={cn("flex-row items-center", className)} {...props} />
);

export const Col = ({ className, ...props }: ViewProps) => (
  <View className={cn("flex-col", className)} {...props} />
);

