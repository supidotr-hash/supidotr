
























































































































































































































































































































































































































































































































































































































































































(async () => {
    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).catch(() => fallbackCopyText(text));
        } else {
            return new Promise((resolve, reject) => {
                if (fallbackCopyText(text)) resolve();
                else reject(new Error('Копирование не удалось'));
            });
        }
    }

    function fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        let successful = false;
        try {
            successful = document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy error:', err);
        }
        document.body.removeChild(textArea);
        return successful;
    }

    // 1. Логика для страницы корзины (скриншот)
    if (window.location.href.startsWith("https://dns-shop.kg/cart/")) {
        const btn = document.createElement('div');
        btn.textContent = 'Сделать скрин';
        btn.classList = 'cart-page__btn-create-order orange-button';
        document.querySelector('.cart-page__total-amount-wrapper')?.appendChild(btn);
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.13/dist/html2canvas-pro.min.js';
        script.async = true;
        
        await new Promise(resolve => {
            script.onload = resolve;
            document.head.appendChild(script);
        });
        
        document.querySelectorAll('img[src*="c.dns-shop.ru"]').forEach(img => {
            const url = img.src.replace(/^https?:\/\//, '');
            img.src = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=jpg`;
        });
    
        btn.addEventListener('click', async () => {
            const oBody = document.body;
            oBody.classList.remove('dark');
            const body = oBody.cloneNode(true);
            const dns = body.querySelector('.header__logo');
            const clone = body.querySelector('.cart-page__products-list');
            const total = body.querySelector('.cart-page__total-amount-wrapper');
            const temp = document.createElement('div');
            temp.classList.add('tempScreen');
            temp.append(dns, clone, total);
            oBody.appendChild(temp);
            clone.querySelectorAll('.cart-page__product-count-input').forEach(el => el.textContent += ' шт.');
            
            html2canvas(temp, { 
                useCORS: true,
                scale: 2,
            })
            .then(canvas => {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = 'screenshot.png';
                oBody.appendChild(link);
                link.click();
                oBody.removeChild(link);
            })
            .catch(err => console.error('error:', err));
            temp.remove();
        });
    }

    // Вспомогательная функция сбора филиалов для модалок
    function getBranchesData() {
        const currentItems = document.querySelectorAll('.product-avail-modal__branch-item');
        const branches = [];

        currentItems.forEach(item => {
            const address = item.querySelector('.product-avail-modal__branch-address');
            const stockSpan = item.querySelector('.product-avail-modal__branch-product-avails-count span');

            if (!address || !stockSpan) return;

            let addressText = address.textContent.replace(/\s+/g, ' ').trim();
            const countMatch = stockSpan.textContent.match(/\d+/);
            
            if (!countMatch) return;

            const count = countMatch[0];
            addressText = addressText.replace(/,\s*$/, '');

            branches.push({ address: addressText, count: count });
        });

        return branches;
    }

    // 2. Логика для модального окна наличия по филиалам
    const modalObserver = new MutationObserver(() => {
        const items = document.querySelectorAll('.product-avail-modal__branch-item');
        if (!items.length) return;
        
        if (document.querySelector('.product-avail-modal__filter.custom-copy-btn')) return;

        const filterBlock = document.querySelector('.product-avail-modal__filters-block');
        if (!filterBlock) return;

        const btnAvail = document.createElement('div');
        btnAvail.classList = 'product-avail-modal__filter custom-copy-btn';
        btnAvail.style.cursor = 'pointer';
        const titleAvail = document.createElement('span');
        titleAvail.textContent = 'Наличие';
        titleAvail.classList = 'ui-checkbox__title';
        btnAvail.appendChild(titleAvail);

        const btnPickup = document.createElement('div');
        btnPickup.classList = 'product-avail-modal__filter custom-copy-btn';
        btnPickup.style.cursor = 'pointer';
        const titlePickup = document.createElement('span');
        titlePickup.textContent = 'Самовывоз';
        titlePickup.classList = 'ui-checkbox__title';
        btnPickup.appendChild(titlePickup);

        filterBlock.appendChild(btnAvail);
        filterBlock.appendChild(btnPickup);

        btnAvail.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const branches = getBranchesData();
            const countBranches = branches.length;
            const shopWord = countBranches === 1 ? '1 магазине' : `${countBranches} магазинах`;
            const branchLines = branches.map(b => `* ${b.address}, - ${b.count}шт.`);

            const fullText = 
`У нас на сайте все цены и наличия актуальные.
Вы всегда можете посмотреть наличие в каком филиале и если нажмёте "В наличии в ${shopWord}"
Товары есть в наличии:
${branchLines.join('\n')}`;

            try {
                await copyToClipboard(fullText);
                titleAvail.textContent = 'Скопировано!';
                setTimeout(() => titleAvail.textContent = 'Наличие', 1500);
            } catch (err) {
                console.error('Ошибка копирования:', err);
            }
        }, true);

        btnPickup.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const branches = getBranchesData();
            const branchLines = branches.map(b => `* ${b.address}`);

            const fullText = 
`Самовывоз:
${branchLines.join('\n')}`;

            try {
                await copyToClipboard(fullText);
                titlePickup.textContent = 'Скопировано!';
                setTimeout(() => titlePickup.textContent = 'Самовывоз', 1500);
            } catch (err) {
                console.error('Ошибка копирования:', err);
            }
        }, true);
    });

    modalObserver.observe(document.body, { childList: true, subtree: true });

    // 3. Логика для страницы списка магазинов (/shops/)
    if (window.location.href.includes('/shops/')) {
        
        const getCardData = (li) => {
            const text = li.innerText || '';
            const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
            
            const name = lines[0] || '';
            const phone = lines.find(l => l.includes('+996')) || '';
            const rawAddr = lines.find(l => l.toLowerCase().includes('адрес') || l.toLowerCase().includes('ул.')) || lines[1] || '';
            const address = rawAddr.replace(/^адрес:\s*/i, '').replace(/,\s*$/, '').trim();

            return { name, address, phone };
        };

        const getOnlyShopsData = () => {
            const results = [];
            const shopCards = document.querySelectorAll('.city-shops__block-shops_list li, .city-shops__item, .shop-card');

            shopCards.forEach(card => {
                const text = card.innerText || '';
                if (!text.includes('+996')) return;

                const data = getCardData(card);
                if (data.name && data.address && !results.some(s => s.address === data.address)) {
                    results.push(data);
                }
            });

            return results;
        };

        const updateShopsPage = () => {
            const shopItems = document.querySelectorAll('.city-shops__block-shops_list li, .city-shops__item, .shop-card');
            
            shopItems.forEach(li => {
                const data = getCardData(li);
                if (!data.address && !data.phone) return;

                li.querySelectorAll('*').forEach(el => {
                    if (el.children.length > 0) return; 

                    const text = el.textContent.trim();

                    // Клик по номеру телефона
                    if (text.includes('+996') && !el.dataset.clickBound) {
                        el.dataset.clickBound = 'true';
                        el.style.cursor = 'pointer';
                        
                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copyToClipboard(data.phone);
                        }, true);
                    }

                    // Клик по адресу
                    if ((text.toLowerCase().includes('адрес:') || text.toLowerCase().includes('ул.')) && !el.dataset.clickBound) {
                        el.dataset.clickBound = 'true';
                        el.style.cursor = 'pointer';
                        
                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copyToClipboard(data.address);
                        }, true);
                    }
                });
            });

            // Верхняя кнопка общего сбора
            const h1 = document.querySelector('h1');
            if (!h1) return;

            let btn = document.querySelector('#copy-all-shops-btn');

            if (!btn) {
                const btnWrapper = document.createElement('div');
                btnWrapper.style.margin = '15px 0 20px 0';

                btn = document.createElement('button');
                btn.id = 'copy-all-shops-btn';
                btn.textContent = 'Скопировать филиалы';
                btn.style.cssText = 'background: #ff6b00; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; display: inline-block; transition: background 0.3s;';

                btnWrapper.appendChild(btn);
                h1.insertAdjacentElement('afterend', btnWrapper);

                btn.addEventListener('click', async () => {
                    const currentShops = getOnlyShopsData();
                    if (currentShops.length > 0) {
                        const formattedLines = currentShops.map((s, index) => 
                            `${index + 1}. ${s.name}, ${s.address}, ${s.phone}`
                        );
                        
                        await copyToClipboard(formattedLines.join('\n'));
                        btn.textContent = 'Скопировано!';
                        btn.style.background = '#4caf50'; 
                        
                        setTimeout(() => {
                            btn.textContent = 'Скопировать филиалы';
                            btn.style.background = '#ff6b00';
                        }, 1500);
                    } else {
                        alert('Не удалось найти филиалы');
                    }
                });
            }
        };

        let timeout = null;
        const shopsObserver = new MutationObserver(() => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                updateShopsPage();
            }, 400);
        });

        shopsObserver.observe(document.body, { childList: true, subtree: true });
        
        setTimeout(() => {
            updateShopsPage();
        }, 800);
    }

    // 4. Автоматическая подстановка параметров фильтрации в ссылки
    document.querySelectorAll(
        '.header__categories-item a, .breadcrumbs__link a, .categories__item a'
    ).forEach(link => {
        try {
            const url = new URL(link.href, window.location.origin);
            url.searchParams.set('sqctg', '');
            url.searchParams.set('avail', 'now');
            link.href = url.toString();
        } catch (e) {}
    });
})();