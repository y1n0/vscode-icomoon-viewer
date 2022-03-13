// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
	const vscode = acquireVsCodeApi();

	const searchInput = document.getElementById("search");
	const iconElms = document.querySelectorAll(".icon");

	// https://davidwalsh.name/javascript-debounce-function
	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The function will be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the function on the
	// leading edge, instead of the trailing.
	function debounce(func, wait, immediate) {
		var timeout;
		return function () {
			var context = this,
				args = arguments;
			var later = function () {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}

	const handleIconClick = (e) => {
		const elm = e.currentTarget;
		const iconName = elm.nextElementSibling.innerText;
		vscode.postMessage({ type: "copyIcon", value: iconName});
	}

	var handleSearchKeyUp = debounce(function (e) {
		var value = e.target.value.toUpperCase();
		var spans = document.querySelectorAll(".grid-item");
		spans.forEach((item) => {
			const iconName = item.querySelector(".icon-name").innerText;
			if (iconName.toUpperCase().indexOf(value) > -1) {
				item.style.display = "";
			} else {
				item.style.display = "none";
			}
		});
	}, 250);
	

	iconElms.forEach(elm => {
		elm.addEventListener("click", handleIconClick);
	})
	searchInput.addEventListener("keyup", handleSearchKeyUp);
})();
