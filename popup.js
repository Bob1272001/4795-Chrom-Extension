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
      if (!scanningPaused && video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height, {
            inversionAttempts: 'attemptBoth',
        });
    
        if (code) {
          result.textContent = 'QR Code detected and parsed successfully';
          const qrData = JSON.parse(code.data);
    
          // Create a tab-separated string for spreadsheet pasting, with fields that fit around dharmas spreadsheet
          const formattedData = [
            qrData.Match,
            qrData.Mobility,  
            '', '', '', '',
            qrData.Amp,
            qrData.AmpMissed,
            qrData.Speaker,
            qrData.SpeakerMissed,
            qrData.totalAutoMadeShots,
            qrData.AmpTeleop,
            qrData.AmpTeleopMissed,
            qrData.SpeakerTeleop,
            qrData.SpeakerTeleopMissed,
            qrData.totalTeleopMadeShots,
            qrData.Parked,   
            qrData.Climbed,
            qrData.Trap,
            qrData.Disabled,
            qrData.UnderStage,
            qrData.Comments
          ].join('\t');
          
    
          // Copy the formatted data to clipboard
          navigator.clipboard.writeText(formattedData).then(function() {
            result.textContent += ' (Data copied to clipboard)';
          }).catch(function() {
            result.textContent += ' (Failed to copy data to clipboard)';
          });
    
          // Display the team number from the QR code
          const teamDisplay = document.getElementById('teamDisplay');
          if (teamDisplay) {
            teamDisplay.textContent = `Scanned Team: ${qrData.team}`;
          }
    
          scanningPaused = true;
          setTimeout(() => {
            scanningPaused = false;
          }, 2000);
        } else {
          result.textContent = 'No QR code detected';
        }
      }
      requestAnimationFrame(scanQRCode);
    }
    
  
  video.addEventListener('playing', function() {
      scanQRCode();
  });
  
  askForCameraPermission();
  
  
    video.addEventListener('playing', function() {
      scanQRCode();
    });
  });
  