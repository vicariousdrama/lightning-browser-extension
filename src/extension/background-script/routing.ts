import * as accounts from "./actions/accounts";
import * as allowances from "./actions/allowances";
import * as ln from "./actions/ln";
import lnurl, { lnurlPay } from "./actions/lnurl";
import * as payments from "./actions/payments";
import * as settings from "./actions/settings";
import * as setup from "./actions/setup";
import * as webln from "./actions/webln";

import { Message } from "../../types";

const checkWebsitePermissions = (action: FixMe) => {
  return (message: Message, sender: FixMe) => {
    // TODO check permission
    const hasPermission = false;
    if (hasPermission) {
      return Promise.resolve({ error: "not enabled" });
    } else {
      return action(message, sender);
    }
  };
};
// TODO: potential nesting/grouping of actions for better organization
const routes = {
  webln: {
    enable: allowances.enable,
    getInfo: checkWebsitePermissions(ln.getInfo),
    sendPaymentOrPrompt: checkWebsitePermissions(webln.sendPaymentOrPrompt),
    keysendOrPrompt: checkWebsitePermissions(webln.keysendOrPrompt),
    lnurl: checkWebsitePermissions(lnurl),
    makeInvoice: checkWebsitePermissions(ln.makeInvoice),
    signMessage: checkWebsitePermissions(ln.signMessage),
    verifyMessage: checkWebsitePermissions(ln.verifyMessage),
  },
  addAllowance: allowances.add,
  getAllowance: allowances.get,
  getAllowanceById: allowances.getById,
  listAllowances: allowances.list,
  deleteAllowance: allowances.deleteAllowance,
  updateAllowance: allowances.updateAllowance,
  lock: accounts.lock,
  isUnlocked: accounts.isUnlocked,
  unlock: accounts.unlock,
  getInfo: ln.getInfo,
  lnurlPay,
  sendPayment: ln.sendPayment,
  keysend: ln.keysend,
  checkPayment: ln.checkPayment,
  signMessage: ln.signMessage,
  verifyMessage: ln.verifyMessage,
  makeInvoice: ln.makeInvoice,
  getBalance: ln.getBalance,
  getPayments: payments.all,
  setPassword: setup.setPassword,
  accountInfo: accounts.info,
  addAccount: accounts.add,
  editAccount: accounts.edit,
  getAccounts: accounts.all,
  removeAccount: accounts.remove,
  deleteAccount: accounts.deleteAccount,
  selectAccount: accounts.select,
  reset: setup.reset,
  status: setup.status,
  validateAccount: setup.validateAccount,
  setIcon: setup.setIcon,
  setSetting: settings.set,
  getSettings: settings.get,
};

const hasPermission = (action: FixMe, message: FixMe, sender: FixMe) => {
  const webLnCalls = Object.keys(routes.webln).map((r) => `webln/${r}`);
  if (message.origin.internal) {
    return true;
  } else if (message.public && webLnCalls.includes(action)) {
    return true;
  } else {
    return false;
  }
};

const route = (path: FixMe) => {
  if (!path) {
    throw new Error("No action path provided to router");
  }
  const routeParts = path.split("/");
  const route = routeParts.reduce((route: FixMe, path: FixMe) => {
    return route[path];
  }, routes);

  if (!route) {
    console.log(`Route not found: ${path}`);
    // return a function to keep the expected method signature
    return () => {
      return Promise.reject({ error: `${path} not found}` });
    };
  }
  return route;
};

export { routes, route, hasPermission };