import { Link } from 'react-router-dom';
import { useT } from '@/i18n';

export default function NotFoundPage() {
  const t = useT();
  return (
    <div className="py-16 text-center">
      <p className="text-lg text-granite dark:text-birch/70">{t('common.notFound')}</p>
      <Link to="/" className="mt-4 inline-block text-falu hover:underline dark:text-gold">
        {t('nav.home')}
      </Link>
    </div>
  );
}
