import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  getWalletCards,
  addCardToWallet,
  removeCardFromWallet,
  type WalletCard,
} from '@/lib/wallet';

interface WalletContextType {
  cards: WalletCard[];
  addCard: (card: Omit<WalletCard, 'id' | 'addedAt'>) => WalletCard;
  removeCard: (id: string) => void;
  refresh: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<WalletCard[]>([]);

  const refresh = useCallback(() => {
    setCards(getWalletCards());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCard = useCallback((card: Omit<WalletCard, 'id' | 'addedAt'>) => {
    const newCard = addCardToWallet(card);
    setCards(getWalletCards());
    return newCard;
  }, []);

  const removeCard = useCallback((id: string) => {
    removeCardFromWallet(id);
    setCards(getWalletCards());
  }, []);

  return (
    <WalletContext.Provider value={{ cards, addCard, removeCard, refresh }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (ctx === undefined) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
