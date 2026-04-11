/**
 * section.js — Renders the section content area (hero, filters, task grid).
 *
 * Responsibilities:
 *  - renderSection  – hero + progress bar + filter bar + task list
 *  - renderTasks    – applies active filter & search to the task list
 *  - showWelcome    – empty state when no section is selected
 */

import { esc } from '../utils/helpers.js';
import { buildTaskCard } from './taskCard.js';
import { state } from '../utils/state.js';

// ── DOM refs ─────────────────────────────────────────────────
const contentArea = document.getElementById('contentArea');
const breadcrumb = document.getElementById('breadcrumb');
const btnAddTask = document.getElementById('btnAddTask');
const welcomeEl = document.getElementById('welcomeState');

/**
 * Render the section hero + filter bar + task grid.
 * @param {Object}   section
 * @param {Function} onMutate       re-fetches data and re-renders
 * @param {Function} openTaskModal  opens the task create/edit modal
 */
export function renderSection(section, onMutate, openTaskModal) {
    breadcrumb.textContent = `${section.icon} ${section.name}`;
    btnAddTask.style.display = 'flex';

    const tasks = section.tasks || [];
    const done = tasks.filter(t => t.completed).length;
    const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

    contentArea.innerHTML = `
      <div class="section-view">
        <div class="section-hero" style="--section-color:${section.color}">
          <div class="section-hero-glow"></div>
          <div class="section-hero-icon">${section.icon}</div>
          <div class="section-hero-info">
            <div class="section-hero-title">${esc(section.name)}</div>
            <div class="section-hero-meta">${tasks.length} task${tasks.length !== 1 ? 's' : ''} · ${done} completed</div>
            <div class="section-progress">
              <div class="progress-bar-wrap" style="--section-color:${section.color}">
                <div class="progress-bar-fill" style="width:${progress}%;--section-color:${section.color}"></div>
              </div>
              <span class="progress-text">${progress}%</span>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <button class="filter-chip${state.taskFilter === 'all' ? ' active' : ''}" data-filter="all">All (${tasks.length})</button>
          <button class="filter-chip${state.taskFilter === 'active' ? ' active' : ''}" data-filter="active">Active (${tasks.filter(t => !t.completed).length})</button>
          <button class="filter-chip${state.taskFilter === 'completed' ? ' active' : ''}" data-filter="completed">Done (${done})</button>
          <div class="search-input-wrap">
            <span class="search-icon">🔍</span>
            <input class="search-input" id="taskSearchInput" type="text"
                   placeholder="Search tasks…" value="${esc(state.taskSearch)}" />
          </div>
        </div>

        <div id="taskContainer"></div>
      </div>`;

    // Filter chips
    contentArea.querySelectorAll('.filter-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            state.taskFilter = btn.dataset.filter;
            renderSection(section, onMutate, openTaskModal);
        });
    });

    // Search input
    const searchInput = document.getElementById('taskSearchInput');
    searchInput.addEventListener('input', () => {
        state.taskSearch = searchInput.value;
        renderTasks(section, onMutate, openTaskModal);
    });

    renderTasks(section, onMutate, openTaskModal);
}

/**
 * Re-render only the task list area inside an already-rendered section.
 */
export function renderTasks(section, onMutate, openTaskModal) {
    const container = document.getElementById('taskContainer');
    if (!container) return;

    let tasks = section.tasks || [];

    // Apply filter
    if (state.taskFilter === 'active') tasks = tasks.filter(t => !t.completed);
    if (state.taskFilter === 'completed') tasks = tasks.filter(t => t.completed);

    // Apply search
    if (state.taskSearch.trim()) {
        const q = state.taskSearch.toLowerCase();
        tasks = tasks.filter(t =>
            t.title.toLowerCase().includes(q) ||
            (t.description || '').toLowerCase().includes(q)
        );
    }

    if (tasks.length === 0) {
        container.innerHTML = `
          <div class="tasks-empty">
            <div class="empty-icon">🌿</div>
            <p>${state.taskSearch ? 'No tasks match your search.' : 'No tasks here yet.'}</p>
            <small>${state.taskSearch ? 'Try a different keyword.' : 'Click <strong>+ Add Task</strong> to create one.'}</small>
          </div>`;
        return;
    }

    container.innerHTML = '<div class="tasks-grid" id="tasksGrid"></div>';
    const grid = document.getElementById('tasksGrid');
    tasks.forEach(task => {
        grid.appendChild(buildTaskCard(task, section, onMutate, openTaskModal));
    });
}

/** Show the welcome / empty state. */
export function showWelcome() {
    breadcrumb.textContent = 'Select a section';
    btnAddTask.style.display = 'none';
    contentArea.innerHTML = welcomeEl ? welcomeEl.outerHTML
        : `<div class="welcome-state">
             <div class="welcome-graphic">✦</div>
             <h1>Welcome to TaskFlow</h1>
             <p>Select a section to get started.</p>
           </div>`;
}
