"use client";

export type CartItem = {
  supplementId: number;
  nombre: string;
  precio: number;
  imagenUrl: string | null;
  cantidad: number;
};

const CART_KEY = "suplefit_cart";
const CART_EVENT = "suplefit_cart_updated";

function readRaw(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) =>
        i &&
        typeof i.supplementId === "number" &&
        typeof i.cantidad === "number" &&
        i.cantidad > 0
    );
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function getCart(): CartItem[] {
  return readRaw();
}

export function getCartCount(): number {
  return readRaw().reduce((sum, i) => sum + i.cantidad, 0);
}

export function addToCart(item: Omit<CartItem, "cantidad">, cantidad = 1) {
  const items = readRaw();
  const idx = items.findIndex((i) => i.supplementId === item.supplementId);
  if (idx >= 0) {
    items[idx].cantidad += cantidad;
    items[idx].precio = item.precio;
    items[idx].nombre = item.nombre;
    items[idx].imagenUrl = item.imagenUrl;
  } else {
    items.push({ ...item, cantidad });
  }
  write(items);
}

export function updateCartQty(supplementId: number, cantidad: number) {
  const items = readRaw();
  const idx = items.findIndex((i) => i.supplementId === supplementId);
  if (idx < 0) return;
  if (cantidad <= 0) {
    items.splice(idx, 1);
  } else {
    items[idx].cantidad = cantidad;
  }
  write(items);
}

export function removeFromCart(supplementId: number) {
  write(readRaw().filter((i) => i.supplementId !== supplementId));
}

export function clearCart() {
  write([]);
}

export function getCartSubtotal(): number {
  return readRaw().reduce((sum, i) => sum + i.precio * i.cantidad, 0);
}

export function subscribeCart(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(CART_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CART_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
