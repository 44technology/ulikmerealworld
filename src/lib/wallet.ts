/**
 * Wallet: saved payment methods (card metadata only - last4, brand, expiry).
 * Full card numbers are never stored.
 */

const WALLET_STORAGE_KEY = 'ulikme_wallet_cards';

export interface WalletCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  addedAt: string;
}

function loadCards(): WalletCard[] {
  try {
    const raw = localStorage.getItem(WALLET_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveCards(cards: WalletCard[]) {
  try {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(cards));
  } catch (_) {}
}

export function getWalletCards(): WalletCard[] {
  return loadCards();
}

export function addCardToWallet(card: Omit<WalletCard, 'id' | 'addedAt'>): WalletCard {
  const cards = loadCards();
  const newCard: WalletCard = {
    ...card,
    id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    addedAt: new Date().toISOString(),
  };
  cards.push(newCard);
  saveCards(cards);
  return newCard;
}

export function removeCardFromWallet(id: string): void {
  const cards = loadCards().filter((c) => c.id !== id);
  saveCards(cards);
}

export function formatCardDisplay(card: WalletCard): string {
  return `${card.brand} •••• ${card.last4}`;
}

/** Get card brand from full number (first digits). */
export function getBrandFromNumber(num: string): string {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6(?:011|5)/.test(n)) return 'discover';
  return 'card';
}
