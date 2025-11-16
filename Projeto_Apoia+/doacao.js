const mp = new MercadoPago("TEST-59bb1e4f-09d9-4707-93af-6bde589fcbef");
let cardInstance = null;

const inputValor = document.getElementById("valor");
const installmentsBox = document.getElementById("installments-box");
const installmentsSelect = document.getElementById("installments");
const cardFields = document.getElementById("card-fields");

document.querySelectorAll(".botoes-valores button").forEach(btn => {
    btn.addEventListener("click", () => {
        const valor = btn.getAttribute("data-valor");
        inputValor.value = valor;
        if (cardInstance) cardInstance.update({ amount: valor });
    });
});

function iniciarCardForm() {
    if (cardInstance) return;

    cardInstance = mp.cardForm({
        amount: inputValor.value,
        autoMount: true,
        form: {
            id: "donationPaymentForm",
            cardNumber: "cardNumber",
            securityCode: "securityCode",
            expirationDate: "expirationDate",
            cardholderName: "cardholderName",
            identificationNumber: "identificationNumber",
            installments: "installments",
            issuerId: "issuer",
            paymentMethodId: "paymentMethodId",
            cardTokenId: "cardToken"
        },
        callbacks: {
            onBinChange: async (error, bin) => {
                if (!bin || bin.length < 6) {
                    installmentsBox.style.display = "none";
                    return;
                }
                const amount = parseFloat(inputValor.value);
                const installments = await mp.getInstallments({
                    amount,
                    bin,
                    payment_type_id: "credit_card"
                });
                preencherParcelas(installments[0].payer_costs);
            }
        }
    });
}

function preencherParcelas(costs) {
    installmentsSelect.innerHTML = "";
    costs.forEach(c => {
        const option = document.createElement("option");
        option.value = c.installments;
        option.textContent = c.recommended_message;
        installmentsSelect.appendChild(option);
    });
    installmentsBox.style.display = "block";
}

document.querySelectorAll("input[name='paymentMethod']").forEach(radio => {
    radio.addEventListener("change", () => {
        const metodo = radio.value;

        if (metodo === "credit" || metodo === "debit") {
            cardFields.style.display = "block";
            iniciarCardForm();
            installmentsBox.style.display = metodo === "credit" ? "block" : "none";
        } else {
            cardFields.style.display = "none";
            installmentsBox.style.display = "none";
        }
    });
});

async function processarPix() {
    const valor = Number(inputValor.value);
    document.getElementById("loading").style.display = "block";

    const res = await fetch("http://localhost:3001/api/process_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            paymentMethod: "pix",
            amount: valor,
            description: "Doação Apoia+"
        })
    });

    const result = await res.json();
    document.getElementById("loading").style.display = "none";

    const pixDiv = document.getElementById("pix-result");
    pixDiv.style.display = "block";

    pixDiv.innerHTML = `
    <h2>PIX Gerado</h2>
    <img src="data:image/png;base64,${result.qr_code_base64}" width="260">

    <div style="margin-top:15px; font-size:16px;">
        <strong>Chave PIX:</strong><br>

        <span id="pixChave" style="
            background:#eee;
            padding:6px 10px;
            border-radius:5px;
            display:inline-block;
            max-width:430px;
            word-break:break-all;
            margin-top:6px;
        ">
            ${result.chave_copia_cola}
        </span>

        <br>

        <button onclick="copiarPix()" 
            style="margin-top:10px;padding:6px 12px;background:#6c63ff;color:white;border-radius:6px;cursor:pointer;border:none;">
            Copiar
        </button>
    </div>
`;

}

function copiarPix() {
    const chave = document.getElementById("pixChave").innerText;
    navigator.clipboard.writeText(chave);
    alert("Chave PIX copiada!");
}

async function processarCartao() {
    const token = document.getElementById("cardToken").value;
    if (!token) return alert("Verifique os dados do cartão.");

    const data = {
        paymentMethod: "card",
        amount: Number(inputValor.value),
        description: "Doação Apoia+",
        token: token,
        installments: Number(installmentsSelect.value),
        paymentMethodId: document.getElementById("paymentMethodId").value,
        issuer_id: document.getElementById("issuer").value,
        identificationNumber: document.getElementById("identificationNumber").value
    };

    const res = await fetch("http://localhost:3001/api/process_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();
    const resultDiv = document.getElementById("card-result");
    resultDiv.style.display = "block";
    resultDiv.innerHTML = `
        <h2>Status do Pagamento</h2>
        Status: ${result.status}<br>
        Detalhe: ${result.status_detail}
    `;
}

document.getElementById("donationPaymentForm").addEventListener("submit", async e => {
    e.preventDefault();
    const metodo = document.querySelector("input[name='paymentMethod']:checked").value;

    if (metodo === "pix") return processarPix();
    return processarCartao();
});
