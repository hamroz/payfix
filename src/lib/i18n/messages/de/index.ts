// The German dictionary. Mirrors en/index.ts; `Messages` enforces the same keys.
import type { Messages } from "../types";
import admin from "./admin";
import app from "./app";
import auth from "./auth";
import cases from "./cases";
import categories from "./categories";
import common from "./common";
import customers from "./customers";
import emails from "./emails";
import errors from "./errors";
import events from "./events";
import exportCsv from "./exportCsv";
import feedback from "./feedback";
import film from "./film";
import invoices from "./invoices";
import landing from "./landing";
import ledger from "./ledger";
import legal from "./legal";
import meta from "./meta";
import onboarding from "./onboarding";
import pay from "./pay";
import receipt from "./receipt";
import resolve from "./resolve";
import roles from "./roles";
import settings from "./settings";
import ui from "./ui";
import wallet from "./wallet";

const de: Messages = {
  common,
  meta,
  ui,
  roles,
  categories,
  landing,
  film,
  auth,
  onboarding,
  wallet,
  app,
  invoices,
  customers,
  ledger,
  settings,
  cases,
  pay,
  resolve,
  receipt,
  errors,
  events,
  emails,
  exportCsv,
  legal,
  admin,
  feedback,
};

export default de;
