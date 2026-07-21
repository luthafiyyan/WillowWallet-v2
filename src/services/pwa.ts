export interface PWAUpdateCallback {
  onUpdateAvailable: (registration: ServiceWorkerRegistration) => void;
  onInstalled: () => void;
  onOfflineStatusChange: (isOffline: boolean) => void;
}

let deferredPrompt: any = null;

export const registerServiceWorker = (callbacks: Partial<PWAUpdateCallback>) => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';
      
      navigator.serviceWorker.register(swUrl)
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully:', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // There is a controlling worker, so a new version is ready to take over
                    console.log('[PWA] New content is available; please refresh.');
                    if (callbacks.onUpdateAvailable) {
                      callbacks.onUpdateAvailable(registration);
                    }
                  } else {
                    // Content is cached for offline use
                    console.log('[PWA] Content is cached for offline use.');
                    if (callbacks.onInstalled) {
                      callbacks.onInstalled();
                    }
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] Error during Service Worker registration:', error);
        });
    });
  }

  // Monitor network connection status
  window.addEventListener('online', () => {
    if (callbacks.onOfflineStatusChange) callbacks.onOfflineStatusChange(false);
  });
  window.addEventListener('offline', () => {
    if (callbacks.onOfflineStatusChange) callbacks.onOfflineStatusChange(true);
  });
};

// Capture beforeinstallprompt event
export const initInstallPromptListener = (onPromptTriggered: () => void) => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    console.log('[PWA] beforeinstallprompt event captured');
    // Notify application that install button can be shown
    onPromptTriggered();
  });
};

// Trigger install prompt
export const triggerInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    console.warn('[PWA] No deferred prompt available');
    return false;
  }
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`[PWA] User response to install prompt: ${outcome}`);
  
  // Clear the deferred prompt, it can only be used once
  deferredPrompt = null;
  return outcome === 'accepted';
};
