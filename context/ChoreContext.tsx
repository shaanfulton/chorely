import {
  approveChoreAPI,
  Chore,
  claimChoreAPI,
  completeChoreAPI,
  createChoreAPI,
  createHomeAPI,
  createUserAPI,
  getAvailableChoresAPI,
  getHomeByIdAPI,
  getMyChoresAPI,
  getUnapprovedChoresAPI,
  getUserHomesAPI,
  Home,
  joinHomeAPI,
  loginUserAPI,
  User,
} from "@/data/mock";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Individual chore context (for chore detail screens and list items)
interface ChoreContextType {
  chore: Chore;
  claimChore: () => Promise<void>;
  completeChore: () => Promise<void>;
  isLoading: boolean;
}

const ChoreContext = createContext<ChoreContextType | undefined>(undefined);

interface ChoreProviderProps {
  chore: Chore;
  children: ReactNode;
}

export function ChoreProvider({ chore, children }: ChoreProviderProps) {
  const globalContext = useContext(GlobalChoreContext);
  const [isLoading, setIsLoading] = useState(false);

  const claimChore = useCallback(async () => {
    if (!globalContext) return;
    setIsLoading(true);
    try {
      await globalContext.claimChore(chore.uuid);
    } finally {
      setIsLoading(false);
    }
  }, [globalContext, chore.uuid]);

  const completeChore = useCallback(async () => {
    if (!globalContext) return;
    setIsLoading(true);
    try {
      await globalContext.completeChore(chore.uuid);
    } finally {
      setIsLoading(false);
    }
  }, [globalContext, chore.uuid]);

  const value: ChoreContextType = {
    chore,
    claimChore,
    completeChore,
    isLoading,
  };

  return (
    <ChoreContext.Provider value={value}>{children}</ChoreContext.Provider>
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
  // User State
  currentUser: User | null;
  currentHome: Home | null;
  userHomes: Home[];

  // Chore State
  availableChores: Chore[];
  myChores: Chore[];
  pendingApprovalChores: Chore[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // User Actions
  loginUser: (email: string) => Promise<boolean>;
  signupUser: (email: string, homeId?: string) => Promise<boolean>;
  switchHome: (homeId: string) => Promise<void>;
  createHome: (name: string, address: string) => Promise<Home>;
  joinHome: (homeId: string) => Promise<boolean>;

  // Chore Actions
  claimChore: (choreUuid: string) => Promise<void>;
  completeChore: (choreUuid: string) => Promise<void>;
  approveChore: (choreUuid: string) => Promise<void>;
  createChore: (
    choreData: Omit<
      Chore,
      "uuid" | "status" | "user_email" | "todos" | "homeID"
    >
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
  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentHome, setCurrentHome] = useState<Home | null>(null);
  const [userHomes, setUserHomes] = useState<Home[]>([]);

  // Chore state
  const [availableChores, setAvailableChores] = useState<Chore[]>([]);
  const [myChores, setMyChores] = useState<Chore[]>([]);
  const [pendingApprovalChores, setPendingApprovalChores] = useState<Chore[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login user and set up initial state
  const loginUser = useCallback(async (email: string): Promise<boolean> => {
    try {
      setError(null);
      const user = loginUserAPI(email);
      if (!user) {
        setError("User not found");
        return false;
      }

      setCurrentUser(user);

      // Get user's homes
      const homes = getUserHomesAPI(email);
      setUserHomes(homes);

      // Set first home as current if available
      if (homes.length > 0) {
        setCurrentHome(homes[0]);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
      return false;
    }
  }, []);

  // Signup user
  const signupUser = useCallback(
    async (email: string, homeId?: string): Promise<boolean> => {
      try {
        setError(null);
        const user = createUserAPI(email, homeId);

        setCurrentUser(user);

        // Get user's homes
        const homes = getUserHomesAPI(email);
        setUserHomes(homes);

        // Set the home as current if provided, otherwise set first available
        if (homeId) {
          const selectedHome = getHomeByIdAPI(homeId);
          if (selectedHome) {
            setCurrentHome(selectedHome);
          }
        } else if (homes.length > 0) {
          setCurrentHome(homes[0]);
        }

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create account"
        );
        return false;
      }
    },
    []
  );

  // Switch home
  const switchHome = useCallback(
    async (homeId: string) => {
      const home = userHomes.find((h) => h.id === homeId);
      if (home) {
        setCurrentHome(home);
        // Refresh data for new home
        await fetchAllData();
      }
    },
    [userHomes]
  );

  // Fetch all chore data for current home
  const fetchAllData = useCallback(async () => {
    if (!currentUser || !currentHome) return;

    try {
      setError(null);
      const available = getAvailableChoresAPI(currentHome.id);
      const my = getMyChoresAPI(currentUser.email, currentHome.id);
      const pending = getUnapprovedChoresAPI(currentHome.id);

      setAvailableChores(available);
      setMyChores(my);
      setPendingApprovalChores(pending);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch chores");
    }
  }, [currentUser, currentHome]);

  // Auto-login with default user on mount (disabled for authentication flow)
  // useEffect(() => {
  //   const initializeUser = async () => {
  //     setIsLoading(true);
  //     const loginSuccess = await loginUser("user@example.com");
  //     if (loginSuccess) {
  //       // fetchAllData will be called automatically due to currentUser/currentHome change
  //     }
  //     setIsLoading(false);
  //   };
  //   initializeUser();
  // }, [loginUser]);

  // Fetch data when user or home changes
  useEffect(() => {
    if (currentUser && currentHome) {
      fetchAllData();
    }
  }, [currentUser, currentHome, fetchAllData]);

  // Refresh data (for pull-to-refresh)
  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAllData();
    setIsRefreshing(false);
  }, [fetchAllData]);

  // Claim chore with optimistic updates
  const claimChore = useCallback(
    async (choreUuid: string) => {
      if (!currentUser) return;

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
        user_email: currentUser.email,
      };
      const updatedMy = [...myChores, optimisticChore];

      setAvailableChores(updatedAvailable);
      setMyChores(updatedMy);

      try {
        // Make API call
        claimChoreAPI(choreUuid, currentUser.email);
      } catch (err) {
        // Rollback on error
        setAvailableChores(availableChores);
        setMyChores(myChores);
        setError(err instanceof Error ? err.message : "Failed to claim chore");
      }
    },
    [availableChores, myChores, currentUser]
  );

  // Complete chore with optimistic updates
  const completeChore = useCallback(
    async (choreUuid: string) => {
      const choreToUpdate = myChores.find((chore) => chore.uuid === choreUuid);
      if (!choreToUpdate) return;

      // Optimistic update - remove from myChores list
      const updatedMy = myChores.filter((chore) => chore.uuid !== choreUuid);
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
      choreData: Omit<
        Chore,
        "uuid" | "status" | "user_email" | "todos" | "homeID"
      >
    ) => {
      if (!currentHome) {
        throw new Error("No home selected");
      }

      // Create a temporary chore for optimistic update
      const tempUuid = `temp_${Date.now()}`;
      const optimisticChore: Chore = {
        ...choreData,
        uuid: tempUuid,
        user_email: null,
        status: "unapproved",
        homeID: currentHome.id,
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
        const newChore = createChoreAPI(choreData, currentHome.id);

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
    [pendingApprovalChores, currentHome]
  );

  // Create home
  const createHome = useCallback(
    async (name: string, address: string): Promise<Home> => {
      if (!currentUser) {
        throw new Error("User must be logged in to create a home");
      }

      try {
        setError(null);
        const newHome = createHomeAPI(name, address);

        // Join the newly created home
        const joinSuccess = joinHomeAPI(currentUser.email, newHome.id);
        if (!joinSuccess) {
          throw new Error("Failed to join the newly created home");
        }

        // Update user homes
        const updatedHomes = getUserHomesAPI(currentUser.email);
        setUserHomes(updatedHomes);

        // Set the new home as current
        setCurrentHome(newHome);

        return newHome;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create home";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [currentUser]
  );

  // Join existing home
  const joinHome = useCallback(
    async (homeId: string): Promise<boolean> => {
      if (!currentUser) {
        throw new Error("User must be logged in to join a home");
      }

      try {
        setError(null);
        const success = joinHomeAPI(currentUser.email, homeId);

        if (!success) {
          setError("Failed to join home. Home may not exist.");
          return false;
        }

        // Update user homes
        const updatedHomes = getUserHomesAPI(currentUser.email);
        setUserHomes(updatedHomes);

        // Set the joined home as current
        const joinedHome = getHomeByIdAPI(homeId);
        if (joinedHome) {
          setCurrentHome(joinedHome);
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to join home";
        setError(errorMessage);
        return false;
      }
    },
    [currentUser]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: GlobalChoreContextType = {
    // User state
    currentUser,
    currentHome,
    userHomes,

    // Chore state
    availableChores,
    myChores,
    pendingApprovalChores,
    isLoading,
    isRefreshing,
    error,

    // User actions
    loginUser,
    signupUser,
    switchHome,
    createHome,
    joinHome,

    // Chore actions
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
