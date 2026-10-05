import type { Metadata } from "next";
import { LegalDocument, legalMetadata } from "../legal-document";

export async function generateMetadata(): Promise<Metadata> {
  return legalMetadata("security");
}

export default function SecurityPage() {
  return <LegalDocument id="security" />;
}
