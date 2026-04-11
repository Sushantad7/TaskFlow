/**
 * sidebar.js — Sidebar rendering and section-modal logic.
 *
 * Responsibilities:
 *  - Render the stats strip and nav list
 *  - Open/save/close the "New / Edit Section" modal
 *  - Build the emoji grid and color swatches (run once on init)
 */

import { api } from '../api/api.js';
import { esc, hexToRgb } from '../utils/helpers.js';
import { showToast } from './toast.js';
import { openModal, closeModal, confirmDelete } from './modals.js';
import { state } from '../utils/state.js';

// ── Emoji & color palettes ───────────────────────────────────
const EMOJIS = ['📋', '🏠', '💼', '🛒', '🎯', '📚', '💪', '🎨', '🚀', '🎮', '🌱', '✈️', '💡', '🔬', '🎵', '🍕', '📐', '🏋️', '📎', '🌟'];
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#84cc16', '#a855f7'];

// ── DOM refs ─────────────────────────────────────────────────
const sectionList = document.getElementById('sectionList');
const sidebarStats = document.getElementById('sidebarStats');

const sectionModal = document.getElementById('sectionModal');
const sectionModalTitle = document.getElementById('sectionModalTitle');
const sectionName = document.getElementById('sectionName');
const sectionIconValue = document.getElementById('sectionIconValue');
const sectionColorValue = document.getElementById('sectionColorValue');
const emojiGrid = document.getElementById('emojiGrid');
const colorSwatches = document.getElementById('colorSwatches');
const sectionModalSave = document.getElementById('sectionModalSave');
const sectionModalCancel = document.getElementById('sectionModalCancel');
const sectionModalClose = document.getElementById('sectionModalClose');

let editingSection = null;

// ── One-time grid builders ───────────────────────────────────
export function buildEmojiGrid() {
    EMOJIS.forEach(e => {
        const btn = document.createElement('button');
        btn.className = `emoji-btn${e === '📋' ? ' selected' : ''}`;
        btn.textContent = e;
        btn.type = 'button';
        btn.addEventListener('click', () => {
            document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            sectionIconValue.value = e;
        });
        emojiGrid.appendChild(btn);
    });
}

export function buildColorSwatches() {
    COLORS.forEach(c => {
        const sw = document.createElement('button');
        sw.className = `color-swatch${c === '#6366f1' ? ' selected' : ''}`;
        sw.style.background = c;
        sw.style.color = c;
        sw.type = 'button';
        sw.title = c;
        sw.addEventListener('click', () => {
            document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('selected'));
            sw.classList.add('selected');
            sectionColorValue.value = c;
        });
        colorSwatches.appendChild(sw);
    });
}

// ── Sidebar render ───────────────────────────────────────────
export function renderSidebar(sections, onSelectSection) {
    // Stats
    const total = sections.reduce((a, s) => a + s.tasks.length, 0);
    const completed = sections.reduce((a, s) => a + s.tasks.filter(t => t.completed).length, 0);

    sidebarStats.innerHTML = `
      <div class="stat-chip">
        <span class="stat-value">${sections.length}</span>
        <span class="stat-label">Sections</span>
      </div>
      <div class="stat-chip">
        <span class="stat-value">${total}</span>
        <span class="stat-label">Tasks</span>
      </div>
      <div class="stat-chip">
        <span class="stat-value">${completed}</span>
        <span class="stat-label">Done</span>
      </div>`;

    // Nav items
    sectionList.innerHTML = '';
    sections.forEach(s => {
        const pending = s.tasks.filter(t => !t.completed).length;
        const li = document.createElement('li');
        li.className = `nav-item${s.id === state.activeSectionId ? ' active' : ''}`;
        li.style.setProperty('--section-color', s.color);
        li.dataset.id = s.id;
        li.innerHTML = `
          <span class="nav-item-icon">${s.icon}</span>
          <span class="nav-item-name">${esc(s.name)}</span>
          <span class="nav-item-count">${pending}</span>
          <span class="nav-item-actions">
            <button class="nav-action-btn edit"   title="Edit Section"   data-id="${s.id}">✎</button>
            <button class="nav-action-btn delete" title="Delete Section" data-id="${s.id}">🗑</button>
          </span>`;

        li.addEventListener('click', e => {
            if (e.target.closest('.nav-item-actions')) return;
            onSelectSection(s.id);
        });

        li.querySelector('.nav-action-btn.edit').addEventListener('click', e => {
            e.stopPropagation();
            openSectionModal(s);
        });

        li.querySelector('.nav-action-btn.delete').addEventListener('click', async e => {
            e.stopPropagation();
            confirmDelete(
                'Delete Section',
                `Delete "${s.name}" and all its tasks? This cannot be undone.`,
                async () => {
                    await api.deleteSection(s.id);
                    if (state.activeSectionId === s.id) state.activeSectionId = null;
                    showToast(`Section "${s.name}" deleted`, 'info');
                }
            );
        });

        sectionList.appendChild(li);
    });
}

// ── Section modal ────────────────────────────────────────────
export function openSectionModal(section = null) {
    editingSection = section;
    sectionModalTitle.textContent = section ? 'Edit Section' : 'New Section';
    sectionName.value = section ? section.name : '';

    const icon = section ? section.icon : '📋';
    const color = section ? section.color : '#6366f1';
    sectionIconValue.value = icon;
    sectionColorValue.value = color;

    document.querySelectorAll('.emoji-btn').forEach(b =>
        b.classList.toggle('selected', b.textContent === icon)
    );
    document.querySelectorAll('.color-swatch').forEach(b =>
        b.classList.toggle('selected', b.style.background === hexToRgb(color) || b.title === color)
    );

    openModal(sectionModal);
    setTimeout(() => sectionName.focus(), 100);
}

export async function saveSectionModal(onSaved) {
    const name = sectionName.value.trim();
    const icon = sectionIconValue.value;
    const color = sectionColorValue.value;

    if (!name) {
        sectionName.classList.add('error');
        sectionName.focus();
        return;
    }
    sectionName.classList.remove('error');

    try {
        let newId = state.activeSectionId;
        if (editingSection) {
            await api.updateSection(editingSection.id, { name, icon, color });
            showToast('Section updated ✓', 'success');
        } else {
            const created = await api.createSection({ name, icon, color });
            newId = created.id;
            showToast(`Section "${name}" created ✓`, 'success');
        }
        closeModal(sectionModal);
        await onSaved(newId);
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// ── Bind sidebar-specific events ─────────────────────────────
export function bindSidebarEvents(onSaved) {
    document.getElementById('btnAddSection').addEventListener('click', () => openSectionModal());
    sectionModalSave.addEventListener('click', () => saveSectionModal(onSaved));
    sectionModalCancel.addEventListener('click', () => closeModal(sectionModal));
    sectionModalClose.addEventListener('click', () => closeModal(sectionModal));
    sectionName.addEventListener('keydown', e => { if (e.key === 'Enter') saveSectionModal(onSaved); });
    sectionModal.addEventListener('click', e => { if (e.target === sectionModal) closeModal(sectionModal); });
    sectionName.addEventListener('input', () => sectionName.classList.remove('error'));
}
