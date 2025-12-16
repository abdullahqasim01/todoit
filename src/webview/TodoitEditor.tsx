import React, { useState } from "react";
import TaskTable from "./components/TaskTable";
import "./TodoitEditor.css";
import Header from "./components/Header";
import ListTabs from "./components/ListTabs";
import Kanban from "./components/Kanban";
import ListSettings from "./components/ListSettings";
import { TasksProvider, useTasks } from "./contexts/TasksContext";
import { TextProvider } from "./contexts/TextContext";

declare global {
  interface Window {
    initialData?: { text: string };
  }
}

const TodoitEditorInner: React.FC = () => {
  const { activeList } = useTasks();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="w-full h-screen p-2">
      <div className="flex flex-col gap-4 h-full">
        <ListTabs />
        <Header onOpenSettings={() => setShowSettings(true)} />
        <div className="w-full flex-1 min-h-0 border-[var(--vscode-editorIndentGuide-background)] border-1 rounded-lg overflow-y-auto bg-[var(--vscode-editor-background)] relative">
          {activeList.view === "kanban" ? <Kanban /> : <TaskTable />}
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="w-[520px] max-w-[90vw]">
            <ListSettings onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

const TodoitEditor: React.FC = () => (
  <TextProvider>
    <TasksProvider>
      <TodoitEditorInner />
    </TasksProvider>
  </TextProvider>
);

export default TodoitEditor;
