import { Link } from 'react-router-dom';
import { ScrollText } from 'lucide-react';
import { useT } from '@/i18n';
import { getGrammarArticles } from '@/content/registry';

export default function GrammarListPage() {
  const t = useT();
  const articles = getGrammarArticles();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('grammar.title')}</h1>
      <p className="text-sm text-granite dark:text-birch/60">{t('grammar.subtitle')}</p>
      <ul className="space-y-2">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link to={`/grammar/${a.slug}`} className="card flex items-center gap-3 hover:border-falu/40">
              <ScrollText className="shrink-0 text-falu dark:text-gold" size={20} aria-hidden="true" />
              <span className="font-semibold">{a.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
