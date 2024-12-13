function Save() {
	window.alert("save");
}

function PageTop() {
	window.alert("top");
}

export function initShortcuts() {
	document.addEventListener("keydown", (e) => {
		if (e.altKey && e.key === "s") {
			Save();
			return;
		}
		if (e.altKey && e.key === "t") {
			PageTop();
			return;
		}
	});
}
