import React, { useReducer, createContext, useEffect } from "react";

export const CoinContext = createContext();

function reducer(store, action) {
    switch (action.type) {
        case 'setCoins':
            return { ...store, coins: action.payload.coins, total: action.payload.total };
        case 'setCurrency':
            return { ...store, currency: action.payload };
        case 'setAllCoin':
            return { ...store, allCoin: action.payload };
        default:
            return store;
    }
}

export function CoinStore(props) {
    const [store, dispatch] = useReducer(reducer, {
        coins: [],
        total: 0,
        currency: { name: "usd", symbol: "$" },
        allCoin: []
    });

    const fetchMarketData = async () => {
        try {
            const options = {
                method: "GET",
                headers: {
                    accept: "application/json",
                    // "x-cg-demo-api-key": "YOUR_API_KEY_HERE",
                },
            };

            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${store.currency.name}&order=market_cap_desc&per_page=20&page=1&sparkline=false`,
                options
            );
            const data = await response.json();
            if (Array.isArray(data)) {
                dispatch({ type: 'setAllCoin', payload: data });
            }
        } catch (err) {
            console.error('Coingecko fetch error:', err);
        }
    };

    useEffect(() => {
        fetchMarketData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store.currency]);

    return (
        <CoinContext.Provider value={[store, dispatch]}>
            {props.children}
        </CoinContext.Provider>
    );
};

export default CoinStore;
