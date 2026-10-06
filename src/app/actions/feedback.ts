"use server";

import { getI18n } from "@/lib/i18n/server";
import { clientIp, currentUser, deps } from "@/lib/server/context";
import { saveFeedback, type FeedbackInput } from "@/lib/server/feedback";
import { run } from "./result";

export async function submitFeedbackAction(input: FeedbackInput) {
  return run(async () => {
    const { db } = await deps();
    const { locale } = await getI18n();
    return saveFeedback(db, input, { userId: (await currentUser())?.id ?? null, locale, ip: await clientIp() });
  });
}
