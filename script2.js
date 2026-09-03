
























































































































































































































































































































































































































































































































































































































































































const branch = {
	ww: ['Метрополь', '+996703556607', 'ул.Фрунзе 340 (2этаж)', 'Пн-Вс: 10:00–21:00'],
	we: ['Юнусалиева', '+996703556604', 'ул. Юнусалиева, д.171/3 (2этаж)', 'Пн-Вс: 10:00–21:00'],
	wr: ['Ала-Арча', '+996703556608', 'проспект Чынгыза Айтматова, д. 299в (2 этаж)', 'Пн-Пт: 10:00–21:00, Сб-Вс: 10:00–22:00'],
	wt: ['Вефа', '+996703556609', 'улица Максима Горького, 27/1', 'Пн-Вс: 10:00–22:00'],
	wu: ['Аламедин-1', '+996703556612', 'ул. Ауэзова, 3а', 'Пн-Вс: 10:00–21:00'],
	tp: ['Технопоинт', '+996703556606', 'улица Курманжан Датка, 207/1', 'Пн-Вс: 10:00–21:00'],
};

const observer = new MutationObserver(() => {
	const allParagraphs = Array.from(document.querySelectorAll('p'));

	const orderNumberElements = allParagraphs.filter((el) => el.textContent.includes('Заказ #'));

	if (orderNumberElements.length) {
		const orderContainer = orderNumberElements[0].parentElement.parentElement.parentElement;
		if (!orderContainer.classList.contains('orderContainer')) {
			orderContainer.classList.add('orderContainer');
		}
	}
	
	const targetBlock = Array.from(document.querySelectorAll('button')).find(el => el.textContent.trim() === 'Отметить как прочитанное');
	if (targetBlock && !document.querySelector('.searchOrder')) {
	    const searchOrderBlock = document.createElement('div');
	    searchOrderBlock.classList.add('searchOrder');
	    const input = document.createElement('input');
	    input.type = 'text';
	    input.placeholder = 'Поиск...';
	    searchOrderBlock.appendChild(input);
	    targetBlock.before(searchOrderBlock);
	}
	
	orderNumberElements.forEach((orderNumberElement) => {
		const orderCardElement = orderNumberElement.parentElement.parentElement;

		if (!orderCardElement.classList.contains('orderCard')) {
			orderCardElement.classList.add('orderCard');
			orderCardElement.nextElementSibling.classList.add('orderProductList');
			orderNumberElement.classList.add('orderNumberBtn');

			const deliveryParagraph = orderCardElement.querySelectorAll('p')[3];
			deliveryParagraph.classList.add('deliveryInfo');

			const phoneBlock = Array.from(orderCardElement.querySelectorAll('div'))
				.find((div) => div.innerText.includes('Телефон'));
			if (phoneBlock?.children[1]) {
				phoneBlock.children[1].classList.add('phoneNumberCopy');
				const phoneNumberButton = document.createElement('p');
				phoneNumberButton.classList.add('phoneNumberButton');
				phoneNumberButton.textContent = 'Телефон';
				orderNumberElement.after(phoneNumberButton);
			}
			
			const oneCButton = document.createElement('p');
			oneCButton.classList.add('copyTo1CBtn');
			oneCButton.textContent = '1C';
			orderNumberElement.after(oneCButton);

			const orderWrapper = orderNumberElement.parentElement;
			const branchButtonsWrapper = document.createElement('div');
			branchButtonsWrapper.classList.add('branchWrapper');
			orderWrapper.after(branchButtonsWrapper);
			
			const branchKeys = ['ww', 'we', 'wu', 'wr', 'wt', 'tp'];
			branchKeys.forEach((key) => {
				const [name] = branch[key];
				const branchBtn = document.createElement('p');
				branchBtn.classList.add('branchBtn', key);
				branchBtn.textContent = name;
				branchButtonsWrapper.appendChild(branchBtn);
			});

			const productListBlock = orderCardElement.nextElementSibling;
			const productTitleClasses = [...productListBlock.querySelector('p').classList];
			const productTitles = productListBlock.querySelectorAll(
				productTitleClasses.map((cls) => '.' + cls).join('')
			);

			productTitles.forEach((productTitle) => {
				productTitle.classList.add('productTitle');

				const quantityParagraph = Array.from(productTitle.nextElementSibling.querySelectorAll('p'))
					.find((el) => el.innerText.includes('Заказ'));

				const quantity = parseInt(quantityParagraph.innerText.replace(/\D/g, ''));
				if (quantity > 1) {
					quantityParagraph.parentElement.classList.add('multipleQuantity');
				}
			});
			
		}
	});
	
	const input = document.querySelector('.searchOrder input');
	if (input) {
	  input.addEventListener('input', () => {
	    const value = input.value.trim();
	    const cards = document.querySelectorAll('.orderCard');
	    cards.forEach(card => {
	      const orderNumber = card.querySelector('.orderNumberBtn');
	      const productList = card.nextElementSibling?.classList.contains('orderProductList')
	        ? card.nextElementSibling
	        : null;
	      if (!value) {
	        card.style.display = '';
	        if (productList) productList.style.display = '';
	        return;
	      }
	      if (!orderNumber) return;
	      const text = orderNumber.textContent.trim();
	      if (text.includes(value)) {
	        card.style.display = '';
	        if (productList) productList.style.display = '';
	      } else {
	        card.style.display = 'none';
	        if (productList) productList.style.display = 'none';
	      }
	    });
	  });
	}
});

observer.observe(document, { childList: true, subtree: true });

document.addEventListener( 'keyup', event => {
  if(event.code === 'Enter' && document.activeElement.closest('.orderProductList')) {
  	document.activeElement.closest('.orderProductList').querySelector('button').click()
  }
});

document.addEventListener('click', (event) => {
	if (event.target.closest('.orderContainer')) {
		const clickedOrderCard = event.target.closest('.orderCard') || event.target.closest('.orderProductList')?.previousElementSibling;
		const orderNumberBtn = clickedOrderCard.querySelector('.orderNumberBtn');
		const copyTo1CBtn = clickedOrderCard.querySelector('.copyTo1CBtn');
		const deliveryInfo = clickedOrderCard.querySelector('.deliveryInfo');
		const phoneNumberButton = clickedOrderCard.querySelector('.phoneNumberButton');
		const phoneNumberCopy = clickedOrderCard.querySelector('.phoneNumberCopy');
		let copiedText;

		if (event.target.matches('.orderNumberBtn')) {
			navigator.clipboard.writeText(`${orderNumberBtn.innerText.replace(/\D/g, '')}`)
		}

		if (event.target.matches('.phoneNumberButton')) {
			const fullText = phoneNumberCopy.innerText;
			navigator.clipboard.writeText(fullText.replace(/^Телефон:\s*/, '').trim())
		}

		if (event.target.matches('.branchBtn')) {
			const branchKey = event.target.classList[1];
			const [branchName, branchPhone, branchAddress, branchTime] = branch[branchKey];
			let d = orderNumberBtn.innerText.split(" ")
			navigator.clipboard.writeText(`Заказ ${d[1].slice(1)} забирать с ${branchName}\nТелефон: ${branchPhone}\nАдрес: ${branchAddress}\n${branchTime}`);
		}

		if (event.target.matches('.copyTo1CBtn')) {
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
