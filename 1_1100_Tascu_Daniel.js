const canvas = document.getElementById('desenareCanvas');
const context = canvas.getContext('2d');
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


let figuraSelectata = null;
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

        actualizeazaFundal();
        actualizeazaListaForme(); 
        deseneaza = false;
    }
});

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

function desenareLinie(x1, y1, x2, y2, culoare, grosime, Preview) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);

    context.strokeStyle = culoare;
    context.lineWidth = grosime;
    context.stroke(); 
}


stergereBtn.addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    actualizeazaFundal();
    formeDesenate = [];
    actualizeazaListaForme();
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
    formeDesenate.forEach(redeseneazaForma);

    svgContent += `</svg>`;

  
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'imagine_desen.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
});

bgColorInput.addEventListener('change', () => {
    culoareFundal = bgColorInput.value;
   
});


function actualizeazaFundal() {
    context.fillStyle = culoareFundal;
    context.fillRect(0, 0, canvas.width, canvas.height);

    formeDesenate.forEach(
        redeseneazaForma);
}


function actualizeazaListaForme() {
    listaForme.innerHTML = ''; // Golește lista existentă

    
    formeDesenate.forEach((forma, index) => {     
//creeaza un el. in lista pt fiecare forma 
const item = document.createElement('li');
item.textContent = `${forma.tip} (${forma.x1}, ${forma.y1}) - (${forma.x2}, ${forma.y2})`;

//creaza buton pt stergerea formei
const btnSterge = document.createElement('button');
btnSterge.textContent = 'Sterge';

//event listener care apeleaza sterge forma 
btnSterge.addEventListener('click', () => stergeForma(index));


        // Buton pentru editare
        const btnEditeaza = document.createElement('button');
        btnEditeaza.textContent = 'Editeaza';
        btnEditeaza.addEventListener('click', () => {
            figuraSelectata = index; // Setăm indexul figurii selectate
            const figura = formeDesenate[index]; // Figura selectată

            // Populăm formularul cu datele curente
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

//edit btn
applyEditBtn.addEventListener('click', () => {
    if (figuraSelectata === null) {
        alert("Nicio figură selectată pentru modificare.");
        return;
    }

    // Colectăm valorile din formular
    const x1 = parseInt(document.getElementById('editX1').value, 10);
    const y1 = parseInt(document.getElementById('editY1').value, 10);
    const x2 = parseInt(document.getElementById('editX2').value, 10);
    const y2 = parseInt(document.getElementById('editY2').value, 10);
    const culoare = document.getElementById('editColor').value;
    const grosime = parseInt(document.getElementById('editGrosime').value, 10);

    // Validare coordonate
    if (
        !valideazaCoordonate(x1, canvas.width) || 
        !valideazaCoordonate(y1, canvas.height) || 
        !valideazaCoordonate(x2, canvas.width) || 
        !valideazaCoordonate(y2, canvas.height)
    ) {
        alert("Coordonatele trebuie să fie numerice, pozitive și în limitele canvasului.");
        return;
    }

    // Validare grosime
    if (isNaN(grosime) || grosime <= 0) {
        alert("Grosimea trebuie să fie un număr pozitiv mai mare decât 0.");
        return;
    }

    // Aplicăm modificările
    formeDesenate[figuraSelectata] = {
        ...formeDesenate[figuraSelectata],
        x1,
        y1,
        x2,
        y2,
        culoare,
        grosime,
    };

    // Redesenăm canvasul și actualizăm lista
    actualizeazaFundal();
    actualizeazaListaForme();

    figuraSelectata = null;
    alert("Figura a fost actualizată cu succes!");
});
//editBtn




function valideazaCoordonate(coord, maxLimit) {
    return !isNaN(coord) && coord >= 0 && coord <= maxLimit;
}





function stergeForma(index) {
    formeDesenate.splice(index, 1); // Șterge forma din array
    actualizeazaFundal(); // 
    actualizeazaListaForme(); // Actualizăm lista
}