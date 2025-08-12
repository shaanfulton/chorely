// Lightweight API client that calls the real backend
// Base URL: configure with EXPO_PUBLIC_API_BASE; defaults to http://localhost:4000

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || "http://localhost:4000";

type ChoreStatus = "unapproved" | "unclaimed" | "claimed" | "complete";

export interface TodoItem {
  name: string;
  description: string;
}

export interface User {
  email: string;
  name: string;
  homeIDs: string[];
}

export interface Home {
  id: string;
  name: string;
  userPoints: { [userEmail: string]: number };
  weeklyPointQuota: number;
}

export interface Chore {
  uuid: string;
  name: string;
  description: string;
  time: string;
  icon: string;
  user_email: string | null;
  status: ChoreStatus;
  todos: TodoItem[];
  homeID: string;
  points: number;
  approvalList: string[];
  completed_at?: string | null;
  claimed_at?: string | null;
}

export interface Dispute {
  uuid: string;
  choreId: string;
  choreName: string;
  choreDescription: string;
  choreIcon: string;
  disputerEmail: string;
  disputerName: string;
  reason: string;
  imageUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  claimedByEmail: string; // Email of the user who claimed the chore (required)
}



// Helpers
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  console.log("Making request to:", url);
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const j = (await res.json()) as any;
      if (j && j.error) message = j.error;
    } catch {}
    throw new Error(message);
  }
  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

function mapChoreRow(row: any): Chore {
  return {
    uuid: row.uuid,
    name: row.name,
    description: row.description,
    time: row.time,
    icon: row.icon,
    user_email: row.user_email ?? null,
    status: row.status as ChoreStatus,
    homeID: row.home_id,
    points: row.points,
    todos: [],
    approvalList: [],
    completed_at: row.completed_at,
    claimed_at: row.claimed_at,
  };
}

function mapHomeRow(row: any): Home {
  return {
    id: row.id,
    name: row.name,
    weeklyPointQuota: row.weekly_point_quota,
    userPoints: {},
  };
}

function inferUserNameFromEmail(email: string): string {
  return email?.split("@")[0] || "User";
}

// Users
export async function loginUserAPI(email: string): Promise<User | null> {
  const data = await http<any>(`/user/login`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (!data) return null;
  // Also fetch homes for this user to fill homeIDs
  const homes = await getUserHomesAPI(email);
  return { email: data.email, name: data.name, homeIDs: homes.map((h) => h.id) };
}

export async function getUserByEmailAPI(email: string): Promise<User | null> {
  const data = await http<any>(`/user/${encodeURIComponent(email)}`);
  const homes = await getUserHomesAPI(email);
  return { email: data.email, name: data.name, homeIDs: homes.map((h) => h.id) };
}

export async function createUserAPI(
  email: string,
  name: string,
  homeId?: string
): Promise<User> {
  const row = await http<any>(`/user`, {
    method: "POST",
    body: JSON.stringify({ email, name, homeIds: homeId ? [homeId] : [] }),
  });
  
  // Only fetch homes if a homeId was provided
  if (homeId) {
    const homes = await getUserHomesAPI(email);
    return { email: row.email, name: row.name, homeIDs: homes.map((h) => h.id) };
  } else {
    // New user with no homes
    return { email: row.email, name: row.name, homeIDs: [] };
  }
}

// Homes
export async function getHomeByIdAPI(homeId: string): Promise<Home | null> {
  const row = await http<any>(`/homes/${encodeURIComponent(homeId)}`);
  return mapHomeRow(row);
}

export async function getAllHomesAPI(): Promise<Home[]> {
  const rows = await http<any[]>(`/homes`);
  return rows.map(mapHomeRow);
}

export async function getUserHomesAPI(email: string): Promise<Home[]> {
  try {
    const rows = await http<any[]>(`/user/${encodeURIComponent(email)}/home`);
    return rows.map(mapHomeRow);
  } catch (error) {
    // If user has no homes, return empty array instead of throwing
    if (error instanceof Error && error.message.includes("has no homes")) {
      return [];
    }
    throw error;
  }
}

export async function getHomeUsersAPI(homeId: string): Promise<User[]> {
  const rows = await http<any[]>(`/homes/${encodeURIComponent(homeId)}/users`);
  return rows.map((u) => ({ email: u.email, name: u.name, homeIDs: [] }));
}

export async function createHomeAPI(
  name: string,
  weeklyPointQuota: number = 100
): Promise<Home> {
  const row = await http<any>(`/homes`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  // Set quota if provided
  if (typeof weeklyPointQuota === "number") {
    await http(`/homes/${encodeURIComponent(row.id)}/quota`, {
      method: "PATCH",
      body: JSON.stringify({ weeklyPointQuota }),
    });
  }
  return { id: row.id, name: row.name, weeklyPointQuota, userPoints: {} };
}

export async function joinHomeAPI(email: string, homeId: string): Promise<boolean> {
  await http(`/user/join`, { method: "POST", body: JSON.stringify({ email, homeId }) });
  return true;
}

export async function leaveHomeAPI(email: string, homeId: string): Promise<boolean> {
  await http(`/user/leave`, { method: "POST", body: JSON.stringify({ email, homeId }) });
  return true;
}

// Chores
export async function createChoreAPI(
  choreData: Omit<
    Chore,
    "uuid" | "status" | "user_email" | "todos" | "homeID" | "approvalList"
  >,
  homeID: string
): Promise<Chore> {
  const payload = {
    name: choreData.name,
    description: choreData.description,
    time: choreData.time,
    icon: choreData.icon,
    home_id: homeID,
    points: choreData.points,
  };
  const row = await http<any>(`/chores`, { method: "POST", body: JSON.stringify(payload) });
  const chore = mapChoreRow(row);
  try {
    // Try to fetch generated todos; if async generation hasn't finished yet, retry briefly
    const tryFetchTodos = async () => {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const todos = await getTodoItemsForChore(chore.uuid);
        if (todos && todos.length > 0) return todos;
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
      return [] as TodoItem[];
    };
    chore.todos = await tryFetchTodos();
  } catch {}
  return chore;
}

export async function getMyChoresAPI(email: string, homeID: string): Promise<Chore[]> {
  const rows = await http<any[]>(`/chores/user?email=${encodeURIComponent(email)}&homeId=${encodeURIComponent(homeID)}`);
  return rows.map(mapChoreRow);
}

export async function getAvailableChoresAPI(homeID: string): Promise<Chore[]> {
  const rows = await http<any[]>(`/chores/available/${encodeURIComponent(homeID)}`);
  return rows.map(mapChoreRow);
}

export async function getUnapprovedChoresAPI(homeID: string): Promise<Chore[]> {
  const rows = await http<any[]>(`/chores/unapproved/${encodeURIComponent(homeID)}`);
  return rows.map(mapChoreRow);
}

export async function getChoreByIdAPI(uuid: string): Promise<Chore | undefined> {
  const row = await http<any>(`/chores/${encodeURIComponent(uuid)}`);
  const chore = mapChoreRow(row);
  try {
    const todos = await getTodoItemsForChore(uuid);
    chore.todos = todos;
  } catch {}
  return chore;
}

export async function claimChoreAPI(uuid: string, email: string): Promise<void> {
  await http(`/chores/${encodeURIComponent(uuid)}/claim`, {
    method: "PATCH",
    body: JSON.stringify({ email }),
  });
}

export async function completeChoreAPI(uuid: string): Promise<void> {
  await http(`/chores/${encodeURIComponent(uuid)}/complete`, { method: "PATCH" });
}

// Approval voting
export async function voteForChoreAPI(uuid: string, userEmail: string): Promise<boolean> {
  try {
    const res = await http<any>(`/approvals/${encodeURIComponent(uuid)}/vote`, {
      method: "POST",
      body: JSON.stringify({ userEmail }),
    });
    return !!res?.approved;
  } catch (error: any) {
    if (error.message.includes("User has already voted on this chore")) {
      // Return false to indicate the vote was not successful
      return false;
    }
    throw error;
  }
}

export async function removeVoteForChoreAPI(uuid: string, userEmail: string): Promise<boolean> {
  const res = await http<any>(`/approvals/${encodeURIComponent(uuid)}/unvote`, {
    method: "POST",
    body: JSON.stringify({ userEmail }),
  });
  return !!res?.approved;
}

export async function getChoreApprovalStatusAPI(uuid: string): Promise<{
  hasVoted: { [userEmail: string]: boolean };
  votesNeeded: number;
  currentVotes: number;
  isApproved: boolean;
  totalEligibleVoters: number;
  voters?: string[];
} | null> {
  const status = await http<any>(`/approvals/${encodeURIComponent(uuid)}`);
  
  // Create hasVoted object from voters array
  const hasVoted: { [userEmail: string]: boolean } = {};
  if (status.voters && Array.isArray(status.voters)) {
    status.voters.forEach((voter: string) => {
      hasVoted[voter] = true;
    });
  }
  
  return {
    hasVoted,
    votesNeeded: status.required,
    currentVotes: status.votes,
    isApproved: status.status !== "unapproved",
    totalEligibleVoters: status.total_users ?? 0,
    voters: status.voters ?? [],
  };
}

// Points
export async function getUserPointsAPI(userEmail: string, homeID: string): Promise<number> {
  const res = await http<any>(`/points/${encodeURIComponent(homeID)}/${encodeURIComponent(userEmail)}`);
  return res.points ?? 0;
}

export async function getAllUserPointsAPI(homeID: string): Promise<{ [userEmail: string]: number }> {
  const arr = await http<any[]>(`/points/${encodeURIComponent(homeID)}`);
  return arr.reduce((acc, row) => {
    acc[row.email] = row.points;
    return acc;
  }, {} as { [k: string]: number });
}

// In the real backend, points are managed automatically; keep this as a no-op helper if needed
export async function updateUserPointsAPI(
  _userEmail: string,
  _homeID: string,
  _points: number
): Promise<void> {
  // No-op: backend handles points on chore completion/dispute resolution
}

// Home management
export async function updateHomeWeeklyQuotaAPI(
  homeId: string,
  weeklyPointQuota: number
): Promise<boolean> {
  await http(`/homes/${encodeURIComponent(homeId)}/quota`, {
    method: "PATCH",
    body: JSON.stringify({ weeklyPointQuota }),
  });
  return true;
}

// Todos
export async function getTodoItemsForChore(choreId: string): Promise<TodoItem[]> {
  const rows = await http<any[]>(`/todos/chore/${encodeURIComponent(choreId)}`);
  return rows.map((r) => ({ name: r.name, description: r.description }));
}

export async function createTodoAPI(input: { chore_id: string; name: string; description: string; order?: number }): Promise<TodoItem> {
  const row = await http<any>(`/todos`, { method: "POST", body: JSON.stringify(input) });
  return { name: row.name, description: row.description };
}

export async function generateTodosForChoreAPI(choreName: string, choreDescription: string): Promise<TodoItem[]> {
  const res = await http<any>(`/todos/generate`, {
    method: "POST",
    body: JSON.stringify({ choreName, choreDescription }),
  });
  return (res.todos || []).map((t: any) => ({ name: t.name, description: t.description }));
}

// Disputes & Activity
export async function getActiveDisputesAPI(): Promise<Dispute[]> {
  const rows = await http<any[]>(`/disputes?status=pending`);
  // Server now returns chore fields; keep a safe fallback for older servers
  return rows.map((d) => {
    const choreName = d.chore_name ?? d.choreName;
    const choreDescription = d.chore_description ?? d.choreDescription;
    const choreIcon = d.chore_icon ?? d.choreIcon ?? "package";
    const claimedByEmail = d.chore_user_email ?? d.claimedByEmail ?? "";
    return {
      uuid: d.uuid,
      choreId: d.chore_id,
      choreName: choreName || "Chore",
      choreDescription: choreDescription || "",
      choreIcon,
      disputerEmail: d.disputer_email,
      disputerName: inferUserNameFromEmail(d.disputer_email),
      reason: d.reason,
      imageUrl: d.image_url || undefined,
      status: d.status,
      createdAt: d.created_at || new Date().toISOString(),
      claimedByEmail,
    } as Dispute;
  });
}

export async function approveDisputeAPI(uuid: string): Promise<void> {
  await http(`/disputes/${encodeURIComponent(uuid)}/approve`, { method: "PATCH" });
}

export async function rejectDisputeAPI(uuid: string): Promise<void> {
  await http(`/disputes/${encodeURIComponent(uuid)}/reject`, { method: "PATCH" });
}

// Fetch a dispute by id (to check final resolution status when vote status 404s)
export async function getDisputeByIdAPI(uuid: string): Promise<{
  uuid: string;
  chore_id: string;
  disputer_email: string;
  reason: string;
  image_url?: string | null;
  status: "pending" | "approved" | "rejected";
  created_at?: string;
  updated_at?: string;
} | null> {
  try {
    const row = await http<any>(`/disputes/${encodeURIComponent(uuid)}`);
    return row;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Dispute not found")) {
      return null;
    }
    throw error;
  }
}

// Dispute voting types and interfaces
export type VoteType = "approve" | "reject";

export interface DisputeVoteStatus {
  dispute_uuid: string;
  approve_votes: number;
  reject_votes: number;
  total_votes: number;
  required_votes: number;
  total_eligible_voters: number;
  is_approved: boolean;
  is_rejected: boolean;
  is_24_hours_passed: boolean;
  hours_since_creation: number;
  voters: {
    user_email: string;
    vote: VoteType;
  }[];
}

// Dispute voting API functions
export async function voteOnDisputeAPI(disputeUuid: string, userEmail: string, vote: VoteType): Promise<void> {
  await http(`/dispute-votes/${encodeURIComponent(disputeUuid)}/vote`, {
    method: "POST",
    body: JSON.stringify({ userEmail, vote })
  });
}

export async function removeDisputeVoteAPI(disputeUuid: string, userEmail: string): Promise<void> {
  await http(`/dispute-votes/${encodeURIComponent(disputeUuid)}/vote`, {
    method: "DELETE",
    body: JSON.stringify({ userEmail })
  });
}

export async function getDisputeVoteStatusAPI(disputeUuid: string): Promise<DisputeVoteStatus> {
  return await http<DisputeVoteStatus>(`/dispute-votes/${encodeURIComponent(disputeUuid)}/status`);
}

export async function getUserDisputeVoteAPI(disputeUuid: string, userEmail: string): Promise<VoteType | null> {
  const result = await http<{ vote: VoteType | null }>(`/dispute-votes/${encodeURIComponent(disputeUuid)}/user/${encodeURIComponent(userEmail)}`);
  return result.vote;
}

export async function getRecentActivitiesAPI(params?: { homeId?: string; timeFrame?: "1d" | "3d" | "7d" | "30d" }): Promise<Chore[]> {
  const q = new URLSearchParams();
  if (params?.homeId) q.set("homeId", params.homeId);
  if (params?.timeFrame) q.set("timeFrame", params.timeFrame);
  const rows = await http<any[]>(`/activities${q.toString() ? `?${q.toString()}` : ""}`);
  return rows.map((r) => ({
    uuid: r.uuid,
    name: r.name,
    description: r.description,
    icon: r.icon,
    points: r.points,
    time: r.time,
    status: r.status,
    user_email: r.user_email,
    homeID: r.home_id,
    todos: r.todos || [],
    approvalList: [],
    completed_at: r.completed_at,
    claimed_at: r.claimed_at,
  }));
}

export async function createDisputeAPI(
  choreId: string,
  reason: string,
  photo?: string | null,
  disputerEmail?: string
): Promise<Dispute | undefined> {
  if (!disputerEmail) {
    throw new Error("Disputer email is required");
  }
  
  try {
    const row = await http<any>(`/disputes`, {
      method: "POST",
      body: JSON.stringify({
        choreId,
        reason,
        imageUrl: photo ?? undefined,
        disputerEmail,
      }),
    });
    const chore = await getChoreByIdAPI(choreId);
    if (!chore?.user_email) {
      throw new Error(`Chore ${choreId} has no assigned user, cannot create dispute`);
    }
    return {
      uuid: row.uuid,
      choreId,
      choreName: chore.name || "Chore",
      choreDescription: chore.description || "",
      choreIcon: chore.icon || "package",
      disputerEmail: row.disputer_email,
      disputerName: inferUserNameFromEmail(row.disputer_email),
      reason: row.reason,
      imageUrl: row.image_url || undefined,
      status: row.status,
      createdAt: row.created_at || new Date().toISOString(),
      claimedByEmail: chore.user_email,
    };
  } catch (error) {
    // Check if it's a home ID issue
    if (error instanceof Error && error.message.includes('Home') && error.message.includes('does not exist')) {
      throw new Error("Session expired. Please log out and log back in.");
    }
    throw error;
  }
}

// Legacy helpers retained for compatibility with existing components
export function getCurrentUserEmail(): string {
  // This function should not be used anymore - use context instead
  throw new Error("getCurrentUserEmail() is deprecated. Use context to get current user email.");
}

export function getCurrentHomeID(): string {
  return "";
}


