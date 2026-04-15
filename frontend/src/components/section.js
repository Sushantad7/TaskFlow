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
const welcomeEl = document.getElementById('welcomeState');

function dateAtLocalMidnight(isoDate) {
    if (!isoDate) return null;
    return new Date(isoDate.substring(0, 10) + 'T00:00:00');
}

function getTaskDayGroup(task) {
    if (!task.dueDate) return 'no-due-date';
    const due = dateAtLocalMidnight(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((due - today) / 86_400_000);
    if (diff < 0) return 'overdue';
    if (diff === 0) return 'today';
    if (diff === 1) return 'tomorrow';
    return 'upcoming';
}

function getTaskGroups(tasks, mode) {
    if (mode === 'none') {
        return [{ id: 'all', label: 'All Tasks', icon: '📋', tasks }];
    }

    const groups = [
        { id: 'overdue', label: 'Overdue', icon: '🚨', tasks: [] },
        { id: 'today', label: 'Today', icon: '📌', tasks: [] },
        { id: 'tomorrow', label: 'Tomorrow', icon: '⏭', tasks: [] },
        { id: 'upcoming', label: 'Upcoming', icon: '🗓', tasks: [] },
        { id: 'no-due-date', label: 'No Due Date', icon: '🧩', tasks: [] },
    ];

    const byId = Object.fromEntries(groups.map(g => [g.id, g]));
    tasks.forEach(task => byId[getTaskDayGroup(task)].tasks.push(task));
    return groups.filter(g => g.tasks.length > 0);
}

/**
 * Render the section hero + filter bar + task grid.
 * @param {Object}   section
 * @param {Function} onMutate       re-fetches data and re-renders
 * @param {Function} openTaskModal  opens the task create/edit modal
 */
export function renderSection(section, onMutate, openTaskModal) {
    breadcrumb.textContent = `${section.icon} ${section.name}`;

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
          <button class="btn-primary section-add-task-btn" id="sectionAddTaskBtn">
            <span>＋</span> Add Task
          </button>
        </div>

        <div class="filter-bar">
          <button class="filter-chip${state.taskFilter === 'all' ? ' active' : ''}" data-filter="all">All (${tasks.length})</button>
          <button class="filter-chip${state.taskFilter === 'active' ? ' active' : ''}" data-filter="active">Active (${tasks.filter(t => !t.completed).length})</button>
          <button class="filter-chip${state.taskFilter === 'completed' ? ' active' : ''}" data-filter="completed">Done (${done})</button>
          <div class="group-toggle-wrap">
            <button class="group-toggle${state.taskGroupMode === 'smart' ? ' active' : ''}" data-group-mode="smart">Group by Day</button>
            <button class="group-toggle${state.taskGroupMode === 'none' ? ' active' : ''}" data-group-mode="none">Flat List</button>
          </div>
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

    contentArea.querySelectorAll('.group-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            state.taskGroupMode = btn.dataset.groupMode;
            renderSection(section, onMutate, openTaskModal);
        });
    });

    document.getElementById('sectionAddTaskBtn').addEventListener('click', () => openTaskModal(section));

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

    const groupMode = state.taskGroupMode || 'smart';
    const groups = getTaskGroups(tasks, groupMode);

    container.innerHTML = groups.map(group => `
      <section class="task-group">
        <header class="task-group-header">
          <h3>${group.icon} ${group.label}</h3>
          <span>${group.tasks.length}</span>
        </header>
        <div class="tasks-grid" id="tasksGrid-${group.id}"></div>
      </section>
    `).join('');

    groups.forEach(group => {
        const grid = document.getElementById(`tasksGrid-${group.id}`);
        group.tasks.forEach(task => {
            grid.appendChild(buildTaskCard(task, section, onMutate, openTaskModal));
        });
    });
}

/** Show the welcome / empty state with live stats. */
export function showWelcome() {
    breadcrumb.textContent = 'Select a section';

    const name = state.username || 'there';
    const allTasks   = state.sections.flatMap(s => s.tasks);
    const total      = allTasks.length;
    const done       = allTasks.filter(t => t.completed).length;
    const overdue    = allTasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date(new Date().toDateString())).length;
    const rate       = total ? Math.round((done / total) * 100) : 0;

    const statsHtml = total > 0 ? `
        <div class="welcome-stats">
            <div class="welcome-stat">
                <span class="welcome-stat-value">${total}</span>
                <span class="welcome-stat-label">Total tasks</span>
            </div>
            <div class="welcome-stat">
                <span class="welcome-stat-value" style="color:var(--green)">${done}</span>
                <span class="welcome-stat-label">Completed</span>
            </div>
            <div class="welcome-stat">
                <span class="welcome-stat-value" style="color:var(--accent)">${rate}%</span>
                <span class="welcome-stat-label">Done rate</span>
            </div>
            ${overdue > 0 ? `<div class="welcome-stat">
                <span class="welcome-stat-value" style="color:var(--red)">${overdue}</span>
                <span class="welcome-stat-label">Overdue</span>
            </div>` : ''}
        </div>` : '';

    contentArea.innerHTML = `
        <div class="welcome-state">
            <div class="welcome-graphic">✦</div>
            <h1>Hi ${esc(name)}, what are you planning today?</h1>
            <p>Select a section from the sidebar or create a new one to get started.</p>
            ${statsHtml}
        </div>`;
}
