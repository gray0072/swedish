import { Link, useParams } from 'react-router-dom';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { getReferenceArticle } from '@/content/registry';
import TheoryView from '@/components/lesson/TheoryView';
import NotFoundPage from './NotFoundPage';

export default function ReferenceArticlePage() {
  const { slug = '' } = useParams();
  const t = useT();
  const lang = useLanguage();
  const article = getReferenceArticle(slug);

  if (!article) return <NotFoundPage />;

  const body = lang === 'ru' && article.bodyRu ? article.bodyRu : article.bodyEn;

  return (
    <div className="space-y-4">
      <Link
        to="/reference/summaries"
        className="text-sm text-granite hover:underline dark:text-birch/60"
      >
        ← {t('common.back')}
      </Link>
      <TheoryView markdown={body} />
    </div>
  );
}
