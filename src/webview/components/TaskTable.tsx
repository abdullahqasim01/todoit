import React, { useState, memo, useRef, useEffect } from "react";
import { TaskType } from "../types";
import { useTasks } from "../contexts/TasksContext";

const TaskTable: React.FC = memo(
  () => {
    const { tasks, deleteTask, editTask, addTask, changeStatus, reorderTasks } = useTasks();
    const [editingTask, setEditingTask] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [addText, setAddText] = useState("");
    const [draggedTask, setDraggedTask] = useState<string | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const handleEditStart = (task: TaskType) => {
      setEditingTask(task.id);
      setEditText(task.text);
    };

    const handleEditSave = () => {
      if (editingTask) {
        editTask(editingTask, editText);
        setEditingTask(null);
        setEditText("");
      }
    };

    const handleEditCancel = () => {
      setEditingTask(null);
      setEditText("");
    };

    const handleAddtask = () => {
      if (editText === undefined) return;
  addTask(addText);
      setAddText("")
    }

    const handleAddCancel = () => {
      setAddText("")
    }

    const handleInputBlur = () => {
      handleEditSave();
    };

    const getTaskStatus = (task: TaskType): "todo" | "doing" | "done" => {
      if (task.status) return task.status;
      return task.completed ? "done" : "todo";
    };

    const handleStatusChange = (
      taskId: string,
      newStatus: "todo" | "doing" | "done"
    ) => {
  changeStatus(taskId, newStatus);
    };

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

      const draggedIndex = tasks.findIndex(t => t.id === draggedTask);
      if (draggedIndex === -1 || draggedIndex === targetIndex) return;

      reorderTasks(draggedIndex, targetIndex);
      setDraggedTask(null);
      setDragOverIndex(null);
    };

    const getStatusColor = (status: "todo" | "doing" | "done") => {
      switch (status) {
        case "todo":
          return "#808080"; // grey
        case "doing":
          return "#4A9EFF"; // blue
        case "done":
          return "#4CAF50"; // green
        default:
          return "#808080";
      }
    };

    const getStatusLabel = (status: "todo" | "doing" | "done") => {
      switch (status) {
        case "todo":
          return "To Do";
        case "doing":
          return "Doing";
        case "done":
          return "Done";
        default:
          return "To Do";
      }
    };

    const toggleDropdown = (taskId: string) => {
      setOpenDropdown(openDropdown === taskId ? null : taskId);
    };

    const handleStatusSelect = (taskId: string, newStatus: "todo" | "doing" | "done") => {
      handleStatusChange(taskId, newStatus);
      setOpenDropdown(null);
    };

    // Close dropdown when clicking outside
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
                <tr className="">
                  <th className="max-w-[50px] p-1"></th>
                  <th className="text-left">Task</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="leading-[50px]">
                  <td className="max-w-[50px] p-1 text-center">+</td>
                  <td className="leading-normal px-1">
                    <input
                      type="text"
                      value={addText}
                      onChange={(e) => setAddText(e.target.value)}
                      className="w-full border-[var(--vscode-editorIndentGuide-background)] border-b-1 border-dashed focus:border-[var(--vscode-statusBar-foreground)]"
                      placeholder="Add Task"
                      onBlur={handleInputBlur}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddtask();
                        if (e.key === "Escape") handleAddCancel();
                      }}
                    />
                  </td>
                </tr>
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <tr
                      key={task.id}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`leading-[50px] border-y-1 border-[var(--vscode-editorIndentGuide-background)] ${
                        draggedTask === task.id ? "opacity-50" : ""
                      } ${
                        dragOverIndex === index && draggedTask !== task.id ? "border-t-2 border-t-[var(--vscode-statusBar-foreground)]" : ""
                      }`}
                    >
                      <td 
                        className="max-w-[50px] p-1 text-center cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
                          <circle cx="8" cy="6" r="2"/>
                          <circle cx="16" cy="6" r="2"/>
                          <circle cx="8" cy="12" r="2"/>
                          <circle cx="16" cy="12" r="2"/>
                          <circle cx="8" cy="18" r="2"/>
                          <circle cx="16" cy="18" r="2"/>
                        </svg>
                      </td>
                      <td className="leading-normal">
                        {editingTask === task.id ? (
                          <div className="">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full border-[var(--vscode-editorIndentGuide-background)] border-b-1 border-dashed focus:border-[var(--vscode-statusBar-foreground)]"
                              autoFocus
                              onBlur={handleInputBlur}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleEditSave();
                                if (e.key === "Escape") handleEditCancel();
                              }}
                            />
                          </div>
                        ) : (
                          <span
                            className=""
                            onClick={() => handleEditStart(task)}
                          >
                            {task.text}
                          </span>
                        )}
                      </td>
                      <td className="">
                        <div 
                          className="relative my-2"
                          ref={(el) => { dropdownRefs.current[task.id] = el; }}
                        >
                          <button
                            onClick={() => toggleDropdown(task.id)}
                            className="flex items-center gap-1.5 border-[var(--vscode-editorIndentGuide-background)] border-1 px-2 py-1.5 rounded text-base leading-tight"
                          >
                            <svg width="10" height="10" viewBox="0 0 10 10">
                              <circle cx="5" cy="5" r="4" fill={getStatusColor(getTaskStatus(task))} />
                            </svg>
                            <span>{getStatusLabel(getTaskStatus(task))}</span>
                            <svg width="16" height="16" viewBox="0 0 12 12" fill="currentColor" opacity="0.6">
                              <path d="M6 8L3 5h6z"/>
                            </svg>
                          </button>
                          
                          {openDropdown === task.id && (
                            <div className="absolute top-full left-0 mt-1 bg-[var(--vscode-input-background)] border-[var(--vscode-editorIndentGuide-background)] border-1 rounded shadow-lg z-10 min-w-[100px]">
                              <button
                                onClick={() => handleStatusSelect(task.id, "todo")}
                                className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-[var(--vscode-list-hoverBackground)] text-left text-base first:rounded-t"
                              >
                                <svg width="10" height="10" viewBox="0 0 10 10">
                                  <circle cx="5" cy="5" r="4" fill="#808080" />
                                </svg>
                                <span>To Do</span>
                              </button>
                              <button
                                onClick={() => handleStatusSelect(task.id, "doing")}
                                className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-[var(--vscode-list-hoverBackground)] text-left text-base"
                              >
                                <svg width="10" height="10" viewBox="0 0 10 10">
                                  <circle cx="5" cy="5" r="4" fill="#4A9EFF" />
                                </svg>
                                <span>Doing</span>
                              </button>
                              <button
                                onClick={() => handleStatusSelect(task.id, "done")}
                                className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-[var(--vscode-list-hoverBackground)] text-left text-base last:rounded-b"
                              >
                                <svg width="10" height="10" viewBox="0 0 10 10">
                                  <circle cx="5" cy="5" r="4" fill="#4CAF50" />
                                </svg>
                                <span>Done</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="">                       <div className="">                        <button
                            onClick={() => deleteTask(task.id)}
                            className=""
                            title="Delete task"
                          >
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
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="">
                      No tasks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
    );
  }
);

export default TaskTable;
