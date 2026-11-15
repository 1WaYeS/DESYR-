declare module 'page-flip/dist/js/page-flip.module.js' {
  export class PageFlip {
    constructor(element: HTMLElement, settings: {
      width: number; height: number; size: 'stretch' | 'fixed'; minWidth: number; maxWidth: number; minHeight: number; maxHeight: number;
      startPage: number; usePortrait: boolean; showCover: boolean; drawShadow: boolean; maxShadowOpacity: number; flippingTime: number;
      autoSize: boolean; mobileScrollSupport: boolean; clickEventForward: boolean; useMouseEvents: boolean; showPageCorners: boolean; disableFlipByClick: boolean;
    });
    on(name: 'flip' | 'changeState', callback: (event: { data: string | number }) => void): void;
    loadFromHTML(pages: HTMLElement[]): void;
    getCurrentPageIndex(): number;
    getOrientation(): 'portrait' | 'landscape';
    getState(): 'read' | 'flipping' | 'user_fold' | 'fold_corner';
    turnToPage(page: number): void;
    flip(page: number, corner?: 'top' | 'bottom'): void;
    flipNext(corner?: 'top' | 'bottom'): void;
    flipPrev(corner?: 'top' | 'bottom'): void;
    update(): void;
    destroy(): void;
  }
}
