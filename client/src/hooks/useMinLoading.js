import { useState, useRef, useCallback, useEffect } from 'react';

// useMinLoading(initial = false, minMs = 3000)
// Returns: [loading, showLoading, hideLoading]
// showLoading() - mark loading started (records timestamp)
// hideLoading() - will clear loading but ensure at least minMs elapsed since show
export default function useMinLoading(initial = false, minMs = 400) {
    const [loading, setLoading] = useState(initial);
    const startRef = useRef(initial ? Date.now() : null);

    useEffect(() => {
        // if initial was true but no start timestamp, set one
        if (initial && startRef.current == null) startRef.current = Date.now();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showLoading = useCallback(() => {
        startRef.current = Date.now();
        setLoading(true);
    }, []);

    const hideLoading = useCallback(() => {
        const start = startRef.current || Date.now();
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, minMs - elapsed);
        if (remaining > 0) {
            const t = setTimeout(() => {
                setLoading(false);
                startRef.current = null;
            }, remaining);
            // in case component unmounts before timeout
            return () => clearTimeout(t);
        }
        setLoading(false);
        startRef.current = null;
    }, [minMs]);

    return [loading, showLoading, hideLoading];
}
