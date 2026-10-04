
























































































































































































































































































































































































































































































































































































































































































const branch = {
	tp: ['Технопоинт', '+996703556606', 'улица Курманжан Датка, 207/1', 'Пн-Вс: 10:00–21:00'],
	ww: ['Метрополь', '+996703556607', 'ул. Фрунзе, 340 (2 этаж)', 'Пн-Вс: 10:00–21:00'],
	we: ['Юнусалиева', '+996703556604', 'ул. Юнусалиева, д. 171/3 (2 этаж)', 'Пн-Вс: 10:00–21:00'],
	wr: ['Ала-Арча', '+996703556608', 'проспект Чынгыза Айтматова, д. 299в (2 этаж)', 'Пн-Пт: 10:00–21:00, Сб-Вс: 10:00–22:00'],
	wt: ['Вефа', '+996703556609', 'улица Максима Горького, 27/1', 'Пн-Вс: 10:00–22:00'],
	wu: ['Аламедин-1', '+996703556612', 'ул. Ауэзова, 3а', 'Пн-Вс: 10:00–21:00']
};

// Функция для фильтрации цен и системных элементов
function isPriceOrStatus(el) {
	if (!el) return true;
	const text = el.innerText.trim();
	if (!text) return true;
	// Проверка на цену (например "13497,00c", "13 497 c", "500сом")
	if (/^\d[\d\s,.]*(с|c|сом)?$/i.test(text)) return true;
	// Проверка на системные фразы
	if (text.includes('Заказ:') || text.includes('В наличии:') || text.includes('Доставка')) return true;
	return false;
}

// Функция для генерации текста
function generateClientText(orderNumber, items, isPickup = false) {
	let text = "";
	
	if (isPickup) {
		text += `Пишем с DNS, вы у нас заказали через О!Маркет товары\nВаш заказ №${orderNumber} готов к выдаче.\n\n`;
	} else {
		text += `**Заказ №${orderNumber}**\n\n`;
	}

	const groups = {};
	items.forEach(item => {
		const key = item.branchKey;
		if (!key) return;
		if (!groups[key]) groups[key] = [];
		groups[key].push(item);
	});

	const keys = Object.keys(groups);
	if (keys.length === 0) return "Филиалы не выбраны!";

	keys.forEach((key, index) => {
		const [branchName, branchPhone, branchAddress, branchTime] = branch[key];
		text += `📍 Филиал: **${branchName}**\n`;
		
		if (keys.length > 1) {
			text += `\n`;
		}

		text += `📦 Состав:\n`;
		groups[key].forEach((prod, i) => {
			text += `${i + 1}. **${prod.name}** — ${prod.quantity} шт.\n`;
		});

		text += `\n🏢 Адрес: **${branchAddress}**\n`;
		text += `🕒 Режим работы: **${branchTime}**\n`;
		text += `📞 Телефон: \`${branchPhone}\``;
		
		if (index < keys.length - 1) {
			text += `\n\n`;
		}
	});

	return text;
}

const observer = new MutationObserver(() => {
	const allParagraphs = Array.from(document.querySelectorAll('p'));
	const orderNumberElements = allParagraphs.filter((el) => el.textContent.includes('Заказ #'));

	if (orderNumberElements.length) {
		const orderContainer = orderNumberElements[0].parentElement?.parentElement?.parentElement;
		if (orderContainer && !orderContainer.classList.contains('orderContainer')) {
			orderContainer.classList.add('orderContainer');
		}
	}
	
	orderNumberElements.forEach((orderNumberElement) => {
		const orderCardElement = orderNumberElement.parentElement?.parentElement;
		if (!orderCardElement) return;

		const productListBlock = orderCardElement.nextElementSibling;

		// 1. Вставляем кнопки к номеру заказа, если их ещё нет
		if (!orderCardElement.querySelector('.copyTo1CBtn')) {
			orderCardElement.classList.add('orderCard');
			if (productListBlock) productListBlock.classList.add('orderProductList');
			orderNumberElement.classList.add('orderNumberBtn', 'actionBtn');

			const deliveryParagraph = orderCardElement.querySelectorAll('p')[3];
			if (deliveryParagraph) deliveryParagraph.classList.add('deliveryInfo');

			const buttonsToInsert = [];

			const phoneBlock = Array.from(orderCardElement.querySelectorAll('div'))
				.find((div) => div.innerText.includes('Телефон'));
			if (phoneBlock?.children[1]) {
				phoneBlock.children[1].classList.add('phoneNumberCopy');
				const phoneNumberButton = document.createElement('p');
				phoneNumberButton.classList.add('phoneNumberButton', 'actionBtn');
				phoneNumberButton.textContent = 'Телефон';
				buttonsToInsert.push(phoneNumberButton);
			}
			
			const oneCButton = document.createElement('p');
			oneCButton.classList.add('copyTo1CBtn', 'actionBtn');
			oneCButton.textContent = '1C';
			buttonsToInsert.push(oneCButton);

			const multiBranchBtn = document.createElement('p');
			multiBranchBtn.classList.add('multiBranchBtn', 'actionBtn');
			multiBranchBtn.textContent = 'Сборный заказ';
			buttonsToInsert.push(multiBranchBtn);

			const pickupBtn = document.createElement('p');
			pickupBtn.classList.add('pickupBtn', 'actionBtn');
			pickupBtn.textContent = 'Самовывоз';
			buttonsToInsert.push(pickupBtn);

			let lastElement = orderNumberElement;
			buttonsToInsert.forEach(btn => {
				lastElement.after(btn);
				lastElement = btn;
			});
		}

		// 2. Обрабатываем список товаров и выпадающие списки филиалов
		if (productListBlock) {
			const branchKeys = Object.keys(branch);
			const defaultKey = branchKeys[0];

			const firstP = productListBlock.querySelector('p');
			if (!firstP) return;

			const productTitleClasses = [...firstP.classList];
			if (!productTitleClasses.length) return;

			const candidateParagraphs = productListBlock.querySelectorAll(
				productTitleClasses.map((cls) => '.' + cls).join('')
			);

			candidateParagraphs.forEach((pElem) => {
				// Пропускаем цену и статусные строки
				if (isPriceOrStatus(pElem)) return;

				if (!pElem.classList.contains('productTitle')) {
					pElem.classList.add('productTitle', 'actionBtn');
					pElem.style.marginBottom = '10px';
				}

				// Пропускаем блок цены и ищем контейнер с количеством
				let infoContainer = pElem.nextElementSibling;
				while (infoContainer && isPriceOrStatus(infoContainer)) {
					if (infoContainer.innerText.includes('Заказ')) break;
					infoContainer = infoContainer.nextElementSibling;
				}

				if (!infoContainer) infoContainer = pElem;

				const quantityParagraph = Array.from(infoContainer.querySelectorAll('p'))
					.concat(infoContainer.tagName === 'P' ? [infoContainer] : [])
					.find((el) => el.innerText.includes('Заказ'));

				if (quantityParagraph) {
					const quantity = parseInt(quantityParagraph.innerText.replace(/\D/g, '')) || 0;
					if (quantity > 1) {
						quantityParagraph.parentElement.classList.add('multipleQuantity');
					}
				}
				
				// Проверяем, есть ли уже кастомный селект у этого товара
				let sibling = infoContainer.nextElementSibling;
				let hasSelect = false;
				while (sibling) {
					if (sibling.classList?.contains('customSelect')) {
						hasSelect = true;
						break;
					}
					if (sibling.classList?.contains('productTitle')) break;
					sibling = sibling.nextElementSibling;
				}

				if (!hasSelect) {
					const customSelect = document.createElement('div');
					customSelect.classList.add('customSelect');
					customSelect.dataset.value = defaultKey;

					customSelect.innerHTML = `
						<div class="customSelectTrigger">
							<span>${branch[defaultKey][0]}</span>
							<span class="customSelectArrow">▼</span>
						</div>
						<div class="customSelectOptions">
							${branchKeys.map(key => `
								<div class="customOption ${key === defaultKey ? 'customSelected' : ''}" data-value="${key}">
									${branch[key][0]}
								</div>
							`).join('')}
						</div>
					`;

					infoContainer.after(customSelect);
				}
			});
		}
	});
});

observer.observe(document, { childList: true, subtree: true });

document.addEventListener('keyup', event => {
  if(event.code === 'Enter' && document.activeElement.closest('.orderProductList')) {
  	document.activeElement.closest('.orderProductList').querySelector('button')?.click();
  }
});

document.addEventListener('click', (event) => {
	// Обработка открывания/закрывания кастомного селекта
	const trigger = event.target.closest('.customSelectTrigger');
	if (trigger) {
		const select = trigger.closest('.customSelect');
		document.querySelectorAll('.customSelect.open').forEach(el => {
			if (el !== select) el.classList.remove('open');
		});
		select.classList.toggle('open');
		return;
	}

	// Обработка выбора варианта в кастомном селекте
	const option = event.target.closest('.customOption');
	if (option) {
		const select = option.closest('.customSelect');
		const value = option.dataset.value;
		const text = option.textContent.trim();

		select.dataset.value = value;
		select.querySelector('.customSelectTrigger span').textContent = text;

		select.querySelectorAll('.customOption').forEach(opt => opt.classList.remove('customSelected'));
		option.classList.add('customSelected');

		select.classList.remove('open');
		return;
	}

	// Закрываем выпадающие списки при клике в любое другое место
	if (!event.target.closest('.customSelect')) {
		document.querySelectorAll('.customSelect.open').forEach(el => el.classList.remove('open'));
	}

	if (event.target.closest('.orderContainer')) {
		const clickedOrderCard = event.target.closest('.orderCard') || event.target.closest('.orderProductList')?.previousElementSibling;
		if (!clickedOrderCard) return;

		const orderNumberBtn = clickedOrderCard.querySelector('.orderNumberBtn');
		const deliveryInfo = clickedOrderCard.querySelector('.deliveryInfo');
		const phoneNumberCopy = clickedOrderCard.querySelector('.phoneNumberCopy');

		if (event.target.matches('.orderNumberBtn') && orderNumberBtn) {
			navigator.clipboard.writeText(`${orderNumberBtn.innerText.replace(/\D/g, '')}`);
		}

		if (event.target.matches('.phoneNumberButton') && phoneNumberCopy) {
			const fullText = phoneNumberCopy.innerText;
			navigator.clipboard.writeText(fullText.replace(/^Телефон:\s*/, '').trim());
		}

		// Копирование (Обработка Сборного заказа и Самовывоза)
		if (event.target.matches('.multiBranchBtn') || event.target.matches('.pickupBtn')) {
			const isPickup = event.target.matches('.pickupBtn');
			const orderNumberStr = orderNumberBtn ? orderNumberBtn.innerText.replace(/\D/g, '') : '';
			const productListBlock = clickedOrderCard.nextElementSibling;
			if (!productListBlock) return;

			const productTitles = Array.from(productListBlock.querySelectorAll('.productTitle'));
			
			const items = productTitles.map(titleEl => {
				const name = titleEl.innerText;
				let sibling = titleEl.nextElementSibling;
				const quantityParagraph = Array.from(sibling?.querySelectorAll('p') || [])
					.find((el) => el.innerText.includes('Заказ'));
				const quantity = quantityParagraph ? parseInt(quantityParagraph.innerText.replace(/\D/g, '')) : 1;
				
				let branchKey = null;
				while(sibling) {
					if(sibling.classList.contains('customSelect')) {
						branchKey = sibling.dataset.value;
						break;
					}
					if(sibling.classList.contains('productTitle')) break;
					sibling = sibling.nextElementSibling;
				}

				return { name, quantity, branchKey };
			}).filter(item => item.branchKey);

			if (items.length === 0) return;

			navigator.clipboard.writeText(generateClientText(orderNumberStr, items, isPickup));
		}

		if (event.target.matches('.copyTo1CBtn') && deliveryInfo && orderNumberBtn) {
			const formattedDate = formatFutureDate(deliveryInfo.innerText);
			navigator.clipboard.writeText(`НЕ СОБРАН / ${orderNumberBtn.innerText} / ${formattedDate} / О!Маркет`);
		}
		
		if (event.target.matches('.productTitle')) {
			navigator.clipboard.writeText(event.target.innerText);
		}
	}
});

function formatFutureDate(input) {
	const months = {
		"января": "01",
		"февраля": "02",
		"марта": "03",
		"апреля": "04",
		"мая": "05",
		"июня": "06",
		"июля": "07",
		"августа": "08",
		"сентября": "09",
		"октября": "10",
		"ноября": "11",
		"декабря": "12"
	};

	input = input.trim();
	if (input.startsWith("Самовывоз")) return input;
	if (input.startsWith("Экспресс-доставка")) return input;

	const now = new Date();
	const content = input.slice("Доставка до:".length).trim();
	const parts = content.split(" ");
	const timeRange = parts.at(-1);
	const dateText = parts.slice(0, -1).join(" ").toLowerCase();

	let targetDate;

	if (dateText === "сегодня") {
		targetDate = now;
	} else if (dateText === "завтра") {
		targetDate = new Date(now);
		targetDate.setDate(now.getDate() + 1);
	} else {
		const [dayRaw, monthName] = dateText.split(" ");
		const day = dayRaw.padStart(2, '0');
		const month = months[monthName];
		const thisYear = now.getFullYear();

		const candidateDate = new Date(`${thisYear}-${month}-${day}`);
		const finalYear = candidateDate < now ? thisYear + 1 : thisYear;
		targetDate = new Date(`${finalYear}-${month}-${day}`);
	}

	const dd = String(targetDate.getDate()).padStart(2, '0');
	const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
	const yyyy = targetDate.getFullYear();

	return `${dd}.${mm}.${yyyy} ${timeRange}`;
}