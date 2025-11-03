class XLanguage {
    private static _languages = ["en", "ru", "kr"];
    private static _currentLanguage = "en";

    static getLanguages() { return this._languages; }
    static getCurrentLanguage() { return this._currentLanguage; }
    static setCurrentLanguage(lang: string) { this._currentLanguage = lang; }

    static getLanguageAnchor(langCode: string): HTMLElement {
        return document.getElementById(`mw-language-${langCode}`) as HTMLElement;
    }
}

class XMenu {
    private static _currentMenu = "home-en";
    private static _ids = ["home", "builds", "mechanics"];

    static getCurrentMenu() { return this._currentMenu; }
    static setCurrentMenu(menu: string) { this._currentMenu = menu; }

    static getIds() { return this._ids; }

    static getMenus() {
        return Object.fromEntries(
            this._ids.map(id => [id, XMenu.getMenuOption(id)])
        );
    }

    static getMainContent() {
        return document.getElementById('mw-content') as HTMLElement;
    }

    static getMenuWrapper() {
        return document.getElementById('mw-menu-wrapper') as HTMLElement;
    }

    static getMenuOption(option: string) {
        return document.getElementById(`mw-menu-${option}`) as HTMLElement;
    }
}

class XBuilds {
    private static _anchors = [
        "mw-builds-wz-element",
        "mw-builds-wz-affix"
    ];

    static getAnchors() { return this._anchors; }

    static getId(doc: Document, wrapperType: string) {
        return doc.getElementById(`mw-${wrapperType}-wrapper`);
    }
}

async function bindLoadPage(page: string) {
    const res =  await fetch(`/${page}-${XLanguage.getCurrentLanguage()}`, {cache: "no-cache"});
    const html = await res.text();

    const container = XMenu.getMainContent();
    if (!container) return console.warn('mw-content not found');

    container.innerHTML = html;

    if (page.includes("build")) changeBuildsTab();
}

function bindLanguageAndMenu() {
    const menuTexts: Record<string, [string, string, string, string]> = {
        ru: ["Frederick", "ГЛАВНАЯ", "СБОРКИ", "МЕХАНИКИ"],
        en: ["RuiXian", "HOME", "BUILDS", "MECHANICS"],
        kr: ["RuiXian", "메인", "빌드", "메카니즘"]
    };

    for (const lang of XLanguage.getLanguages()) {
        const anchor = XLanguage.getLanguageAnchor(lang);
        anchor.onclick = async () => {
            XLanguage.setCurrentLanguage(lang);

            const currentPage = XMenu.getCurrentMenu().split('-')[0];
            await bindLoadPage(currentPage);
            XMenu.setCurrentMenu(`${currentPage}-${lang}`);


            const [fontFamily, home, builds, mech] = menuTexts[lang];
            const menus = XMenu.getMenus();
            XMenu.getMenuWrapper().style.setProperty("font-family", fontFamily, "important");
            XMenu.getMainContent().style.setProperty("font-family", fontFamily, "important");

            menus["home"].textContent = home;
            menus["builds"].textContent = builds;
            menus["mechanics"].textContent = mech;

            console.log(`[LANG] switched to: ${lang}, font: ${fontFamily}`);
        };
    }
}

function bindChangeMenu() {
    for (const menu of XMenu.getIds()) {
        XMenu.getMenuOption(menu).onclick = async () => {
            await bindLoadPage(menu);
            XMenu.setCurrentMenu(`${menu}-${XLanguage.getCurrentLanguage()}`);
        };
    }
}

function changeBuildsTab() {
    for (const anchor of XBuilds.getAnchors()) {
        const anchorEle = document.getElementById(anchor);
        if (!anchorEle) continue;

        anchorEle.onclick = async () => {
            const res = await fetch(`/${anchor}-${XLanguage.getCurrentLanguage()}`, {cache: "no-cache"});
            const html = await res.text();
            if (!html) return;

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const ids = ["note", "damage-type", "team", "build"];
            for (const id of ids) {
                const current = document.getElementById(`mw-${id}-wrapper`);
                const other = doc.getElementById(`mw-${id}-wrapper`);
                if (current && other) current.innerHTML = other.innerHTML;
            }
        };
    }
}



function blockScroll() {
    document.body.style.overflow = "hidden";
    window.addEventListener('wheel', function(event) {
        if (event.ctrlKey) {
            event.preventDefault();
        }
    });
    window.addEventListener('keydown', function (e) {
        if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '_')) {
            e.preventDefault();
        }
    });
}

function blockF12() {
    window.addEventListener("keydown", (e) => {
        if (e.key === "F12") e.preventDefault();
    });
}

function blockRMB() {
    window.addEventListener("keydown", (e) => {
        if (e.key == "contextmenu") e.preventDefault();
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    blockScroll();
    blockF12();
    blockRMB();
    bindLanguageAndMenu();
    bindChangeMenu();
    await bindLoadPage("home");
});