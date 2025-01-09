//canvas&context
const desenCanvas = document.getElementById('desenareCanvas');
const context = desenCanvas.getContext('2d');

//legaturi
const colorInput = document.getElementById('saveColor');
const stergereBtn = document.getElementById('btnStergeCanvas');
const saveBtn = document.getElementById('btnSalvareImage');
const grosimeLinieIn = document.getElementById('selecteazaGrosime');
const selectareForma = document.getElementById('selecteazaForma');
const exportSVGBtn = document.getElementById('btnExportSvg'); 
const bgColorInput = document.getElementById('bgColor');
const listaForme = document.getElementById('listaFiguri');
const editForm = document.getElementById('editForm');
const applyEditBtn = document.getElementById('applyEditBtn');

//initializari
let figuraSelectata = null;
let culoareFundal = bgColorInput.value;
let formeDesenate = []; 
let deseneaza = false;
let x, y;
let canvasSnapshot = null;

// incepere desen
desenCanvas.addEventListener('mousedown', (e) => {
    deseneaza = true;
    x = e.offsetX;
    y = e.offsetY;
    canvasSnapshot = context.getImageData(0, 0, desenCanvas.width, desenCanvas.height);
});

// preview desen
desenCanvas.addEventListener('mousemove', (e) => {
    if (deseneaza) {
        context.putImageData(canvasSnapshot, 0, 0);
       
        const forma = selectareForma.value;
        if (forma === 'elipsa') {
            desenareElipsa(x, y, e.offsetX, e.offsetY, true);
    } else if (forma === 'dreptunghi') {
        desenareDreptunghi(x, y, e.offsetX, e.offsetY, true);
    } else if (forma === 'linie') { 
        desenareLinie(x, y, e.offsetX, e.offsetY, true);
    }
}
});

// finalizare desen
desenCanvas.addEventListener('mouseup', (e) => {
    
    if (deseneaza) {
        const forma = selectareForma.value;

        const formaNoua = {
            tip: forma,
            x1: x,
            y1: y,
            x2: e.offsetX,
            y2: e.offsetY,
            culoare: colorInput.value,
            grosime: grosimeLinieIn.value,
        };

        formeDesenate.push(formaNoua);

        modificaFundal();
        actualizeazaListaForme(); 
        deseneaza = false;
    }
});

stergereBtn.addEventListener('click', () => {
    context.clearRect(0, 0, desenCanvas.width, desenCanvas.height);
    modificaFundal();
    formeDesenate = [];
    actualizeazaListaForme();
});

// png save
saveBtn.addEventListener('click', () => {
    const imagineGenerata = desenCanvas.toDataURL('image/png');
    const linkSalvare = document.createElement('a');
    linkSalvare.download = 'imagine_desen.png';
    linkSalvare.href = imagineGenerata;
    linkSalvare.click();
});

// svg export
exportSVGBtn.addEventListener('click', () => {
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${desenCanvas.width}" height="${desenCanvas.height}">\n`;
    svgContent += `<rect width="${desenCanvas.width}" height="${desenCanvas.height}" fill="${culoareFundal}" />\n`;

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
    modificaFundal();
});

applyEditBtn.addEventListener('click', () => {
    if (figuraSelectata === null) {
        alert("Nicio forma selectata pentru modificare.");
        return;
    }

    //luam date din formular
    const x1 = parseInt(document.getElementById('editX1').value, 10);
    const y1 = parseInt(document.getElementById('editY1').value, 10);
    const x2 = parseInt(document.getElementById('editX2').value, 10);
    const y2 = parseInt(document.getElementById('editY2').value, 10);
    const culoare = document.getElementById('editColor').value;
    const grosime = parseInt(document.getElementById('editGrosime').value, 10);

    // Validare coordonate
    if (
        !valideazaCoordonate(x1, desenCanvas.width) || 
        !valideazaCoordonate(y1, desenCanvas.height) || 
        !valideazaCoordonate(x2, desenCanvas.width) || 
        !valideazaCoordonate(y2, desenCanvas.height)
    ) {
        alert("Coordonatele trebuie sa fie numerice, pozitive si sa respecte limitele canvasului.");
        return;
    }

    // Validare grosime
    if (isNaN(grosime) || grosime <= 0) {
        alert("Grosimea trebuie sa fie un numar pozitiv mai mare decat 0.");
        return;
    }

    //aplicam modificarile
    formeDesenate[figuraSelectata] = {
        ...formeDesenate[figuraSelectata],
        x1,
        y1,
        x2,
        y2,
        culoare,
        grosime,
    };

    //redesenam canvas si actualizam lista
    modificaFundal();
    actualizeazaListaForme();

    figuraSelectata = null;
    alert("Figura a fost editata cu succes!");
});



//functie generala
function redeseneazaForma(forma) {
    if (forma.tip === 'elipsa') {
        desenareElipsa(forma.x1, forma.y1, forma.x2, forma.y2, forma.culoare, forma.grosime, false);
    } else if (forma.tip === 'dreptunghi') {
        desenareDreptunghi(forma.x1, forma.y1, forma.x2, forma.y2, forma.culoare, forma.grosime, false);
    } else if (forma.tip === 'linie') {
        desenareLinie(forma.x1, forma.y1, forma.x2, forma.y2, forma.culoare, forma.grosime, false);
    }
}

// elipsa
function desenareElipsa(x1, y1, x2, y2, culoare, grosime, Preview) {
    const razaX = Math.abs(x2 - x1) / 2;
    const razaY = Math.abs(y2 - y1) / 2;
    const centruX = (x1 + x2) / 2;
    const centruY = (y1 + y2) / 2;

    context.beginPath();
    context.ellipse(centruX, centruY, razaX, razaY, 0, 0, 2 * Math.PI);

    context.strokeStyle = culoare;
    context.lineWidth = grosime;

    if (Preview) {
        context.stroke();
    } else {
        context.fillStyle = culoare;
        context.fill();
    }
}

//dreptunghi
function desenareDreptunghi(x1, y1, x2, y2, culoare, grosime, Preview) {
    context.beginPath();
    context.rect(x1, y1, x2 - x1, y2 - y1);

    context.strokeStyle = culoare;
    context.lineWidth = grosime;

    if (Preview) {
        context.stroke();
    } else {
        context.fillStyle = culoare;
        context.fill();
    }
}


//linie
function desenareLinie(x1, y1, x2, y2, culoare, grosime, Preview) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);

    context.strokeStyle = culoare;
    context.lineWidth = grosime;
    context.stroke(); 
}

function modificaFundal() {
    context.fillStyle = culoareFundal;
    context.fillRect(0, 0, desenCanvas.width, desenCanvas.height);

    formeDesenate.forEach(
        redeseneazaForma);
}


function actualizeazaListaForme() {
    listaForme.innerHTML = ''; // golesc lista 

    
    formeDesenate.forEach((forma, index) => {   

//creeaza un element in lista pt fiecare forma 
const item = document.createElement('li');
item.textContent = `${forma.tip} (${forma.x1}, ${forma.y1}) - (${forma.x2}, ${forma.y2})`;

//creaza buton pt stergerea formei
const btnSterge = document.createElement('button');
btnSterge.textContent = 'Sterge';

//event listener care apeleaza sterge forma 
btnSterge.addEventListener('click', () => stergeForma(index));


        //btnEditare
        const btnEditeaza = document.createElement('button');
        btnEditeaza.textContent = 'Editeaza';
        btnEditeaza.addEventListener('click', () => {
            figuraSelectata = index; //setam indexul figurii select
            const figura = formeDesenate[index]; //forma selectata

            //populare formularul cu date 
            document.getElementById('editX1').value = figura.x1;
            document.getElementById('editY1').value = figura.y1;
            document.getElementById('editX2').value = figura.x2;
            document.getElementById('editY2').value = figura.y2;
            document.getElementById('editColor').value = figura.culoare;
            document.getElementById('editGrosime').value = figura.grosime;
        });

        item.appendChild(btnSterge);
        item.appendChild(btnEditeaza);
        listaForme.appendChild(item);
    });
}

function valideazaCoordonate(coord, maxLimit) {
    return !isNaN(coord) && coord >= 0 && coord <= maxLimit;
}

function stergeForma(index) {
    formeDesenate.splice(index, 1); 
    modificaFundal();  
    actualizeazaListaForme(); 
}