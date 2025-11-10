// import './App.css'
import { useEffect, useMemo, useRef, useState, type FC } from 'react';

interface TagCardProps {
  title: string;
  description?: string;
  zpl: string;
  widthInInches: number;
  heightInInches: number;
}

export const TagCard: FC<TagCardProps> = ({
  title,
  description,
  zpl,
  widthInInches,
  heightInInches,
}) => {
  const workerRef = useRef<Worker | null>(null);
  const [b64, setB64] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const reqIdRef = useRef<number>(0);

  useEffect(() => {
    const worker = new Worker(new URL('./zpl-web-worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    const onMessage = (
      ev: MessageEvent<{ id: number; ok: boolean; b64?: string; error?: string }>,
    ) => {
      const { id, ok, b64, error } = ev.data;

      if (id !== reqIdRef.current) {
        return;
      }

      if (ok && typeof b64 === 'string') {
        setError(null);
        setB64(b64);
        if (!loaded) {
          setLoaded(true);
        }
      } else {
        setError(error || 'Render failed');
        setB64('');
      }
    };

    worker.addEventListener('message', onMessage);

    return () => {
      worker.removeEventListener('message', onMessage);
      worker.terminate();
      setB64('');
    };
  }, []);

  useEffect(() => {
    const w = workerRef.current;
    if (!w) {
      return;
    }
    const id = ++reqIdRef.current;
    w.postMessage({
      id,
      zpl,
      wmm: widthInInches * 25.4,
      hmm: heightInInches * 25.4,
      dpmm: 12,
    });
  }, [zpl, widthInInches, heightInInches]);

  const url = useMemo(() => `data:image/png;base64,${b64}`, [b64]);

  const formattedZPL = useMemo(
    () =>
      zpl
        .split('^')
        .filter((x) => !!x.trim())
        .map((x) => `^${x}`)
        .join('\n'),
    [zpl],
  );

  return (
    <div className="card shadow-sm">
      <figure>
        {error ? (
          <span>ERROR | Internal: {error}</span>
        ) : (
          <img src={url} className="rounded-xl" alt="ZPL" />
        )}
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>{description}</p>
        <details>
          <code>{formattedZPL}</code>
        </details>
      </div>
    </div>
  );
};
