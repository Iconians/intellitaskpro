"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Tag {
  id: string;
  name: string;
  color: string;
  organizationId: string | null;
  boardId: string | null;
}

export interface TagManagerModalProps {
  boardId: string;
  organizationId?: string;
  userBoardRole?: "ADMIN" | "MEMBER" | "VIEWER";
  onClose: () => void;
}

const PRESET_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
  "#14B8A6",
  "#A855F7",
];

export function TagManagerModalContent({
  boardId,
  organizationId,
  userBoardRole,
  onClose,
}: TagManagerModalProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [newTagScope, setNewTagScope] = useState<"board" | "organization">("board");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagColor, setEditTagColor] = useState("");
  const queryClient = useQueryClient();

  const canManage = userBoardRole === "ADMIN" || userBoardRole === "MEMBER";
  const canManageOrg = userBoardRole === "ADMIN" && organizationId;
  const { data: boardTags = [], isLoading: boardTagsLoading } = useQuery<Tag[]>({
    queryKey: ["tags", boardId],
    queryFn: async () => {
      const res = await fetch(`/api/tags?boardId=${boardId}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: orgTags = [] } = useQuery<Tag[]>({
    queryKey: ["tags", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const res = await fetch(`/api/tags?organizationId=${organizationId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!organizationId,
  });

  const invalidateTagQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["tags"] });
    queryClient.invalidateQueries({ queryKey: ["tags", boardId, organizationId] });
    queryClient.invalidateQueries({ queryKey: ["tags", boardId] });
    if (organizationId) queryClient.invalidateQueries({ queryKey: ["tags", organizationId] });
  };

  const createTagMutation = useMutation({
    mutationFn: async ({ name, color, scope }: { name: string; color: string; scope: "board" | "organization" }) => {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          color,
          ...(scope === "organization" && organizationId ? { organizationId } : { boardId }),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to create tag");
      return res.json();
    },
    onSuccess: () => {
      invalidateTagQueries();
      setNewTagName("");
      setNewTagColor(PRESET_COLORS[0]);
      setNewTagScope("board");
      setShowCreateForm(false);
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const res = await fetch(`/api/tags/${tagId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete tag");
      return res.json();
    },
    onSuccess: invalidateTagQueries,
  });

  const updateTagMutation = useMutation({
    mutationFn: async ({ tagId, name, color }: { tagId: string; name: string; color: string }) => {
      const res = await fetch(`/api/tags/${tagId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update tag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", boardId] });
      if (organizationId) queryClient.invalidateQueries({ queryKey: ["tags", organizationId] });
      setEditingTagId(null);
      setEditTagName("");
      setEditTagColor("");
    },
  });

  const handleSaveEdit = () => {
    if (!editingTagId || !editTagName.trim()) return;
    updateTagMutation.mutate({ tagId: editingTagId, name: editTagName, color: editTagColor });
  };

  const renderTagRow = (tag: Tag, canEdit: boolean) => (
    <div key={tag.id} className="flex items-center gap-2 rounded-full border px-3 py-2" style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color }}>
      {editingTagId === tag.id ? (
        <>
          <input type="text" value={editTagName} onChange={(e) => setEditTagName(e.target.value)} className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white" autoFocus onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") { setEditingTagId(null); setEditTagName(""); setEditTagColor(""); } }} />
          <input type="color" value={editTagColor} onChange={(e) => setEditTagColor(e.target.value)} className="h-8 w-8 cursor-pointer rounded border border-gray-300 dark:border-gray-600" />
          <button onClick={handleSaveEdit} disabled={updateTagMutation.isPending} className="text-sm text-green-600 hover:text-green-700">✓</button>
          <button onClick={() => { setEditingTagId(null); setEditTagName(""); setEditTagColor(""); }} className="text-sm text-red-600 hover:text-red-700">✕</button>
        </>
      ) : (
        <>
          <span className="text-xs font-medium" style={{ color: tag.color }}>{tag.name}</span>
          {canEdit && (
            <>
              <button onClick={() => { setEditingTagId(tag.id); setEditTagName(tag.name); setEditTagColor(tag.color); }} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" title="Edit tag">✏️</button>
              <button onClick={() => { if (confirm(`Are you sure you want to delete the tag "${tag.name}"? This will remove it from all tasks.`)) deleteTagMutation.mutate(tag.id); }} disabled={deleteTagMutation.isPending} className="text-xs text-gray-500 hover:text-red-600" title="Delete tag">🗑️</button>
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 xs:p-4">
      <div className="mx-2 max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-3 shadow-xl xs:mx-4 xs:max-h-[90vh] xs:p-4 sm:p-6 dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Tags</h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        </div>
        {canManage && (
          <div className="mb-6">
            {!showCreateForm ? (
              <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"><span>+</span><span>Create New Tag</span></button>
            ) : (
              <div className="space-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="e.g., Frontend, Backend, Bug" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white" maxLength={50} />
                <div className="flex flex-wrap gap-2">{PRESET_COLORS.map((color) => <button key={color} type="button" onClick={() => setNewTagColor(color)} className={`h-10 w-10 rounded-full border-2 transition-all ${newTagColor === color ? "scale-110 ring-2 ring-blue-500 ring-offset-2" : "hover:scale-105"}`} style={{ backgroundColor: color }} title={color} />)}</div>
                <input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} className="h-10 w-12 cursor-pointer rounded border border-gray-300 dark:border-gray-600" />
                {organizationId && (
                  <div className="flex gap-4">
                    <label className="flex cursor-pointer items-center gap-2"><input type="radio" name="scope" value="board" checked={newTagScope === "board"} onChange={() => setNewTagScope("board")} className="h-4 w-4 text-blue-600" /><span className="text-sm text-gray-700 dark:text-gray-300">Board-specific</span></label>
                    {canManageOrg && <label className="flex cursor-pointer items-center gap-2"><input type="radio" name="scope" value="organization" checked={newTagScope === "organization"} onChange={() => setNewTagScope("organization")} className="h-4 w-4 text-blue-600" /><span className="text-sm text-gray-700 dark:text-gray-300">Organization-wide</span></label>}
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => createTagMutation.mutate({ name: newTagName, color: newTagColor, scope: newTagScope })} disabled={createTagMutation.isPending || !newTagName.trim()} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">{createTagMutation.isPending ? "Creating..." : "Create Tag"}</button>
                  <button onClick={() => { setShowCreateForm(false); setNewTagName(""); setNewTagColor(PRESET_COLORS[0]); setNewTagScope("board"); }} className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="space-y-6">
          {organizationId && orgTags.length > 0 && <div><h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Organization Tags</h3><div className="flex flex-wrap gap-2">{orgTags.map((tag) => renderTagRow(tag, Boolean(canManageOrg)))}</div></div>}
          <div><h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Board Tags</h3>{boardTagsLoading ? <div className="text-sm text-gray-500 dark:text-gray-400">Loading tags...</div> : boardTags.length > 0 ? <div className="flex flex-wrap gap-2">{boardTags.map((tag) => renderTagRow(tag, canManage))}</div> : <div className="text-sm italic text-gray-500 dark:text-gray-400">No board-specific tags yet. Create one above!</div>}</div>
        </div>
        <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
          <button onClick={onClose} className="w-full rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">Close</button>
        </div>
      </div>
    </div>
  );
}
