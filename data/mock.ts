import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export type ChoreStatus = "unapproved" | "unclaimed" | "claimed" | "complete";

export interface TodoItem {
  name: string;
  description: string;
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
}

const LOGGED_IN_USER_EMAIL = "user@example.com";

const CHORES: Chore[] = [
  {
    uuid: uuidv4(),
    name: "Unapproved Chore",
    description: "This is an unapproved chore.",
    time: "1h 15m",
    icon: "package",
    user_email: null,
    status: "unapproved",
    todos: [
      { name: "Step 1", description: "Detailed description for step 1." },
      { name: "Step 2", description: "Detailed description for step 2." },
    ],
  },
  {
    uuid: uuidv4(),
    name: "Organizing",
    description: "Organize the living room shelves.",
    time: "1h 15m",
    icon: "package",
    user_email: null,
    status: "unclaimed",
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
  },
  {
    uuid: uuidv4(),
    name: "Dusting",
    description: "Dust all surfaces in the main room.",
    time: "25m",
    icon: "feather",
    user_email: null,
    status: "unclaimed",
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
  },
  {
    uuid: uuidv4(),
    name: "Mopping",
    description: "Mop the kitchen and bathroom floors.",
    time: "35m",
    icon: "droplets",
    user_email: null,
    status: "unclaimed",
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
  },
  {
    uuid: uuidv4(),
    name: "Taking out trash",
    description: "Empty all trash cans and take out the garbage.",
    time: "10m",
    icon: "trash-2",
    user_email: null,
    status: "unclaimed",
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
  },
  {
    uuid: uuidv4(),
    name: "Sweeping",
    description: "Sweep the front porch.",
    time: "12h 10m",
    icon: "brush",
    user_email: LOGGED_IN_USER_EMAIL,
    status: "claimed",
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
  },
  {
    uuid: uuidv4(),
    name: "Washing Dishes",
    description: "Wash and dry all dishes in the sink.",
    time: "30m",
    icon: "droplets",
    user_email: LOGGED_IN_USER_EMAIL,
    status: "claimed",
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
  },
  {
    uuid: uuidv4(),
    name: "Vacuum",
    description: "Vacuum the entire house.",
    time: "45m",
    icon: "wind",
    user_email: LOGGED_IN_USER_EMAIL,
    status: "complete",
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
  },
  {
    uuid: uuidv4(),
    name: "Laundry",
    description: "Wash, dry, and fold one load of laundry.",
    time: "2h",
    icon: "shirt",
    user_email: LOGGED_IN_USER_EMAIL,
    status: "complete",
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
  },
];

export const createChore = (
  choreData: Omit<Chore, "uuid" | "status" | "user_email" | "todos">
) => {
  const newChore: Chore = {
    ...choreData,
    uuid: uuidv4(),
    user_email: null,
    status: "unapproved",
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

export const getMyChores = (): Chore[] => {
  return CHORES.filter(
    (chore) =>
      chore.user_email === LOGGED_IN_USER_EMAIL &&
      (chore.status === "claimed" || chore.status === "complete")
  );
};

export const getAvailableChores = (): Chore[] => {
  return CHORES.filter(
    (chore) => chore.user_email === null && chore.status === "unclaimed"
  );
};

export const getChoreById = (uuid: string): Chore | undefined => {
  return CHORES.find((chore) => chore.uuid === uuid);
};

export const getUnapprovedChores = (): Chore[] => {
  return CHORES.filter((chore) => chore.status === "unapproved");
};

export const approveChore = (uuid: string): void => {
  const chore = CHORES.find((chore) => chore.uuid === uuid);
  if (chore) {
    chore.status = "unclaimed";
  }
};

export const completeChore = (uuid: string): void => {
  const chore = CHORES.find((chore) => chore.uuid === uuid);
  if (chore) {
    chore.status = "complete";
  }
};
