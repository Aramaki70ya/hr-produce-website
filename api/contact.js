/**
 * Vercel Serverless Function — お問い合わせを Slack Incoming Webhook へ転送
 * 環境変数: SLACK_WEBHOOK_URL（必須）
 */

const MAX_FIELD = 2000;

function truncate(s, max) {
    if (typeof s !== 'string') return '';
    const t = s.trim();
    return t.length > max ? `${t.slice(0, max)}…` : t;
}

function buildSlackPayload(type, data) {
    const isService = type === 'service';
    const title = isService ? 'お問い合わせ（サービス）' : 'お問い合わせ（採用）';

    const fields = isService
        ? [
              ['お名前', data.name],
              ['会社名', data.company],
              ['メール', data.email],
              ['電話', data.phone || '—'],
              ['ご用件', data.subject],
              ['内容', data.message],
          ]
        : [
              ['お名前', data.name],
              ['現在の職種・業界', data.current_job || '—'],
              ['メール', data.email],
              ['電話', data.phone || '—'],
              ['希望する職種', data.desired_role],
              ['メッセージ', data.message || '—'],
          ];

    const blocks = [
        {
            type: 'header',
            text: { type: 'plain_text', text: title, emoji: true },
        },
        {
            type: 'section',
            fields: fields.map(([label, value]) => ({
                type: 'mrkdwn',
                text: `*${label}*\n${truncate(String(value || ''), MAX_FIELD)}`,
            })),
        },
        {
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: `_送信元: HRプロデュースサイト / ${new Date().toISOString()}_`,
                },
            ],
        },
    ];

    return { text: title, blocks };
}

function parseBody(req) {
    const raw = req.body;
    if (raw == null) return {};
    if (typeof raw === 'object' && !Buffer.isBuffer(raw)) return raw;
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw);
        } catch {
            return {};
        }
    }
    return {};
}

module.exports = async (req, res) => {
    Object.entries({
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders(),
    }).forEach(([k, v]) => res.setHeader(k, v));

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook || typeof webhook !== 'string') {
        return res.status(500).json({ ok: false, error: 'Server misconfigured' });
    }

    const body = parseBody(req);
    const { type, website } = body;

    // ハニーポット（ボット対策）— 値が入っていたら送信せず成功を返す
    if (website && String(website).trim() !== '') {
        return res.status(200).json({ ok: true });
    }

    if (type !== 'service' && type !== 'recruit') {
        return res.status(400).json({ ok: false, error: 'Invalid type' });
    }

    let data;
    if (type === 'service') {
        const { name, company, email, phone, subject, message } = body;
        if (!name || !company || !email || !subject || !message) {
            return res.status(400).json({ ok: false, error: 'Missing required fields' });
        }
        data = { name, company, email, phone, subject, message };
    } else {
        const { name, email, phone, current_job, desired_role, message } = body;
        if (!name || !email || !desired_role) {
            return res.status(400).json({ ok: false, error: 'Missing required fields' });
        }
        data = { name, email, phone, current_job, desired_role, message };
    }

    const payload = buildSlackPayload(type, data);

    let slackRes;
    try {
        slackRes = await fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload),
        });
    } catch (e) {
        return res.status(502).json({ ok: false, error: 'Slack request failed' });
    }

    if (!slackRes.ok) {
        const t = await slackRes.text();
        console.error('Slack webhook error', slackRes.status, t);
        return res.status(502).json({ ok: false, error: 'Slack rejected' });
    }

    return res.status(200).json({ ok: true });
};

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}
