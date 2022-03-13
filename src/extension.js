const vscode = require("vscode");
const { SidebarProvider } = require("./sidebar-provider");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const provider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(provider.viewName, provider)
	);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
