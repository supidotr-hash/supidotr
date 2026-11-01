(function() {
    'use strict';

    const phoneRegex = /^\+\d[\d\s\-()]{7,}\d$/;

    if (!document.getElementById('fb-phone-copier-styles')) {
        const style = document.createElement('style');
        style.id = 'fb-phone-copier-styles';
        style.innerHTML = `
            .fb-phone-copy-btn {
                display: inline-flex !important;
                align-items: center !important;
                gap: 6px !important;
                background-color: #f0f2f5 !important;
                color: #050505 !important;
                padding: 4px 10px !important;
                border-radius: 8px !important;
                border: 1px solid #e4e6eb !important;
                font-family: inherit !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                user-select: none !important;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
            }

            .fb-phone-copy-btn:hover {
                background-color: #e4e6eb !important;
                border-color: #d8dadf !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08) !important;
            }

            .fb-phone-copy-btn:active {
                transform: translateY(0) scale(0.97) !important;
                background-color: #d8dadf !important;
                box-shadow: none !important;
            }

            .fb-phone-copy-btn svg {
                width: 14px;
                height: 14px;
                fill: #65676b;
                flex-shrink: 0;
                transition: fill 0.2s ease;
            }

            .fb-phone-copy-btn:hover svg {
                fill: #050505;
            }
        `;
        document.head.appendChild(style);
    }

    function processElements() {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;

        while (node = walker.nextNode()) {
            const rawText = node.nodeValue.trim();

            if (phoneRegex.test(rawText)) {
                const parent = node.parentElement;
                if (!parent) continue;

                const cleanNumber = rawText.replace(/\s+/g, '');

                if (parent.classList.contains('fb-phone-copy-btn')) {
                    if (parent.dataset.cleanPhone !== cleanNumber) {
                        parent.dataset.cleanPhone = cleanNumber;
                    }
                    continue;
                }

                parent.classList.add('fb-phone-copy-btn');
                parent.dataset.cleanPhone = cleanNumber;
                parent.title = "Скопировать";
            }
        }
    }

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.fb-phone-copy-btn');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();

            const cleanNumber = btn.dataset.cleanPhone;
            if (cleanNumber) {
                navigator.clipboard.writeText(cleanNumber).catch(err => {
                    console.error('Не удалось скопировать номер:', err);
                });
            }
        }
    }, true);

    const observer = new MutationObserver(() => {
        processElements();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    processElements();
})();