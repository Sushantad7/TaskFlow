/**
 * helpers.js — Pure utility functions with no DOM or state dependencies.
 */

/** Escape HTML special chars to prevent XSS. */
export function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Convert a hex color string to its CSS rgb() equivalent. */
export function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
}

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Build the recurrence badge HTML for a task card. Returns '' when recurrence is none/unset. */
export function getRecurrenceBadge(recurrence, recurrenceDays) {
    if (!recurrence || recurrence === 'none') return '';
    if (recurrence === 'daily') return `<span class="recurrence-badge">↻ Daily</span>`;
    if (recurrence === 'weekly') {
        const days = Array.isArray(recurrenceDays) && recurrenceDays.length
            ? recurrenceDays.map(d => DAY_NAMES[d]).join(' ')
            : 'Weekly';
        return `<span class="recurrence-badge">↻ ${days}</span>`;
    }
    return '';
}

/**
 * Build the due-date badge HTML string for a task card.
 * Returns '' when no due date is set.
 */
export function getDueBadge(dueDate, completed) {
    if (!dueDate) return '';

    // Parse as local midnight to avoid UTC-offset shifting the date
    const due = new Date(dueDate.substring(0, 10) + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diff = Math.ceil((due - today) / 86_400_000);
    let cls = '';

    if (!completed) {
        if (diff < 0) cls = 'overdue';
        else if (diff <= 2) cls = 'due-soon';
    }

    const label =
        diff < 0 ? `${Math.abs(diff)}d overdue`
            : diff === 0 ? 'Today'
                : diff === 1 ? 'Tomorrow'
                    : due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return `<span class="due-date-badge ${cls}">📅 ${label}</span>`;
}
