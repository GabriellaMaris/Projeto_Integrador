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

    popup.style.display = 'flex'; // mostra o pop-up
});

closePopup.addEventListener('click', () => {
    popup.style.display = 'none';
    form.reset(); // limpa o formulário
});

