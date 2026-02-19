export interface StatusType {
  id: string;
  label: string;
  color: string;
}

export type PriorityType = "low" | "medium" | "high";

export interface TaskType {
  id: string;
  text: string;
  statusId: string;
  description?: string;
  dueDate?: string;
  priority?: PriorityType;
}

export type ViewType = "table" | "kanban" | "task-detail";

export interface ListType {
  id: string;
  name: string;
  view: ViewType;
  statuses: StatusType[];
  tasks: TaskType[];
}

export interface DocumentData {
  lists: ListType[];
  activeListId: string;
}

export interface VSCodeApiType {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}