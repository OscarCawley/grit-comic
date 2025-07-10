import React, { useState, useEffect } from 'react';

function DataLoader({ children, isLoading }) {
    const [ready, setReady] = useState(!isLoading);

    useEffect(() => {
        if (!isLoading) {
            setReady(true);
        } else {
            setReady(false);
        }
    }, [isLoading]);

    return ready ? children : null; // show children only when ready
}

export default DataLoader;