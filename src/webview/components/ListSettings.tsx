import React, { useState } from "react";
import { useTasks } from "../contexts/TasksContext";

interface ListSettingsProps {
  onClose?: () => void;
}

const ListSettings: React.FC<ListSettingsProps> = ({ onClose }) => {
  const { statuses, addStatus, updateStatus, deleteStatus, reorderStatuses } = useTasks();
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#4A9EFF");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | "end" | null>(null);

  const handleAddStatus = () => {
    if (!newLabel.trim()) return;
    addStatus(newLabel.trim(), newColor || "#4A9EFF");
    setNewLabel("");
  };

  const handleDrop = (targetId: string | null) => {
    if (!dragId || dragId === targetId) return;
    const from = statuses.findIndex((s) => s.id === dragId);
    const to = targetId ? statuses.findIndex((s) => s.id === targetId) : statuses.length;
    if (from === -1 || to === -1) return;
    reorderStatuses(from, to);
    setDragId(null);
    setDragOverId(null);
  };

  const draggedStatus = dragId ? statuses.find((s) => s.id === dragId) : undefined;

  const renderPreview = (key: string, targetId: string | null) => (
    <div
      key={key}
      className="drop-preview-card cursor-move"
      onDragOver={(e) => {
        if (!dragId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverId(targetId ?? "end");
      }}
      onDrop={(e) => {
        e.preventDefault();
        handleDrop(targetId);
      }}
    >
      <div className="flex items-center gap-2 text-sm">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: draggedStatus?.color ?? "var(--vscode-statusBar-foreground)" }}
        ></span>
        <span className="text-[var(--vscode-editor-foreground)]">{draggedStatus?.label ?? "Drop here"}</span>
      </div>
      <div className="text-[var(--vscode-editorLineNumber-foreground)] text-xs">New position</div>
    </div>
  );

  return (
    <div className="border-1 border-[var(--vscode-editorIndentGuide-background)] rounded-lg p-4 bg-[var(--vscode-input-background)] flex flex-col gap-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">List Settings</div>
          <div className="text-[var(--vscode-editorLineNumber-foreground)] text-sm">Statuses for this list</div>
        </div>
        {onClose && (
          <button
            className="text-[var(--vscode-editorLineNumber-foreground)]"
            onClick={onClose}
            title="Close settings"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
        {statuses.map((status) => (
          <React.Fragment key={status.id}>
            {dragOverId === status.id && renderPreview(`${status.id}-preview`, status.id)}

            <div
              className="flex items-center gap-2"
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setDragOverId(status.id);
              }}
              onDragEnter={(e) => {
                if (!dragId) return;
                e.preventDefault();
                setDragOverId(status.id);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(status.id);
              }}
            >
              <button
                className="p-2 cursor-move text-[var(--vscode-editorLineNumber-foreground)] hover:text-[var(--vscode-editor-foreground)]"
                title="Drag to reorder"
                draggable
                onDragStart={(e) => {
                  setDragId(status.id);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", status.id);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setDragOverId(null);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity="0.8">
                  <circle cx="8" cy="6" r="2" />
                  <circle cx="16" cy="6" r="2" />
                  <circle cx="8" cy="12" r="2" />
                  <circle cx="16" cy="12" r="2" />
                  <circle cx="8" cy="18" r="2" />
                  <circle cx="16" cy="18" r="2" />
                </svg>
              </button>

              <input
                type="color"
                value={status.color}
                onChange={(e) => updateStatus(status.id, status.label, e.target.value)}
              />
              <input
                className="flex-1 border-1 border-[var(--vscode-editorIndentGuide-background)] rounded px-2 py-1"
                value={status.label}
                onChange={(e) => updateStatus(status.id, e.target.value, status.color)}
              />
              <button
                className="text-[var(--vscode-editorLineNumber-foreground)]"
                onClick={() => deleteStatus(status.id)}
                title="Delete status"
              >
                ×
              </button>
            </div>
          </React.Fragment>
        ))}

        {dragId && dragOverId === "end" && renderPreview("end-preview", null)}
      </div>

      <div
        className="flex items-center gap-2 pt-2 border-t-1 border-[var(--vscode-editorIndentGuide-background)]"
        onDragOver={(e) => {
          if (!dragId) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setDragOverId("end");
        }}
        onDragEnter={(e) => {
          if (!dragId) return;
          e.preventDefault();
          setDragOverId("end");
        }}
        onDrop={(e) => {
          e.preventDefault();
          handleDrop(null);
        }}
      >
        <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} />
        <input
          className="flex-1 border-1 border-[var(--vscode-editorIndentGuide-background)] rounded px-2 py-1"
          placeholder="Add status label"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddStatus();
            if (e.key === "Escape") setNewLabel("");
          }}
        />
        <button
          className="px-3 py-1 rounded bg-[var(--vscode-statusBar-foreground)] text-[var(--vscode-statusBar-background)]"
          onClick={handleAddStatus}
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default ListSettings;
