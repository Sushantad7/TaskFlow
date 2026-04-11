/**
 * modals.js — Modal open/close helpers + delete-confirm modal logic.
 */

import { showToast } from './toast.js';

// ── Generic helpers ──────────────────────────────────────────
export function openModal(modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

export function closeModal(modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

export function closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
}

// ── Delete confirm modal ─────────────────────────────────────
let _deleteCallback = null;

const deleteModal = document.getElementById('deleteModal');
const deleteTitle = document.getElementById('deleteModalTitle');
const deleteMessage = document.getElementById('deleteModalMessage');
const deleteConfirm = document.getElementById('deleteModalConfirm');
const deleteCancel = document.getElementById('deleteModalCancel');
const deleteClose = document.getElementById('deleteModalClose');

/**
 * Show the delete-confirmation dialog.
 * @param {string}   title
 * @param {string}   message
 * @param {Function} onConfirm  async callback executed on confirm
 */
export function confirmDelete(title, message, onConfirm) {
    deleteTitle.textContent = title;
    deleteMessage.textContent = message;
    _deleteCallback = onConfirm;
    openModal(deleteModal);
}

/**
 * Wire up the delete modal buttons — call once on boot.
 * The optional onAfterDelete hook lets main.js re-render after deletion.
 * @param {Function} onAfterDelete
 */
export function bindDeleteModal(onAfterDelete) {
    deleteConfirm.addEventListener('click', async () => {
        if (_deleteCallback) {
            try {
                await _deleteCallback();
                if (onAfterDelete) await onAfterDelete();
            } catch (e) {
                showToast(e.message, 'error');
            }
            _deleteCallback = null;
        }
        closeModal(deleteModal);
    });

    deleteCancel.addEventListener('click', () => closeModal(deleteModal));
    deleteClose.addEventListener('click', () => closeModal(deleteModal));

    deleteModal.addEventListener('click', e => {
        if (e.target === deleteModal) closeModal(deleteModal);
    });
}
