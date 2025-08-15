import {
  Chore,
  claimChoreAPI,
  completeChoreAPI,
  createChoreAPI,
  createHomeAPI,
  createUserAPI,
  getAllUserPointsAPI,
  getAvailableChoresAPI,
  getChoreApprovalStatusAPI,
  getHomeByIdAPI,
  getMyChoresAPI,
  getUnapprovedChoresAPI,
  getUserHomesAPI,
  getUserPointsAPI,
  Home,
  joinHomeAPI,
  leaveHomeAPI,
  loginUserAPI,
  removeVoteForChoreAPI,
  updateHomeWeeklyQuotaAPI,
  updateUserPointsAPI,
  User,
  voteForChoreAPI,
} from "@/data/api";
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
  approvalStatuses: {
    [choreUuid: string]: {
      hasVoted: { [userEmail: string]: boolean };
      votesNeeded: number;
      currentVotes: number;
      isApproved: boolean;
      totalEligibleVoters: number;
      voters?: string[];
    };
  };
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Points State
  userPoints: number;
  allUserPoints: { [userEmail: string]: number };

  // User Actions
  loginUser: (email: string) => Promise<boolean>;
  signupUser: (
    email: string,
    name: string,
    homeId?: string
  ) => Promise<boolean>;
  logoutUser: () => void;
  switchHome: (homeId: string) => Promise<void>;
  createHome: (name: string, weeklyPointQuota?: number) => Promise<Home>;
  joinHome: (homeId: string) => Promise<boolean>;
  updateHomeWeeklyQuota: (
    homeId: string,
    weeklyPointQuota: number
  ) => Promise<boolean>;
  leaveHome: (homeId: string) => Promise<boolean>;

  // Chore Actions
  claimChore: (choreUuid: string) => Promise<void>;
  completeChore: (choreUuid: string) => Promise<void>;
  voteForChore: (choreUuid: string) => Promise<boolean>;
  removeVoteForChore: (choreUuid: string) => Promise<boolean>;
  getChoreApprovalStatus: (choreUuid: string) => Promise<{
    hasVoted: { [userEmail: string]: boolean };
    votesNeeded: number;
    currentVotes: number;
    isApproved: boolean;
    totalEligibleVoters: number;
    voters?: string[];
  } | null>;
  hasUserVotedInPending: (choreUuid: string, userEmail?: string) => boolean;
  isChorePending: (choreUuid: string) => boolean;
  createChore: (
    choreData: Omit<
      Chore,
      "uuid" | "status" | "user_email" | "todos" | "homeID" | "approvalList"
    >
  ) => Promise<Chore>;
  refreshAllData: () => Promise<void>;
  clearError: () => void;

  // Points Actions
  getUserPoints: (userEmail?: string) => number;
  refreshPoints: () => Promise<void>;
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
  const [approvalStatuses, setApprovalStatuses] = useState<
    GlobalChoreContextType["approvalStatuses"]
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Points state
  const [userPoints, setUserPoints] = useState<number>(0);
  const [allUserPoints, setAllUserPoints] = useState<{
    [userEmail: string]: number;
  }>({});

  // Login user and set up initial state
  const loginUser = useCallback(async (email: string): Promise<boolean> => {
    try {
      setError(null);
      const user = await loginUserAPI(email);
      if (!user) {
        setError("User not found");
        return false;
      }

      setCurrentUser(user);

      // Get user's homes
      const homes = await getUserHomesAPI(email);
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
    async (email: string, name: string, homeId?: string): Promise<boolean> => {
      try {
        setError(null);
        const user = await createUserAPI(email, name, homeId);

        setCurrentUser(user);

        // Get user's homes
        const homes = await getUserHomesAPI(email);
        setUserHomes(homes);

        // Set the home as current if provided, otherwise set first available
        if (homeId) {
          const selectedHome = await getHomeByIdAPI(homeId);
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

  // Logout user
  const logoutUser = useCallback(() => {
    // Clear all user state
    setCurrentUser(null);
    setCurrentHome(null);
    setUserHomes([]);

    // Clear all chore state
    setAvailableChores([]);
    setMyChores([]);
    setPendingApprovalChores([]);

    // Clear all points state
    setUserPoints(0);
    setAllUserPoints({});

    // Clear all loading and error states
    setIsLoading(false);
    setIsRefreshing(false);
    setError(null);
  }, []);

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
      const available = await getAvailableChoresAPI(currentHome.id);
      const my = await getMyChoresAPI(currentUser.email, currentHome.id);
      const pending = await getUnapprovedChoresAPI(currentHome.id);

      setAvailableChores(available);
      setMyChores(my);
      setPendingApprovalChores(pending);

      // Preload approval statuses for pending chores for quick UI response
      try {
        const statusEntries = await Promise.all(
          pending.map(async (c) => {
            const s = await getChoreApprovalStatusAPI(c.uuid);
            return [
              c.uuid,
              s
                ? {
                    hasVoted: s.hasVoted,
                    votesNeeded: s.votesNeeded,
                    currentVotes: s.currentVotes,
                    isApproved: s.isApproved,
                    totalEligibleVoters: s.totalEligibleVoters,
                    voters: s.voters ?? [],
                  }
                : undefined,
            ] as const;
          })
        );
        const mapped: GlobalChoreContextType["approvalStatuses"] = {};
        statusEntries.forEach(([uuid, s]) => {
          if (s) mapped[uuid] = s;
        });
        setApprovalStatuses(mapped);
      } catch {}

      // Fetch points data
      const currentUserPoints = await getUserPointsAPI(
        currentUser.email,
        currentHome.id
      );
      const allPoints = await getAllUserPointsAPI(currentHome.id);
      setUserPoints(currentUserPoints);
      setAllUserPoints(allPoints);
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
    async (choreUuid: string, photoUri?: string) => {
      const choreToUpdate = myChores.find((chore) => chore.uuid === choreUuid);
      if (!choreToUpdate || !currentUser || !currentHome) return;

      // Optimistic update - remove from myChores list and add points
      const updatedMy = myChores.filter((chore) => chore.uuid !== choreUuid);
      const newUserPoints = userPoints + choreToUpdate.points;
      const updatedAllPoints = {
        ...allUserPoints,
        [currentUser.email]: newUserPoints,
      };

      setMyChores(updatedMy);
      setUserPoints(newUserPoints);
      setAllUserPoints(updatedAllPoints);

      try {
        // Make API calls
        completeChoreAPI(choreUuid, photoUri);
        updateUserPointsAPI(
          currentUser.email,
          currentHome.id,
          choreToUpdate.points
        );
      } catch (err) {
        // Rollback on error
        setMyChores(myChores);
        setUserPoints(userPoints);
        setAllUserPoints(allUserPoints);
        setError(
          err instanceof Error ? err.message : "Failed to complete chore"
        );
      }
    },
    [myChores, currentUser, currentHome, userPoints, allUserPoints]
  );

  // Vote for chore approval
  const voteForChore = useCallback(
    async (choreUuid: string): Promise<boolean> => {
      if (!currentUser) return false;

      const choreToVote = pendingApprovalChores.find(
        (chore) => chore.uuid === choreUuid
      );
      if (!choreToVote) return false;

      try {
        const success = await voteForChoreAPI(choreUuid, currentUser.email);
        // Always refresh approval status and lists
        await fetchAllData();
        return success;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to vote for chore"
        );
        return false;
      }
    },
    [pendingApprovalChores, currentUser, fetchAllData]
  );

  // Remove vote for chore approval
  const removeVoteForChore = useCallback(
    async (choreUuid: string): Promise<boolean> => {
      if (!currentUser) return false;

      try {
        const success = await removeVoteForChoreAPI(
          choreUuid,
          currentUser.email
        );
        await fetchAllData();
        return success;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to remove vote for chore"
        );
        return false;
      }
    },
    [currentUser, fetchAllData]
  );

  // Get chore approval status
  const getChoreApprovalStatus = useCallback(async (choreUuid: string) => {
    const status = await getChoreApprovalStatusAPI(choreUuid);
    if (status) {
      setApprovalStatuses((prev) => ({
        ...prev,
        [choreUuid]: {
          hasVoted: status.hasVoted,
          votesNeeded: status.votesNeeded,
          currentVotes: status.currentVotes,
          isApproved: status.isApproved,
          totalEligibleVoters: status.totalEligibleVoters,
          voters: status.voters ?? [],
        },
      }));
    }
    return status;
  }, []);

  const hasUserVotedInPending = useCallback(
    (choreUuid: string, userEmail?: string) => {
      if (!userEmail) return false;
      const status = approvalStatuses[choreUuid];
      return !!status?.hasVoted?.[userEmail];
    },
    [approvalStatuses]
  );

  const isChorePending = useCallback(
    (choreUuid: string) =>
      pendingApprovalChores.some((c) => c.uuid === choreUuid),
    [pendingApprovalChores]
  );

  // Create chore with optimistic updates
  const createChore = useCallback(
    async (
      choreData: Omit<
        Chore,
        "uuid" | "status" | "user_email" | "todos" | "homeID" | "approvalList"
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
        points: choreData.points || 10, // Default to 10 points if not specified
        approvalList: [],
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
        const newChore = await createChoreAPI({ ...choreData, user_email: currentUser?.email }, currentHome.id);

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

        // Check if it's a home ID issue
        if (
          err instanceof Error &&
          err.message.includes("Home") &&
          err.message.includes("does not exist")
        ) {
          throw new Error("Session expired. Please log out and log back in.");
        }

        throw new Error(errorMessage);
      }
    },
    [pendingApprovalChores, currentHome]
  );

  // Create home
  const createHome = useCallback(
    async (name: string, weeklyPointQuota?: number): Promise<Home> => {
      if (!currentUser) {
        throw new Error("User must be logged in to create a home");
      }

      try {
        setError(null);
        const newHome = await createHomeAPI(name, weeklyPointQuota);

        // Join the newly created home
        const joinSuccess = await joinHomeAPI(currentUser.email, newHome.id);
        if (!joinSuccess) {
          throw new Error("Failed to join the newly created home");
        }

        // Update user homes
        const updatedHomes = await getUserHomesAPI(currentUser.email);
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
        const updatedHomes = await getUserHomesAPI(currentUser.email);
        setUserHomes(updatedHomes);

        // Set the joined home as current
        const joinedHome = await getHomeByIdAPI(homeId);
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

  // Points actions
  const getUserPoints = useCallback(
    (userEmail?: string): number => {
      if (!currentHome) return 0;
      const email = userEmail || currentUser?.email;
      if (!email) return 0;
      return allUserPoints[email] || 0;
    },
    [currentHome, currentUser, allUserPoints]
  );

  const refreshPoints = useCallback(async () => {
    if (!currentUser || !currentHome) return;
    try {
      const currentUserPoints = await getUserPointsAPI(
        currentUser.email,
        currentHome.id
      );
      const allPoints = await getAllUserPointsAPI(currentHome.id);
      setUserPoints(currentUserPoints);
      setAllUserPoints(allPoints);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch points");
    }
  }, [currentUser, currentHome]);

  // Update home weekly quota
  const updateHomeWeeklyQuota = useCallback(
    async (homeId: string, weeklyPointQuota: number): Promise<boolean> => {
      try {
        setError(null);
        const success = updateHomeWeeklyQuotaAPI(homeId, weeklyPointQuota);

        if (!success) {
          setError("Failed to update weekly quota. Home may not exist.");
          return false;
        }

        // Update the home in userHomes if it's in the list
        const updatedHomes = userHomes.map((home) =>
          home.id === homeId ? { ...home, weeklyPointQuota } : home
        );
        setUserHomes(updatedHomes);

        // Update current home if it's the one being updated
        if (currentHome?.id === homeId) {
          setCurrentHome({ ...currentHome, weeklyPointQuota });
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update weekly quota";
        setError(errorMessage);
        return false;
      }
    },
    [userHomes, currentHome]
  );

  // Leave home
  const leaveHome = useCallback(
    async (homeId: string): Promise<boolean> => {
      if (!currentUser) {
        throw new Error("User must be logged in to leave a home");
      }

      try {
        setError(null);
        const success = await leaveHomeAPI(currentUser.email, homeId);

        if (!success) {
          setError("Failed to leave home. Home may not exist.");
          return false;
        }

        // Update user homes by removing the left home
        const updatedHomes = await getUserHomesAPI(currentUser.email);
        setUserHomes(updatedHomes);

        // If the user left their current home, switch to the first available home
        if (currentHome?.id === homeId) {
          const resolvedHomes = updatedHomes;
          if (resolvedHomes.length > 0) {
            setCurrentHome(resolvedHomes[0]);
          } else {
            setCurrentHome(null);
            // Clear all data if no homes left
            setAvailableChores([]);
            setMyChores([]);
            setPendingApprovalChores([]);
            setUserPoints(0);
            setAllUserPoints({});
          }
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to leave home";
        setError(errorMessage);
        return false;
      }
    },
    [currentUser, currentHome]
  );

  const value: GlobalChoreContextType = {
    // User state
    currentUser,
    currentHome,
    userHomes,

    // Chore state
    availableChores,
    myChores,
    pendingApprovalChores,
    approvalStatuses,
    isLoading,
    isRefreshing,
    error,

    // Points State
    userPoints,
    allUserPoints,

    // User actions
    loginUser,
    signupUser,
    logoutUser,
    switchHome,
    createHome,
    joinHome,
    updateHomeWeeklyQuota,
    leaveHome,

    // Chore actions
    claimChore,
    completeChore,
    voteForChore,
    removeVoteForChore,
    getChoreApprovalStatus,
    hasUserVotedInPending,
    isChorePending,
    createChore,
    refreshAllData,
    clearError,

    // Points Actions
    getUserPoints,
    refreshPoints,
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
