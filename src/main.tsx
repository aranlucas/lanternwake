import { createRoot } from "react-dom/client";
import App from "./app.tsx";
import "./styles.css";

createRoot(document.querySelector("#root")!).render(<App />);
