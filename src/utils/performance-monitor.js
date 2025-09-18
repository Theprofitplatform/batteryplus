/**
 * Advanced Performance Monitoring System
 * Tracks Core Web Vitals and image loading performance
 */

class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      enableVitals: true,
      enableImageTracking: true,
      enableUserTiming: true,
      reportingEndpoint: '/api/metrics',
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      ...options
    };

    this.metrics = {
      vitals: {},
      images: [],
      timing: {},
      errors: []
    };

    this.queue = [];
    this.isSupported = this.checkSupport();

    if (this.isSupported) {
      this.init();
    }
  }

  checkSupport() {
    return !!(
      window.performance &&
      window.performance.mark &&
      window.performance.measure &&
      window.PerformanceObserver
    );
  }

  init() {
    if (this.options.enableVitals) {
      this.initWebVitals();
    }

    if (this.options.enableImageTracking) {
      this.initImageTracking();
    }

    if (this.options.enableUserTiming) {
      this.initUserTiming();
    }

    // Set up automatic reporting
    this.setupReporting();

    // Track page visibility changes
    this.trackVisibilityChanges();
  }

  initWebVitals() {
    // Import web-vitals dynamically
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(this.recordVital.bind(this, 'CLS'));
      onFID(this.recordVital.bind(this, 'FID'));
      onFCP(this.recordVital.bind(this, 'FCP'));
      onLCP(this.recordVital.bind(this, 'LCP'));
      onTTFB(this.recordVital.bind(this, 'TTFB'));
      onINP(this.recordVital.bind(this, 'INP'));
    }).catch(() => {
      // Fallback to manual Core Web Vitals tracking
      this.manualWebVitals();
    });
  }

  manualWebVitals() {
    // LCP observer
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordVital('LCP', { value: lastEntry.startTime, entry: lastEntry });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // CLS observer
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.recordVital('CLS', { value: clsValue });
    }).observe({ entryTypes: ['layout-shift'] });

    // FCP observer
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0];
      this.recordVital('FCP', { value: firstEntry.startTime, entry: firstEntry });
    }).observe({ entryTypes: ['paint'] });
  }

  recordVital(name, metric) {
    this.metrics.vitals[name] = {
      value: metric.value,
      rating: this.getRating(name, metric.value),
      timestamp: Date.now(),
      id: metric.id || null
    };

    this.queueMetric('vital', { name, ...this.metrics.vitals[name] });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${name}:`, metric.value, this.getRating(name, metric.value));
    }
  }

  getRating(metric, value) {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  initImageTracking() {
    // Track image loading performance
    document.addEventListener('imageLoaded', (event) => {
      const imageData = {
        src: event.detail.src,
        loadTime: event.detail.loadTime,
        timestamp: Date.now(),
        type: 'lazy-loaded'
      };

      this.metrics.images.push(imageData);
      this.queueMetric('image', imageData);
    });

    // Track critical image loading
    window.addEventListener('load', () => {
      const images = document.querySelectorAll('img.critical');
      images.forEach(img => {
        if (img.complete) {
          const imageData = {
            src: img.src,
            loadTime: performance.now(),
            timestamp: Date.now(),
            type: 'critical'
          };

          this.metrics.images.push(imageData);
          this.queueMetric('image', imageData);
        }
      });
    });

    // Observe resource timing for images
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === 'img') {
          const imageData = {
            src: entry.name,
            loadTime: entry.responseEnd - entry.startTime,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
            timestamp: Date.now(),
            type: 'resource-timing'
          };

          this.metrics.images.push(imageData);
          this.queueMetric('image', imageData);
        }
      }
    }).observe({ entryTypes: ['resource'] });
  }

  initUserTiming() {
    // Custom timing marks and measures
    this.mark = (name) => {
      performance.mark(name);
      return {
        end: () => {
          const measureName = `${name}-duration`;
          performance.measure(measureName, name);
          const measure = performance.getEntriesByName(measureName)[0];

          this.metrics.timing[name] = {
            duration: measure.duration,
            timestamp: Date.now()
          };

          this.queueMetric('timing', { name, duration: measure.duration });
          return measure.duration;
        }
      };
    };
  }

  trackVisibilityChanges() {
    document.addEventListener('visibilitychange', () => {
      this.queueMetric('visibility', {
        hidden: document.hidden,
        timestamp: Date.now()
      });

      if (document.hidden) {
        // Flush metrics when page becomes hidden
        this.flush();
      }
    });
  }

  setupReporting() {
    // Automatic flushing
    setInterval(() => {
      this.flush();
    }, this.options.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Flush on page hide
    window.addEventListener('pagehide', () => {
      this.flush();
    });
  }

  queueMetric(type, data) {
    this.queue.push({
      type,
      data,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType()
    });

    if (this.queue.length >= this.options.batchSize) {
      this.flush();
    }
  }

  getConnectionType() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    } : null;
  }

  async flush() {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    try {
      // Use sendBeacon for better reliability
      if (navigator.sendBeacon && this.options.reportingEndpoint) {
        const success = navigator.sendBeacon(
          this.options.reportingEndpoint,
          JSON.stringify({ metrics: batch })
        );

        if (!success) {
          // Fallback to fetch
          await this.sendViaFetch(batch);
        }
      } else {
        await this.sendViaFetch(batch);
      }

      console.log(`📤 Sent ${batch.length} metrics`);

    } catch (error) {
      console.warn('Failed to send metrics:', error);

      // Re-queue failed metrics (with limit to prevent infinite growth)
      if (this.queue.length < 100) {
        this.queue.unshift(...batch);
      }
    }
  }

  async sendViaFetch(batch) {
    if (!this.options.reportingEndpoint) {
      // Log to console if no endpoint configured
      console.log('📊 Performance Metrics:', batch);
      return;
    }

    const response = await fetch(this.options.reportingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metrics: batch }),
      keepalive: true
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // Public API methods
  getMetrics() {
    return { ...this.metrics };
  }

  getVitalsScore() {
    const vitals = this.metrics.vitals;
    const scores = Object.entries(vitals).map(([name, data]) => {
      const weight = { LCP: 25, FID: 25, CLS: 25, FCP: 25 }[name] || 0;
      const score = data.rating === 'good' ? 100 : data.rating === 'needs-improvement' ? 50 : 0;
      return { name, score, weight, rating: data.rating };
    });

    const totalScore = scores.reduce((sum, s) => sum + (s.score * s.weight / 100), 0);
    return { totalScore: Math.round(totalScore), breakdown: scores };
  }

  generateReport() {
    const vitalsScore = this.getVitalsScore();
    const imageStats = this.calculateImageStats();

    return {
      timestamp: Date.now(),
      url: window.location.href,
      vitals: this.metrics.vitals,
      vitalsScore,
      images: imageStats,
      timing: this.metrics.timing,
      errors: this.metrics.errors,
      connectionInfo: this.getConnectionType()
    };
  }

  calculateImageStats() {
    const images = this.metrics.images;
    if (images.length === 0) return {};

    const loadTimes = images.map(img => img.loadTime).filter(Boolean);
    const transferSizes = images.map(img => img.transferSize).filter(Boolean);

    return {
      total: images.length,
      averageLoadTime: loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length,
      totalTransferSize: transferSizes.reduce((a, b) => a + b, 0),
      largestImage: Math.max(...transferSizes),
      criticalImages: images.filter(img => img.type === 'critical').length,
      lazyImages: images.filter(img => img.type === 'lazy-loaded').length
    };
  }

  // Error tracking
  trackError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: window.location.href,
      context
    };

    this.metrics.errors.push(errorData);
    this.queueMetric('error', errorData);
  }

  destroy() {
    // Clean up observers and intervals
    clearInterval(this.flushInterval);
    this.queue = [];
  }
}

// Global error tracking
window.addEventListener('error', (event) => {
  if (window.performanceMonitor) {
    window.performanceMonitor.trackError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  }
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (window.performanceMonitor) {
    window.performanceMonitor.trackError(new Error(event.reason), {
      type: 'unhandledrejection'
    });
  }
});

// Auto-initialize
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.performanceMonitor = new PerformanceMonitor();
    });
  } else {
    window.performanceMonitor = new PerformanceMonitor();
  }
}

export default PerformanceMonitor;