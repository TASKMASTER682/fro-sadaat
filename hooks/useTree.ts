import { create } from 'zustand';
import { TreeNode, User } from '@/types';
import api from '@/lib/api';

interface TreeState {
  treeData: TreeNode | null;
  selectedNode: (TreeNode & { fullUser?: User }) | null;
  isLoading: boolean;
  isPanelOpen: boolean;
  searchQuery: string;
  totalNodes: number;
  fetchTree: () => Promise<void>;
  selectNode: (node: TreeNode | null) => void;
  closePanel: () => void;
  setSearchQuery: (q: string) => void;
}

export const useTreeStore = create<TreeState>((set) => ({
  treeData: null,
  selectedNode: null,
  isLoading: false,
  isPanelOpen: false,
  searchQuery: '',
  totalNodes: 0,

  fetchTree: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/tree');
      set({
        treeData: res.data.data,
        totalNodes: res.data.totalNodes ?? 0,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to fetch tree:', err);
      set({ isLoading: false });
    }
  },

  selectNode: (node) => {
    set({ selectedNode: node, isPanelOpen: !!node });
  },

  closePanel: () => {
    set({ isPanelOpen: false, selectedNode: null });
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
}));
