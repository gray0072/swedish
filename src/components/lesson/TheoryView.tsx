import { isValidElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AudioButton from './AudioButton';
import { useLanguage } from '@/store/settings';

function isExampleCodeChild(child: unknown): boolean {
  if (!isValidElement(child)) return false;
  const props = child.props as { className?: string };
  return /language-example/.test(props.className ?? '');
}

/** Renders a fenced ```example block as speaker-enabled sv — translation pairs (SPEC §5.3). */
function ExampleBlock({ raw }: { raw: string }) {
  const lang = useLanguage();
  const lines = raw.trim().split('\n').filter(Boolean);
  return (
    <div className="my-3 space-y-1.5 rounded-xl border border-granite/15 bg-granite/5 p-3 dark:border-white/10 dark:bg-white/5">
      {lines.map((line, i) => {
        const [sv, ...rest] = line.split('—').map((s) => s.trim());
        const translation = rest.join('—');
        return (
          <div key={i} className="flex items-center gap-2 text-sm">
            <AudioButton text={sv} />
            <span className="sv-word">{sv}</span>
            {translation && <span className="text-granite dark:text-birch/60">— {translation}</span>}
          </div>
        );
      })}
      <p className="sr-only" lang={lang}>
        {/* keeps the block reachable for screen readers describing the pair language */}
      </p>
    </div>
  );
}

export default function TheoryView({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-a:text-blue-flag">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // The typography plugin gives <pre> a dark code-block background — fine for real
          // code, wrong for our example blocks, so unwrap the <pre> when it's ours.
          pre(props) {
            const child = Array.isArray(props.children) ? props.children[0] : props.children;
            if (isExampleCodeChild(child)) return <>{props.children}</>;
            return <pre {...props} />;
          },
          code(props) {
            const { className, children } = props;
            const isExample = /language-example/.test(className ?? '');
            if (isExample) {
              return <ExampleBlock raw={String(children)} />;
            }
            return <code className={className}>{children}</code>;
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
