const mp = new MercadoPago("TEST-59bb1e4f-09d9-4707-93af-6bde589fcbef"); 
let cardInstance = null;

const inputValor = document.getElementById("valor");
const installmentsBox = document.getElementById("installments-box");
const installmentsSelect = document.getElementById("installments");
const cardFields = document.getElementById("card-fields");

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
            cardTokenId: "cardToken",
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
                    payment_type_id: "credit_card",
                });

                preencherParcelas(installments[0].payer_costs);
            }
        }
    });
  const form = document.getElementById('donationForm');
const popup = document.getElementById('popup');
const closePopup = document.getElementById('closePopup');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const valor = parseFloat(document.getElementById('valor').value);

    if (isNaN(valor) || valor < 5) {
        alert('O valor mínimo para doação é R$5,00.');
        return;
    }

    popup.style.display = 'flex'; 
});

closePopup.addEventListener('click', () => {
    popup.style.display = 'none';
    form.reset(); 
});

}

function preencherParcelas(costs) {
    installmentsSelect.innerHTML = "";

    costs.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.installments;
        opt.textContent = c.recommended_message;
        installmentsSelect.appendChild(opt);
    });

    installmentsBox.style.display = "block";
}

document.querySelectorAll("input[name='paymentMethod']").forEach(radio => {
    radio.addEventListener("change", () => {
        const metodo = radio.value;

        if (metodo === "credit" || metodo === "debit") {
            cardFields.style.display = "block";
            iniciarCardForm();
            installmentsBox.style.display = (metodo === "credit") ? "block" : "none";
        } else {
            cardFields.style.display = "none";
            installmentsBox.style.display = "none";
        }
    });
});

async function processarPix() {
    const valor = Number(document.getElementById("valor").value);

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
        <p><strong>Chave Copia e Cola:</strong></p>
        <textarea id="pixChave" style="width:100%;height:90px;">${result.chave_copia_cola}</textarea>
        <button onclick="copiarPix()" 
            style="margin-top:10px;padding:10px;background:#6c63ff;color:white;border-radius:6px;cursor:pointer">
            Copiar Chave
        </button>
    `;
}

function copiarPix() {
    const text = document.getElementById("pixChave");
    text.select();
    navigator.clipboard.writeText(text.value);
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
        installments: Number(document.getElementById("installments").value),
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
    console.log(result);

    document.getElementById("card-result").style.display = "block";
    document.getElementById("card-result").innerHTML = `
        Status: ${result.status}<br>
        Detalhe: ${result.detail}
    `;
}

document.getElementById("donationPaymentForm").addEventListener("submit", async e => {
    e.preventDefault();

    const metodo = document.querySelector("input[name='paymentMethod']:checked").value;

    if (metodo === "pix") return processarPix();
    return processarCartao();
});
