const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MercadoPagoConfig, Payment } = require("mercadopago");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const ACCESS_TOKEN = "TEST-7117069459786834-111416-134802255afbbd6347a2e47688a88169-570799488";

const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
const payment = new Payment(client);

app.post("/api/process_payment", async (req, res) => {
    const { paymentMethod, amount, description } = req.body;

    if (paymentMethod === "pix") {
        try {
            const response = await payment.create({
                body: {
                    transaction_amount: Number(amount),
                    description: description ?? "Doação Apoia+",
                    payment_method_id: "pix",
                    payer: {
                        email: "teste@teste.com",
                        first_name: "Cliente",
                        last_name: "Teste",
                        identification: {
                            type: "CPF",
                            number: "12345678909"
                        }
                    }
                }
            });

            return res.json({
                status: response.status,
                qr_code: response.point_of_interaction.transaction_data.qr_code,
                qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64,
                chave_copia_cola: response.point_of_interaction.transaction_data.qr_code
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Erro ao gerar PIX", detail: error.message });
        }
    }

    return res.status(400).json({ error: "Método não suportado." });
});

app.listen(3001, () => {
    console.log("API Mercado Pago rodando http://localhost:3001");
});
