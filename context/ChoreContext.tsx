import {
  approveChoreAPI,
  Chore,
  claimChoreAPI,
  completeChoreAPI,
  createChoreAPI,
  getAvailableChoresAPI,
  getMyChoresAPI,
  getUnapprovedChoresAPI,
} from "@/data/mock";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Individual chore context (for chore detail screens)
interface ChoreContextType {
  choreUuid: string;
}

const ChoreContext = createContext<ChoreContextType | undefined>(undefined);

interface ChoreProviderProps {
  choreUuid: string;
  children: ReactNode;
}

export function ChoreProvider({ choreUuid, children }: ChoreProviderProps) {
  return (
    <ChoreContext.Provider value={{ choreUuid }}>
      {children}
    </ChoreContext.Provider>
  );
}

export function useChore() {
  const context = useContext(ChoreContext);
  if (context === undefined) {
    throw new Error("useChore must be used within a ChoreProvider");
  }
  return context;
}

// Global chore state management context
interface GlobalChoreContextType {
  // State
  availableChores: Chore[];
  myChores: Chore[];
  pendingApprovalChores: Chore[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  claimChore: (choreUuid: string) => Promise<void>;
  completeChore: (choreUuid: string) => Promise<void>;
  approveChore: (choreUuid: string) => Promise<void>;
  createChore: (
    choreData: Omit<Chore, "uuid" | "status" | "user_email" | "todos">
  ) => Promise<Chore>;
  refreshAllData: () => Promise<void>;
  clearError: () => void;
}

const GlobalChoreContext = createContext<GlobalChoreContextType | undefined>(
  undefined
);

interface GlobalChoreProviderProps {
  children: ReactNode;
}

export function GlobalChoreProvider({ children }: GlobalChoreProviderProps) {
  const [availableChores, setAvailableChores] = useState<Chore[]>([]);
  const [myChores, setMyChores] = useState<Chore[]>([]);
  const [pendingApprovalChores, setPendingApprovalChores] = useState<Chore[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all chore data
  const fetchAllData = useCallback(async () => {
    try {
      setError(null);
      const available = getAvailableChoresAPI();
      const my = getMyChoresAPI();
      const pending = getUnapprovedChoresAPI();

      setAvailableChores(available);
      setMyChores(my);
      setPendingApprovalChores(pending);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch chores");
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchAllData();
      setIsLoading(false);
    };
    loadData();
  }, [fetchAllData]);

  // Refresh data (for pull-to-refresh)
  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAllData();
    setIsRefreshing(false);
  }, [fetchAllData]);

  // Claim chore with optimistic updates
  const claimChore = useCallback(
    async (choreUuid: string) => {
      const choreToMove = availableChores.find(
        (chore) => chore.uuid === choreUuid
      );
      if (!choreToMove) return;

      // Optimistic update - immediately move chore to myChores
      const updatedAvailable = availableChores.filter(
        (chore) => chore.uuid !== choreUuid
      );
      const optimisticChore = {
        ...choreToMove,
        status: "claimed" as const,
        user_email: "user@example.com",
      };
      const updatedMy = [...myChores, optimisticChore];

      setAvailableChores(updatedAvailable);
      setMyChores(updatedMy);

      try {
        // Make API call
        claimChoreAPI(choreUuid);
      } catch (err) {
        // Rollback on error
        setAvailableChores(availableChores);
        setMyChores(myChores);
        setError(err instanceof Error ? err.message : "Failed to claim chore");
      }
    },
    [availableChores, myChores]
  );

  // Complete chore with optimistic updates
  const completeChore = useCallback(
    async (choreUuid: string) => {
      const choreToUpdate = myChores.find((chore) => chore.uuid === choreUuid);
      if (!choreToUpdate) return;

      // Optimistic update - mark as complete
      const updatedMy = myChores.map((chore) =>
        chore.uuid === choreUuid
          ? { ...chore, status: "complete" as const }
          : chore
      );
      setMyChores(updatedMy);

      try {
        // Make API call
        completeChoreAPI(choreUuid);
      } catch (err) {
        // Rollback on error
        setMyChores(myChores);
        setError(
          err instanceof Error ? err.message : "Failed to complete chore"
        );
      }
    },
    [myChores]
  );

  // Approve chore with optimistic updates
  const approveChore = useCallback(
    async (choreUuid: string) => {
      const choreToApprove = pendingApprovalChores.find(
        (chore) => chore.uuid === choreUuid
      );
      if (!choreToApprove) return;

      // Optimistic update - move from pending to available
      const updatedPending = pendingApprovalChores.filter(
        (chore) => chore.uuid !== choreUuid
      );
      const approvedChore = {
        ...choreToApprove,
        status: "unclaimed" as const,
      };
      const updatedAvailable = [...availableChores, approvedChore];

      setPendingApprovalChores(updatedPending);
      setAvailableChores(updatedAvailable);

      try {
        // Make API call
        approveChoreAPI(choreUuid);
      } catch (err) {
        // Rollback on error
        setPendingApprovalChores(pendingApprovalChores);
        setAvailableChores(availableChores);
        setError(
          err instanceof Error ? err.message : "Failed to approve chore"
        );
      }
    },
    [pendingApprovalChores, availableChores]
  );

  // Create chore with optimistic updates
  const createChore = useCallback(
    async (
      choreData: Omit<Chore, "uuid" | "status" | "user_email" | "todos">
    ) => {
      // Create a temporary chore for optimistic update
      const tempUuid = `temp_${Date.now()}`;
      const optimisticChore: Chore = {
        ...choreData,
        uuid: tempUuid,
        user_email: null,
        status: "unapproved",
        todos: [
          { name: "Item 1", description: "Detailed description for item 1." },
          { name: "Item 2", description: "Detailed description for item 2." },
          { name: "Item 3", description: "Detailed description for item 3." },
        ],
      };

      // Optimistic update - add to pending approval chores
      const updatedPending = [...pendingApprovalChores, optimisticChore];
      setPendingApprovalChores(updatedPending);

      try {
        // Make API call and get the real chore with proper UUID
        const newChore = createChoreAPI(choreData);

        // Replace the temporary chore with the real one
        const finalPending = updatedPending.map((chore) =>
          chore.uuid === tempUuid ? newChore : chore
        );
        setPendingApprovalChores(finalPending);

        return newChore;
      } catch (err) {
        // Rollback on error - remove the optimistic chore
        setPendingApprovalChores(pendingApprovalChores);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create chore";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [pendingApprovalChores]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: GlobalChoreContextType = {
    availableChores,
    myChores,
    pendingApprovalChores,
    isLoading,
    isRefreshing,
    error,
    claimChore,
    completeChore,
    approveChore,
    createChore,
    refreshAllData,
    clearError,
  };

  return (
    <GlobalChoreContext.Provider value={value}>
      {children}
    </GlobalChoreContext.Provider>
  );
}

export function useGlobalChores() {
  const context = useContext(GlobalChoreContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalChores must be used within a GlobalChoreProvider"
    );
  }
  return context;
}
