import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DocumentData, ListType, StatusType, TaskType } from "../types";
import { useText } from "./TextContext";

interface TasksContextValue {
	document: DocumentData;
	activeList: ListType;
	tasks: TaskType[];
	statuses: StatusType[];
	addTask: (text: string) => void;
	editTask: (id: string, newText: string) => void;
	deleteTask: (id: string) => void;
	changeStatus: (id: string, statusId: string) => void;
	moveTaskToStatus: (id: string, statusId: string, beforeTaskId?: string) => void;
	reorderTasks: (fromIndex: number, toIndex: number) => void;
	addList: (name?: string) => void;
	renameList: (id: string, name: string) => void;
	deleteList: (id: string) => void;
	setActiveList: (id: string) => void;
	setView: (view: ListType["view"]) => void;
	addStatus: (label: string, color: string) => void;
	updateStatus: (id: string, label: string, color: string) => void;
	deleteStatus: (id: string) => void;
	reorderStatuses: (fromIndex: number, toIndex: number) => void;
}

interface TasksProviderProps { children: React.ReactNode }

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

const defaultStatuses: StatusType[] = [
	{ id: "todo", label: "To Do", color: "#808080" },
	{ id: "doing", label: "Doing", color: "#4A9EFF" },
	{ id: "done", label: "Done", color: "#4CAF50" },
];

const createEmptyDocument = (): DocumentData => ({
	lists: [
		{
			id: "list-default",
			name: "Default",
			view: "table",
			statuses: defaultStatuses,
			tasks: [],
		},
	],
	activeListId: "list-default",
});

const parseLegacyTasks = (text: string): TaskType[] => {
	const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	const lines = normalized.split("\n");
	const parsed: TaskType[] = [];

	lines.forEach((line, index) => {
		const match = line.match(/^(\s*)(- )?\[([ *xX])\]\s*(.+)$/);
		if (!match) return;
		const [, , , checkbox, body] = match;
		const symbol = checkbox.toLowerCase();
		let statusId = "todo";
		if (symbol === "x") statusId = "done";
		if (symbol === "*") statusId = "doing";

		const contentHash = body.trim().replace(/\s+/g, "-").toLowerCase();
		parsed.push({
			id: `task-${index}-${contentHash.substring(0, 10)}`,
			text: body.trim(),
			statusId,
		});
	});

	return parsed;
};

const parseDocument = (raw: string): DocumentData => {
	if (!raw.trim()) {
		return createEmptyDocument();
	}

	try {
		const parsed = JSON.parse(raw);
		if (parsed && Array.isArray(parsed.lists) && parsed.activeListId) {
			return parsed as DocumentData;
		}
	} catch (_) {
		// fall back
	}

	const tasks = parseLegacyTasks(raw);
	return {
		lists: [
			{
				id: "list-default",
				name: "Default",
				view: "table",
				statuses: defaultStatuses,
				tasks,
			},
		],
		activeListId: "list-default",
	};
};

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
	const { text, setTextImmediate } = useText();
	const [document, setDocument] = useState<DocumentData>(() => parseDocument(text));

	// Sync when text updates externally
	useEffect(() => {
		setDocument(parseDocument(text));
	}, [text]);

	const persist = useCallback((nextDoc: DocumentData) => {
		setDocument(nextDoc);
		setTextImmediate(JSON.stringify(nextDoc, null, 2));
	}, [setTextImmediate]);

	const activeList = useMemo(() => {
		return document.lists.find((l) => l.id === document.activeListId) ?? document.lists[0];
	}, [document]);

	const updateActiveList = useCallback(
		(updater: (list: ListType) => ListType) => {
			const nextLists = document.lists.map((l) =>
				l.id === activeList.id ? updater(l) : l
			);
			persist({ ...document, lists: nextLists });
		},
		[document, activeList, persist]
	);

	const addTask = useCallback(
		(taskText: string) => {
			if (!taskText.trim()) return;
			updateActiveList((list) => ({
				...list,
				tasks: [...list.tasks, { id: crypto.randomUUID(), text: taskText.trim(), statusId: list.statuses[0]?.id ?? "todo" }],
			}));
		},
		[updateActiveList]
	);

	const editTask = useCallback(
		(id: string, newText: string) => {
			updateActiveList((list) => ({
				...list,
				tasks: list.tasks.map((t) => (t.id === id ? { ...t, text: newText } : t)),
			}));
		},
		[updateActiveList]
	);

	const deleteTask = useCallback(
		(id: string) => {
			updateActiveList((list) => ({
				...list,
				tasks: list.tasks.filter((t) => t.id !== id),
			}));
		},
		[updateActiveList]
	);

	const changeStatus = useCallback(
		(id: string, statusId: string) => {
			updateActiveList((list) => ({
				...list,
				tasks: list.tasks.map((t) => (t.id === id ? { ...t, statusId } : t)),
			}));
		},
		[updateActiveList]
	);

	const moveTaskToStatus = useCallback(
		(id: string, statusId: string, beforeTaskId?: string) => {
			updateActiveList((list) => {
				const tasks = [...list.tasks];
				const fromIndex = tasks.findIndex((t) => t.id === id);
				if (fromIndex === -1) return list;
				const [task] = tasks.splice(fromIndex, 1);
				const updatedTask = { ...task, statusId };

				let targetIndex = tasks.length;
				if (beforeTaskId) {
					const idx = tasks.findIndex((t) => t.id === beforeTaskId);
					if (idx >= 0) targetIndex = idx;
				}

				tasks.splice(targetIndex, 0, updatedTask);
				return { ...list, tasks };
			});
		},
		[updateActiveList]
	);

	const reorderTasks = useCallback(
		(fromIndex: number, toIndex: number) => {
			if (fromIndex === toIndex) return;
			updateActiveList((list) => {
				const tasks = [...list.tasks];
				const [moved] = tasks.splice(fromIndex, 1);
				tasks.splice(toIndex, 0, moved);
				return { ...list, tasks };
			});
		},
		[updateActiveList]
	);

	const addList = useCallback(
		(name?: string) => {
			const id = `list-${crypto.randomUUID()}`;
			const nextList: ListType = {
				id,
				name: name?.trim() || "New List",
				view: "table",
				statuses: defaultStatuses,
				tasks: [],
			};
			const nextDoc: DocumentData = {
				...document,
				lists: [...document.lists, nextList],
				activeListId: id,
			};
			persist(nextDoc);
		},
		[document, persist]
	);

	const renameList = useCallback(
		(id: string, name: string) => {
			persist({
				...document,
				lists: document.lists.map((l) => (l.id === id ? { ...l, name } : l)),
			});
		},
		[document, persist]
	);

	const deleteList = useCallback(
		(id: string) => {
			if (document.lists.length <= 1) return;
			const nextLists = document.lists.filter((l) => l.id !== id);
			const nextActive = document.activeListId === id ? nextLists[0].id : document.activeListId;
			persist({ ...document, lists: nextLists, activeListId: nextActive });
		},
		[document, persist]
	);

	const setActiveList = useCallback(
		(id: string) => {
			if (document.activeListId === id) return;
			persist({ ...document, activeListId: id });
		},
		[document, persist]
	);

	const setView = useCallback(
		(view: ListType["view"]) => {
			updateActiveList((list) => ({ ...list, view }));
		},
		[updateActiveList]
	);

	const addStatus = useCallback(
		(label: string, color: string) => {
			updateActiveList((list) => {
				const newStatus: StatusType = { id: `status-${crypto.randomUUID()}`, label, color };
				return { ...list, statuses: [...list.statuses, newStatus] };
			});
		},
		[updateActiveList]
	);

	const updateStatus = useCallback(
		(id: string, label: string, color: string) => {
			updateActiveList((list) => ({
				...list,
				statuses: list.statuses.map((s) => (s.id === id ? { ...s, label, color } : s)),
			}));
		},
		[updateActiveList]
	);

	const deleteStatus = useCallback(
		(id: string) => {
			updateActiveList((list) => {
				const remaining = list.statuses.filter((s) => s.id !== id);
				const fallback = remaining[0]?.id ?? "todo";
				return {
					...list,
					statuses: remaining,
					tasks: list.tasks.map((t) => (t.statusId === id ? { ...t, statusId: fallback } : t)),
				};
			});
		},
		[updateActiveList]
	);

	const reorderStatuses = useCallback(
		(fromIndex: number, toIndex: number) => {
			if (fromIndex === toIndex) return;
			updateActiveList((list) => {
				const statuses = [...list.statuses];
				const [moved] = statuses.splice(fromIndex, 1);
				statuses.splice(toIndex, 0, moved);
				return { ...list, statuses };
			});
		},
		[updateActiveList]
	);

	const value: TasksContextValue = useMemo(
		() => ({
			document,
			activeList: activeList ?? createEmptyDocument().lists[0],
			tasks: activeList?.tasks ?? [],
			statuses: activeList?.statuses ?? defaultStatuses,
			addTask,
			editTask,
			deleteTask,
			changeStatus,
			moveTaskToStatus,
			reorderTasks,
			addList,
			renameList,
			deleteList,
			setActiveList,
			setView,
			addStatus,
			updateStatus,
			deleteStatus,
			reorderStatuses,
		}),
		[document, activeList, addTask, editTask, deleteTask, changeStatus, moveTaskToStatus, reorderTasks, addList, renameList, deleteList, setActiveList, setView, addStatus, updateStatus, deleteStatus, reorderStatuses]
	);

	return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = (): TasksContextValue => {
	const ctx = useContext(TasksContext);
	if (!ctx) {
		throw new Error("useTasks must be used within a TasksProvider");
	}
	return ctx;
};

