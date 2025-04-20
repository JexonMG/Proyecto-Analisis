class QRGenerator {
    constructor() {
      this.qrModal = document.getElementById('qrModal');
      this.qrImage = document.getElementById('qrImage');
      this.qrCarnet = document.getElementById('qrCarnet');
      this.closeQr = document.getElementById('closeQr');
      
      this.initEvents();
    }
    
    initEvents() {
      document.querySelector('.profile-image').addEventListener('click', () => this.showQR());
      this.closeQr.addEventListener('click', () => this.closeQR());
      this.qrModal.addEventListener('click', (e) => {
        if (e.target === this.qrModal) this.closeQR();
      });
    }
    
    generateQR(carnet) {
      const qr = qrcode(0, 'H');
      qr.addData(carnet);
      qr.make();
      return qr.createDataURL(8, 30);
    }
    
    showQR(carnet) {
      if (!carnet) {
        const user = JSON.parse(localStorage.getItem('user')) || {};
        carnet = user.carnetNumber || '12345';
      }
      
      this.qrImage.src = this.generateQR(carnet);
      this.qrCarnet.textContent = carnet;
      this.qrModal.classList.add('active');
    }
    
    closeQR() {
      this.qrModal.classList.remove('active');
    }
  }
  
  // Inicialización cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    new QRGenerator();
  });