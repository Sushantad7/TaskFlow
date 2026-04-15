const { createClerkClient } = require('@clerk/backend');

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

function getRemark(rate) {
    if (rate === 100) return { emoji: '🔥', line: 'Flawless day. Every task checked off — that\'s rare, own it.' };
    if (rate >= 80)   return { emoji: '💪', line: 'Almost perfect. You\'re building serious momentum.' };
    if (rate >= 60)   return { emoji: '📈', line: 'Solid progress today. You\'re clearly moving forward.' };
    if (rate >= 40)   return { emoji: '⚡', line: 'Halfway there. Push a little harder tomorrow.' };
    if (rate >= 1)    return { emoji: '🌱', line: 'A slow day — but every step counts. Tomorrow\'s your shot.' };
    return             { emoji: '🌙', line: 'A quiet day. Rest is part of the process. Come back strong.' };
}

function buildHtml({ name, sections, totalTasks, completedTasks, completionRate, date }) {
    const { emoji, line } = getRemark(completionRate);
    const pendingTasks = totalTasks - completedTasks;
    const pendingPct = totalTasks ? Math.max(0, 100 - completionRate) : 0;

    const sectionRows = sections.map(s => {
        const done  = s.tasks.filter(t => t.completed).length;
        const total = s.tasks.length;
        const pct   = total ? Math.round((done / total) * 100) : 0;
        return `<tr>
            <td style="padding:10px 0;border-bottom:1px solid #1e1e38">
                <span style="font-size:18px">${s.icon}</span>
                <span style="margin-left:8px;color:#f0f0ff;font-weight:500">${s.name}</span>
            </td>
            <td style="padding:10px 0;border-bottom:1px solid #1e1e38;text-align:right;color:#9898c8">
                ${done}/${total} · ${pct}%
                <div style="height:5px;background:#1e1e38;border-radius:99px;margin-top:4px">
                    <div style="height:5px;width:${pct}%;background:${s.color};border-radius:99px"></div>
                </div>
            </td>
        </tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#05050e;font-family:Inter,system-ui,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#0a0a12;border-radius:20px;overflow:hidden;border:1px solid #1e1e38">
    <div style="background:linear-gradient(135deg,#6366f1,#818cf8);padding:36px 40px;text-align:center">
      <div style="font-size:36px">✦</div>
      <h1 style="margin:8px 0 4px;color:#fff;font-size:22px;font-weight:700">TaskFlow</h1>
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px">${date}</p>
    </div>
    <div style="padding:36px 40px">
      <h2 style="margin:0 0 6px;color:#f0f0ff;font-size:18px">Hi ${name},</h2>
      <p style="margin:0 0 28px;color:#9898c8;font-size:14px">Here's your daily task summary.</p>
      <div style="background:#111120;border-radius:14px;padding:24px;text-align:center;margin-bottom:28px">
        <div style="font-size:48px;font-weight:800;color:#6366f1;line-height:1">${completionRate}%</div>
        <div style="color:#9898c8;font-size:13px;margin-top:6px">${completedTasks} of ${totalTasks} tasks completed</div>
        <div style="margin-top:16px;font-size:22px">${emoji}</div>
        <div style="margin-top:8px;color:#f0f0ff;font-size:14px;font-style:italic">"${line}"</div>
      </div>
      ${totalTasks > 0 ? `
      <div style="background:#111120;border:1px solid #1e1e38;border-radius:14px;padding:18px 16px;margin-bottom:24px">
        <div style="color:#f0f0ff;font-size:13px;font-weight:600;margin-bottom:10px;letter-spacing:.3px">Progress Graph</div>
        <div style="height:14px;border-radius:99px;overflow:hidden;background:#1c1c34;display:flex">
          <div style="width:${completionRate}%;background:linear-gradient(90deg,#10b981,#34d399)"></div>
          <div style="width:${pendingPct}%;background:linear-gradient(90deg,#ef4444,#f97316)"></div>
        </div>
        <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:10px;color:#9898c8;font-size:12px">
          <span>✅ Completed: <strong style="color:#f0f0ff">${completedTasks}</strong></span>
          <span>🕒 Pending: <strong style="color:#f0f0ff">${pendingTasks}</strong></span>
          <span>📌 Total: <strong style="color:#f0f0ff">${totalTasks}</strong></span>
        </div>
      </div>` : ''}
      ${totalTasks > 0 ? `
      <h3 style="margin:0 0 12px;color:#f0f0ff;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:.5px">Section Breakdown</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px">${sectionRows}</table>` : ''}
      ${pendingTasks > 0
        ? `<div style="margin-top:24px;background:#16162a;border-left:3px solid #6366f1;padding:14px 16px;border-radius:0 8px 8px 0">
             <span style="color:#9898c8;font-size:13px">📌 <strong style="color:#f0f0ff">${pendingTasks} task${pendingTasks !== 1 ? 's' : ''}</strong> still pending. Still the day is left, you can push yourself. All the best.</span>
           </div>`
        : `<div style="margin-top:24px;background:#16162a;border-left:3px solid #10b981;padding:14px 16px;border-radius:0 8px 8px 0">
             <span style="color:#9898c8;font-size:13px">🎉 All tasks done across every section. Exceptional.</span>
           </div>`}
    </div>
    <div style="padding:20px 40px;border-top:1px solid #1e1e38;text-align:center">
      <p style="margin:0;color:#5c5c8a;font-size:12px">Sent by TaskFlow · your personal task manager</p>
    </div>
  </div>
</body>
</html>`;
}

async function getUserEmail(userId) {
    const user = await clerk.users.getUser(userId);
    const primary = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
    return {
        email: primary?.emailAddress,
        name:  user.firstName || user.username || primary?.emailAddress?.split('@')[0] || 'there',
    };
}

exports.sendDailySummary = async ({ userId, displayName, sections }) => {
    const { email, name } = await getUserEmail(userId);
    if (!email) throw new Error('No verified email address found for this user in Clerk');

    const allTasks       = sections.flatMap(s => s.tasks);
    const totalTasks     = allTasks.length;
    const completedTasks = allTasks.filter(t => t.completed).length;
    const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const { emoji }      = getRemark(completionRate);

    const date = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const html = buildHtml({
        name: displayName || name,
        sections, totalTasks, completedTasks, completionRate, date,
    });

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: 'TaskFlow <onboarding@resend.dev>',
            to:   [email],
            subject: `${emoji} Your TaskFlow Summary — ${completionRate}% done · ${date}`,
            html,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const details = err.message || err.error || JSON.stringify(err);
        throw new Error(`Resend API error (${res.status}): ${details}`);
    }
};
