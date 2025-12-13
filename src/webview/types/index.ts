export interface StatusType {
  id: string;
  label: string;
  color: string;
}

export interface TaskType {
  id: string;
  text: string;
  statusId: string;
}

export interface ListType {
  id: string;
  name: string;
  view: "table" | "kanban";
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