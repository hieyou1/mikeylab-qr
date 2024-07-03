import "./settings.scss";
import * as bootstrap from "bootstrap";
import { get as idbGet, set as idbSet } from "idb-keyval";
import checkSupport from "./lib/check-support";

const DOM = {
    "size": {
        "width": (document.querySelector("#size-width") as HTMLInputElement),
        "height": (document.querySelector("#size-height") as HTMLInputElement)
    },
    "main": (document.querySelector("#card-body") as HTMLDivElement)
};

window.onload = async () => {
    let size = await idbGet("size") ?? 2000;
    DOM.size.width.value = size;
    DOM.size.height.value = size;
    console.log(size);

    DOM.size.width.onkeyup = DOM.size.width.onpaste = DOM.size.width.onchange = async () => {
        await idbSet("size", DOM.size.width.value);
        DOM.size.height.value = DOM.size.width.value;
    }

    let supportedTypes = ["png"];

    try {
        if (checkSupport("svg")) {
            supportedTypes.push("svg")
        }
        if (checkSupport("jpeg")) {
            supportedTypes.push("jpeg");
        }
    } catch (err) {
        console.log("ClipboardItem.supports() error, reporting PNG-only support");
        throw err;
    }

    let unsupportedTypes = document.createElement("div");
    unsupportedTypes.classList.add("input-group", "us-types");

    let svgBtn = document.createElement("button");
    svgBtn.classList.add("btn", "btn-outline-secondary", "dropdown-toggle");
    svgBtn.setAttribute("data-bs-toggle", "dropdown");
    svgBtn.setAttribute("aria-expanded", "false");
    svgBtn.innerText = "Copy SVGs as";
    unsupportedTypes.appendChild(svgBtn);

    let svgSel = document.createElement("ul");
    svgSel.classList.add("dropdown-menu");

    if (supportedTypes.includes("svg")) {
        let copySVGContainer = document.createElement("li");
        let copySVG = document.createElement("a");
        copySVG.classList.add("dropdown-item");
        copySVG.id = "svg-copy-svg";
        copySVG.href = "#";
        copySVG.onclick = async () => {
            await idbSet("copy-svg", "svg");
        };
        copySVG.innerText = "SVG";
        copySVGContainer.appendChild(copySVG);
        svgSel.appendChild(copySVGContainer);
    }

    let svgCopyTextContainer = document.createElement("li");
    let svgCopyText = document.createElement("a");
    svgCopyText.classList.add("dropdown-item");
    svgCopyText.id = "svg-copy-text";
    svgCopyText.href = "#";
    svgCopyText.onclick = async () => {
        await idbSet("copy-svg", "text");
    };
    svgCopyText.innerText = "Text";
    svgCopyTextContainer.appendChild(svgCopyText);
    svgSel.appendChild(svgCopyTextContainer);

    let svgCopyPNGContainer = document.createElement("li");
    let svgCopyPNG = document.createElement("a");
    svgCopyPNG.classList.add("dropdown-item");
    svgCopyPNG.id = "svg-copy-png";
    svgCopyPNG.href = "#";
    svgCopyPNG.onclick = async () => {
        await idbSet("copy-svg", "png");
    };
    svgCopyPNG.innerText = "PNG";
    svgCopyPNGContainer.appendChild(svgCopyPNG);
    svgSel.appendChild(svgCopyPNGContainer);

    unsupportedTypes.appendChild(svgSel);

    new bootstrap.Dropdown(svgBtn);

    let jpgBtn = document.createElement("button");
    jpgBtn.classList.add("btn", "btn-outline-secondary", "dropdown-toggle");
    jpgBtn.setAttribute("data-bs-toggle", "dropdown");
    jpgBtn.setAttribute("aria-expanded", "false");
    jpgBtn.innerText = "Copy JPGs as";
    unsupportedTypes.appendChild(jpgBtn);

    let jpgSel = document.createElement("ul");
    jpgSel.classList.add("dropdown-menu");

    if (supportedTypes.includes("jpeg")) {
        let copyJPGContainer = document.createElement("li");
        let copyJPG = document.createElement("a");
        copyJPG.classList.add("dropdown-item");
        copyJPG.id = "jpg-copy-jpg";
        copyJPG.href = "#";
        copyJPG.onclick = async () => {
            await idbSet("copy-jpg", "jpg");
        };
        copyJPG.innerText = "JPG";
        copyJPGContainer.appendChild(copyJPG);
        jpgSel.appendChild(copyJPGContainer);
    }

    let jpgCopyPNGContainer = document.createElement("li");
    let jpgCopyPNG = document.createElement("a");
    jpgCopyPNG.classList.add("dropdown-item");
    jpgCopyPNG.id = "jpg-copy-png";
    jpgCopyPNG.href = "#";
    jpgCopyPNG.onclick = async () => {
        await idbSet("copy-jpg", "png");
    };
    jpgCopyPNG.innerText = "PNG";
    jpgCopyPNGContainer.appendChild(jpgCopyPNG);
    jpgSel.appendChild(jpgCopyPNGContainer);

    let jpgCopyTextContainer = document.createElement("li");
    let jpgCopyText = document.createElement("a");
    jpgCopyText.classList.add("dropdown-item");
    jpgCopyText.id = "jpg-copy-text";
    jpgCopyText.href = "#";
    jpgCopyText.onclick = async () => {
        await idbSet("copy-jpg", "text");
    };
    jpgCopyText.innerText = "Text (not recommended!)";
    jpgCopyTextContainer.appendChild(jpgCopyText);
    jpgSel.appendChild(jpgCopyTextContainer);
    unsupportedTypes.appendChild(jpgSel);

    new bootstrap.Dropdown(jpgBtn);

    DOM.main.appendChild(document.createElement("br"));

    DOM.main.appendChild(unsupportedTypes);

    DOM.size.width.disabled = false;
};
