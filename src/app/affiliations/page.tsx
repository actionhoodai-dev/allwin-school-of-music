// Redirect /affiliations → /about#affiliations
import { redirect } from 'next/navigation';

export default function AffiliationsPage() {
  redirect('/about#affiliations');
}
