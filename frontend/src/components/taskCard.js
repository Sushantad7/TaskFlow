/**
 * taskCard.js — Builds and returns a single task card DOM element.
 * Has no direct DOM queries; callers pass in section + task data.
 */

import { esc, getDueBadge } from '../utils/helpers.js';
import { api } from '../api/api.js';
import { showToast } from './toast.js';
import { confirmDelete } from './modals.js';

/**
 * @param {Object}   task
 * @param {Object}   section
 * @param {Function} onMutate  called after any mutation so the parent can re-render
 * @param {Function} openTaskModal  opens the edit-task modal
 * @returns {HTMLElement}
 */
export function buildTaskCard(task, section, onMutate, openTaskModalFn) {
    const priorityColor = {
        high: '#ef4444',
        medium: '#f59e0b',
        low: '#10b981',
    }[task.priority] || '#6366f1';

    const div = document.createElement('div');
    div.className = `task-card${task.completed ? ' completed' : ''}`;
    div.style.setProperty('--priority-color', priorityColor);
    div.dataset.taskId = task.id;

    div.innerHTML = `
      <div class="task-card-top">
        <button class="task-checkbox${task.completed ? ' checked' : ''}"
                title="${task.completed ? 'Mark incomplete' : 'Mark complete'}"
                data-action="toggle">
          ${task.completed ? '✓' : ''}
        </button>
        <div class="task-info">
          <div class="task-title">${esc(task.title)}</div>
          ${task.description ? `<div class="task-desc">${esc(task.description)}</div>` : ''}
        </div>
        <div class="task-card-actions">
          <button class="task-action-btn"        title="Edit task"   data-action="edit">✎</button>
          <button class="task-action-btn delete" title="Delete task" data-action="delete">🗑</button>
        </div>
      </div>
      <div class="task-meta">
        <span class="priority-badge ${task.priority}">${task.priority}</span>
        ${getDueBadge(task.dueDate, task.completed)}
      </div>`;

    // Toggle complete
    div.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
        await api.updateTask(section.id, task.id, { completed: !task.completed });
        onMutate();
    });

    // Edit
    div.querySelector('[data-action="edit"]').addEventListener('click', () => {
        openTaskModalFn(section, task);
    });

    // Delete
    div.querySelector('[data-action="delete"]').addEventListener('click', () => {
        confirmDelete(
            'Delete Task',
            `Delete task "${task.title}"?`,
            async () => {
                await api.deleteTask(section.id, task.id);
                showToast('Task deleted', 'info');
                onMutate();
            }
        );
    });

    return div;
}
