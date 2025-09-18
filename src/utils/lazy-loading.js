/**
 * Advanced Lazy Loading with Performance Optimization
 * Implements blur placeholders and progressive enhancement
 */

class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.1,
      enableBlur: true,
      enablePlaceholder: true,
      retryAttempts: 3,
      retryDelay: 1000,
      ...options
    };

    this.observer = null;
    this.loadedImages = new Set();
    this.retryQueue = new Map();

    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: this.options.rootMargin,
          threshold: this.options.threshold
        }
      );

      // Start observing existing images
      this.observeImages();
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }

    // Listen for new images added to DOM
    this.setupMutationObserver();
  }

  observeImages() {
    const lazyImages = document.querySelectorAll('[data-lazy]');
    lazyImages.forEach(img => this.observer.observe(img));
  }

  setupMutationObserver() {
    if ('MutationObserver' in window) {
      const mutationObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              const lazyImages = node.matches && node.matches('[data-lazy]')
                ? [node]
                : node.querySelectorAll && node.querySelectorAll('[data-lazy]') || [];

              lazyImages.forEach(img => this.observer.observe(img));
            }
          });
        });
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  async loadImage(img) {
    if (this.loadedImages.has(img)) return;

    try {
      const srcset = img.dataset.lazy;
      const src = img.dataset.src;
      const placeholder = img.dataset.placeholder;

      // Show placeholder if available and blur is enabled
      if (placeholder && this.options.enablePlaceholder) {
        await this.loadPlaceholder(img, placeholder);
      }

      // Preload the actual image
      const imagePromise = this.preloadImage(srcset || src);

      // Show loading state
      img.classList.add('loading');

      const loadedImage = await imagePromise;

      // Apply the loaded image
      if (srcset) {
        img.srcset = srcset;
      }
      if (src) {
        img.src = src;
      }

      // Remove placeholder and blur effects
      img.classList.remove('loading', 'blur-placeholder');
      img.classList.add('loaded');

      // Clean up data attributes
      delete img.dataset.lazy;
      delete img.dataset.src;
      delete img.dataset.placeholder;

      this.loadedImages.add(img);

      // Trigger custom event
      img.dispatchEvent(new CustomEvent('imageLoaded', {
        detail: { src: src || srcset, loadTime: performance.now() }
      }));

    } catch (error) {
      console.warn('Failed to load image:', error);
      this.handleImageError(img, error);
    }
  }

  async loadPlaceholder(img, placeholderSrc) {
    try {
      const placeholder = await this.preloadImage(placeholderSrc);
      img.src = placeholderSrc;

      if (this.options.enableBlur) {
        img.classList.add('blur-placeholder');
      }
    } catch (error) {
      console.warn('Failed to load placeholder:', error);
    }
  }

  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));

      // Handle responsive images
      if (src.includes(',')) {
        img.srcset = src;
      } else {
        img.src = src;
      }
    });
  }

  handleImageError(img, error) {
    const retryCount = this.retryQueue.get(img) || 0;

    if (retryCount < this.options.retryAttempts) {
      this.retryQueue.set(img, retryCount + 1);

      setTimeout(() => {
        this.loadImage(img);
      }, this.options.retryDelay * (retryCount + 1));
    } else {
      // Show error state
      img.classList.add('error');
      img.alt = 'Image failed to load';

      // Trigger error event
      img.dispatchEvent(new CustomEvent('imageError', {
        detail: { error, retryAttempts: retryCount }
      }));
    }
  }

  loadAllImages() {
    // Fallback for browsers without IntersectionObserver
    const lazyImages = document.querySelectorAll('[data-lazy]');
    lazyImages.forEach(img => this.loadImage(img));
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.loadedImages.clear();
    this.retryQueue.clear();
  }

  // Static method to create responsive image HTML
  static createResponsiveImage(baseName, alt, className = '', critical = false) {
    const formats = ['avif', 'webp', 'jpeg'];
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

    let sources = '';
    let fallbackSrc = '';

    // Generate source elements for each format
    formats.forEach(format => {
      const srcset = sizes.map(size => {
        const filename = `${baseName}-${size}.${format}`;
        const width = {
          xs: '320w', sm: '640w', md: '768w',
          lg: '1024w', xl: '1280w', xxl: '1920w'
        }[size];
        return `/dist/images/${filename} ${width}`;
      }).join(', ');

      sources += `<source type="image/${format}" srcset="${srcset}" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw">`;
    });

    // Fallback src (largest JPEG)
    fallbackSrc = `/dist/images/${baseName}-xl.jpeg`;
    const placeholderSrc = `/dist/images/${baseName}-placeholder.jpeg`;

    const lazyAttrs = critical ? '' : `
      data-lazy="${fallbackSrc}"
      data-placeholder="${placeholderSrc}"
    `;

    const srcAttr = critical ? `src="${fallbackSrc}"` : `src="${placeholderSrc}"`;

    return `
      <picture class="responsive-image ${className}">
        ${sources}
        <img
          ${srcAttr}
          ${lazyAttrs}
          alt="${alt}"
          class="img-fluid ${critical ? 'critical' : 'lazy-load blur-placeholder'}"
          loading="${critical ? 'eager' : 'lazy'}"
          decoding="async"
        >
      </picture>
    `;
  }
}

// CSS for blur effect and loading states
const lazyLoadingCSS = `
  .lazy-load {
    transition: filter 0.3s ease-in-out, opacity 0.3s ease-in-out;
  }

  .blur-placeholder {
    filter: blur(10px);
  }

  .loading {
    opacity: 0.8;
  }

  .loaded {
    filter: none !important;
    opacity: 1;
  }

  .error {
    opacity: 0.5;
    filter: grayscale(100%);
  }

  .responsive-image {
    display: block;
    width: 100%;
  }

  .responsive-image img {
    width: 100%;
    height: auto;
    display: block;
  }

  /* Performance optimization */
  .critical {
    content-visibility: auto;
    contain-intrinsic-size: 500px;
  }

  /* Skeleton loading animation */
  .loading::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = lazyLoadingCSS;
  document.head.appendChild(style);
}

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.lazyLoader = new LazyImageLoader();
    });
  } else {
    window.lazyLoader = new LazyImageLoader();
  }
}

export default LazyImageLoader;