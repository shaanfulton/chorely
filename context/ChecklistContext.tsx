import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface ChecklistContextType {
  completedItems: Set<string>;
  toggleItem: (itemName: string) => void;
  isAllCompleted: (totalItems: number) => boolean;
  resetCompleted: () => void;
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(
  undefined
);

export const ChecklistProvider = ({ children }: { children: ReactNode }) => {
  const [completedItems, setCompletedItems] = useState(new Set<string>());

  const toggleItem = useCallback((itemName: string) => {
    setCompletedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  }, []);

  const resetCompleted = useCallback(() => {
    setCompletedItems(new Set());
  }, []);

  const isAllCompleted = useCallback(
    (totalItems: number) => {
      return completedItems.size === totalItems;
    },
    [completedItems]
  );

  const value = useMemo(
    () => ({
      completedItems,
      toggleItem,
      isAllCompleted,
      resetCompleted,
    }),
    [completedItems, toggleItem, isAllCompleted, resetCompleted]
  );

  return (
    <ChecklistContext.Provider value={value}>
      {children}
    </ChecklistContext.Provider>
  );
};

export const useChecklist = () => {
  const context = useContext(ChecklistContext);
  if (context === undefined) {
    throw new Error("useChecklist must be used within a ChecklistProvider");
  }
  return context;
};
