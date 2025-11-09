import { createRoot } from "react-dom/client";
import App from "./app/App";
import GlobalStyle from "./app/styles/GlobalStyle";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <>
    <GlobalStyle />
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </>
);
