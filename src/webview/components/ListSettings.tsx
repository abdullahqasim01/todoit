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

  const handleAddStatus = () => {
    if (!newLabel.trim()) return;
    addStatus(newLabel.trim(), newColor || "#4A9EFF");
    setNewLabel("");
  };

  const handleDrop = (targetId: string | null) => {
    if (!dragId || dragId === targetId) return;
    const from = statuses.findIndex((s) => s.id === dragId);
    const to = targetId ? statuses.findIndex((s) => s.id === targetId) : statuses.length - 1;
    if (from === -1 || to === -1) return;
    reorderStatuses(from, to);
    setDragId(null);
  };

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

      <div className="flex flex-col gap-2">
        {statuses.map((status) => (
          <div
            key={status.id}
            className="flex items-center gap-2"
            draggable
            onDragStart={() => setDragId(status.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(status.id);
            }}
          >
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
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t-1 border-[var(--vscode-editorIndentGuide-background)]">
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
