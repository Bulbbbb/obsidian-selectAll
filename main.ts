import { App, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';


// Remember to rename these classes and interfaces!
interface MyPluginSettings {
	mySetting: string;
	selectAll: boolean;
}

// 默认设置
const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	selectAll: true
}
// 插件的生命周期
export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	select() {
		var activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		var editor = activeView.sourceMode.cmEditor;
		this._select(editor);
	}
	_select(editor: CodeMirror.Editor) {
		var lineNr = editor.getCursor().line;
		var contents = editor.getDoc().getLine(lineNr);
		if (contents.search(/>\s+[0-9]\.\s+/i) == 0) { // >+空格+数字+.+空格
			var ch_start = contents.search(/[^>\s0-9\.]/i);
		} else if (contents.search(/\s+[0-9]\.\s+/i) == 0) {// 空格+数字+.+空格
			var ch_start = contents.search(/[^\s0-9\.]/i);
		} else if (contents.search(/>\s+/i) == 0) {// >+空格
			var ch_start = contents.search(/[^>\s]/i);
		} else if (contents.search(/[0-9]\.\s+/i) == 0) { // 数字+.+空格
			var ch_start = contents.search(/[^\s0-9\.]/i);
		} else if (contents.search(/\+\s+/i) == 0) { // 加号+空格
			var ch_start = contents.search(/[^\+\s]/i);
		} else if (contents.search(/\s+\+\s+/i) == 0) { // 空格+加号+空格
			var ch_start = contents.search(/[^\+\s]/i);
		} else if (contents.search(/\s+\-\s+/i) == 0) { // 空格+减号+空格
			var ch_start = contents.search(/[^\-\s]/i);
		} else if (contents.search(/\-\s+/i) == 0) { // 减号+空格
			var ch_start = contents.search(/[^\-\s]/i);
		} else {
			var ch_start = contents.search(/[^\s]/i);
			// var ch_start = 0;
		}
		// 匹配 callout
		if (contents.search(/>\s+\[\![a-z]+\]\s+/i) == 0) {
      		var _start = contents.indexOf(']');
      		var cc = contents.slice(_start);
      		var ch_start = cc.search(/[^\]\s]/i) + _start;
    	}
    	if (contents.search(/>\s+\[\![a-z]+\]\+\s+/i) == 0) { // 匹配 callout（+）
      		var _start = contents.indexOf(']');
      		var cc = contents.slice(_start);
      		var ch_start = cc.search(/[^\]\+\s]/i) + _start;
    	}
    	if (contents.search(/>\s+\[\![a-z]+\]\-\s+/i) == 0) { // 匹配 callout（-）
      		var _start = contents.indexOf(']');
      		var cc = contents.slice(_start);
      		var ch_start = cc.search(/[^\]\-\s]/i) + _start;
    	}
		let cursorStart = { line: lineNr, ch: ch_start };
		let cursorEnd = { line: lineNr, ch: contents.length };
		let content = editor.getRange(cursorStart, cursorEnd) + "\n";
		// let node = editor.getCursor;
		editor.setSelection(cursorStart, cursorEnd)
		// console.log(contents); // >+空格+数组+空格contents.indexOf(']')
		// console.log(contents.indexOf(']')); // >+空格+数组+空格

		// console.log(contents.search(/>\s+\[\![a-z]+\]\s+/i)); // >+空格+数组+空格
		// var bb=new RegExp(/\s/);
		// console.log(contents.startsWith(bb));
	}
	// 激活插件时触发
	async onload() {

		await this.loadSettings(); // 加载设置

		// // This creates an icon in the left ribbon.
		// this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
		// 	new Notice('插件用于增强`Ctrl+A`快捷键功能');
		// });

		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');
		this.addCommand({
			id: 'select-block',
			name: '选择一个block',
			callback: () => this.select(), // 增强后的选择函数
			hotkeys: [
				{
					modifiers: ["Mod"],
					key: "A",
				},
			],
		});

		// this.addSettingTab(new SampleSettingTab(this.app, this));
	}
	// 卸载插件时触发
	onunload() {
		console.log('unloading plugin')
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h1', { text: 'Settings for my awesome plugin.' });

		// 增强`Ctrl+A`功能
		new Setting(containerEl)
			.setName("增强`Ctrl+A`的功能")
			.setDesc("Press the hotkey once to select the current list item. Press the hotkey twice to select the entire list.")
			.addToggle(toggle => toggle  // 增加一个toggle按钮
				.setValue(this.plugin.settings.selectAll)
				.onChange(async (value) => {
					this.plugin.settings.selectAll = value;
					await this.plugin.saveSettings
				})
			)
	}
}
