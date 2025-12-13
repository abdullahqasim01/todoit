import React, { useState, memo, useRef, useEffect } from "react";
import { useTasks } from "../contexts/TasksContext";
import { StatusType } from "../types";

const TaskTable: React.FC = memo(() => {
  const { tasks, statuses, deleteTask, editTask, addTask, changeStatus, reorderTasks } = useTasks();
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [addText, setAddText] = useState("");
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const findStatus = (id: string): StatusType | undefined => statuses.find((s) => s.id === id);

  const handleEditStart = (taskId: string, text: string) => {
    setEditingTask(taskId);
    setEditText(text);
  };

  const handleEditSave = () => {
    if (editingTask) {
      editTask(editingTask, editText.trim());
      setEditingTask(null);
      setEditText("");
    }
  };

  const handleEditCancel = () => {
    setEditingTask(null);
    setEditText("");
  };

  const handleAddTask = () => {
    if (!addText.trim()) return;
    addTask(addText.trim());
    setAddText("");
  };

  const handleAddCancel = () => setAddText("");

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedTask) return;
    const draggedIndex = tasks.findIndex((t) => t.id === draggedTask);
    if (draggedIndex === -1 || draggedIndex === targetIndex) return;
    reorderTasks(draggedIndex, targetIndex);
    setDraggedTask(null);
    setDragOverIndex(null);
  };

  const toggleDropdown = (taskId: string) => {
    setOpenDropdown(openDropdown === taskId ? null : taskId);
  };

  const handleStatusSelect = (taskId: string, statusId: string) => {
    changeStatus(taskId, statusId);
    setOpenDropdown(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && dropdownRefs.current[openDropdown]) {
        const dropdown = dropdownRefs.current[openDropdown];
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  return (
    <div className="w-full h-full overflow-y-auto">
      <table className="w-full">
        <thead className="leading-[50px] bg-[var(--vscode-input-background)] sticky top-0">
          <tr>
            <th className="max-w-[50px] p-1"></th>
            <th className="text-left">Task</th>
            <th className="text-left">Status</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="leading-[50px]">
            <td className="max-w-[50px] p-1 text-center">+</td>
            <td className="leading-normal px-1" colSpan={2}>
              <input
                type="text"
                value={addText}
                onChange={(e) => setAddText(e.target.value)}
                className="w-full border-[var(--vscode-editorIndentGuide-background)] border-b-1 border-dashed focus:border-[var(--vscode-statusBar-foreground)]"
                placeholder="Add Task"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTask();
                  if (e.key === "Escape") handleAddCancel();
                }}
              />
            </td>
            <td></td>
          </tr>
          {tasks.length > 0 ? (
            tasks.map((task, index) => {
              const status = findStatus(task.statusId);
              return (
                <tr
                  key={task.id}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`leading-[50px] border-y-1 border-[var(--vscode-editorIndentGuide-background)] ${
                    draggedTask === task.id ? "opacity-50" : ""
                  } ${
                    dragOverIndex === index && draggedTask !== task.id
                      ? "border-t-2 border-t-[var(--vscode-statusBar-foreground)]"
                      : ""
                  }`}
                >
                  <td
                    className="max-w-[50px] p-1 text-center cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
                      <circle cx="8" cy="6" r="2" />
                      <circle cx="16" cy="6" r="2" />
                      <circle cx="8" cy="12" r="2" />
                      <circle cx="16" cy="12" r="2" />
                      <circle cx="8" cy="18" r="2" />
                      <circle cx="16" cy="18" r="2" />
                    </svg>
                  </td>
                  <td className="leading-normal">
                    {editingTask === task.id ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full border-[var(--vscode-editorIndentGuide-background)] border-b-1 border-dashed focus:border-[var(--vscode-statusBar-foreground)]"
                        autoFocus
                        onBlur={handleEditSave}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave();
                          if (e.key === "Escape") handleEditCancel();
                        }}
                      />
                    ) : (
                      <span onClick={() => handleEditStart(task.id, task.text)}>{task.text}</span>
                    )}
                  </td>
                  <td>
                    <div
                      className="relative my-2"
                      ref={(el) => {
                        dropdownRefs.current[task.id] = el;
                      }}
                    >
                      <button
                        onClick={() => toggleDropdown(task.id)}
                        className="flex items-center gap-1.5 border-[var(--vscode-editorIndentGuide-background)] border-1 px-2 py-1.5 rounded text-base leading-tight"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10">
                          <circle cx="5" cy="5" r="4" fill={status?.color ?? "#808080"} />
                        </svg>
                        <span>{status?.label ?? "Unset"}</span>
                        <svg width="16" height="16" viewBox="0 0 12 12" fill="currentColor" opacity="0.6">
                          <path d="M6 8L3 5h6z" />
                        </svg>
                      </button>

                      {openDropdown === task.id && (
                        <div className="absolute top-full left-0 mt-1 bg-[var(--vscode-input-background)] border-[var(--vscode-editorIndentGuide-background)] border-1 rounded shadow-lg z-10 min-w-[140px]">
                          {statuses.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => handleStatusSelect(task.id, s.id)}
                              className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-[var(--vscode-list-hoverBackground)] text-left text-base"
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10">
                                <circle cx="5" cy="5" r="4" fill={s.color} />
                              </svg>
                              <span>{s.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <button onClick={() => deleteTask(task.id)} title="Delete task">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} className="p-4 text-[var(--vscode-editorLineNumber-foreground)]">
                No tasks yet. Add one to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default TaskTable;
