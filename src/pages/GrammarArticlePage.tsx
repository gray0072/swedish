import { Link, useParams } from 'react-router-dom';
import { useT } from '@/i18n';
import { getGrammarArticle } from '@/content/registry';
import TheoryView from '@/components/lesson/TheoryView';
import NotFoundPage from './NotFoundPage';

export default function GrammarArticlePage() {
  const { slug = '' } = useParams();
  const t = useT();
  const article = getGrammarArticle(slug);

  if (!article) return <NotFoundPage />;

  return (
    <div className="space-y-4">
      <Link to="/grammar" className="text-sm text-granite hover:underline dark:text-birch/60">
        ← {t('common.back')}
      </Link>
      <TheoryView markdown={article.body} />
    </div>
  );
}
