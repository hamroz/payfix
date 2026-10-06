-- Invoices seeded by "Add the demo customer and invoices" before the `sample` flag existed.
-- seedSampleData always used these English titles for the Acme customer.
UPDATE "invoices" SET "sample" = true
WHERE "title" IN ('Brand identity system', 'Website retainer — October')
  AND "customer_id" IN (SELECT "id" FROM "customers" WHERE "email" = 'ap@acme.test');
