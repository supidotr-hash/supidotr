
(function() {
    'use strict';

    function enhanceOrders() {
        const qtys = document.querySelectorAll('._499TxW_qty');
        qtys.forEach(qtyEl => {
            const text = qtyEl.textContent.trim();
            const match = text.match(/\d+/);
            if (match) {
                const count = parseInt(match[0], 10);
                if (count > 1) {
                    qtyEl.classList.add('_custom-qty-highlight');
                }
            }
        });

        const orderRows = document.querySelectorAll('._499TxW_tr');
        orderRows.forEach(row => {
            const numEl = row.querySelector('._499TxW_num');
            if (!numEl) return;
            const orderNum = numEl.textContent.trim();

            const deliveryEl = row.querySelector('._499TxW_subDelivery');
            const deliveryText = deliveryEl ? deliveryEl.textContent.trim() : 'Доставка';

            const nextRow = row.nextElementSibling;
            if (!nextRow || !nextRow.classList.contains('_499TxW_detailRow')) return;

            const detailBox = nextRow.querySelector('._499TxW_detailBox');
            if (!detailBox) return;

            const items = detailBox.querySelectorAll('._499TxW_item');
            items.forEach(item => {
                let barcode = '';
                const idsSpan = item.querySelector('._499TxW_ids');
                if (idsSpan) {
                    const spans = idsSpan.querySelectorAll('span');
                    for (let s of spans) {
                        const txt = s.textContent;
                        if (txt.includes('Ваш код товара')) {
                            barcode = txt.replace('Ваш код товара', '').trim();
                            break;
                        }
                    }
                }

                const qtyEl = item.querySelector('._499TxW_qty');
                const itemTextEl = item.querySelector('._499TxW_itemText');

                const existingBtn = item.querySelector('.custom-item-copy-btn');

                if (barcode && qtyEl && itemTextEl && !existingBtn) {
                    const copyBarcodeBtn = document.createElement('button');
                    copyBarcodeBtn.type = 'button';
                    copyBarcodeBtn.className = 'Az9afq_button Az9afq_ghost Az9afq_sm custom-item-copy-btn';
                    copyBarcodeBtn.innerHTML = `<span class="Az9afq_label">${barcode}</span>`;
                    copyBarcodeBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(barcode);
                    });

                    item.insertBefore(copyBarcodeBtn, itemTextEl);
                }
            });

            const linksContainer = detailBox.querySelector('._499TxW_links');
            const existingOrderBtn = linksContainer ? linksContainer.querySelector('.custom-order-copy-btn') : null;

            if (linksContainer && !existingOrderBtn) {
                const copyOrderBtn = document.createElement('button');
                copyOrderBtn.type = 'button';
                copyOrderBtn.className = 'Az9afq_button Az9afq_ghost Az9afq_sm custom-order-copy-btn';
                copyOrderBtn.innerHTML = `
                    <span class="Az9afq_icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="9" y="9" width="12" height="12" rx="2"></rect><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"></path></svg>
                    </span>
                    <span class="Az9afq_label">1С</span>
                `;
                copyOrderBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const formattedText = `НЕ СОБРАН / Заказ ${orderNum} / ${deliveryText} / БакайСтор`;
                    navigator.clipboard.writeText(formattedText);
                });

                linksContainer.appendChild(copyOrderBtn);
            }
        });
    }

    let timeoutId = null;
    const observer = new MutationObserver(() => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(enhanceOrders, 200);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(enhanceOrders, 300);
    } else {
        window.addEventListener('DOMContentLoaded', () => setTimeout(enhanceOrders, 300));
    }
})();