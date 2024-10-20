document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const result = document.getElementById('result');
    let scanningPaused = false;
  
    const constraints = {
      video: { facingMode: 'environment' }
    };
  
    function handleSuccess(stream) {
      video.srcObject = stream;
      video.play();
    }
  
    function handleError(err) {
      console.error('Error accessing the camera:', err);
      result.textContent = `Error accessing the camera: ${err.name}`;
    }
  
    navigator.permissions.query({ name: 'camera' }).then(function(permissionStatus) {
      if (permissionStatus.state === 'granted') {
        startCamera();
      } else if (permissionStatus.state === 'prompt') {
        permissionStatus.onchange = function() {
          if (permissionStatus.state === 'granted') {
            startCamera();
          } else {
            result.textContent = 'Camera permission denied.';
          }
        };
      } else {
        result.textContent = 'Camera permission denied.';
      }
    });
  
    function startCamera() {
      navigator.mediaDevices.getUserMedia(constraints)
        .then(handleSuccess)
        .catch(handleError);
    }
  
    function scanQRCode() {
      console.log('Scanning QR Code...');
      if (!scanningPaused && video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        console.log('Capturing video frame...');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height, {
          inversionAttempts: 'attemptBoth',
        });
  
        if (code) {
          console.log('QR code detected:', code.data);
          result.textContent = 'QR Code detected and parsed successfully';
          const qrData = code.data;
  
          navigator.clipboard.writeText(qrData).then(function() {
            result.textContent += ' (Data copied to clipboard)';
          }).catch(function(err) {
            result.textContent += ' (Failed to copy data to clipboard)';
          });
  
          scanningPaused = true;
          setTimeout(() => {
            scanningPaused = false;
          }, 2000);
        } else {
          result.textContent = 'No QR code detected';
          console.log('No QR code detected');
        }
      }
  
      requestAnimationFrame(scanQRCode);
    }
  
    video.addEventListener('playing', function() {
      scanQRCode();
    });
  });
  