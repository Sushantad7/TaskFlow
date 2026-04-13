/**
 * state.js — Single source of truth for all mutable app state.
 * Exported as a plain object so components can read it directly.
 * Mutations happen in main.js which owns the lifecycle.
 */

export const state = {
    sections: [],
    activeSectionId: null,
    taskFilter: 'all',   // 'all' | 'active' | 'completed'
    taskSearch: '',
    username: '',
};
