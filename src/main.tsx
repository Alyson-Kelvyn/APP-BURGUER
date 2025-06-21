// Importação da função para criar a raiz do React DOM
import { createRoot } from "react-dom/client";
// Importação do componente principal da aplicação
import App from "./App.tsx";
// Importação dos estilos globais da aplicação
import "./index.css";

// Criação da raiz do React e renderização do componente App
// O "!" indica que o elemento com id "root" existe com certeza
createRoot(document.getElementById("root")!).render(<App />);
