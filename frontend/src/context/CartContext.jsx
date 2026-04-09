import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');

  const addToCart = (item, restId, restName) => {
    // If adding from a different restaurant, clear cart first
    if (restaurantId && restaurantId !== restId) {
      setCartItems([{ ...item, quantity: 1 }]);
      setRestaurantId(restId);
      setRestaurantName(restName);
      return;
    }

    setRestaurantId(restId);
    setRestaurantName(restName);

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((ci) => ci._id === item._id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((ci) => ci._id === itemId);
      if (existingIndex >= 0) {
        const item = prev[existingIndex];
        if (item.quantity > 1) {
          const updated = [...prev];
          updated[existingIndex] = { ...item, quantity: item.quantity - 1 };
          return updated;
        }
        return prev.filter((ci) => ci._id !== itemId);
      }
      return prev;
    });
  };

  const deleteFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((ci) => ci._id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
    setRestaurantName('');
  };

  const getItemQuantity = (itemId) => {
    const item = cartItems.find((ci) => ci._id === itemId);
    return item ? item.quantity : 0;
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurantId,
        restaurantName,
        addToCart,
        removeFromCart,
        deleteFromCart,
        clearCart,
        getItemQuantity,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
