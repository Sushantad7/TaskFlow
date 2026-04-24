/**
 * taskModal.js — New / edit task modal.
 */

import { api } from '../api/api.js';
import { showToast } from './toast.js';
import { openModal, closeModal } from './modals.js';
import { state } from '../utils/state.js';

// ── DOM refs ─────────────────────────────────────────────────
const taskModal         = document.getElementById('taskModal');
const taskModalTitle    = document.getElementById('taskModalTitle');
const taskTitle         = document.getElementById('taskTitle');
const taskDescription   = document.getElementById('taskDescription');
const taskPriority      = document.getElementById('taskPriority');
const taskDueDate       = document.getElementById('taskDueDate');
const taskRecurrence    = document.getElementById('taskRecurrence');
const recurrenceDaysWrap = document.getElementById('recurrenceDaysWrap');
const taskModalSave     = document.getElementById('taskModalSave');
const taskModalCancel   = document.getElementById('taskModalCancel');
const taskModalClose    = document.getElementById('taskModalClose');

let _editingTask = null;

// ── Day picker helpers ────────────────────────────────────────
function getSelectedDays() {
    return [...document.querySelectorAll('#recurrenceDays .day-btn.selected')]
        .map(b => Number(b.dataset.day));
}

function setSelectedDays(days = []) {
    document.querySelectorAll('#recurrenceDays .day-btn').forEach(btn => {
        btn.classList.toggle('selected', days.includes(Number(btn.dataset.day)));
    });
}

function updateDayPickerVisibility() {
    recurrenceDaysWrap.style.display = taskRecurrence.value === 'weekly' ? '' : 'none';
}

/**
 * Open the task modal pre-filled for an edit, or blank for create.
 * @param {Object}  section
 * @param {Object?} task       null → create mode
 */
export function openTaskModal(section, task = null) {
    _editingTask = task ? { ...task, sectionId: section.id } : null;

    taskModalTitle.textContent = task ? 'Edit Task' : 'New Task';
    taskTitle.value         = task ? task.title : '';
    taskDescription.value   = task ? task.description : '';
    taskPriority.value      = task ? task.priority : 'medium';
    taskDueDate.value       = task && task.dueDate ? task.dueDate.substring(0, 10) : '';
    taskRecurrence.value    = task?.recurrence || 'none';
    setSelectedDays(task?.recurrenceDays || []);
    updateDayPickerVisibility();

    taskModal.dataset.sectionId = section.id;
    openModal(taskModal);
    setTimeout(() => taskTitle.focus(), 100);
}

async function _saveTaskModal(onSaved) {
    const title = taskTitle.value.trim();
    const sid   = taskModal.dataset.sectionId;

    if (!title) {
        taskTitle.classList.add('error');
        taskTitle.focus();
        return;
    }
    taskTitle.classList.remove('error');

    const recurrence     = taskRecurrence.value;
    const recurrenceDays = recurrence === 'weekly' ? getSelectedDays() : [];

    const body = {
        title,
        description:  taskDescription.value.trim(),
        priority:     taskPriority.value,
        dueDate:      taskDueDate.value || null,
        recurrence,
        recurrenceDays,
    };

    try {
        if (_editingTask) {
            await api.updateTask(sid, _editingTask.id, body);
            showToast('Task updated ✓', 'success');
        } else {
            await api.createTask(sid, body);
            showToast('Task added ✓', 'success');
        }
        closeModal(taskModal);
        onSaved(sid);
    } catch (e) {
        showToast(e.message, 'error');
    }
}

/** Wire up task modal events — call once on boot. */
export function bindTaskModal(onSaved) {
    taskModalSave.addEventListener('click',   () => _saveTaskModal(onSaved));
    taskModalCancel.addEventListener('click', () => closeModal(taskModal));
    taskModalClose.addEventListener('click',  () => closeModal(taskModal));

    taskRecurrence.addEventListener('change', updateDayPickerVisibility);

    document.querySelectorAll('#recurrenceDays .day-btn').forEach(btn => {
        btn.addEventListener('click', () => btn.classList.toggle('selected'));
    });

    taskTitle.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) _saveTaskModal(onSaved);
    });
    taskTitle.addEventListener('input', () => taskTitle.classList.remove('error'));
    taskModal.addEventListener('click', e => {
        if (e.target === taskModal) closeModal(taskModal);
    });
}
