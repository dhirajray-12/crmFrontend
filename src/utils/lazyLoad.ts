// frontend/src/utils/lazyLoad.ts
import { lazy,  } from "react";
import type { ComponentType } from "react";

// Cache for preloaded modules
const preloadedModules = new Map<string, Promise<any>>();

// After a new deploy, old JS chunk files are removed from the server. A
// tab left open across that deploy will still reference the old chunk
// hashes, so a lazy import 404s with "Failed to fetch dynamically imported
// module" and the whole route falls into the error boundary. A full reload
// fetches the current index.html (with current chunk hashes) and fixes it,
// so we do that once automatically instead of showing an error page. The
// sessionStorage flag prevents an infinite reload loop if the failure is a
// genuine bug rather than a stale chunk.
const RELOAD_FLAG_KEY = "chunk-load-reload-attempted";

const isChunkLoadError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message)
  );
};

const importWithChunkReload = async <T>(importer: () => Promise<T>): Promise<T> => {
  try {
    const result = await importer();
    // A successful import means chunks are in sync again — clear the flag
    // so a *future* deploy's stale-chunk error can still trigger a reload.
    sessionStorage.removeItem(RELOAD_FLAG_KEY);
    return result;
  } catch (error) {
    if (
      isChunkLoadError(error) &&
      sessionStorage.getItem(RELOAD_FLAG_KEY) !== "1"
    ) {
      sessionStorage.setItem(RELOAD_FLAG_KEY, "1");
      window.location.reload();
      // Keep the import pending — the reload is about to replace this page.
      return new Promise<T>(() => {});
    }
    throw error;
  }
};

// Enhanced lazy load with preloading support
export const lazyLoad = (path: string, ) => {
  const modules = import.meta.glob("../pages/**/*.tsx");
  const importer = modules[`../pages/${path}.tsx`];

  if (!importer) {
    console.error(`Module not found: ../pages/${path}.tsx`);
    return lazy(() => Promise.resolve({ default: () => null }));
  }

  // Store preload function
  const preload = () => {
    if (!preloadedModules.has(path)) {
      preloadedModules.set(path, importWithChunkReload(importer));
    }
    return preloadedModules.get(path);
  };

  // Create lazy component with preload
  const LazyComponent = lazy(() =>
    importWithChunkReload(importer) as Promise<{ default: ComponentType<any> }>,
  );

  // Attach preload method
  (LazyComponent as any).preload = preload;

  return LazyComponent;
};

// Preload visible routes
export const preloadVisibleRoutes = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const routePath = element.dataset.route;
        if (routePath && (element as any).preload) {
          (element as any).preload();
          observer.unobserve(element);
        }
      }
    });
  });
  
  return observer;
};