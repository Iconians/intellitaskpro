"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BoardHeaderProps, BoardHeaderFilterState } from "@/components/boards/board-header-types";
import { useBoardHeaderData } from "@/hooks/useBoardHeaderData";
import { patchBoard } from "@/lib/board-client";

export function useBoardHeader(props: BoardHeaderProps) {
  const {
    boardId,
    boardName,
    organizationId,
    filters = {},
    onFiltersChange,
  } = props;

  const [showTaskGenerator, setShowTaskGenerator] = useState(false);
  const [showSprintPlanner, setShowSprintPlanner] = useState(false);
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [showBoardMembers, setShowBoardMembers] = useState(false);
  const [showGitHubRepo, setShowGitHubRepo] = useState(false);
  const [showManageColumns, setShowManageColumns] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showRecurringTasks, setShowRecurringTasks] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(boardName);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const {
    activeSprint,
    board,
    hasPaidSubscription,
    isGitHubConnected,
    needsRepoName,
    githubLimit,
    canConnectGitHub,
  } = useBoardHeaderData(boardId, organizationId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleFilterChange = useCallback(
    (newFilters: BoardHeaderFilterState) => {
      onFiltersChange?.(newFilters);
    },
    [onFiltersChange]
  );

  const updateBoardTitleMutation = useMutation({
    mutationFn: (name: string) =>
      patchBoard(boardId, { name }, "Failed to update board title"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      setIsEditingTitle(false);
    },
    onError: () => {
      setEditTitle(boardName);
      setIsEditingTitle(false);
    },
  });

  const handleSaveTitle = useCallback(() => {
    if (editTitle.trim() && editTitle.trim() !== boardName) {
      updateBoardTitleMutation.mutate(editTitle.trim());
    } else {
      setIsEditingTitle(false);
      setEditTitle(boardName);
    }
  }, [editTitle, boardName, updateBoardTitleMutation]);

  const closeMenu = useCallback(() => setShowMenu(false), []);

  return {
    ...props,
    menuRef,
    showMenu,
    setShowMenu,
    closeMenu,
    showTaskGenerator,
    setShowTaskGenerator,
    showSprintPlanner,
    setShowSprintPlanner,
    showCreateSprint,
    setShowCreateSprint,
    showBoardMembers,
    setShowBoardMembers,
    showGitHubRepo,
    setShowGitHubRepo,
    showManageColumns,
    setShowManageColumns,
    showTagManager,
    setShowTagManager,
    showExportModal,
    setShowExportModal,
    showImportModal,
    setShowImportModal,
    showTemplateEditor,
    setShowTemplateEditor,
    showRecurringTasks,
    setShowRecurringTasks,
    isEditingTitle,
    setIsEditingTitle,
    editTitle,
    setEditTitle,
    handleSaveTitle,
    handleFilterChange,
    activeSprint,
    board,
    hasPaidSubscription,
    isGitHubConnected,
    needsRepoName,
    canConnectGitHub,
    githubLimit,
    filters,
  };
}

export type UseBoardHeaderReturn = ReturnType<typeof useBoardHeader>;
