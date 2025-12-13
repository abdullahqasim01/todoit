# Todoit 📝

A multi-list task manager for VS Code with table and kanban views, custom statuses, and drag-and-drop. Everything is stored as JSON in your `.todoit` files—fast, local, and version-control friendly.

## ✨ Features

- **Multiple lists**: Create/rename/delete lists; each list has its own tasks, statuses, and view.
- **Two views per list**: Table view for quick edits; Kanban view with drag-and-drop between columns.
- **Custom statuses**: Add/edit/delete statuses per list, choose colors, and reorder status columns via drag-and-drop.
- **Drag-and-drop tasks**: Reorder in table; move across columns in Kanban (drop on card to insert before, or on column to append).
- **JSON storage**: Tasks and settings persist as JSON inside `.todoit` files—ready for git.
- **Lightweight + local**: No cloud dependencies; works entirely within VS Code.

## 🚀 Getting Started

1. Create a file ending in `.todoit` (or `.todoit.txt`).
2. Open it; Todoit loads and stores data as JSON automatically.
3. Add a list from the top bar, then add tasks in table view or Kanban.
4. Customize statuses in the Settings modal (gear button next to the progress bar).
5. Drag tasks to reorder or move between statuses.

## 📖 Usage Examples

### Example JSON shape (stored in file)
```
{
   "lists": [
      {
         "id": "list-default",
         "name": "Default",
         "view": "table",
         "statuses": [
            { "id": "todo", "label": "To Do", "color": "#808080" },
            { "id": "doing", "label": "Doing", "color": "#4A9EFF" },
            { "id": "done", "label": "Done", "color": "#4CAF50" }
         ],
         "tasks": [
            { "id": "task-1", "text": "Review pull request", "statusId": "todo" },
            { "id": "task-2", "text": "Ship feature", "statusId": "doing" }
         ]
      }
   ],
   "activeListId": "list-default"
}
```

## 🔧 Installation

1. Install from the VS Code Marketplace (search for todoit on marketplace.)

## 📋 Requirements

- VS Code version 1.102.0 or higher
- No additional dependencies required

## 🎛️ Extension Settings

No VS Code settings required. All per-list settings (statuses, view) are stored in the file itself.

## 🐛 Known Issues

- None known; please report issues you hit.

## 📝 Release Notes

See `CHANGELOG.md`.

## 🤝 Contributing

Found a bug or have a feature request? Please check the issues page or create a new issue.

## 📄 License

This extension is provided as-is. Please check the license file for more details.

---

**Enjoy staying organized with Todoit! 🎉**
