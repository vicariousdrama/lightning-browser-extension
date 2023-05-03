import { postMessage } from "../postMessage";

declare global {
  interface Window {
    webbtc: WebBTCProvider;
  }
}

export default class WebBTCProvider {
  enabled: boolean;
  isEnabled: boolean;
  executing: boolean;

  constructor() {
    this.enabled = false;
    this.isEnabled = false;
    this.executing = false;
  }

  enable() {
    if (this.enabled) {
      return Promise.resolve({ enabled: true });
    }
    return this.execute("enable").then((result) => {
      if (typeof result.enabled === "boolean") {
        this.enabled = result.enabled;
        this.isEnabled = result.enabled;
      }
      return result;
    });
  }

  getInfo() {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling getInfo");
    }
    return this.execute("getInfo");
  }

  signPsbt(psbt: string) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling signPsbt");
    }

    return this.execute("signPsbtWithPrompt", { psbt });
  }

  sendTransaction(address: string, amount: string) {
    if (!this.enabled) {
      throw new Error(
        "Provider must be enabled before calling sendTransaction"
      );
    }
    throw new Error("Alby does not support `sendTransaction`");
  }

  getAddress(index: number, num: number, change: boolean) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling getAddress");
    }
    throw new Error("Alby does not support `getAddress`");
  }

  request(method: string, params: Record<string, unknown>) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling request");
    }

    return this.execute("request", {
      method,
      params,
    });
  }

  // NOTE: new call `action`s must be specified also in the content script
  execute(
    action: string,
    args?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return postMessage("webbtc", action, args);
  }
}