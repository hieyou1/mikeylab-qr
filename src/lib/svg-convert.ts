import { Canvg, presets, IOptions } from "canvg";

export type Convertable = "png" | "jpeg";

export type ImageType = "svg" | Convertable;

export default async function convert(svg: SVGElement, type: Convertable, width: number, height: number): Promise<Blob> {
    let canvas = new OffscreenCanvas(width, height);
    await (await Canvg.from(
        (canvas).getContext('2d') as OffscreenCanvasRenderingContext2D,
        svg.outerHTML,
        presets.offscreen() as IOptions
    )).render();
    return await canvas.convertToBlob({
        "type": "image/" + type
    });
}