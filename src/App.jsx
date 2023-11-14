import { QueryClient, QueryClientProvider } from "react-query";
import StageScene from "./components/blocks/StageScene";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

const App = (props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <StageScene allDataJson={props.json} />
    </QueryClientProvider>
  );
};

export default App;
