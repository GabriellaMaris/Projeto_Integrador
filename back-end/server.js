import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 5000; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicPath = path.join(__dirname, "../front-end"); 

app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "doacao.html"));
});

app.get("/doacao", (req, res) => {
  res.sendFile(path.join(publicPath, "doacao.html"));
});


app.listen(port, () => {
  console.log(`🚀 Servidor Principal (Frontend) rodando em http://localhost:${port}`);
  console.log(`Acesse a doação em http://localhost:${port}/`);
  console.log(`\n** Lembre-se de iniciar o Servidor de Pagamento na porta 3001 (node paymentServer.cjs)! **`);
});