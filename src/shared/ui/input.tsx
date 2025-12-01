import React from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { cn } from "@/shared/lib/utils";
import { Text } from "./text";
import { useThemeColor } from "@/shared/lib/hooks/useThemeColor";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
}

export const Input = ({ 
  label, 
  error, 
  leftElement,
  rightElement, 
  className, 
  ...props 
}: Props) => {
  const { mutedForeground } = useThemeColor();

  return (
    <View className="w-full gap-1.5">
      {label && (
        <Text variant="subtle" size="sm" className="ml-1">
          {label}
        </Text>
      )}
      
      <View className={cn(
        "flex-row items-center rounded-xl border border-input bg-background px-3 h-12",
        error && "border-destructive",
        className
      )}>
        {leftElement && <View className="mr-2">{leftElement}</View>}
        
        <TextInput
          className="flex-1 text-foreground text-base h-full"
          placeholderTextColor={mutedForeground}
          {...props}
        />
        
        {rightElement && <View className="ml-2">{rightElement}</View>}
      </View>

      {error && (
        <Text className="text-destructive text-xs ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};
