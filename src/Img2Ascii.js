import React, { useRef, useState, useEffect } from 'react';

const ImageToAscii = () => {
  const canvasRef = useRef(null);
  const [asciiArt, setAsciiArt] = useState('');
  const [dotArt, setDotArt] = useState('');
  const [originalImage, setOriginalImage] = useState('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg');
  const [conversionType, setConversionType] = useState('ascii');

  useEffect(() => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.src = originalImage;
    image.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const maxDimension = 300; // Limit the size of the image
      let scaleFactor = Math.min(maxDimension / image.width, maxDimension / image.height);
      canvas.width = image.width * scaleFactor;
      canvas.height = image.height * scaleFactor;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      if (conversionType === 'ascii') {
        generateAsciiArt(ctx, canvas.width, canvas.height);
      } else if (conversionType === 'dot') {
        generateDotArt(ctx, canvas.width, canvas.height);
      } else if (conversionType === 'pixel') {
        generatePixelArt(ctx, canvas.width, canvas.height);
      }
    };
  }, [originalImage, conversionType]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAsciiArt(''); // Reset previous conversion result
      setDotArt('');   // Reset previous conversion result

      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target.result);
      };

      reader.readAsDataURL(file);
    }
  };

  const generateAsciiArt = (ctx, width, height) => {
    const asciiCharacters = '@#%$&*+=-:. '; // Expanded ASCII character set
    let asciiImage = '';
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y += 2) {
      let row = '';
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const brightness = (r + g + b) / 3;
        const charIndex = Math.floor((brightness / 255) * (asciiCharacters.length - 1));
        row += asciiCharacters[charIndex];
      }
      asciiImage += row + '\n';
    }

    setAsciiArt(asciiImage);
  };

  const generateDotArt = (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const dotSize = 2;
    let dotImage = '';

    for (let y = 0; y < height; y += dotSize) {
      let row = '';
      for (let x = 0; x < width; x += dotSize) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const brightness = (r + g + b) / 3;

        if (brightness < 50) {
          row += '●';
        } else if (brightness < 100) {
          row += '◉';
        } else if (brightness < 150) {
          row += '○';
        } else if (brightness < 200) {
          row += '◌';
        } else {
          row += ' ';
        }
      }
      dotImage += row + '\n';
    }

    setDotArt(dotImage);
  };

  const generatePixelArt = (ctx, width, height) => {
    const pixelSize = 10;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let pixelImage = '';

    const numRows = Math.ceil(height / pixelSize);
    const numCols = Math.ceil(width / pixelSize);

    for (let y = 0; y < numRows; y++) {
      let row = '';
      for (let x = 0; x < numCols; x++) {
        const index = (y * pixelSize * width + x * pixelSize) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        const avgColor = (r + g + b) / 3;

        if (avgColor < 50) {
          row += '█';
        } else if (avgColor < 100) {
          row += '▓';
        } else if (avgColor < 150) {
          row += '▒';
        } else if (avgColor < 200) {
          row += '░';
        } else {
          row += ' ';
        }
      }
      pixelImage += row + '\n';
    }

    setAsciiArt(pixelImage);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: '20px' }} />

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setConversionType('ascii')} style={{ marginRight: '10px' }}>Image with ASCII</button>
        <button onClick={() => setConversionType('dot')} style={{ marginRight: '10px' }}>Image with DOT</button>
        <button onClick={() => setConversionType('pixel')}>Image with PIXEL</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
        {originalImage && (
          <img
            src={originalImage}
            alt="Original"
            style={{ width: '200px', height: 'auto', marginRight: '20px', border: '1px solid black' }}
          />
        )}

        <pre
          style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '5px',
            lineHeight: '5px',
            letterSpacing: '-1px',
            overflowX: 'auto',
          }}
        >
          {conversionType === 'ascii' ? asciiArt : conversionType === 'dot' ? dotArt : asciiArt}
        </pre>
      </div>

      <canvas
        ref={canvasRef}
        style={{ display: 'none' }} 
      />
    </div>
  );
};

export default ImageToAscii;
