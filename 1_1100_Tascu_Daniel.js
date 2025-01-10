//canvas&context
const desenCanvas = document.getElementById('desenareCanvas');
const context = desenCanvas.getContext('2d');

//legaturi catre elemente HTML
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
const creion = document.getElementById('creion');

//initializari
let figuraSelectata = null;
let culoareFundal = bgColorInput.value;
let formeDesenate = []; 
let deseneaza = false;
let x, y;
let canvasSnapshot = null;
let puncteCreion = [];



//EventListeners ---------------------------------------------------------------------------------------------------------

//incepe desenarea
addCanvasEvent('mousedown', handleMouseDown);
//preview
addCanvasEvent('mousemove', handleMouseMove);
//finalizare desen
addCanvasEvent('mouseup', handleMouseUp);


stergereBtn.addEventListener('click', stergeCanvas); //sterge canvasul
saveBtn.addEventListener('click', () => salveazaImagine('image/png', 'imagine_desen.png')); //save png
exportSVGBtn.addEventListener('click', () => exportaSVG('imagine_desen.svg')); //save svg


bgColorInput.addEventListener('change', () => {
    culoareFundal = bgColorInput.value;
    modificaFundal();
});

applyEditBtn.addEventListener('click', () => {
    //verifica daca exista o forma selectata
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

    //aplica modificarile folosind operatorul spread prin suprascriere
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

    //reseteaza forma selectata pentru a evita modificari nedorite
    figuraSelectata = null;
    alert("Figura a fost editata cu succes!");
});

//FUNCTII ---------------------------------------------------------------------------------------------------------
//functie generala pentru a adauga un eveniment pe canvas
function addCanvasEvent(eventType, callback) {
    desenCanvas.addEventListener(eventType, callback);
}

//apasare mouse
function handleMouseDown(e) {
    deseneaza = true;
    x = e.offsetX; // coord x si y unde a fost apasat mouse ul
    y = e.offsetY;
    
    if (selectareForma.value === "creion") {
        traseuCreion = [{ x: x, y: y }]; // initializeaza traseul cu punctul de start
    } else {
        //copie a canvasului actual pentru a putea face preview
    canvasSnapshot = context.getImageData(0, 0, desenCanvas.width, desenCanvas.height);
    }

}

//miscare mouse
function handleMouseMove(e) {
    if (deseneaza) {
        if (selectareForma.value === "creion") {
            // adauga punctul curent în vectorul pentru traseul creionului
            const punctCurent = { x: e.offsetX, y: e.offsetY };
            traseuCreion.push(punctCurent);

            // deseneaza traseul în timp real
            context.beginPath();
            context.moveTo(traseuCreion[0].x, traseuCreion[0].y);
            for (let i = 1; i < traseuCreion.length; i++) {
                context.lineTo(traseuCreion[i].x, traseuCreion[i].y);
            }
            context.strokeStyle = colorInput.value; 
            context.lineWidth = grosimeLinieIn.value; 
            context.stroke();
        }
        else{
        context.putImageData(canvasSnapshot, 0, 0);//stare initiala canvas, evita suprapunere preview
        const forma = selectareForma.value;
        if (forma === 'elipsa') {
            desenareElipsa(x, y, e.offsetX, e.offsetY, true);
        } else if (forma === 'dreptunghi') {
            desenareDreptunghi(x, y, e.offsetX, e.offsetY, true);
        } else if (forma === 'linie') {
            desenareLinie(x, y, e.offsetX, e.offsetY, true);
        }
    }
}
}

//eliberare mouse
function handleMouseUp(e) {
    if (deseneaza) {
        if (selectareForma.value === "creion") {
            //salveazatraseul ca forma
            formeDesenate.push({
                tip: "creion",
                traseu: traseuCreion.slice(), //copie a traseului cu shallow copy slice
                culoare: colorInput.value,
                grosime: grosimeLinieIn.value,
            });
        }
        else {
        const forma = selectareForma.value;

        //creeaza obiect pentru forma desenata
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
        }
        //actualizare fundal si lista forme
        modificaFundal();
        actualizeazaListaForme();
        deseneaza = false; //finalizare mod de desenare
    
    }
}

//sterge continutul canvasului, reseteaza lista de frome, reseteaza fundalul si actualizeaza lista
function stergeCanvas() {
    context.clearRect(0, 0, desenCanvas.width, desenCanvas.height); 
    formeDesenate = []; 
    modificaFundal(); 
    actualizeazaListaForme(); 
}

//save png
function salveazaImagine(format = 'image/png', filename = 'imagine_desen.png') {
    //converteste continutul intr-un URL(uniform resource locator)
    const imagineGenerata = desenCanvas.toDataURL(format); 
    //element temporar pentru download
    const linkSalvare = document.createElement('a'); 
    
    linkSalvare.download = filename; 
    linkSalvare.href = imagineGenerata; 
    linkSalvare.click(); //simulare click pentru download
}


function exportaSVG(filename = 'imagine_desen.svg') {
    //initializeaza svg
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${desenCanvas.width}" height="${desenCanvas.height}">\n`;
    //dreptunghi care reprezinta canvasul cu fundalul sau
    svgContent += `<rect width="${desenCanvas.width}" height="${desenCanvas.height}" fill="${culoareFundal}" />\n`;

    //itereaza prin toate formele din array si pentru fiecare genereaza continut svg corespunzator
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

    svgContent += `</svg>`; //inchide svg

    //creeaza blob pentru a putea fi descarcat
    const blob = new Blob([svgContent], { type: 'image/svg+xml' }); // Create a Blob from SVG content
    //la fel ca la png creaza un element temporar pentru download
    const link = document.createElement('a'); 
    link.download = filename; 
    link.href = URL.createObjectURL(blob); 
    link.click(); 
}


//functie generala
function redeseneazaForma(forma) {
    if (forma.tip === 'elipsa') {
        desenareElipsa(forma.x1, forma.y1, forma.x2, forma.y2, forma.culoare, forma.grosime, false);
    } else if (forma.tip === 'dreptunghi') {
        desenareDreptunghi(forma.x1, forma.y1, forma.x2, forma.y2, forma.culoare, forma.grosime, false);
    } else if (forma.tip === 'linie') {
        desenareLinie(forma.x1, forma.y1, forma.x2, forma.y2, forma.culoare, forma.grosime, false);
    }else if (forma.tip === "creion") {
        //redeseneaza traseul creionului
        context.beginPath();
        context.moveTo(forma.traseu[0].x, forma.traseu[0].y);
        for (let i = 1; i < forma.traseu.length; i++) {
            context.lineTo(forma.traseu[i].x, forma.traseu[i].y);
        }
        context.strokeStyle = forma.culoare;
        context.lineWidth = forma.grosime;
        context.stroke();
    }
}

// elipsa
function desenareElipsa(x1, y1, x2, y2, culoare, grosime, Preview) {
   //calculeaza raza si pozitia centrului
    const razaX = Math.abs(x2 - x1) / 2;
    const razaY = Math.abs(y2 - y1) / 2;
    const centruX = (x1 + x2) / 2;
    const centruY = (y1 + y2) / 2;

    //incepe desenul si seteaza conturul si grosimea
    context.beginPath();
    context.ellipse(centruX, centruY, razaX, razaY, 0, 0, 2 * Math.PI);
    context.strokeStyle = culoare;
    context.lineWidth = grosime;

    //daca e preview arata doar preview, altfel umple conturul
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

//seteaza culoare fundal si umple canvasul cu acea culoare
function modificaFundal() {
    context.fillStyle = culoareFundal;
    context.fillRect(0, 0, desenCanvas.width, desenCanvas.height);

    //redeseneaza formele peste noul bg
    formeDesenate.forEach(
        redeseneazaForma);
}


function actualizeazaListaForme() {
    listaForme.innerHTML = ''; // golesc lista 

    
    formeDesenate.forEach((forma, index) => {   

        //ignor creionul pentru ca nu e forma geometrica
        if (forma.tip === "creion") {
            return;
        }
//creeaza un element in lista pt fiecare forma 
const item = document.createElement('li');
//textul care afiseaza tipul formei si coordonatele
item.textContent = `${forma.tip} (${forma.x1}, ${forma.y1}) - (${forma.x2}, ${forma.y2})`;

//creeaza buton pt stergerea formei
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
        
        //adauga butoanele sterge si editeaza si itemul in lista
        item.appendChild(btnSterge);
        item.appendChild(btnEditeaza);
        listaForme.appendChild(item);
    });
}

//coord pozitive numerice si in limitele canvasului
function valideazaCoordonate(coord, maxLimit) {
    return !isNaN(coord) && coord >= 0 && coord <= maxLimit;
}

//sterge forma din lista si redeseneaza canvasul
function stergeForma(index) {
    formeDesenate.splice(index, 1); //cate elemente sa sterg de la index
    modificaFundal();  
    actualizeazaListaForme(); 
}