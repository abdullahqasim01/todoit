import { useTasks } from "../contexts/TasksContext";

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header = ({ onOpenSettings }: HeaderProps) => {
  const { tasks, statuses, activeList, setView } = useTasks();
  const total = tasks.length;
  const done = tasks.filter((t) => t.statusId === "done").length;
  const completion = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="flex flex-row justify-between items-center w-full">
      <div className="flex flex-col">
        <span className="font-bold">{activeList?.name ?? "Tasks"}</span>
        <span className="text-[var(--vscode-editorLineNumber-foreground)]">
          {total} tasks · {statuses.length} statuses
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-[var(--vscode-input-background)] p-1 rounded-lg">
          <button
            className={`px-3 py-1 rounded ${
              activeList.view === "table"
                ? "bg-[var(--vscode-statusBar-foreground)] text-[var(--vscode-statusBar-background)]"
                : "text-[var(--vscode-editorLineNumber-foreground)]"
            }`}
            onClick={() => setView("table")}
          >
            Table
          </button>
          <button
            className={`px-3 py-1 rounded ${
              activeList.view === "kanban"
                ? "bg-[var(--vscode-statusBar-foreground)] text-[var(--vscode-statusBar-background)]"
                : "text-[var(--vscode-editorLineNumber-foreground)]"
            }`}
            onClick={() => setView("kanban")}
          >
            Kanban
          </button>
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <div className="flex flex-col gap-1 items-end w-full">
            <p className="text-[var(--vscode-editorLineNumber-foreground)]">
              {done}/{total || 1} done
            </p>
            <div className="w-full bg-[var(--vscode-input-background)] h-2 rounded-lg">
              <div
                className="h-2 bg-primary rounded-lg transition-all"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
          </div>
          <button
            className="px-3 py-1 rounded border-1 border-[var(--vscode-editorIndentGuide-background)]"
            onClick={onOpenSettings}
            title="Open list settings"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
