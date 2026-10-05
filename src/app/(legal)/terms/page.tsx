import type { Metadata } from "next";
import { LegalDocument, legalMetadata } from "../legal-document";

export async function generateMetadata(): Promise<Metadata> {
  return legalMetadata("terms");
}

export default function TermsPage() {
  return <LegalDocument id="terms" />;
}
