document.addEventListener('DOMContentLoaded', () => {
    const qrScanBtn = document.getElementById('qrScanBtn');
    const qrScannerModal = document.getElementById('qrScanner');
    const closeQrScanner = document.getElementById('closeQrScanner');
    const scanResultDiv = document.getElementById('scanResult');

    qrScanBtn.addEventListener('click', () => {
        qrScannerModal.style.display = 'block';
        initializeQRScanner();
    });

    closeQrScanner.addEventListener('click', () => {
        qrScannerModal.style.display = 'none';
        html5QrcodeScanner.clear();
    });

    function initializeQRScanner() {
        const html5QrcodeScanner = new Html5QrcodeScanner(
            "reader", 
            { 
                fps: 10, 
                qrbox: 250 
            }
        );

        html5QrcodeScanner.render(onScanSuccess, onScanError);

        function onScanSuccess(decodedText, decodedResult) {
            console.log(`Code scanned = ${decodedText}, decodedResult`);
            scanResultDiv.textContent = `Resultado: ${decodedText}`;
            html5QrcodeScanner.clear();
            qrScannerModal.style.display = 'none';
        }

        function onScanError(errorMessage) {
            console.warn(`Code scan error = ${errorMessage}`);
        }
    }
});

function generateQRCode() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const qrCodeDiv = document.getElementById('qrCode');
    qrCodeDiv.innerHTML = ''; // Clear previous QR code

    const qr = new QRCode(qrCodeDiv, {
        text: JSON.stringify({
            username: user.username,
            name: user.name,
            timestamp: new Date().toISOString()
        }),
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}