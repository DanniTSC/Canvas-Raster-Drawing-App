const canvas = document.getElementById('desenareCanvas');
const context = canvas.getContext('2d');
const colorInput = document.getElementById('saveColor');
const stergereBtn = document.getElementById('btnStergeCanvas');
const saveBtn = document.getElementById('btnSalvareImage');
const grosimeLinieIn = document.getElementById('selecteazaGrosime');
const selectareForma = document.getElementById('selecteazaForma');
const exportSVGBtn = document.getElementById('btnExportSvg'); 
const bgColorInput = document.getElementById('bgColor');


let culoareFundal = bgColorInput.value;
let formeDesenate = []; 
let deseneaza = false;
let initialX, initialY;
let canvasSnapshot = null;

// incepere desen
canvas.addEventListener('mousedown', (e) => {
    deseneaza = true;
    initialX = e.offsetX;
    initialY = e.offsetY;
    canvasSnapshot = context.getImageData(0, 0, canvas.width, canvas.height);
});

// preview desen
canvas.addEventListener('mousemove', (e) => {
    if (deseneaza) {
        context.putImageData(canvasSnapshot, 0, 0);
       
        const forma = selectareForma.value;
        if (forma === 'elipsa') {
            desenareElipsa(initialX, initialY, e.offsetX, e.offsetY, true);
    } else if (forma === 'dreptunghi') {
        desenareDreptunghi(initialX, initialY, e.offsetX, e.offsetY, true);
    } else if (forma === 'linie') { 
        desenareLinie(initialX, initialY, e.offsetX, e.offsetY, true);
    }
}
});

// finalizare desen
canvas.addEventListener('mouseup', (e) => {
    if (deseneaza) {
        const forma = selectareForma.value; 

        const formaNoua = { 
            tip: forma,
            x1: initialX,
            y1: initialY,
            x2: e.offsetX,
            y2: e.offsetY,
            culoare: colorInput.value,
            grosime: grosimeLinieIn.value,
        };
        formeDesenate.push(formaNoua);

        if (forma === 'elipsa') {
            desenareElipsa(initialX, initialY, e.offsetX, e.offsetY, false);
        } else if (forma === 'dreptunghi') {
            desenareDreptunghi(initialX, initialY, e.offsetX, e.offsetY, false);
        } else if (forma === 'linie') {
            desenareLinie(initialX, initialY, e.offsetX, e.offsetY, false);
        }
        actualizeazaFundal();
        deseneaza = false;
        
    }
});

// elipsa
function desenareElipsa(x1, y1, x2, y2, Preview) {
    const razaX = Math.abs(x2 - x1) / 2;
    const razaY = Math.abs(y2 - y1) / 2;
    const centruX = (x1 + x2) / 2;
    const centruY = (y1 + y2) / 2;

    context.beginPath();
    context.ellipse(centruX, centruY, razaX, razaY, 0, 0, 2 * Math.PI);

    if (Preview) {
        context.strokeStyle = colorInput.value;
        context.lineWidth = grosimeLinieIn.value;;
        context.stroke();
    } else {
        context.fillStyle = colorInput.value;
        context.fill();
        // Salvează starea canvas-ului doar când desenul este finalizat
        canvasSnapshot = context.getImageData(0, 0, canvas.width, canvas.height);
    }
}




//functie desenare dreptunghi
function desenareDreptunghi(x1,y1,x2,y2,preview)
{
    context.beginPath();
    context.rect(x1,y1,x2-x1,y2-y1);
    if(preview)
    {
        context.strokeStyle = colorInput.value;
        context.lineWidth = grosimeLinieIn.value;
        context.stroke();
    }
    else
    {
        context.fillStyle = colorInput.value;
        context.fill();
        canvasSnapshot = context.getImageData(0, 0, canvas.width, canvas.height);
    }
}

//functie desenare linie
function desenareLinie(x1,y1,x2,y2,preview)
{
    context.beginPath();
    context.moveTo(x1,y1);
    context.lineTo(x2,y2);
    if(preview)
    {
        context.strokeStyle = colorInput.value;
        context.lineWidth = grosimeLinieIn.value;
        context.stroke();
    }
    else
    {
        context.strokeStyle = colorInput.value;
        context.lineWidth = grosimeLinieIn.value;
        context.stroke();
        canvasSnapshot = context.getImageData(0, 0, canvas.width, canvas.height);
    }
}


stergereBtn.addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    actualizeazaFundal();
    formeDesenate = [];
});

// png save
saveBtn.addEventListener('click', () => {
    const imagineGenerata = canvas.toDataURL('image/png');
    const linkSalvare = document.createElement('a');
    linkSalvare.download = 'imagine_desen.png';
    linkSalvare.href = imagineGenerata;
    linkSalvare.click();
});

// svg export
exportSVGBtn.addEventListener('click', () => {
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">\n`;
    svgContent += `<rect width="${canvas.width}" height="${canvas.height}" fill="${culoareFundal}" />\n`;
    formeDesenate.forEach((forma) => {
        if (forma.tip === 'elipsa') {
            const razaX = Math.abs(forma.x2 - forma.x1) / 2;
            const razaY = Math.abs(forma.y2 - forma.y1) / 2;
            const centruX = (forma.x1 + forma.x2) / 2;
            const centruY = (forma.y1 + forma.y2) / 2;
            svgContent += `<ellipse cx="${centruX}" cy="${centruY}" rx="${razaX}" ry="${razaY}" fill="${forma.culoare}" stroke="${forma.culoare}" stroke-width="${forma.grosime}" />\n`;
        } else if (forma.tip === 'dreptunghi') {
            const width = forma.x2 - forma.x1;
            const height = forma.y2 - forma.y1;
            svgContent += `<rect x="${forma.x1}" y="${forma.y1}" width="${width}" height="${height}" fill="${forma.culoare}" stroke="${forma.culoare}" stroke-width="${forma.grosime}" />\n`;
        } else if (forma.tip === 'linie') {
            svgContent += `<line x1="${forma.x1}" y1="${forma.y1}" x2="${forma.x2}" y2="${forma.y2}" stroke="${forma.culoare}" stroke-width="${forma.grosime}" />\n`;
        }
    });

    svgContent += `</svg>`;

  
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'imagine_desen.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
});

bgColorInput.addEventListener('change', () => {
    culoareFundal = bgColorInput.value;
    actualizeazaFundal();
});

function actualizeazaFundal() {
    context.fillStyle = culoareFundal;
    context.fillRect(0, 0, canvas.width, canvas.height);
    formeDesenate.forEach((forma) => {
        if (forma.tip === 'elipsa') {
            desenareElipsa(forma.x1, forma.y1, forma.x2, forma.y2, false);
        } else if (forma.tip === 'dreptunghi') {
            desenareDreptunghi(forma.x1, forma.y1, forma.x2, forma.y2, false);
        } else if (forma.tip === 'linie') {
            desenareLinie(forma.x1, forma.y1, forma.x2, forma.y2, false);
        }
    });
}
