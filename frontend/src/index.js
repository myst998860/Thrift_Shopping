import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css';

import { UserSessionProvider } from "./context/UserSessionContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create React Query client instance
const queryClient = new QueryClient();

console.log("Starting application");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <UserSessionProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </UserSessionProvider>
);
