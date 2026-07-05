import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { EbookData } from '@api/models';
import ePub from 'epubjs';

type EpubBook = any;
type EpubRendition = any;
type EpubLocation = { start?: { cfi?: string } };

@Component({
  selector: 'app-ebook-reader',
  templateUrl: './ebook-reader.component.html',
  styleUrls: ['./ebook-reader.component.scss'],
  standalone: false,
})
export class EbookReaderComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() book: EbookData | null = null;
  @Input() useDarkMode = false;
  @Output() closeReader = new EventEmitter<void>();
  @ViewChild('viewer', { static: true }) viewer?: ElementRef<HTMLDivElement>;

  loading = false;
  errorMessage = '';
  progressPercent = 0;
  chapterHref = '';
  chapters: Array<{ label: string; href: string }> = [];
  hasGeneratedLocations = false;

  private epubBook?: EpubBook;
  private rendition?: EpubRendition;
  private viewReady = false;
  private currentCfi = '';
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit() {
    this.viewReady = true;
    this.resizeObserver = new ResizeObserver(() => this.rendition?.resize());
    if (this.viewer?.nativeElement) {
      this.resizeObserver.observe(this.viewer.nativeElement);
    }
    void this.renderCurrentBook();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['useDarkMode'] && this.rendition) {
      this.applyTheme();
    }
    if (changes['book'] && this.viewReady) {
      void this.renderCurrentBook();
    }
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    this.destroyReader();
  }

  async goToPreviousPage() {
    await this.rendition?.prev();
  }

  async goToNextPage() {
    await this.rendition?.next();
  }

  async onChapterChange(href: string) {
    this.chapterHref = href;
    await this.rendition?.display(href);
  }

  onClose() {
    this.closeReader.emit();
  }

  private async renderCurrentBook() {
    this.destroyReader();
    this.errorMessage = '';
    this.progressPercent = 0;
    this.chapters = [];
    this.chapterHref = '';
    this.hasGeneratedLocations = false;

    if (!this.book?.filePath || !this.viewer?.nativeElement) {
      return;
    }

    this.loading = true;
    try {
      this.epubBook = ePub(this.book.filePath);
      this.rendition = this.epubBook.renderTo(this.viewer.nativeElement, {
        width: '100%',
        height: '100%',
        flow: 'scrolled-doc',
        manager: 'continuous',
      });

      this.registerEvents();
      this.registerThemes();
      this.applyTheme();

      const navigation = await this.epubBook.loaded.navigation;
      this.chapters = (navigation?.toc || []).map((item: { label: string; href: string }) => ({
        label: item.label,
        href: item.href,
      }));

      await this.epubBook.ready;
      const savedLocation = this.getStoredLocation();
      await this.rendition.display(savedLocation || undefined);
      this.loading = false;

      void this.generateLocations();
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Unable to open this EPUB in the browser.';
      this.loading = false;
    }
  }

  private registerEvents() {
    this.rendition?.on('relocated', (location: EpubLocation) => {
      const cfi = location?.start?.cfi || '';
      if (!cfi) {
        return;
      }

      this.currentCfi = cfi;
      this.storeLocation(cfi);

      if (this.hasGeneratedLocations && this.epubBook?.locations) {
        const progress = this.epubBook.locations.percentageFromCfi(cfi);
        this.progressPercent = Number.isFinite(progress) ? Math.round(progress * 100) : 0;
      }
    });

    this.rendition?.on('rendered', (_section: unknown, view: { section?: { href?: string } }) => {
      this.chapterHref = view?.section?.href || this.chapterHref;
    });
  }

  private registerThemes() {
    const themes = this.rendition?.themes;
    themes?.register('light', {
      body: {
        background: '#f7f1e3 !important',
        color: '#1f1f1f !important',
      },
      a: {
        color: '#22577a !important',
      },
      '::selection': {
        background: '#c8d6e5 !important',
      },
    });
    themes?.register('dark', {
      body: {
        background: '#11151c !important',
        color: '#f5f7fa !important',
      },
      a: {
        color: '#8ecae6 !important',
      },
      '::selection': {
        background: '#3c4f65 !important',
      },
    });
  }

  private applyTheme() {
    this.rendition?.themes.select(this.useDarkMode ? 'dark' : 'light');
  }

  private async generateLocations() {
    try {
      await this.epubBook?.locations?.generate(1600);
      this.hasGeneratedLocations = true;
      if (this.currentCfi && this.epubBook?.locations) {
        const progress = this.epubBook.locations.percentageFromCfi(this.currentCfi);
        this.progressPercent = Number.isFinite(progress) ? Math.round(progress * 100) : 0;
      }
    } catch (error) {
      console.error(error);
    }
  }

  private getStoredLocation() {
    if (!this.book) {
      return '';
    }
    return localStorage.getItem(this.storageKey()) || '';
  }

  private storeLocation(cfi: string) {
    if (!this.book) {
      return;
    }
    localStorage.setItem(this.storageKey(), cfi);
  }

  private storageKey() {
    return `ebook-reader-location:${this.book?.id ?? this.book?.filePath ?? 'unknown'}`;
  }

  private destroyReader() {
    this.rendition?.destroy();
    this.epubBook?.destroy?.();
    this.rendition = undefined;
    this.epubBook = undefined;
    this.currentCfi = '';
    this.hasGeneratedLocations = false;
  }
}
