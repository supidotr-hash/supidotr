const branch = {
	tp: ['Технопоинт', '+996703556615', 'улица Курманжан Датка, 755', 'Пн-Вс: 10:00–21:00'],
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
	if (/^\d[\d\s,.]*(с|c|сом)?$/i.test(text)) return true;
	if (text.includes('Заказ:') || text.includes('В наличии:') || text.includes('Доставка')) return true;
	return false;
}

// Генерация HTML кастомного селекта
function createCustomSelectHTML(selectedKey) {
	const branchKeys = Object.keys(branch);
	return `
		<div class="customSelect" data-value="${selectedKey}">
			<div class="customSelectTrigger">
				<span>${branch[selectedKey][0]}</span>
				<span class="customSelectArrow">▼</span>
			</div>
			<div class="customSelectOptions">
				${branchKeys.map(key => `
					<div class="customOption ${key === selectedKey ? 'customSelected' : ''}" data-value="${key}">
						${branch[key][0]}
					</div>
				`).join('')}
			</div>
		</div>
	`;
}

// Создание элемента строки филиала
function createBranchRowElement(selectedKey, maxQuantity, initialQty) {
	const row = document.createElement('div');
	row.classList.add('branchRow');

	const showQty = maxQuantity > 1;

	row.innerHTML = `
		${createCustomSelectHTML(selectedKey)}${showQty ? `
			<div class="qtyWrapper">
				<input type="number" class="branchQtyInput" min="1" max="${maxQuantity}" value="${initialQty}">
				<span class="qtyLabel"></span>
			</div>
		` : ''}
		<button type="button" class="removeBranchBtn" title="Удалить филиал" style="display: none;">✕</button>
	`;

	return row;
}

// Создание контейнера филиалов для товара
function createBranchAllocationContainer(maxQuantity) {
	const branchKeys = Object.keys(branch);
	const defaultKey = branchKeys[0];

	const container = document.createElement('div');
	container.classList.add('branchAllocationContainer');
	container.dataset.maxQty = maxQuantity;

	const rowsList = document.createElement('div');
	rowsList.classList.add('branchRowsList');

	const initialRow = createBranchRowElement(defaultKey, maxQuantity, maxQuantity);
	rowsList.appendChild(initialRow);
	container.appendChild(rowsList);

	if (maxQuantity > 1) {
		const addBtn = document.createElement('button');
		addBtn.type = 'button';
		addBtn.classList.add('addBranchBtn');
		addBtn.textContent = '+ Филиал';
		container.appendChild(addBtn);
	}

	updateContainerState(container);
	return container;
}

// Обновление состояния контейнера (проверка лимита количества и видимости кнопок)
function updateContainerState(container) {
	const maxQty = parseInt(container.dataset.maxQty) || 1;
	const rows = Array.from(container.querySelectorAll('.branchRow'));

	let totalAllocated = 0;
	rows.forEach(row => {
		const input = row.querySelector('.branchQtyInput');
		if (input) {
			let val = parseInt(input.value) || 1;
			if (val < 1) val = 1;
			input.value = val;
			totalAllocated += val;
		} else {
			totalAllocated += 1;
		}
	});

	rows.forEach(row => {
		const removeBtn = row.querySelector('.removeBranchBtn');
		if (removeBtn) {
			removeBtn.style.display = rows.length > 1 ? 'inline-block' : 'none';
		}
	});

	const addBtn = container.querySelector('.addBranchBtn');
	if (addBtn) {
		if (totalAllocated >= maxQty) {
			addBtn.style.display = 'none';
		} else {
			addBtn.style.display = 'inline-block';
		}
	}
}

function getBranchCountText(count) {
	const forms = {
		1: 'одного филиала',
		2: 'двух филиалов',
		3: 'трех филиалов',
		4: 'четырех филиалов',
		5: 'пяти филиалов',
		6: 'шести филиалов'
	};
	return forms[count] || `${count} филиалов`;
}

function generateClientText(orderNumber, items, isPickup = false) {
	const groups = {};
	items.forEach(item => {
		const key = item.branchKey;
		if (!key) return;
		if (!groups[key]) groups[key] = [];
		groups[key].push(item);
	});

	const keys = Object.keys(groups);
	if (keys.length === 0) return "Филиалы не выбраны!";

	const branchCountText = getBranchCountText(keys.length);
	let text = "";

	if (isPickup) {
		text += `Пишем с DNS, вы у нас заказали через О!Маркет товары\nВаш заказ №${orderNumber} готов к выдаче с ${branchCountText}.\n`;
	} else {
		text += `**Заказ №${orderNumber} забирать с ${branchCountText}**\n`;
	}

	if (keys.length > 1) {
		text += `\n========================================\n`;
	}

	keys.forEach((key, index) => {
		text += `\n`;
		const [branchName, branchPhone, branchAddress, branchTime] = branch[key];
		text += `📍 Филиал: **${branchName}**\n\n`;
		text += `📦 Состав:\n`;
		groups[key].forEach((prod, i) => {
			text += `${i + 1}. **${prod.name}** —${prod.quantity} шт.\n`;
		});

		text += `\n🏢 Адрес: **${branchAddress}**\n`;
		text += `🕒 Режим работы: **${branchTime}**\n`;
		text += `📞 Телефон: \`${branchPhone}\``;

		if (index < keys.length - 1) {
			text += `\n\n========================================\n`;
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

		if (productListBlock) {
			const firstP = productListBlock.querySelector('p');
			if (!firstP) return;

			const productTitleClasses = [...firstP.classList];
			if (!productTitleClasses.length) return;

			const candidateParagraphs = productListBlock.querySelectorAll(
				productTitleClasses.map((cls) => '.' + cls).join('')
			);

			candidateParagraphs.forEach((pElem) => {
				if (isPriceOrStatus(pElem)) return;

				if (!pElem.classList.contains('productTitle')) {
					pElem.classList.add('productTitle', 'actionBtn');
					pElem.style.marginBottom = '10px';
				}

				let infoContainer = pElem.nextElementSibling;
				while (infoContainer && isPriceOrStatus(infoContainer)) {
					if (infoContainer.innerText.includes('Заказ')) break;
					infoContainer = infoContainer.nextElementSibling;
				}

				if (!infoContainer) infoContainer = pElem;

				let maxQuantity = 1;
				const quantityParagraph = Array.from(infoContainer.querySelectorAll('p'))
					.concat(infoContainer.tagName === 'P' ? [infoContainer] : [])
					.find((el) => el.innerText.includes('Заказ'));

				if (quantityParagraph) {
					const quantity = parseInt(quantityParagraph.innerText.replace(/\D/g, '')) || 0;
					if (quantity > 0) maxQuantity = quantity;
					if (quantity > 1) {
						quantityParagraph.parentElement.classList.add('multipleQuantity');
					}
				}
				
				let sibling = infoContainer.nextElementSibling;
				let hasContainer = false;
				while (sibling) {
					if (sibling.classList?.contains('branchAllocationContainer')) {
						hasContainer = true;
						break;
					}
					if (sibling.classList?.contains('productTitle')) break;
					sibling = sibling.nextElementSibling;
				}

				if (!hasContainer) {
					const container = createBranchAllocationContainer(maxQuantity);
					infoContainer.after(container);
				}
			});
		}
	});
});

observer.observe(document, { childList: true, subtree: true });

document.addEventListener('keyup', event => {
  if(event.code === 'Enter' && document.activeElement.closest('.orderProductList') && !event.target.classList.contains('branchQtyInput')) {
  	document.activeElement.closest('.orderProductList').querySelector('button')?.click();
  }
});

document.addEventListener('input', (event) => {
	if (event.target.matches('.branchQtyInput')) {
		const input = event.target;
		const container = input.closest('.branchAllocationContainer');
		if (!container) return;

		const maxQty = parseInt(container.dataset.maxQty) || 1;
		let val = parseInt(input.value) || 1;
		if (val < 1) val = 1;

		const inputs = Array.from(container.querySelectorAll('.branchQtyInput'));
		let otherSum = 0;
		inputs.forEach(inp => {
			if (inp !== input) {
				otherSum += (parseInt(inp.value) || 1);
			}
		});

		const maxAllowed = Math.max(1, maxQty - otherSum);
		if (val > maxAllowed) {
			val = maxAllowed;
		}

		input.value = val;
		updateContainerState(container);
	}
});

document.addEventListener('click', (event) => {
	if (event.target.closest('.addBranchBtn')) {
		const addBtn = event.target.closest('.addBranchBtn');
		const container = addBtn.closest('.branchAllocationContainer');
		if (!container) return;

		const maxQty = parseInt(container.dataset.maxQty) || 1;
		const rowsList = container.querySelector('.branchRowsList');
		const rows = Array.from(rowsList.querySelectorAll('.branchRow'));

		let totalAllocated = 0;
		rows.forEach(row => {
			const input = row.querySelector('.branchQtyInput');
			totalAllocated += input ? (parseInt(input.value) || 1) : 1;
		});

		let remaining = maxQty - totalAllocated;

		if (remaining <= 0) {
			const lastInput = rows[rows.length - 1].querySelector('.branchQtyInput');
			if (lastInput) {
				const currentVal = parseInt(lastInput.value) || 1;
				if (currentVal > 1) {
					lastInput.value = currentVal - 1;
					remaining = 1;
				}
			}
		}

		if (remaining > 0) {
			const branchKeys = Object.keys(branch);
			const usedKeys = rows.map(r => r.querySelector('.customSelect')?.dataset.value);
			const unusedKey = branchKeys.find(k => !usedKeys.includes(k)) || branchKeys[0];

			const newRow = createBranchRowElement(unusedKey, maxQty, remaining);
			rowsList.appendChild(newRow);
			updateContainerState(container);
		}
		return;
	}

	if (event.target.closest('.removeBranchBtn')) {
		const removeBtn = event.target.closest('.removeBranchBtn');
		const row = removeBtn.closest('.branchRow');
		const container = row.closest('.branchAllocationContainer');
		if (!container) return;

		row.remove();
		updateContainerState(container);
		return;
	}

	const trigger = event.target.closest('.customSelectTrigger');
	if (trigger) {
		const select = trigger.closest('.customSelect');
		document.querySelectorAll('.customSelect.open').forEach(el => {
			if (el !== select) el.classList.remove('open');
		});
		select.classList.toggle('open');
		return;
	}

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

		if (event.target.matches('.multiBranchBtn') || event.target.matches('.pickupBtn')) {
			const isPickup = event.target.matches('.pickupBtn');
			const orderNumberStr = orderNumberBtn ? orderNumberBtn.innerText.replace(/\D/g, '') : '';
			const productListBlock = clickedOrderCard.nextElementSibling;
			if (!productListBlock) return;

			const productTitles = Array.from(productListBlock.querySelectorAll('.productTitle'));
			
			const items = [];
			productTitles.forEach(titleEl => {
				const name = titleEl.innerText.trim();
				let sibling = titleEl.nextElementSibling;
				
				let container = null;
				while (sibling) {
					if (sibling.classList.contains('branchAllocationContainer')) {
						container = sibling;
						break;
					}
					if (sibling.classList.contains('productTitle')) break;
					sibling = sibling.nextElementSibling;
				}

				if (container) {
					const rows = container.querySelectorAll('.branchRow');
					rows.forEach(row => {
						const selectEl = row.querySelector('.customSelect');
						const branchKey = selectEl ? selectEl.dataset.value : null;
						const qtyInput = row.querySelector('.branchQtyInput');
						const quantity = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

						if (branchKey) {
							items.push({ name, quantity, branchKey });
						}
					});
				}
			});

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