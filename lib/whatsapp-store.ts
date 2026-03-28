type WhatsAppStore = {
  qr: Map<string, string>
  status: Map<string, string>
}

declare global {
  // eslint-disable-next-line no-var
  var __hehoWhatsAppStore__: WhatsAppStore | undefined
}

const store: WhatsAppStore = globalThis.__hehoWhatsAppStore__ || {
  qr: new Map<string, string>(),
  status: new Map<string, string>(),
}

if (!globalThis.__hehoWhatsAppStore__) {
  globalThis.__hehoWhatsAppStore__ = store
}

export const whatsappStore = store

