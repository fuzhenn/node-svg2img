type Callback = (err: any, buffer: any) => any;

declare enum Format {
  jpeg = 'jpeg',
  jpg = 'jpg',
  png = 'png',
}

export interface svg2imgOptions {
  width?: number;
  height?: number;
  preserveAspectRatio?: boolean | string;
  format?: Format;
  quality?: number;
}

declare function svg2img(svg: string, options: svg2imgOptions, callback: Callback): void;
declare function svg2img(svg: string, callback: Callback): void;
export default svg2img;
