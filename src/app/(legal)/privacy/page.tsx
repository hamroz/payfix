import type { Metadata } from "next";
import { LegalDocument, legalMetadata } from "../legal-document";

export async function generateMetadata(): Promise<Metadata> {
  return legalMetadata("privacy");
}

export default function PrivacyPage() {
  return <LegalDocument id="privacy" />;
}
