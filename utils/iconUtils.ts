import * as LucideIcons from "lucide-react-native";

/**
 * Convert kebab-case string to PascalCase
 * Example: "brush-cleaning" -> "BrushCleaning"
 */
const toPascalCase = (str: string): string => {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
};

/**
 * Get a Lucide icon component from an icon string
 * @param iconString - The icon name in kebab-case (e.g., "brush", "droplets", "help-circle")
 * @returns The corresponding Lucide icon component, or HelpCircle if not found
 */
export const getLucideIcon = (iconString?: string): React.ComponentType<any> => {
  // Fallback safely if iconString is undefined/null/empty
  const safe = typeof iconString === "string" && iconString.trim().length > 0
    ? iconString
    : "help-circle";
  const iconName = toPascalCase(safe);
  return (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
};
