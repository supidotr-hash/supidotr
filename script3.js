document.addEventListener("click", function (el) {
	const skuBtn = el.target.closest(".btnSKU");
	if (skuBtn) {
		el.preventDefault();
		el.stopPropagation();
		el.stopImmediatePropagation();
		navigator.clipboard.writeText(skuBtn.textContent.trim());
		return;
	}

	// /sss

	const detailRoot = document.querySelector('[data-slot="order-detail"]');
	if (!detailRoot) return;

	const headingText = detailRoot.querySelector("header h2")?.textContent || "";
	const order = (headingText.match(/\d+/) || [""])[0];

	const labels = [...detailRoot.querySelectorAll("span")].filter(
		(s) => s.className.includes("text-muted-foreground")
	);
	const get = (t) => {
		const found = labels.find((e) => e.textContent.trim() === t);
		return found?.nextElementSibling?.textContent.trim() || "";
	};

	const delivery = get("Тип доставки");
	let text;

	if (el.target.closest(".btnOrderButton")) {
		if (order) navigator.clipboard.writeText(order);
	}

	if (el.target.closest(".btn1CButton")) {
		if (delivery.includes("С магазина")) {
			text = `Самовывоз / Код: ${get("Код выдачи") || "-"}`;
		} else if (delivery.includes("ПВЗ")) {
			text = `ПВЗ / ${get("Код для маркировки") || "-"}`;
		} else {
			text = `${delivery} / ${get("Доставить") || get("Когда доставить") || "-"}`;
		}

		navigator.clipboard.writeText(
			`НЕ СОБРАН / НЕ ПРОМАРКИРОВАНО / Заказ №${order} / ${text} / ММаркет`
		);
	}

	if (el.target.closest(".onePhoneButton")) {
		const phone = get("Номер телефона");
		if (phone) navigator.clipboard.writeText(phone);
	}
}, true);

const observer = new MutationObserver(() => {
	if (!window.location.pathname.startsWith("/orders")) return;

	const detailRoot = document.querySelector('[data-slot="order-detail"]');
	const header = detailRoot?.querySelector("header");

	if (detailRoot && header) {
		const orderContainer = header.parentElement;

		if (orderContainer && !orderContainer.classList.contains("orderCard")) {
			orderContainer.parentElement?.classList.add("orderContent");
			orderContainer.classList.add("orderCard");

			const productsList = detailRoot.querySelector("ul");
			let btnContent = detailRoot.querySelector(".btnContent");

			if (!btnContent) {
				btnContent = document.createElement("div");
				btnContent.classList.add("btnContent");

				const btnData = {
					btnOrderButton: "Заказ",
					onePhoneButton: "Телефон",
					btn1CButton: "1C",
				};

				for (let key in btnData) {
					const btn = document.createElement("p");
					btn.classList.add("btnBlock", key);
					btn.textContent = btnData[key];
					btnContent.append(btn);
				}
			}

			header.after(btnContent);

			if (productsList && btnContent.nextElementSibling !== productsList) {
				btnContent.after(productsList);
			}
		}

		detailRoot.querySelectorAll("ul > li").forEach((item) => {
			const qtyElement = [...item.querySelectorAll("span, div")].find((el) =>
				/Выделено\s+\d+\s+из\s+\d+/.test(el.textContent.trim())
			);
			if (!qtyElement) return;

			const skuLabel = [...item.querySelectorAll("span")].find(
				(s) => s.textContent.trim() === "SKU"
			);
			const skuValueEl = skuLabel?.nextElementSibling;

			if (skuValueEl && !skuValueEl.querySelector(".btnSKU")) {
				const skuValue = skuValueEl.textContent.trim();
				skuValueEl.textContent = "";

				const divSKU = document.createElement("div");
				divSKU.className = "btnBlock btnSKU";
				divSKU.textContent = skuValue;
				skuValueEl.appendChild(divSKU);
			}

			const match = qtyElement.textContent
				.trim()
				.match(/Выделено\s+(\d+)\s+из\s+(\d+)/);

			if (match) {
				const selected = Number(match[1]);
				const total = Number(match[2]);

				if (selected > 1 && total > 1) {
					qtyElement.classList.add("counted");
				}
			}
		});
	}
	detailRoot.querySelectorAll("ul > li").forEach((item) => {
		item.querySelectorAll(".counted").forEach((el) => el.classList.remove("counted"));
	
		const qtyElement = [...item.querySelectorAll("span, div")].find((el) =>
			/^Выделено\s+\d+\s+из\s+\d+$/.test(el.textContent.trim())
		);
		if (!qtyElement) return;
	
		const match = qtyElement.textContent
			.trim()
			.match(/^Выделено\s+(\d+)\s+из\s+(\d+)$/);
	
		if (match && Number(match[1]) > 1 && Number(match[2]) > 1) {
			qtyElement.classList.add("counted");
		}
	});
	
});

observer.observe(document.body || document, { childList: true, subtree: true });