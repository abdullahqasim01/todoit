import { useTasks } from "../contexts/TasksContext";

const Header = () => {
  const { tasks, getDone } = useTasks();
  const total = tasks.length;
  const done = getDone();
  const completion = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="flex flex-row justify-between items-center w-full">
      <div className="flex flex-col">
        <span className="font-bold">Tasks</span>
        <span className="text-[var(--vscode-editorLineNumber-foreground)]">
          {total} total
        </span>
      </div>
      <div className="flex flex-col gap-1 items-end min-w-[160px]">
        <p className="text-[var(--vscode-editorLineNumber-foreground)]">
          {done}/{total || 1} tasks completed
        </p>
        <div className="w-full bg-[var(--vscode-input-background)] h-2 rounded-lg">
          <div
            className="h-2 bg-primary rounded-lg transition-all"
            style={{ width: `${completion}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Header;
