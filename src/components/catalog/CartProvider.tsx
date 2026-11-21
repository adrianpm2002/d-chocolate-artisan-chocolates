import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from "react";
import { cartReducer, initialCart, type CartAction, type CartState } from "@/lib/cart";

const CartContext = createContext<{ cart: CartState; dispatch: Dispatch<CartAction> } | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);
  return <CartContext.Provider value={{ cart, dispatch }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("El carrito necesita CartProvider");
  return value;
}