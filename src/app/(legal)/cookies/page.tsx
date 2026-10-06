import type { Metadata } from "next";
import { LegalDocument, legalMetadata } from "../legal-document";

export async function generateMetadata(): Promise<Metadata> {
  return legalMetadata("cookies");
}

export default function CookiesPage() {
  return <LegalDocument id="cookies" />;
}
