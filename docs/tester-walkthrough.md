# PayFix tester walkthrough (M4 / M5)

**For the person running the session:** send the tester only the section "Instructions for the tester" below. Don't help during the run. Note the start and end times and every point where they hesitate, then ask the questions at the end. Record the results in `docs/evidence-log.md`.

---

## Instructions for the tester

Thanks for trying PayFix. It helps a small agency sort out payments that don't match an invoice, for example when a client pays too much. You'll play **both sides**: the agency ("the business") and its client ("the customer").

Everything uses **test money** on a test network. Nothing here is real money, and you don't need a crypto wallet. It takes about 10–15 minutes on your phone. If something is confusing, say so out loud or write it down. That's exactly what we want to learn.

**Write down the time when you start:** ________

### 1. Sign up

1. Open **https://payfix-mu.vercel.app** on your phone.
2. Tap **Try the live demo**.
3. Type any email address. It doesn't need to be real, because no real email is sent. Tap **Continue**.
4. Tap **Demo inbox** at the **bottom left** of the screen. Your 6-digit code is there. Tap **Copy**, close the inbox, and enter the code.

### 2. Create your company

1. Type a company name, for example "Lumen Studio".
2. Leave **"Add the demo customer and invoices"** ticked.
3. Tap **Create company**. Setting up can take up to a minute.

You'll land on the Overview. Your demo client is **Acme Robotics**, who has two invoices: **INV-0001 for $1,000** and **INV-0002 for $400**. A **Guided demo** card lists the steps and ticks them off as you go.

### 3. Pay as the customer (with the demo wallet)

1. In the Guided demo card, tap **"Customer pays $600 toward INV-0001"**. The payment page opens in a new tab.
2. Make sure **Demo wallet** is selected. Enter **600** and tap **Pay $600.00 from demo wallet**. Wait for **Payment confirmed** (a few seconds). It should say $400.00 remains.
3. Tap **Make another payment**. Enter **500** and pay again.
4. The customer has now paid **$100 too much**. The page shows that $100 is "held for your decision".

### 4. Send the customer a link (as the business)

1. Switch back to the first PayFix tab (your business).
2. Tap **Exceptions** in the bottom bar, then open the $100 case.
3. Tap **Send resolution link**. A link appears under the button. Tap the small **copy icon** at its right end.

### 5. Act as the customer

1. Open a new tab, paste the link, and open it.
2. Tap **Email me a code**. Open **Demo inbox** (bottom left), copy the newest code (sent to ap@acme.test), and enter it.
3. Choose where the extra $100 goes. Tap **Split 60 / 40**: $60 goes to the other invoice and $40 comes back to you as a refund.
4. Under "Refund wallet", tap **Use demo wallet A** and wait for "Ownership verified".
5. Tap **Send plan to …** (your company's name).

### 6. Approve, then watch a change cancel the approval

1. Go back to your business tab and open the case again. Refresh the page if it hasn't updated.
2. Tap **Approve v1**.
3. Go back to the customer tab and refresh. Tap **Change plan**, then **Split 60 / 40**, then **Use demo wallet B**, then **Send revised plan (v2)**.
4. Go back to the business tab. The old approval no longer applies, because the refund wallet changed. Look at the plan and the timeline.

### 7. Approve the new plan and refund

1. On the business case page, tap **Approve v2**.
2. Tap **Run plan v2**.
3. Tap **Sign with demo merchant wallet**. Wait until you see **"Loop closed"**. This can take up to a minute.

### 8. Check the receipt

1. Tap **Shared receipt**.
2. Check that the receipt says **Settled** and adds up to **$1,100 received = $1,000 to INV-0001 + $60 to INV-0002 + $40 refunded**, with **$0** left unresolved.
3. Optional: in the customer tab, tap **View receipt**. The customer sees the same receipt.

**Write down the time when you finish:** ________

Did you need help from anyone? (yes/no) ____

---

### Optional: pay with your own Phantom wallet

Only do this if you already use Phantom or want to try it. Use a wallet that holds no real funds.

1. In Phantom, open **Settings → Developer Settings → Testnet Mode**, turn it on, and choose **Solana Devnet**. Menu names can differ slightly between Phantom versions.
2. In PayFix (business tab), open **Invoices → INV-0002** and **Copy** its payment link.
3. In Phantom, open its built-in browser, paste the payment link, and open it.
4. Choose **Browser wallet** and connect Phantom.
5. Tap **"Need test USD? Get 2,000 from the devnet faucet"**. Test dollars, plus a little test SOL for fees, arrive in a few seconds.
6. Enter an amount, for example the remaining **$340**, tap **Pay**, and approve in Phantom.
7. Back in PayFix, the invoice updates by itself. Each payment has a link to Solana Explorer.

---

## Send the survey

After the run, send the tester the survey link with a batch tag, for example **https://payfix-mu.vercel.app/feedback?c=oct-walkthroughs**. It asks the questions below plus ease (1–5) and how likely they are to recommend PayFix (0–10), in the tester's language, and takes about two minutes. Answers are anonymous unless the tester ticks "attach my PayFix account". Results appear at `/admin/feedback`; export them as CSV to fill in [the evidence log](evidence-log.md).

If you're running the session live, you can still ask the questions out loud; record the answers the same way.

## Questions to ask the tester afterward

1. In your own words, what happened to the extra $100, and who decided?
2. Where did you hesitate or feel unsure what to tap next?
3. When the refund wallet changed after approval, did you notice the approval was cancelled? Did that feel right?
4. If you run a business that gets paid in stablecoins: how do you handle an overpayment today, and how often does it happen? (Ask for a real, anonymized example.)
5. Would you trust the receipt as a record to send to a client or an accountant? What's missing?
6. What would stop you from using this, and what tool would it replace or sit next to?
