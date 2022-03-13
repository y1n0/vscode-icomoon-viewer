const vscode = require("vscode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
class SidebarProvider {
	viewName = "IcomoonIconsPanel";

	constructor(extensionUri) {
		this._extensionUri = extensionUri;
		this._selection = [];
		this.isReady = new Promise((resolve) => {
			this._resolveIsReady = resolve
		});
		this.loadIconsList();
	}

	loadIconsList() {
		vscode.workspace
			.findFiles("**/selection.json", "/node_modules/", 1)
			.then((uris) => {
				const selectionPath = uris[0].path;
				const selectionJson = require(selectionPath);
				this._selection = selectionJson.icons;
			})
			.catch((err) => {
				console.error(err);
			})
			.finally(() => {
				this._resolveIsReady();
			});
	}

	resolveWebviewView(webviewView, context, token) {

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
			localResourceRoots: [this._extensionUri],
		};

		webviewView.webview.onDidReceiveMessage((data) => {
			switch (data.type) {
				case "copyIcon": {
					vscode.env.clipboard.writeText(data.value);
					vscode.window.showInformationMessage(
						`Copied "${data.value}" to the clipboard!`
					);
					break;
				}
			}
		});
		return this.isReady.then(() => {
			webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
		})
	}

	_getHtmlForWebview(webview) {
		const nonce = getNonce();

		const styleResetUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "assets", "reset.css")
		);
		const styleMainUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "assets", "style.css")
		);
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "assets", "main.js")
		);

		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
			-->
			<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${
				webview.cspSource
			}; script-src 'nonce-${nonce}';">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			
			<link href="${styleResetUri}" rel="stylesheet">
			<link href="${styleMainUri}" rel="stylesheet">
			
			<title>Cat Colors</title>
		</head>
		<body>

		${this._selection.length === 0 ? `<p>No selection.json found is this workspace</p>` : ``}
		${
			this._selection.length !== 0
				? `<input type="text" id="search" placeholder="Search" />`
				: ``
		}
			<ul class="icons-grid">
				${this._selection.map(this._renderIcon).join("")}
			</ul>
			<script nonce="${nonce}" src="${scriptUri}"></script>
		</body>
		</html>`;
	}

	_renderIcon(icon) {
		const width = icon.icon.width || 1024;
		return `
		<li class="grid-item">
			<div class="icon-box">
				<svg class="icon" viewBox="0 0 ${width} 1024">
					${icon.icon.paths.map((path) => `<path d="${path}" />`)}
				</svg>
				<p class="icon-name">${icon.properties.name}</p>
			</div>
		</li>
		`;
	}
}

function getNonce() {
	let text = "";
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

module.exports = {
	SidebarProvider,
};
