import '@happy-dom/global-registrator/register.js'

if (globalThis.window?.happyDOM?.settings) {
  globalThis.window.happyDOM.settings.disableIframePageLoading = true
}
