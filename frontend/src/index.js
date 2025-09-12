import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css';

import { UserSessionProvider } from "./context/UserSessionContext";
import { CartProvider } from "./context/CartContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create React Query client instance
const queryClient = new QueryClient();

console.log("Starting application");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <UserSessionProvider>
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <App />
      </CartProvider>
    </QueryClientProvider>
  </UserSessionProvider>
);
