import React from "react";
import TaskTable from "./components/TaskTable";
import "./TodoitEditor.css";
import Header from "./components/Header";
import { TasksProvider } from "./contexts/TasksContext";
import { TextProvider } from "./contexts/TextContext";

declare global {
  interface Window {
    initialData?: { text: string };
  }
}

const TodoitEditorInner: React.FC = () => (
  <div className="w-full h-screen p-2">
    <div className="flex flex-col gap-4 h-full">
      <TasksProvider>
        <Header />

        <div className="w-full flex-1 border-[var(--vscode-editorIndentGuide-background)] border-1 rounded-lg overflow-hidden">
          <TaskTable />
        </div>
      </TasksProvider>
    </div>
  </div>
);

const TodoitEditor: React.FC = () => (
  <TextProvider>
    <TodoitEditorInner />
  </TextProvider>
);

export default TodoitEditor;
