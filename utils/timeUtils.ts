export interface TimeRemaining {
  text: string;
  color: string;
  isOverdue: boolean;
  urgencyLevel: "low" | "medium" | "high" | "overdue";
}

export function getTimeRemaining(dueTime: string): TimeRemaining {
  const now = new Date();
  const dueDate = new Date(dueTime);
  const diffMs = dueDate.getTime() - now.getTime();

  // If overdue
  if (diffMs < 0) {
    const overdueDiffMs = Math.abs(diffMs);
    const overdueDays = Math.floor(overdueDiffMs / (1000 * 60 * 60 * 24));
    const overdueHours = Math.floor(
      (overdueDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    let overdueText = "";
    if (overdueDays > 0) {
      overdueText = `${overdueDays}d ${overdueHours}h overdue`;
    } else if (overdueHours > 0) {
      overdueText = `${overdueHours}h overdue`;
    } else {
      const overdueMinutes = Math.floor(
        (overdueDiffMs % (1000 * 60 * 60)) / (1000 * 60)
      );
      overdueText = `${overdueMinutes}m overdue`;
    }

    return {
      text: overdueText,
      color: "#D32F2F", // Red
      isOverdue: true,
      urgencyLevel: "overdue",
    };
  }

  // Calculate remaining time
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let timeText = "";
  let color = "";
  let urgencyLevel: "low" | "medium" | "high" = "low";

  if (days > 0) {
    if (days > 2) {
      timeText = `${days}d ${hours}h left`;
      color = "#4CAF50"; // Green
      urgencyLevel = "low";
    } else {
      timeText = `${days}d ${hours}h left`;
      color = "#FF9800"; // Orange
      urgencyLevel = "medium";
    }
  } else if (hours > 0) {
    if (hours > 6) {
      timeText = `${hours}h ${minutes}m left`;
      color = "#4CAF50"; // Green
      urgencyLevel = "low";
    } else if (hours > 2) {
      timeText = `${hours}h ${minutes}m left`;
      color = "#FF9800"; // Orange
      urgencyLevel = "medium";
    } else {
      timeText = `${hours}h ${minutes}m left`;
      color = "#F44336"; // Red
      urgencyLevel = "high";
    }
  } else {
    timeText = `${minutes}m left`;
    color = "#D32F2F"; // Dark red
    urgencyLevel = "high";
  }

  return {
    text: timeText,
    color,
    isOverdue: false,
    urgencyLevel,
  };
}
