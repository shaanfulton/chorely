import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export type ChoreStatus = "unapproved" | "unclaimed" | "claimed" | "complete";

export interface TodoItem {
  name: string;
  description: string;
}

export interface User {
  email: string;
  homeIDs: string[];
}

export interface Home {
  id: string;
  name: string;
  address: string;
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
}

// Mock data for homes
const HOMES: Home[] = [
  {
    id: "home_1",
    name: "Main House",
    address: "123 Main St, Berkeley, CA",
    userPoints: {
      "user@example.com": 85,
      "roommate@example.com": 42,
    },
    weeklyPointQuota: 100,
  },
  {
    id: "home_2",
    name: "Summer Cabin",
    address: "456 Lake View Dr, Tahoe, CA",
    userPoints: {
      "user@example.com": 120,
      "family@example.com": 95,
    },
    weeklyPointQuota: 150,
  },
  {
    id: "home_3",
    name: "Downtown Apartment",
    address: "789 Market St, San Francisco, CA",
    userPoints: {
      "family@example.com": 73,
    },
    weeklyPointQuota: 80,
  },
];

// Mock data for users
const USERS: User[] = [
  {
    email: "user@example.com",
    homeIDs: ["home_1", "home_2"],
  },
  {
    email: "roommate@example.com",
    homeIDs: ["home_1"],
  },
  {
    email: "family@example.com",
    homeIDs: ["home_2", "home_3"],
  },
];

const DEFAULT_USER_EMAIL = "user@example.com";
const DEFAULT_HOME_ID = "home_1";

export const getCurrentUserEmail = (): string => {
  return DEFAULT_USER_EMAIL;
};

export const getCurrentHomeID = (): string => {
  return DEFAULT_HOME_ID;
};

const CHORES: Chore[] = [
  {
    uuid: uuidv4(),
    name: "Sorting Boxes",
    description: "This is an unapproved chore.",
    time: "1h 15m",
    icon: "package",
    user_email: null,
    status: "unapproved",
    homeID: "home_1",
    todos: [
      { name: "Step 1", description: "Detailed description for step 1." },
      { name: "Step 2", description: "Detailed description for step 2." },
    ],
    points: 10,
  },
  {
    uuid: uuidv4(),
    name: "Organizing",
    description: "Organize the living room shelves.",
    time: "1h 15m",
    icon: "package",
    user_email: null,
    status: "unclaimed",
    homeID: "home_1",
    todos: [
      {
        name: "Clear shelves",
        description: "Remove all items from the shelves.",
      },
      {
        name: "Sort items",
        description: "Group items into categories: keep, donate, trash.",
      },
      {
        name: "Wipe shelves",
        description: "Clean the shelves with a damp cloth.",
      },
      {
        name: "Arrange items",
        description: "Place items back on the shelves in an organized manner.",
      },
    ],
    points: 10,
  },
  {
    uuid: uuidv4(),
    name: "Dusting",
    description: "Dust all surfaces in the main room.",
    time: "25m",
    icon: "feather",
    user_email: null,
    status: "unclaimed",
    homeID: "home_1",
    todos: [
      {
        name: "Gather supplies",
        description: "Get a duster or microfiber cloth.",
      },
      { name: "Dust high surfaces", description: "Start from top to bottom." },
      {
        name: "Dust furniture",
        description: "Dust tables, shelves, and other furniture.",
      },
    ],
    points: 10,
  },
  {
    uuid: uuidv4(),
    name: "Mopping",
    description: "Mop the kitchen and bathroom floors.",
    time: "35m",
    icon: "droplets",
    user_email: null,
    status: "unclaimed",
    homeID: "home_1",
    todos: [
      {
        name: "Sweep/vacuum first",
        description: "Remove loose dirt and debris.",
      },
      {
        name: "Prepare mop solution",
        description: "Fill a bucket with water and cleaning solution.",
      },
      {
        name: "Mop the floors",
        description: "Mop from the farthest corner towards the door.",
      },
      {
        name: "Let it dry",
        description: "Allow the floor to air dry completely.",
      },
    ],
    points: 10,
  },
  {
    uuid: uuidv4(),
    name: "Taking out trash",
    description: "Empty all trash cans and take out the garbage.",
    time: "10m",
    icon: "trash-2",
    user_email: null,
    status: "unclaimed",
    homeID: "home_1",
    todos: [
      {
        name: "Collect trash",
        description: "Gather trash from all bins in the house.",
      },
      {
        name: "Replace liners",
        description: "Put new liners in all the trash cans.",
      },
      {
        name: "Take out to curb",
        description: "Take the main trash bag to the outdoor bin/curb.",
      },
    ],
    points: 10,
  },
  {
    uuid: uuidv4(),
    name: "Sweeping",
    description: "Sweep the front porch.",
    time: "12h 10m",
    icon: "brush",
    user_email: DEFAULT_USER_EMAIL,
    status: "claimed",
    homeID: "home_1",
    todos: [
      {
        name: "Get broom and dustpan",
        description: "Grab the necessary tools.",
      },
      {
        name: "Sweep into a pile",
        description: "Sweep all debris into one area.",
      },
      {
        name: "Dispose of debris",
        description: "Use the dustpan to collect and throw away the pile.",
      },
    ],
    points: 10,
  },
  {
    uuid: uuidv4(),
    name: "Washing Dishes",
    description: "Wash and dry all dishes in the sink.",
    time: "30m",
    icon: "droplets",
    user_email: DEFAULT_USER_EMAIL,
    status: "claimed",
    homeID: "home_1",
    todos: [
      {
        name: "Scrape plates",
        description: "Remove leftover food from dishes.",
      },
      {
        name: "Wash with soap",
        description: "Use hot, soapy water to wash each dish.",
      },
      { name: "Rinse thoroughly", description: "Rinse off all soap suds." },
      { name: "Dry and put away", description: "Use a towel or drying rack." },
    ],
    points: 10,
  },
  {
    uuid: uuidv4(),
    name: "Vacuum",
    description: "Vacuum the entire house.",
    time: "45m",
    icon: "wind",
    user_email: DEFAULT_USER_EMAIL,
    status: "complete",
    homeID: "home_2",
    todos: [
      {
        name: "Clear the floor",
        description: "Pick up any large items or clutter from the floor.",
      },
      {
        name: "Vacuum room by room",
        description: "Work systematically through the house.",
      },
      {
        name: "Use attachments",
        description: "Use attachments for corners and edges.",
      },
    ],
    points: 10,
  },
  {
    uuid: uuidv4(),
    name: "Laundry",
    description: "Wash, dry, and fold one load of laundry.",
    time: "2h",
    icon: "shirt",
    user_email: DEFAULT_USER_EMAIL,
    status: "complete",
    homeID: "home_2",
    todos: [
      {
        name: "Sort clothes",
        description: "Separate lights, darks, and colors.",
      },
      {
        name: "Wash load",
        description: "Put one load in the washing machine with detergent.",
      },
      {
        name: "Dry load",
        description: "Transfer washed clothes to the dryer.",
      },
      {
        name: "Fold and put away",
        description: "Fold the dry clothes and put them away.",
      },
    ],
    points: 10,
  },
];

// User authentication functions
export const loginUserAPI = (email: string): User | null => {
  return USERS.find((user) => user.email === email) || null;
};

export const getUserByEmailAPI = (email: string): User | null => {
  return USERS.find((user) => user.email === email) || null;
};

export const getHomeByIdAPI = (homeId: string): Home | null => {
  return HOMES.find((home) => home.id === homeId) || null;
};

export const getAllHomesAPI = (): Home[] => {
  return HOMES;
};

export const getUserHomesAPI = (email: string): Home[] => {
  const user = getUserByEmailAPI(email);
  if (!user) return [];
  return HOMES.filter((home) => user.homeIDs.includes(home.id));
};

export const createUserAPI = (email: string, homeId?: string): User => {
  // Check if user already exists
  const existingUser = getUserByEmailAPI(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Create new user
  const newUser: User = {
    email,
    homeIDs: homeId ? [homeId] : [],
  };

  USERS.push(newUser);
  return newUser;
};

export const createHomeAPI = (
  name: string,
  address: string,
  weeklyPointQuota: number = 100
): Home => {
  const newHome: Home = {
    id: `home_${Date.now()}`, // Simple ID generation for mock
    name,
    address,
    userPoints: {},
    weeklyPointQuota,
  };

  HOMES.push(newHome);
  return newHome;
};

export const joinHomeAPI = (email: string, homeId: string): boolean => {
  const user = getUserByEmailAPI(email);
  const home = getHomeByIdAPI(homeId);

  if (!user || !home) {
    return false;
  }

  if (!user.homeIDs.includes(homeId)) {
    user.homeIDs.push(homeId);
  }

  return true;
};

export const createChoreAPI = (
  choreData: Omit<Chore, "uuid" | "status" | "user_email" | "todos" | "homeID">,
  homeID: string
) => {
  const newChore: Chore = {
    ...choreData,
    uuid: uuidv4(),
    user_email: null,
    status: "unapproved",
    homeID,
    points: choreData.points || 10, // Default to 10 points if not specified
    todos: [
      { name: "Item 1", description: "Detailed description for item 1." },
      { name: "Item 2", description: "Detailed description for item 2." },
      { name: "Item 3", description: "Detailed description for item 3." },
    ],
  };
  console.log("Creating new chore:", newChore);
  CHORES.push(newChore);
  return newChore;
};

export const getMyChoresAPI = (email: string, homeID: string): Chore[] => {
  return CHORES.filter(
    (chore) =>
      chore.user_email === email &&
      chore.status === "claimed" &&
      chore.homeID === homeID
  );
};

export const getAvailableChoresAPI = (homeID: string): Chore[] => {
  return CHORES.filter(
    (chore) =>
      chore.user_email === null &&
      chore.status === "unclaimed" &&
      chore.homeID === homeID
  );
};

export const getChoreByIdAPI = (uuid: string): Chore | undefined => {
  return CHORES.find((chore) => chore.uuid === uuid);
};

export const getUnapprovedChoresAPI = (homeID: string): Chore[] => {
  return CHORES.filter(
    (chore) => chore.status === "unapproved" && chore.homeID === homeID
  );
};

export const approveChoreAPI = (uuid: string): void => {
  const chore = CHORES.find((chore) => chore.uuid === uuid);
  if (chore) {
    chore.status = "unclaimed";
  }
};

export const claimChoreAPI = (uuid: string, email: string): void => {
  const chore = CHORES.find((chore) => chore.uuid === uuid);
  if (chore && chore.status === "unclaimed") {
    chore.user_email = email;
    chore.status = "claimed";
  }
};

export const completeChoreAPI = (uuid: string): void => {
  const chore = CHORES.find((chore) => chore.uuid === uuid);
  if (chore) {
    chore.status = "complete";
  }
};

export const verifyChoreAPI = (uuid: string): void => {
  const chore = CHORES.find((chore) => chore.uuid === uuid);
  if (chore) {
    chore.status = "complete";
  }
};

// Points-related API functions
export const getUserPointsAPI = (userEmail: string, homeID: string): number => {
  const home = HOMES.find((home) => home.id === homeID);
  if (!home) return 0;
  return home.userPoints[userEmail] || 0;
};

export const updateUserPointsAPI = (
  userEmail: string,
  homeID: string,
  points: number
): void => {
  const home = HOMES.find((home) => home.id === homeID);
  if (home) {
    if (!home.userPoints[userEmail]) {
      home.userPoints[userEmail] = 0;
    }
    home.userPoints[userEmail] += points;
  }
};

export const getAllUserPointsAPI = (
  homeID: string
): { [userEmail: string]: number } => {
  const home = HOMES.find((home) => home.id === homeID);
  if (!home) return {};
  return home.userPoints;
};
