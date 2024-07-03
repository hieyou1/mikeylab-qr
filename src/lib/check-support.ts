import { ImageType } from "./svg-convert";

export default function checkSupport(type: ImageType): boolean {
    if (type == "png") return true;
    try {
        return ClipboardItem.supports((type == "svg") ? "image/svg+xml" : "image/jpeg");
    } catch (err) {
        console.error(err, " - error = no support for PNG");
        return false;
    }
}