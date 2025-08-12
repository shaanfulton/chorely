// Lightweight API client that mirrors the mock.ts surface but calls the real backend
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
}

export interface RecentActivity {
  uuid: string;
  choreId: string;
  choreName: string;
  choreDescription: string;
  choreIcon: string;
  userEmail: string;
  userName: string;
  completedAt: string;
  canDispute: boolean;
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
  const homes = await getUserHomesAPI(email);
  return { email: row.email, name: row.name, homeIDs: homes.map((h) => h.id) };
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
  const rows = await http<any[]>(`/user/${encodeURIComponent(email)}/home`);
  return rows.map(mapHomeRow);
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
    const todos = await getTodoItemsForChore(chore.uuid);
    chore.todos = todos;
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
  const res = await http<any>(`/approvals/${encodeURIComponent(uuid)}/vote`, {
    method: "POST",
    body: JSON.stringify({ userEmail }),
  });
  return !!res?.approved;
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
} | null> {
  const chore = await getChoreByIdAPI(uuid);
  if (!chore) return null;
  const status = await http<any>(`/approvals/${encodeURIComponent(uuid)}`);
  const users = await getHomeUsersAPI(chore.homeID);
  const hasVoted: { [email: string]: boolean } = {};
  users.forEach((u) => (hasVoted[u.email] = status.voters?.includes(u.email)));
  return {
    hasVoted,
    votesNeeded: status.required,
    currentVotes: status.votes,
    isApproved: chore.status !== "unapproved",
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
  // hydrate chore info
  const enriched = await Promise.all(
    rows.map(async (d) => {
      const chore = await getChoreByIdAPI(d.chore_id);
      return {
        uuid: d.uuid,
        choreId: d.chore_id,
        choreName: chore?.name || "Chore",
        choreDescription: chore?.description || "",
        choreIcon: chore?.icon || "package",
        disputerEmail: d.disputer_email,
        disputerName: inferUserNameFromEmail(d.disputer_email),
        reason: d.reason,
        imageUrl: d.image_url || undefined,
        status: d.status,
        createdAt: d.created_at || new Date().toISOString(),
      } as Dispute;
    })
  );
  return enriched;
}

export async function approveDisputeAPI(uuid: string): Promise<void> {
  await http(`/disputes/${encodeURIComponent(uuid)}/approve`, { method: "PATCH" });
}

export async function rejectDisputeAPI(uuid: string): Promise<void> {
  await http(`/disputes/${encodeURIComponent(uuid)}/reject`, { method: "PATCH" });
}

export async function getRecentActivitiesAPI(params?: { homeId?: string; timeFrame?: "1d" | "7d" | "30d" }): Promise<RecentActivity[]> {
  const q = new URLSearchParams();
  if (params?.homeId) q.set("homeId", params.homeId);
  if (params?.timeFrame) q.set("timeFrame", params.timeFrame);
  const rows = await http<any[]>(`/activities${q.toString() ? `?${q.toString()}` : ""}`);
  return rows.map((r) => ({
    uuid: r.uuid,
    choreId: r.uuid,
    choreName: r.name,
    choreDescription: r.description,
    choreIcon: r.icon,
    userEmail: r.user_email,
    userName: inferUserNameFromEmail(r.user_email),
    completedAt: r.completed_at || r.updated_at || new Date().toISOString(),
    canDispute: true,
  }));
}

export async function createDisputeAPI(
  choreId: string,
  reason: string,
  photo?: string | null,
  disputerEmail?: string
): Promise<Dispute | undefined> {
  const row = await http<any>(`/disputes`, {
    method: "POST",
    body: JSON.stringify({
      choreId,
      reason,
      imageUrl: photo ?? undefined,
      disputerEmail: disputerEmail || "user@example.com",
    }),
  });
  const chore = await getChoreByIdAPI(choreId);
  return {
    uuid: row.uuid,
    choreId,
    choreName: chore?.name || "Chore",
    choreDescription: chore?.description || "",
    choreIcon: chore?.icon || "package",
    disputerEmail: row.disputer_email,
    disputerName: inferUserNameFromEmail(row.disputer_email),
    reason: row.reason,
    imageUrl: row.image_url || undefined,
    status: row.status,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// Legacy helpers retained for compatibility with existing components
export function getCurrentUserEmail(): string {
  // Fallback for places still reading from here; prefer using context where possible
  return "user@example.com";
}

export function getCurrentHomeID(): string {
  return "";
}


