import { BarChart3, RotateCcw, ScrollText, type LucideIcon } from 'lucide-react';
import type { I18nKey } from '@/i18n';

/**
 * Destinations that are not part of the core loop (home → topics → city) and therefore do not
 * earn a slot in the header: the header has to stay on one line down to a phone, and seven
 * items did not. They live as links on the pages a learner is already on — the Topics page
 * header and the foot of the Home page — which is where the reference link already lived.
 *
 * Their routes are unchanged; only the way in moved.
 */
export interface SecondaryNavItem {
  to: string;
  icon: LucideIcon;
  key: I18nKey;
}

export const SECONDARY_NAV: SecondaryNavItem[] = [
  { to: '/review', icon: RotateCcw, key: 'nav.review' },
  { to: '/stats', icon: BarChart3, key: 'nav.stats' },
  { to: '/reference', icon: ScrollText, key: 'nav.reference' },
];
