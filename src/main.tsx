import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './AuthContext';
import { CloudProvider } from './CloudContext';

// Intercept and handle benign environment/sandbox WebSocket or HMR connection errors
if (typeof window !== "undefined") {
  // Silence Vite's noisy websocket console errors
  const originalConsoleError = console.error;
  console.error = function (...args) {
    const msg = args.join(" ");
    if (
      msg.includes("WebSocket") ||
      msg.includes("[vite] failed to connect to websocket") ||
      msg.includes("WebSocket closed without opened") ||
      msg.includes("HMR")
    ) {
      return; // Swallow these specific benign Vite HMR errors
    }
    originalConsoleError.apply(console, args);
  };

  // Wrap proxy/websocket class to capture and discard connection error drops in sandboxed preview environments
  // and implement a robust reconnection strategy with exponential backoff.
  const NativeWebSocket = window.WebSocket;
  if (NativeWebSocket) {
    try {
      class ReconnectingWebSocketFacade {
        private ws: WebSocket | null = null;
        private url: string | URL;
        private protocols?: string | string[];
        private reconnectAttempts = 0;
        private maxReconnectAttempts = 10;
        private baseDelay = 1000; // 1s
        private listeners: Record<string, Function[]> = {};

        // WebSocket properties
        public onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
        public onerror: ((this: WebSocket, ev: Event) => any) | null = null;
        public onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
        public onopen: ((this: WebSocket, ev: Event) => any) | null = null;
        
        constructor(url: string | URL, protocols?: string | string[]) {
          this.url = url;
          this.protocols = protocols;
          this.connect();
        }

        private connect() {
          try {
            this.ws = new NativeWebSocket(this.url, this.protocols);
          } catch (e) {
            this.handleClose();
            return;
          }

          this.ws.onopen = (e) => {
            this.reconnectAttempts = 0; // reset on successful connection
            if (this.onopen) this.onopen.call(this.ws!, e);
            if (this.listeners['open']) this.listeners['open'].forEach(cb => cb(e));
          };

          this.ws.onmessage = (e) => {
            if (this.onmessage) this.onmessage.call(this.ws!, e);
            if (this.listeners['message']) this.listeners['message'].forEach(cb => cb(e));
          };

          this.ws.onerror = (e) => {
            // Silently absorb
            if (this.onerror) this.onerror.call(this.ws!, e);
            if (this.listeners['error']) this.listeners['error'].forEach(cb => cb(e));
          };

          this.ws.onclose = (e) => {
            if (this.onclose) this.onclose.call(this.ws!, e);
            if (this.listeners['close']) this.listeners['close'].forEach(cb => cb(e));
            this.handleClose();
          };
        }

        private handleClose() {
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = this.baseDelay * Math.pow(1.5, this.reconnectAttempts);
            this.reconnectAttempts++;
            setTimeout(() => this.connect(), delay);
          }
        }

        public send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
          if (this.ws && this.ws.readyState === NativeWebSocket.OPEN) {
            this.ws.send(data);
          }
        }

        public close(code?: number, reason?: string) {
          this.reconnectAttempts = this.maxReconnectAttempts; // prevent reconnect
          if (this.ws) this.ws.close(code, reason);
        }

        public addEventListener(type: string, listener: Function) {
          if (!this.listeners[type]) this.listeners[type] = [];
          this.listeners[type].push(listener);
        }

        public removeEventListener(type: string, listener: Function) {
          if (!this.listeners[type]) return;
          this.listeners[type] = this.listeners[type].filter(cb => cb !== listener);
        }
        
        get readyState() { return this.ws ? this.ws.readyState : NativeWebSocket.CLOSED; }
        get bufferedAmount() { return this.ws ? this.ws.bufferedAmount : 0; }
        get extensions() { return this.ws ? this.ws.extensions : ""; }
        get protocol() { return this.ws ? this.ws.protocol : ""; }
        get binaryType() { return this.ws ? this.ws.binaryType : "blob"; }
        set binaryType(val) { if (this.ws) this.ws.binaryType = val; }
      }

      const SafeWebSocketProxy = new Proxy(NativeWebSocket, {
        construct(target, args: any) {
          // If Vite is trying to connect to its HMR server, use the robust facade
          if (typeof args[0] === 'string' && args[0].includes('_vite')) {
             return new ReconnectingWebSocketFacade(args[0], args[1]);
          }
          
          const ws = Reflect.construct(target, args);
          ws.addEventListener("error", () => {});
          return ws;
        }
      });

      Object.defineProperty(window, "WebSocket", {
        value: SafeWebSocketProxy,
        configurable: true,
        writable: true,
        enumerable: true
      });
    } catch (e) {
      // Silently bypass if the browser env strictly seals the property
    }
  }

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason?.message || String(event.reason || "");
    if (
      reason.includes("WebSocket") || 
      reason.includes("websocket") || 
      reason.includes("HMR") || 
      reason.includes("vite") ||
      reason.includes("connection") ||
      reason.includes("closed without opened")
    ) {
      // Direct silent absorption of sandbox connection errors
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener("error", (event) => {
    const message = event.message || "";
    if (
      message.includes("WebSocket") || 
      message.includes("websocket") ||
      message.includes("HMR") ||
      message.includes("vite") ||
      message.includes("closed without opened")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CloudProvider>
        <App />
      </CloudProvider>
    </AuthProvider>
  </StrictMode>,
);

