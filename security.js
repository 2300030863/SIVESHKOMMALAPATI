/**
 * ==============================================================================
 * SIVESH PORTFOLIO - APPLICATION SECURITY FIREWALL & DATA LOSS PREVENTION (WAF)
 * ==============================================================================
 * Protection layers:
 * 1. Web Application Firewall (WAF) - Client-side payload inspection
 * 2. Cross-Site Scripting (XSS) & Self-XSS (Pastejacking) Protection
 * 3. Anti-Clickjacking Frame Buster (UI Redressing Defense)
 * 4. Data Loss Prevention (DLP) - Prevents leaking private keys, credentials & cards
 * 5. Rate Limiting & Anti-Flood Engine - Mitigates automated bot spam & DoS
 * 6. Reverse Tabnabbing Protection on all external links
 */

(function () {
    'use strict';

    // ── 1. Anti-Clickjacking Frame Buster ──────────────────────────────────────
    try {
        if (window.top !== window.self) {
            try {
                if (window.top.location.hostname !== window.self.location.hostname) {
                    window.top.location = window.self.location.href;
                }
            } catch (e) {
                // Cross-origin iframe detected: attempt top window redirection
                window.top.location = window.self.location.href;
            }
        }
    } catch (e) {
        // Fallback for strict sandbox iframe environments
    }

    // ── 2. Console Self-XSS & Anti-Tampering Notice ───────────────────────────
    if (typeof console !== 'undefined') {
        const titleStyle = 'color: #D4AF37; font-size: 18px; font-weight: bold; background: #0b0f19; padding: 4px 10px; border-radius: 4px; border: 1px solid #D4AF37;';
        const warningStyle = 'color: #ef4444; font-size: 13px; font-weight: bold;';
        const textStyle = 'color: #94a3b8; font-size: 11px;';
        
        setTimeout(() => {
            console.log('%c🛡️ SIVESH SECURITY FIREWALL ACTIVE', titleStyle);
            console.log('%cCAUTION: This browser console is intended for developer diagnostics only.', warningStyle);
            console.log('%cDo NOT paste scripts, access tokens, or sensitive credentials here (prevents Self-XSS).', textStyle);
        }, 500);
    }

    // ── 3. Application Security Firewall (WAF & DLP) ──────────────────────────
    const SecurityFirewall = {
        _submissionHistory: [],
        _lastSubmitTime: 0,
        _pageLoadTime: Date.now(),
        _hasHumanInteraction: false,

        PATTERNS: {
            xss: /<script[\s\S]*?>|<\/script>|javascript:|onerror\s*=|onload\s*=|onclick\s*=|eval\(|<iframe|<object|<embed|data:text\/html/i,
            sqli: /(\b(UNION\s+(ALL\s+)?SELECT|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|DROP\s+(TABLE|DATABASE)|ALTER\s+TABLE|OR\s+['"]?1['"]?\s*=\s*['"]?1)\b|--\s*$|;\s*SHUTDOWN\b)/i,
            cmdInjection: /(\b(cmd\.exe|powershell|bin\/(bash|sh|zsh)|curl\s+https?:|wget\s+https?:|rm\s+-rf)\b|\|\||\&\&|;\s*(rm|cat|ls|whoami|id)\b)/i,
            pathTraversal: /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\/|\.\.%2f)/i,
            privateKey: /-----BEGIN\s+(RSA|EC|DSA|OPENSSH|PGP|ENCRYPTED)?\s*PRIVATE\s+KEY-----/i,
            apiKey: /(sk_live_[0-9a-zA-Z]{24,}|ghp_[0-9a-zA-Z]{36}|xox[baprs]-[0-9a-zA-Z]{10,48}|AIza[0-9A-Za-z-_]{35})/i,
            creditCard: /\b(?:\d{4}[ -]?){3}\d{4}\b/
        },

        init() {
            // Track legitimate human presence
            const markHuman = () => {
                this._hasHumanInteraction = true;
                window.removeEventListener('mousemove', markHuman);
                window.removeEventListener('keydown', markHuman);
                window.removeEventListener('touchstart', markHuman);
                window.removeEventListener('scroll', markHuman);
            };
            window.addEventListener('mousemove', markHuman, { passive: true });
            window.addEventListener('keydown', markHuman, { passive: true });
            window.addEventListener('touchstart', markHuman, { passive: true });
            window.addEventListener('scroll', markHuman, { passive: true });

            // Audit external links for reverse tabnabbing defense
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.auditExternalLinks());
            } else {
                this.auditExternalLinks();
            }
        },

        auditExternalLinks() {
            try {
                const links = document.querySelectorAll('a[href^="http://"], a[href^="https://"]');
                links.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && !href.includes(window.location.hostname)) {
                        link.setAttribute('rel', 'noopener noreferrer');
                    }
                });
            } catch (e) {}
        },

        sanitize(str) {
            if (typeof str !== 'string') return '';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\0/g, '') // Strip null bytes
                .trim();
        },

        inspect(text, fieldName = 'input') {
            if (!text || typeof text !== 'string') return { valid: true };

            // 1. Data Loss Prevention (DLP) Checks
            if (this.PATTERNS.privateKey.test(text)) {
                return {
                    valid: false,
                    reason: 'Private encryption keys cannot be transmitted in form inputs.'
                };
            }
            if (this.PATTERNS.apiKey.test(text)) {
                return {
                    valid: false,
                    reason: 'Live API tokens or private credentials detected. Blocked for privacy.'
                };
            }
            if (this.PATTERNS.creditCard.test(text)) {
                return {
                    valid: false,
                    reason: 'Payment card numbers are not accepted in this form.'
                };
            }

            // 2. Web Application Firewall (WAF) Payload Checks
            if (this.PATTERNS.xss.test(text)) {
                return {
                    valid: false,
                    reason: 'Potentially malicious script or HTML tags detected.'
                };
            }
            if (this.PATTERNS.sqli.test(text)) {
                return {
                    valid: false,
                    reason: 'Suspicious SQL command sequence detected.'
                };
            }
            if (this.PATTERNS.cmdInjection.test(text)) {
                return {
                    valid: false,
                    reason: 'Suspicious system command execution pattern detected.'
                };
            }
            if (this.PATTERNS.pathTraversal.test(text)) {
                return {
                    valid: false,
                    reason: 'Path traversal sequence detected.'
                };
            }

            return { valid: true };
        },

        checkRateLimit() {
            const now = Date.now();

            // Check bot speed (must take at least 1.2s from page load with human interaction)
            if (now - this._pageLoadTime < 1200 && !this._hasHumanInteraction) {
                return {
                    allowed: false,
                    message: 'Automated request detected. Please wait a moment before sending.'
                };
            }

            // Check minimum cooldown between messages (10 seconds)
            if (now - this._lastSubmitTime < 10000) {
                const waitSec = Math.ceil((10000 - (now - this._lastSubmitTime)) / 1000);
                return {
                    allowed: false,
                    message: `Please wait ${waitSec} second${waitSec > 1 ? 's' : ''} before sending another message.`
                };
            }

            // Clean history older than 10 minutes
            this._submissionHistory = this._submissionHistory.filter(t => now - t < 600000);

            // Maximum 4 messages per 10 minutes
            if (this._submissionHistory.length >= 4) {
                return {
                    allowed: false,
                    message: 'Submission limit reached (maximum 4 messages per 10 minutes). Please try again later.'
                };
            }

            return { allowed: true };
        },

        recordSubmission() {
            const now = Date.now();
            this._lastSubmitTime = now;
            this._submissionHistory.push(now);
        }
    };

    SecurityFirewall.init();
    window.SecurityFirewall = SecurityFirewall;
})();

