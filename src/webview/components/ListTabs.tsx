import React, { useState } from "react";
import { useTasks } from "../contexts/TasksContext";

const ListTabs: React.FC = () => {
  const { document, activeList, setActiveList, addList, renameList, deleteList } = useTasks();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const handleRename = (id: string) => {
    if (!draftName.trim()) {
      setEditingId(null);
      return;
    }
    renameList(id, draftName.trim());
    setEditingId(null);
    setDraftName("");
  };

  return (
    <div className="flex items-center gap-2 w-full overflow-x-auto pb-1">
      {document.lists.map((list) => {
        const isActive = list.id === activeList.id;
        return (
          <div
            key={list.id}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg border-1 border-[var(--vscode-editorIndentGuide-background)] cursor-pointer ${
              isActive ? "bg-[var(--vscode-input-background)]" : "bg-transparent"
            }`}
            onClick={() => setActiveList(list.id)}
          >
            {editingId === list.id ? (
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={() => handleRename(list.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(list.id);
                  if (e.key === "Escape") {
                    setEditingId(null);
                    setDraftName("");
                  }
                }}
                autoFocus
                className="bg-[var(--vscode-input-background)] px-1 rounded"
              />
            ) : (
              <span
                className="font-medium"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingId(list.id);
                  setDraftName(list.name);
                }}
              >
                {list.name}
              </span>
            )}
            {document.lists.length > 1 && (
              <button
                title="Delete list"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteList(list.id);
                }}
                className="text-[var(--vscode-editorLineNumber-foreground)]"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
      <button
        onClick={() => addList("New List")}
        className="px-3 py-1 rounded-lg border-1 border-[var(--vscode-editorIndentGuide-background)] text-[var(--vscode-statusBar-foreground)]"
      >
        + New List
      </button>
    </div>
  );
};

export default ListTabs;
