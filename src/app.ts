import './styles.scss';
import { get as idbGet, set as idbSet } from "idb-keyval";
import convertSVG, { ImageType } from "./lib/svg-convert";
import checkSupport from "./lib/check-support";

const DOM = {
    "qr": (document.querySelector("#qr") as SVGElement),
    "content": (document.querySelector("#content") as HTMLInputElement),
    "toggle": {
        "div": (document.querySelector("#toggle") as HTMLDivElement),
        "svg": (document.querySelector("#toggle-svg") as HTMLInputElement),
        "png": (document.querySelector("#toggle-png") as HTMLInputElement),
        "jpg": (document.querySelector("#toggle-jpg") as HTMLInputElement)
    },
    "export": {
        "div": (document.querySelector("#export") as HTMLDivElement),
        "copy": (document.querySelector("#copy") as HTMLButtonElement),
        "download": (document.querySelector("#download") as HTMLButtonElement)
    }
}

const getType: () => ImageType = () => {
    let type: ImageType;

    if (DOM.toggle.svg.checked) type = "svg";
    else if (DOM.toggle.png.checked) type = "png";
    else type = "jpeg";

    return type;
}

const getFile: () => Promise<Blob> = async () => {
    let type = getType();
    let file: Blob;
    if (type == "svg") {
        file = new Blob([DOM.qr.outerHTML], {
            "type": "image/svg+xml"
        })
    } else {
        file = await convertSVG(DOM.qr, type, await idbGet("size") ?? 2000, await idbGet("size") ?? 2000);
    }

    return file;
};
const download = async () => {
    let type = getType();
    let file = await getFile();
    let url = URL.createObjectURL(file);

    let a = document.createElement("a");
    a.href = url;
    a.download = "qr." + ((type == "jpeg") ? "jpg" : type);
    a.click();

    URL.revokeObjectURL(url);
};
const copyNative = async () => {
    let file = await getFile();
    let clipboardOpts: Partial<Record<string, Blob>> = {};
    clipboardOpts[file.type] = file;
    await navigator.clipboard.write([new ClipboardItem(clipboardOpts as Record<string, Blob>)]);
}
const copy = async () => {
    let { state: permission } = await navigator.permissions.query({
        "name": "clipboard-write" as unknown as PermissionName
    });
    if (permission != "granted") {
        DOM.export.copy.disabled = true;
        return;
    }
    switch (getType()) {
        case "png": {
            return await copyNative();
        }
        case "svg": {
            let copyAs = await idbGet("copy-svg");
            if (checkSupport("svg") && (!copyAs || copyAs == "svg")) return await copyNative();
            if (copyAs == "png") {
                DOM.toggle.png.checked = true;
                idbSet("export-type", "png");
                return await copyNative();
            } else {
                return await navigator.clipboard.writeText(DOM.qr.outerHTML);
            }
        }
        case "jpeg": {
            let copyAs = await idbGet("copy-jpg");
            if (checkSupport("jpeg") && (!copyAs || copyAs == "jpg")) return await copyNative();
            if (!copyAs || copyAs == "png") {
                DOM.toggle.png.checked = true;
                idbSet("export-type", "png");
                return await copyNative();
            } else {
                return await navigator.clipboard.writeText(await (await getFile()).text());
            }
        }
        default: {
            throw new Error("Wrong type");
        }
    }
};
const updateQR = () => {
    idbSet("content", DOM.content.value);
    // @ts-ignore not an npm package
    let elem = QRCode(DOM.content.value) as SVGElement;
    elem.id = "qr";
    elem.removeAttribute("width");
    elem.removeAttribute("height");
    document.querySelector("#qr").outerHTML = elem.outerHTML;
};
window.onload = async () => {
    window.onkeydown = (e: KeyboardEvent) => {
        if (!e.ctrlKey && !e.metaKey) return;
        switch (e.key) {
            case "v": {
                e.preventDefault();
                idbSet("export-type", "svg");
                DOM.toggle.svg.checked = true;
                break;
            }
            case "p": {
                e.preventDefault();
                idbSet("export-type", "png");
                DOM.toggle.png.checked = true;
                break;
            }
            case "j": {
                e.preventDefault();
                idbSet("export-type", "jpeg");
                DOM.toggle.jpg.checked = true;
                break;
            }
            case "s":
            case "d": {
                e.preventDefault();
                download();
                break;
            }
            case "c": {
                e.preventDefault();
                copy();
                break;
            }
            case ",": {
                e.preventDefault();
                window.location.href = "/settings.html";
                break;
            }
            default: {
                break;
            }
        }
    };
    let content = await idbGet("content");
    DOM.content.value = content ?? window.location.origin;
    updateQR();
    DOM.content.onkeyup = DOM.content.onpaste = () => updateQR();
    DOM.content.disabled = false;
    let type = await idbGet("export-type") as ImageType ?? "png";
    switch (type) {
        case "jpeg": {
            DOM.toggle.jpg.checked = true;
            break;
        }
        case "svg": {
            DOM.toggle.svg.checked = true;
            break;
        }
        case "png": {
            DOM.toggle.png.checked = true;
            break;
        }
    }
    DOM.toggle.div.onclick = () => idbSet("export-type", getType());
    // @ts-ignore
    for (let i of document.querySelectorAll("input[name=toggle-state]")) {
        (i as HTMLInputElement).disabled = false;
    }
    DOM.export.copy.onclick = copy;
    DOM.export.download.onclick = download;
    // @ts-ignore
    for (let i of DOM.export.div.getElementsByTagName("button")) {
        i.disabled = false;
    }

    window.onclick = (e) => {
        if ((e.target as HTMLElement).tagName.toLowerCase() != "button" && (e.target as HTMLElement).tagName.toLowerCase() != "input") {
            DOM.content.select();
        }
    }
};