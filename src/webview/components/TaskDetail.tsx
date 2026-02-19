import React, { useState } from "react";
import { useTasks } from "../contexts/TasksContext";
import { PriorityType } from "../types";

const TaskDetail: React.FC = () => {
  const { tasks, statuses, selectedTaskId, setSelectedTaskId, updateTaskField, deleteTask } = useTasks();

  const task = tasks.find(t => t.id === selectedTaskId);

  if (!task) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-[var(--vscode-editorLineNumber-foreground)]">Task not found</div>
      </div>
    );
  }

  const handleFieldChange = (field: keyof typeof task, value: any) => {
    updateTaskField(task.id, field, value);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setSelectedTaskId(null);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setSelectedTaskId(null)}
          className="flex items-center gap-2 text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 3.5l5 4.5-5 4.5" />
          </svg>
          Back to Tasks
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        {/* Task Title */}
        <div className="mb-6">
          <input
            type="text"
            value={task.text}
            onChange={(e) => handleFieldChange("text", e.target.value)}
            className="text-2xl font-bold w-full bg-transparent border-b border-[var(--vscode-editorIndentGuide-background)] focus:border-[var(--vscode-focusBorder)] outline-none pb-2"
            placeholder="Task title"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={task.statusId}
              onChange={(e) => handleFieldChange("statusId", e.target.value)}
              className="w-full bg-[var(--vscode-input-background)] border border-[var(--vscode-editorIndentGuide-background)] rounded px-3 py-2"
            >
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={task.priority || ""}
              onChange={(e) => handleFieldChange("priority", e.target.value as PriorityType)}
              className="w-full bg-[var(--vscode-input-background)] border border-[var(--vscode-editorIndentGuide-background)] rounded px-3 py-2"
            >
              <option value="">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <input
              type="date"
              value={task.dueDate || ""}
              onChange={(e) => handleFieldChange("dueDate", e.target.value || undefined)}
              className="w-full bg-[var(--vscode-input-background)] border border-[var(--vscode-editorIndentGuide-background)] rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={task.description || ""}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            className="w-full h-40 bg-[var(--vscode-input-background)] border border-[var(--vscode-editorIndentGuide-background)] rounded px-3 py-2 resize-none"
            placeholder="Add detailed notes..."
          />
        </div>

        {/* Delete Button */}
        <div className="mt-8">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;