import { syncBusiness, type Deps } from "./ingest";
import { flagOverdueInvoices } from "./invoices";
import { reconcileBusinessRefunds } from "./refunds";

/**
 * One sync pass for a company: pull chain activity, settle in-flight refunds, and (when asked)
 * flag newly overdue invoices. Overdue needs no chain, so a chain outage doesn't hold it back;
 * the chain error is still raised afterwards.
 */
export async function refreshCompany(deps: Deps, businessId: string, opts: { checkOverdue: boolean }) {
  let chainError: unknown = null;
  try {
    await syncBusiness(deps, businessId);
    await reconcileBusinessRefunds(deps, businessId);
  } catch (err) {
    chainError = err;
  }
  if (opts.checkOverdue) await flagOverdueInvoices(deps.db, businessId);
  if (chainError) throw chainError;
}
