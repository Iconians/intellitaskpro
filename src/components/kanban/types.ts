import type { TaskStatus } from "@prisma/client";

export interface BoardStatus {
  id: string;
  name: string;
  status: TaskStatus;
  order: number;
}

export interface BoardTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: string;
  assigneeId: string | null;
  assignee: {
    id: string;
    userId: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  } | null;
  order: number;
  tags?: Array<{
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }>;
  dueDate?: string | null;
}

export interface Board {
  id: string;
  name: string;
  statuses: BoardStatus[];
  tasks: BoardTask[];
}

export interface FilterState {
  assigneeId?: string;
  status?: string;
  priority?: string;
  tagId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  searchQuery?: string;
}

export interface KanbanBoardProps {
  boardId: string;
  organizationId?: string;
  userBoardRole?: "ADMIN" | "MEMBER" | "VIEWER";
  filters?: FilterState;
}
