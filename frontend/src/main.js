
import './index.css';
import { Clerk } from '@clerk/clerk-js';
import { api, setTokenGetter } from './api/api.js';
import { state } from './utils/state.js';
import { showToast } from './components/toast.js';
import { bindDeleteModal, closeAllModals } from './components/modals.js';
import { buildEmojiGrid, buildColorSwatches, renderSidebar, bindSidebarEvents } from './components/sidebar.js';
import { renderSection, showWelcome } from './components/section.js';
import { openTaskModal, bindTaskModal } from './components/taskModal.js';
import { openSettings, bindSettings } from './components/settings.js';


function initTheme() {
    const saved = localStorage.getItem('taskflow-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('taskflow-theme', next);
}


async function loadSections() {
    try {
        state.sections = await api.getSections();
        renderSidebar(state.sections, selectSection);

        if (state.activeSectionId) {
            const still = state.sections.find(s => s.id === state.activeSectionId);
            still ? renderSection(still, onMutate, openTaskModal) : showWelcome();
        }
    } catch {
        showToast('Could not reach the server. Is the backend running?', 'error');
    }
}

/** Re-fetch everything, then re-render the active section if one is selected. */
async function onMutate() {
    state.sections = await api.getSections();
    renderSidebar(state.sections, selectSection);

    if (state.activeSectionId) {
        const sec = state.sections.find(s => s.id === state.activeSectionId);
        sec ? renderSection(sec, onMutate, openTaskModal) : showWelcome();
    }
}

//  SECTION SELECTION
function selectSection(id) {
    state.activeSectionId = id;
    state.taskFilter = 'all';
    state.taskSearch = '';
    closeMobileSidebar();

    renderSidebar(state.sections, selectSection);
    const section = state.sections.find(s => s.id === id);
    if (section) renderSection(section, onMutate, openTaskModal);
}

// 
//  MOBILE SIDEBAR
// 
const sidebar = document.getElementById('sidebar');
function openMobileSidebar() { sidebar.classList.add('open'); }
function closeMobileSidebar() { sidebar.classList.remove('open'); }

// 
//  GLOBAL EVENT BINDINGS
// 
function bindGlobalEvents() {
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    document.getElementById('btnAddTask').addEventListener('click', () => {
        const sec = state.sections.find(s => s.id === state.activeSectionId);
        if (sec) openTaskModal(sec);
    });

    document.getElementById('mobileMenuBtn').addEventListener('click', openMobileSidebar);
    document.getElementById('sidebarToggle').addEventListener('click', closeMobileSidebar);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeAllModals();
    });
}

//  BOOT
async function initApp(clerk) {
    initTheme();

    // Wire Clerk session token into every API call
    setTokenGetter(() => clerk.session?.getToken() ?? null);

    // Store display name for the welcome screen
    state.username = clerk.user?.firstName || clerk.user?.username
        || clerk.user?.primaryEmailAddress?.emailAddress?.split('@')[0]
        || 'there';

    // Render user email + sign-out button in topbar
    const userBtnEl = document.getElementById('userButtonContainer');
    if (userBtnEl) {
        const email = clerk.user?.primaryEmailAddress?.emailAddress || '';
        userBtnEl.innerHTML = `
            <span class="user-email">${email}</span>
            <button class="btn-signout" id="btnSignOut">Sign out</button>
        `;
        document.getElementById('btnSignOut').addEventListener('click', () => {
            clerk.signOut().then(() => clerk.redirectToSignIn());
        });
    }

    const sb = document.getElementById('sidebar');
    const mc = document.getElementById('mainContent');
    if (sb) sb.style.display = 'flex';
    if (mc) mc.style.display = 'flex';

    buildEmojiGrid();
    buildColorSwatches();
    bindGlobalEvents();

    bindSidebarEvents(async (newActiveId) => {
        if (newActiveId) state.activeSectionId = newActiveId;
        await onMutate();
    });

    bindTaskModal(async (sid) => {
        state.sections = await api.getSections();
        renderSidebar(state.sections, selectSection);
        const sec = state.sections.find(s => s.id === sid);
        if (sec) renderSection(sec, onMutate, openTaskModal);
    });

    bindDeleteModal(async () => {
        await onMutate();
        if (!state.activeSectionId) showWelcome();
    });

    bindSettings();
    document.getElementById('btnSettings').addEventListener('click', openSettings);

    await loadSections();
}

async function init() {
    initTheme();

    const clerk = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
    await clerk.load();

    if (clerk.user) {
        await initApp(clerk);
    } else {
        await clerk.redirectToSignIn({ redirectUrl: window.location.href });
    }
}

init();
