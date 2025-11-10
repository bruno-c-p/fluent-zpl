// import './App.css'
import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

export interface TagCardProps {
  title: string;
  description?: string;
  zpl: string;
  widthInInches: number;
  heightInInches: number;
  onDetailClick?: (title: string, zpl: string) => void;
}

export const TagCard: FC<TagCardProps> = ({
  title,
  description,
  zpl,
  widthInInches,
  heightInInches,
  onDetailClick,
}) => {
  const workerRef = useRef<Worker | null>(null);
  const [b64, setB64] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const reqIdRef = useRef<number>(0);

  useEffect(() => {
    const worker = new Worker(new URL('../zpl-web-worker.ts', import.meta.url), { type: 'module' });
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
      wmm: Math.floor(widthInInches * 25.4),
      hmm: Math.floor(heightInInches * 25.4),
      dpmm: 12,
    });
  }, [zpl, widthInInches, heightInInches]);

  const url = useMemo(() => `data:image/png;base64,${b64}`, [b64]);

  const [widthInPixels, heightInPixels] = useMemo(
    () => [widthInInches * 96, heightInInches * 96],
    [widthInInches, heightInInches],
  );

  const onDetailClickCallback = useCallback(
    () => onDetailClick?.(title, zpl),
    [onDetailClick, title, zpl],
  );

  return (
    <div className="card shadow-lg">
      <figure className="p-4 bg-primary/20">
        {error ? (
          <span>ERROR | Internal: {error}</span>
        ) : (
          <img
            src={url}
            className="rounded-lg shadow-xl"
            alt="ZPL"
            height={heightInPixels}
            width={widthInPixels}
          />
        )}
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>{description}</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary btn-sm" onClick={onDetailClickCallback}>
            Details
          </button>
        </div>
      </div>
    </div>
  );
};
