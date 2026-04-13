import { api } from '../api/api.js';
import { showToast } from './toast.js';
import { openModal, closeModal } from './modals.js';

const modal = document.getElementById('settingsModal');
const form = {
    enabled:     () => document.getElementById('settingEnabled'),
    displayName: () => document.getElementById('settingName'),
    sendHour:    () => document.getElementById('settingHour'),
    sendMinute:  () => document.getElementById('settingMinute'),
};

export async function openSettings() {
    try {
        const s = await api.getEmailSettings();
        form.enabled().checked    = s.enabled;
        form.displayName().value  = s.displayName || '';
        form.sendHour().value     = s.sendHour  ?? 12;
        form.sendMinute().value   = s.sendMinute ?? 45;
    } catch {
        showToast('Could not load settings', 'error');
    }
    openModal(modal);
}

export function bindSettings() {
    document.getElementById('settingsModalClose').addEventListener('click',   () => closeModal(modal));
    document.getElementById('settingsModalCancel').addEventListener('click',  () => closeModal(modal));
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal); });

    document.getElementById('settingsModalSave').addEventListener('click', async () => {
        try {
            await api.saveEmailSettings({
                enabled:     form.enabled().checked,
                displayName: form.displayName().value.trim(),
                sendHour:    Number(form.sendHour().value),
                sendMinute:  Number(form.sendMinute().value),
            });
            showToast('Settings saved ✓', 'success');
            closeModal(modal);
        } catch (e) {
            showToast(e.message, 'error');
        }
    });

    document.getElementById('btnTestEmail').addEventListener('click', async () => {
        const btn = document.getElementById('btnTestEmail');
        btn.disabled = true;
        btn.textContent = 'Sending…';
        try {
            await api.sendTestEmail();
            showToast('Test email sent! Check your inbox.', 'success');
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Send test email now';
        }
    });
}
