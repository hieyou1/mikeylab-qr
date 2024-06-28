import { get as idbGet, set as idbSet } from "idb-keyval";
import './styles.scss';
import convertSVG, { ImageType } from "./lib/svg-convert";

const getType: () => ImageType = () => {
    let type: ImageType;

    if ((document.querySelector("#toggle-svg") as HTMLInputElement).checked) type = "svg";
    else if ((document.querySelector("#toggle-png") as HTMLInputElement).checked) type = "png";
    else type = "jpeg";

    return type;
}

const getFile: () => Promise<Blob> = async () => {
    let type = getType();
    let file: Blob;
    if (type == "svg") {
        file = new Blob([(document.querySelector("#qr") as SVGElement).outerHTML], {
            "type": "image/svg+xml"
        })
    } else {
        file = await convertSVG((document.querySelector("#qr") as SVGElement), type, await idbGet("size") ?? 2000, await idbGet("size") ?? 2000);
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
const copy = async () => {
    let { state: permission } = await navigator.permissions.query({
        "name": "clipboard-write" as unknown as PermissionName
    });
    if (permission != "granted") {
        (document.querySelector("#copy") as HTMLButtonElement).disabled = true;
        return;
    }
    let file = await getFile();
    let clipboardOpts: Partial<Record<string, Blob>> = {};
    clipboardOpts[file.type] = file;
    await navigator.clipboard.write([new ClipboardItem(clipboardOpts as Record<string, Blob>)]);
};
const updateQR = () => {
    idbSet("content", (document.querySelector("#content") as HTMLInputElement).value);
    // @ts-ignore not an npm package
    let elem = QRCode((document.querySelector("#content") as HTMLInputElement).value) as SVGElement;
    elem.id = "qr";
    elem.removeAttribute("width");
    elem.removeAttribute("height");
    (document.querySelector("#qr") as SVGElement).outerHTML = elem.outerHTML;
};
window.onload = async () => {
    window.onkeydown = (e: KeyboardEvent) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        switch (e.key) {
            case "s": {
                (document.querySelector("#toggle-svg") as HTMLInputElement).checked = true;
                break;
            }
            case "p": {
                (document.querySelector("#toggle-png") as HTMLInputElement).checked = true;
                break;
            }
            case "j": {
                (document.querySelector("#toggle-jpg") as HTMLInputElement).checked = true;
                break;
            }
            case "d": {
                download();
                break;
            }
            case "c": {
                copy();
                break;
            }
            default: {
                break;
            }
        }
    };
    let content = await idbGet("content");
    (document.querySelector("#content") as HTMLInputElement).value = content ?? window.location.origin;
    updateQR();
    (document.querySelector("#content") as HTMLInputElement).onkeyup = (document.querySelector("#content") as HTMLInputElement).onpaste = () => updateQR();
    (document.querySelector("#content") as HTMLInputElement).disabled = false;
    let type = await idbGet("export-type") as ImageType ?? "png";
    switch (type) {
        case "jpeg": {
            (document.querySelector("#toggle-jpg") as HTMLInputElement).checked = true;
            break;
        }
        case "svg": {
            (document.querySelector("#toggle-svg") as HTMLInputElement).checked = true;
            break;
        }
        case "png": {
            (document.querySelector("#toggle-png") as HTMLInputElement).checked = true;
            break;
        }
    }
    (document.querySelector("#toggle") as HTMLDivElement).onclick = () => idbSet("export-type", getType());
    // @ts-ignore
    for (let i of document.querySelectorAll("input[name=toggle-state]")) {
        (i as HTMLInputElement).disabled = false;
    }
    (document.querySelector("#copy") as HTMLButtonElement).onclick = copy;
    (document.querySelector("#download") as HTMLButtonElement).onclick = download;
    // @ts-ignore
    for (let i of (document.querySelector("#export") as HTMLDivElement).getElementsByTagName("button")) {
        i.disabled = false;
    }
};