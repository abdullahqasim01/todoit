import React, { useMemo, useState } from "react";
import { useTasks } from "../contexts/TasksContext";
import { StatusType, TaskType } from "../types";

const Kanban: React.FC = () => {
  const { tasks, statuses, changeStatus, deleteTask, editTask, addTask, moveTaskToStatus } = useTasks();
  const [draftText, setDraftText] = useState("");
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ statusId: string; beforeTaskId: string | null } | null>(null);
  const grouped = useMemo(() => {
    const buckets: Record<string, TaskType[]> = {};
    statuses.forEach((s) => {
      buckets[s.id] = [];
    });
    tasks.forEach((t) => {
      const bucket = buckets[t.statusId] ?? (buckets[statuses[0]?.id] = []);
      bucket.push(t);
    });
    return buckets;
  }, [tasks, statuses]);

  const handleAdd = () => {
    if (!draftText.trim()) return;
    addTask(draftText.trim());
    setDraftText("");
  };

  const handleCardDrop = (statusId: string, beforeTaskId?: string) => {
    if (!dragTaskId) return;
    moveTaskToStatus(dragTaskId, statusId, beforeTaskId);
    setDragTaskId(null);
    setDropTarget(null);
  };

  const renderGhostCard = (status: StatusType) => {
    const task = tasks.find((t) => t.id === dragTaskId);
    if (!task) return null;
    return (
      <div className="drop-preview-card">
        <div className="flex items-center justify-between text-sm mb-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></span>
            <span className="text-[var(--vscode-editor-foreground)]">{status.label}</span>
          </div>
          <span className="text-[var(--vscode-editorLineNumber-foreground)]">Preview</span>
        </div>
        <div className="text-[var(--vscode-editor-foreground)] text-sm">{task.text}</div>
      </div>
    );
  };

  const renderTask = (task: TaskType, status: StatusType) => (
    <div
      key={task.id}
      className="p-2 bg-[var(--vscode-editor-background)] border-1 border-[var(--vscode-editorIndentGuide-background)] rounded flex flex-col gap-2"
      draggable
      onDragStart={(e) => {
        setDragTaskId(task.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={() => {
        setDragTaskId(null);
        setDropTarget(null);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDropTarget({ statusId: status.id, beforeTaskId: task.id });
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleCardDrop(status.id, task.id);
      }}
    >
      <input
        className="bg-transparent border-b-1 border-[var(--vscode-editorIndentGuide-background)]"
        value={task.text}
        onChange={(e) => editTask(task.id, e.target.value)}
      />
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: status.color }}
          ></span>
          <select
            className="bg-[var(--vscode-input-background)] px-2 py-1 rounded"
            value={task.statusId}
            onChange={(e) => changeStatus(task.id, e.target.value)}
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button onClick={() => deleteTask(task.id)} title="Delete" className="text-[var(--vscode-editorLineNumber-foreground)]">
          ×
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 h-full min-h-0 overflow-hidden">
      <div className="flex gap-2">
        <input
          className="flex-1 border-1 border-[var(--vscode-editorIndentGuide-background)] rounded px-2 py-1"
          placeholder="Quick add task"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
            if (e.key === "Escape") setDraftText("");
          }}
        />
        <button
          className="px-3 py-1 rounded bg-[var(--vscode-statusBar-foreground)] text-[var(--vscode-statusBar-background)]"
          onClick={handleAdd}
        >
          Add
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto flex-1 min-h-0 pb-1">
        {statuses.map((status) => (
          <div
            key={status.id}
            className="min-w-[220px] flex-1 bg-[var(--vscode-input-background)] rounded-lg p-3 flex flex-col gap-3 min-h-0"
            onDragOver={(e) => {
              e.preventDefault();
              setDropTarget({ statusId: status.id, beforeTaskId: null });
            }}
            onDragLeave={(e) => {
              if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) return;
              setDropTarget(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleCardDrop(status.id);
            }}
          >
            <div className="flex items-center gap-2 font-semibold">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: status.color }}
              ></span>
              <span>{status.label}</span>
              <span className="text-[var(--vscode-editorLineNumber-foreground)]">{grouped[status.id]?.length ?? 0}</span>
            </div>
            <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-1">
              {grouped[status.id]?.length ? (
                <>
                  {dropTarget?.statusId === status.id && dropTarget.beforeTaskId === null && renderGhostCard(status)}
                  {grouped[status.id].map((task) => (
                    <React.Fragment key={task.id}>
                      {dropTarget?.statusId === status.id && dropTarget.beforeTaskId === task.id && renderGhostCard(status)}
                      {renderTask(task, status)}
                    </React.Fragment>
                  ))}
                </>
              ) : dropTarget?.statusId === status.id ? (
                renderGhostCard(status)
              ) : (
                <div className="text-[var(--vscode-editorLineNumber-foreground)] text-sm">No tasks here</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Kanban;
