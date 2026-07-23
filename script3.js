document.addEventListener("click", function (el) {
	let order = document.querySelector('.display-large-700')?.textContent;
	let data = [...document.querySelectorAll('.body-small-400._label_1kikn_10')];
	let get = t => data.find(e => e.textContent.trim() === t)?.nextElementSibling?.innerText;
	let delivery = get('Тип доставки');
	let text;
	
	if (el.target.matches('.btnOrderButton')) navigator.clipboard.writeText(order);
	
	if (el.target.matches('.btn1CButton')) {
		if (delivery.includes('С магазина')) text = `Самовывоз / Код: ${get('Код выдачи')}`;
		else if (delivery.includes('ПВЗ')) text = `ПВЗ / ${get('Код для маркировки')}`;
	  else text = `${get('Тип доставки')} / ${get('Доставить')}`;
	  
	  navigator.clipboard.writeText(`НЕ СОБРАН / Заказ №${order} / ${text} / ММаркет`);
	}
	
	if (el.target.matches('.onePhoneButton')) navigator.clipboard.writeText(get('Номер телефона'));
	
	if (el.target.matches('.code .ant-table-cell:nth-child(1)')){
		navigator.clipboard.writeText(el.target.textContent);
		el.stopImmediatePropagation();
	}
	
}, true);
	

// Следит за появлением заказов в DOM
const observer = new MutationObserver(() => {
	if (window.location.pathname.startsWith("/orders")) {
		let orderElement = document.querySelector('.display-large-700')
		if (orderElement){
			let order = orderElement.parentElement.parentElement
			
			if (!order.classList.contains('orderCard')){
				order.parentElement.classList.add('orderContent')
				order.classList.add('orderCard');
				let btnContent = document.createElement('div');
				btnContent.classList.add('btnContent');
				order.after(btnContent);
				
				let btnData = {
					'btnOrderButton':	'Заказ',
					'onePhoneButton': 'Телефон',
					'btn1CButton': '1C'
				}
				
				for (let key in btnData) {
				  let btn = document.createElement('p');
				  btn.classList.add('btnBlock', key);
					btn.textContent = btnData[key];
					btnContent.append(btn);
				}
			}
			
			let tableRow = document.querySelectorAll('.ant-table-row')
			for (let el of tableRow) {
				if (!el.classList.contains('code')){
					el.classList.add('code')
				}
				
			  let count = el.children[2];
			  if (parseInt(count.textContent) > 1){
			  	el.classList.add('counted')
			  }
			}
		}
		
    const activeSegment = document.querySelector('.ant-segmented-item-label[aria-selected="true"]');
    if (activeSegment && activeSegment.title === "Все") {
        document.querySelectorAll("tr.ant-table-row").forEach(row => {
            const cells = row.querySelectorAll("td.ant-table-cell");
            if (cells.length >= 5) {
                const col4 = cells[3].textContent.trim();
                const col5 = cells[4].textContent.trim();
                if (col4 === "-" && col5.includes("Отменен")) {
                    row.style.display = "none";
                }
            }
        });
    }
	}
})


// Запускает наблюдение за DOM
observer.observe(document, { childList: true, subtree: true });