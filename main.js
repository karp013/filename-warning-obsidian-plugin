// main.js
const { Plugin, Notice, Setting, PluginSettingTab } = require("obsidian");

module.exports = class FilenameLengthWarningPlugin extends Plugin {
    async onload() {
        console.log("Filename Length Warning Plugin loaded");

        // Load settings or apply defaults
        this.settings = Object.assign({}, { maxLength: 127 }, await this.loadData());

        // Add plugin settings tab
        this.addSettingTab(new FilenameLimiterSettingTab(this.app, this));

        // Function to check filename length
        const checkName = (file) => {
            if (file.extension === "md") {
                const nameWithoutExt = file.basename;
                if (nameWithoutExt.length > this.settings.maxLength) {
                    new Notice(
                        `⚠️ Filename exceeds ${this.settings.maxLength} characters (${nameWithoutExt.length})!`
                    );
                }
            }
        };

        // Events: check on file creation and rename
        this.registerEvent(this.app.vault.on("create", checkName));
        this.registerEvent(this.app.vault.on("rename", checkName));
    }

    onunload() {
        console.log("Filename Length Warning Plugin unloaded");
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
};

// Settings tab UI
class FilenameLimiterSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl("h2", { text: "Filename Length Limiter Settings" });

        new Setting(containerEl)
            .setName("Maximum filename length")
            .setDesc("Warn if filename exceeds this length")
            .addText((text) =>
                text
                    .setPlaceholder("127")
                    .setValue(this.plugin.settings.maxLength.toString())
                    .onChange(async (value) => {
                        const num = parseInt(value);
                        if (!isNaN(num) && num > 0) {
                            this.plugin.settings.maxLength = num;
                            await this.plugin.saveSettings();
                        }
                    })
            );
    }
}
