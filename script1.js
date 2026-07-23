(async () => {
	if (window.location.href.startsWith("https://dns-shop.kg/cart/")) {
		
		// Создание кнопки
		const btn = document.createElement('div');
		btn.textContent = 'Сделать скрин';
		btn.classList = 'cart-page__btn-create-order orange-button'
		document.querySelector('.cart-page__total-amount-wrapper').appendChild(btn);
		
		// Подключение html2canvas
		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.13/dist/html2canvas-pro.min.js';
		script.async = true;
		
		await new Promise(resolve => {
		  script.onload = resolve;
		  document.head.appendChild(script);
		});
		
		// Обработка картонок
		document.querySelectorAll('img[src*="c.dns-shop.ru"]').forEach(img => {
		  const url = img.src.replace(/^https?:\/\//, '');
		  img.src = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=jpg`;
		});
	
		// Обработка клика
		btn.addEventListener('click', async () => {
			const oBody = document.body
			oBody.classList.remove('dark')
			const body = oBody.cloneNode(true);
			const dns = body.querySelector('.header__logo');
		  const clone = body.querySelector('.cart-page__products-list');
		  const total = body.querySelector('.cart-page__total-amount-wrapper');
		  const temp = document.createElement('div');
		  temp.classList.add('tempScreen')
		  temp.append(dns, clone, total);
		  oBody.appendChild(temp);
			clone.querySelectorAll('.cart-page__product-count-input').forEach(el => el.textContent += ' шт.')
			
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

	
	const observer = new MutationObserver(() => {
	  const items = document.querySelectorAll('.product-avail-modal__branch-item');
	  if (!items.length) return;
	  
	  const btn = document.createElement('label');
		btn.classList = 'product-avail-modal__filter availability'
		
		const btnTitle = document.createElement('span');
		btnTitle.textContent = 'Наличие';
		btnTitle.classList = 'ui-checkbox__title'
		
		btn.appendChild(btnTitle)
		document.querySelector('.product-avail-modal__filters-block').appendChild(btn);
	
	
		btn.addEventListener('click', async () => {
		  const text = ['Товар есть:'];
		
		  items.forEach(item => {
		  	
		    const title = item.querySelector('[js--product-avail-modal_branch-title-text]');
		    const address = item.querySelector('.product-avail-modal__branch-address');
		    const stockSpan = item.querySelector('.product-avail-modal__branch-product-avails-count span');
		
		    if (!title || !address || !stockSpan) return;

		    const titleText = title.textContent.trim();
		    const addressText = address.textContent.trim();
		    const countMatch = stockSpan.textContent.match(/\d+/);
		    
		    if (!countMatch) return;
		
		    const count = countMatch[0];
		    
		    text.push(`${titleText}, ${addressText}: ${count}шт`);
		  });
		  
		  const countText = `"В наличии в ${text.length-1} магазин${text.length-1 === 1 ? 'е' : 'ах'}"`;
		  text.unshift(`Вы всегда можете посмотреть наличие, количество и в каком филиале, если нажмёте ${countText}\n`)
		  
			navigator.clipboard.writeText(text.join('\n'));
		});
	
	  observer.disconnect();
	});
	
	observer.observe(document.body, {
	  childList: true,
	  subtree: true
	});
	
	document.querySelectorAll(
	  '.header__categories-item a, .breadcrumbs__link a, .categories__item a'
	).forEach(link => {
	  const url = new URL(link.href, window.location.origin);
	
	  url.searchParams.set('sqctg', '');
	  url.searchParams.set('avail', 'now');
	
	  link.href = url.toString();
	});
	
})();