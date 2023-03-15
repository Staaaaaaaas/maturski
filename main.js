const platno = document.getElementById("platno");
const kontekst = platno.getContext("2d");

const checkBoxMisere = document.getElementById("misereCheck");

const birac = document.getElementById("biracBoja");

const sliderDimenzija = document.getElementById("sliderDimenzija");
const dimenzijaIspis = document.getElementById("dimenzijaIspis");
const checkBoxCheat = document.getElementById("cheatCheck");




dimenzijaIspis.innerHTML = sliderDimenzija.value;


let misJeDole = false;

let sirina;
let visina;

let modCrtanja = false;

let dimenzijaTable = 10;

let tabla;
let figura;
let potez = false;

function podesi() {
    sirina = platno.width;
    visina = platno.height;

    potez = true;
    kontekst.textAlign = "center";
    tabla = new Tabla(sirina);
    figura = new Figura();
    if (tabla.pozicije[dimenzijaTable - 1][dimenzijaTable - 1]) {
        potez = false;
        figura.pomeriRacunar();
    }
    if (modCrtanja) {
        potez = false;
        tabla.matrica[dimenzijaTable - 1][dimenzijaTable - 1] = 0;
    }
    window.requestAnimationFrame(petlja);
}

function petlja() {
    kontekst.fillStyle = trenutnaBoja.bojaPozadine;
    kontekst.fillRect(0, 0, sirina, visina);
    tabla.crtaj();
    figura.crtaj();
    tabla.crtajPozicije();
    window.requestAnimationFrame(petlja);
}

function randRange(min, max) {
    let ret = Math.random() * (max - min) + min;
    return ret;
}

function map(val, old_min, old_max, new_min, new_max){
    return (new_max-new_min) * (val-old_min)/(old_max-old_min) + new_min;
}

function izmesajNiz(niz) {
    for (let i = niz.length - 1; i >= 0; i--) {
        let j = Math.floor(randRange(0, i + 1));
        [niz[i], niz[j]] = [niz[j], niz[i]];
    }
}


class Stil {
    constructor(pokret, pokretAI, cilj, zid, pozadina, figura) {
        this.bojaPokreta = pokret;
        this.bojaPokretaAI = pokretAI;
        this.bojaCilja = cilj;
        this.bojaZida = zid;
        this.bojaPozadine = pozadina;
        this.bojaFigure = figura;
    }
}

const boje = {
    "default": new Stil("#696969", "#000000", "#AAAAAA", "#000000", "#FFFFFF", "#000000"),
    "priroda": new Stil("#DDB892", "#CCD5AE", "#CCB092", "#CCD5AE", "#E9EDC9", "#D4A373"),
    "roze": new Stil("#A2D2FF", "#BDE0FE", "#CDB4DB", "#CDB4DB", "#FFC8DD", "#A2D2FF"),
    "funky": new Stil("#00BBF9", "#00BBF9", "#FEE440", "#9B5DE5", "#00F5D4", "#00BBF9"),
};

let trenutnaBoja = boje["default"];
document.body.style.backgroundColor = trenutnaBoja.bojaPozadine;

function tekst(rec, boja, velicina, x, y) {
    kontekst.fillStyle = boja;
    kontekst.font = velicina + "px roboto";
    kontekst.fillText(rec, x, y);
}

function krug(x, y, r, boja) {
    kontekst.beginPath();
    kontekst.fillStyle = boja;
    kontekst.arc(x, y, r, 0, Math.PI * 2);
    kontekst.fill();
}

class Tabla {
    constructor() {
        this.velicina = platno.width;
        this.polje = this.velicina / dimenzijaTable;
        this.matrica = Array(dimenzijaTable);
        this.pozicije = Array(dimenzijaTable);
        this.pozicijeVertikalno = Array(dimenzijaTable).fill(1 + checkBoxMisere.checked);
        this.pozicijeHorizontalno = Array(dimenzijaTable).fill(1 + checkBoxMisere.checked);
        this.pozicijeDijagonalno = Array(2 * dimenzijaTable).fill(1 + checkBoxMisere.checked);
        for (let i = 0; i < dimenzijaTable; i++) {
            this.matrica[i] = Array(dimenzijaTable).fill(1);
            this.pozicije[i] = Array(dimenzijaTable).fill(1);
        }
        if (modCrtanja) return;
        this.generisiTablu();
        this.izracunajPozicije();
    }
    generisiPutV1() {
        let put = [];
        for (let j = 0; j < 2 * (dimenzijaTable - 1); j++) {
            if (j < dimenzijaTable - 1) put.push(0);
            else put.push(1);
        }
        izmesajNiz(put);
        let x = 0, y = 0;
        this.matrica[x][y] = 0;
        for (let j = 0; j < 2 * (dimenzijaTable - 1); j++) {
            if (put[j] == 0) y++;
            else x++;
            this.matrica[x][y] = 0;
        }
    }
    generisiPutV2() {
        let matrica = this.matrica;
        function dfs(i, j, params = null) {
            matrica[i][j] = 0;
            if (i == dimenzijaTable - 1 && j == dimenzijaTable - 1) return;
            if (i == dimenzijaTable - 1) { dfs(i, j + 1); return; }
            if (j == dimenzijaTable - 1) { dfs(i + 1, j); return; }
            let [A, B, C, D, E, F, zameni] = params;
            let x = map(j, 0, (dimenzijaTable-1), 3, 8);

            if (zameni){
                x = map(i, 0, (dimenzijaTable-1), 0, 3);
            }
            let izvod = A * (Math.sin(x * B)+1)+ C*(Math.sin(Math.PI * x*D) + 1) +E*(Math.sin(Math.E*x*F)+1);
            let verovGore = 1 / (1 + izvod);
            let verovDole = izvod / (1 + izvod);
            if(zameni){
                [verovDole, verovGore] = [verovGore, verovDole];    
            }
            let biram = Math.random();
            if (biram < verovDole) {
                dfs(i + 1, j, params);
            }
            else dfs(i, j + 1, params);
        }
        let params = [randRange(0,2), randRange(-5,5), randRange(0,2), randRange(-5,5),randRange(0,2),randRange(-5,5), randRange(0,1)<0.5];
        dfs(0, 0, params);
    }
    generisiTablu() {
        let brojPuteva = 30;//Math.floor(3 * Math.log(dimenzijaTable));
        for (let i = 0; i < brojPuteva; i++) {
            //this.generisiPutV1();
            this.generisiPutV2();
        }
    }
    izracunajPozicije() {
        for (let i = 0; i < dimenzijaTable; i++) for (let j = 0; j < dimenzijaTable; j++) {
            if (this.matrica[i][j] == 1) {
                this.pozicijeVertikalno[i] = 1 + checkBoxMisere.checked;
                this.pozicijeHorizontalno[j] = 1 + checkBoxMisere.checked;
                this.pozicijeDijagonalno[i - j + dimenzijaTable] = 1 + checkBoxMisere.checked;

            }
            else {
                this.pozicije[i][j] = 1 - Math.min(this.pozicijeVertikalno[i], this.pozicijeHorizontalno[j], this.pozicijeDijagonalno[i - j + dimenzijaTable]);
                this.pozicijeVertikalno[i] = Math.min(this.pozicijeVertikalno[i], 1);
                this.pozicijeHorizontalno[j] = Math.min(this.pozicijeHorizontalno[j], 1);
                this.pozicijeDijagonalno[i - j + dimenzijaTable] = Math.min(this.pozicijeDijagonalno[i - j + dimenzijaTable], 1);
                if (this.pozicije[i][j] == -1) {
                    this.pozicije[i][j] = 1;
                    this.pozicijeVertikalno[i] = 1;
                    this.pozicijeHorizontalno[j] = 1;
                    this.pozicijeDijagonalno[i - j + dimenzijaTable] = 1;
                }
                else {
                    this.pozicijeVertikalno[i] &= this.pozicije[i][j];
                    this.pozicijeHorizontalno[j] &= this.pozicije[i][j];
                    this.pozicijeDijagonalno[i - j + dimenzijaTable] &= this.pozicije[i][j];

                }
            }
        }
    }
    crtaj() {
        kontekst.strokeStyle = trenutnaBoja.bojaZida;
        kontekst.fillStyle = trenutnaBoja.bojaZida;
        for (let i = 0; i < dimenzijaTable; i++) {
            for (let j = 0; j < dimenzijaTable; j++) {
                if (this.matrica[i][j]) {
                    kontekst.fillRect(j * this.polje, i * this.polje, this.polje, this.polje);
                }

                if(checkBoxCheat.checked && this.pozicije[i][j]==0){
                    kontekst.fillStyle = trenutnaBoja.bojaCilja;
                    kontekst.fillRect(j * this.polje, i * this.polje, this.polje, this.polje);
                    kontekst.fillStyle = trenutnaBoja.bojaZida;
                }
                kontekst.strokeRect(j * this.polje, i * this.polje, this.polje, this.polje);

            }
        }
    }
    crtajPozicije() {
        if (!checkBoxCheat.checked) return;
        kontekst.translate(this.polje * 0.5, this.polje * 0.65);
        for (let i = 0; i < dimenzijaTable; i++) {
            for (let j = 0; j < dimenzijaTable; j++)if (this.pozicije[i][j] >= -1) {
                if (this.matrica[i][j]) continue;
                tekst(this.pozicije[i][j], "grey", this.polje * 0.5, this.polje * j, this.polje * i);
            }
        }
        kontekst.translate(-this.polje * 0.5, -this.polje * 0.65);

    }
    popuniCelu(){
        for(let i = 0; i < dimenzijaTable; i++)for(let j=0;j<dimenzijaTable;j++){
            this.matrica[i][j]=0;
        }
    }
}

class Figura {
    constructor() {
        this.i = dimenzijaTable - 1;
        this.j = dimenzijaTable - 1;
        this.dozvoljeno = [];
        for (let i = 0; i < dimenzijaTable; i++) {
            let novaDuzina = this.dozvoljeno.push([]);
            for (let j = 0; j < dimenzijaTable; j++) {
                this.dozvoljeno[novaDuzina - 1].push(false);
            }
        }
    }
    pomeri(i, j) {
        if (!potez) return;
        if (!this.dozvoljeno[i][j]) return;
        if (i >= this.i && j >= this.j || i > this.i || j > this.j) return;
        [this.i, this.j] = [i, j];
        potez = 0;
        this.pomeriRacunar();
    }
    pomeriRacunar() {
        if (modCrtanja) return;
        if (this.i == 0 && this.j == 0) return;
        let moguciPokreti = [];
        for (let i = this.i - 1; i >= 0; i--) {
            if (tabla.matrica[i][this.j] == 1) break;
            if (tabla.pozicije[i][this.j] == 0) moguciPokreti.push([i, this.j]);
        }
        for (let j = this.j - 1; j >= 0; j--) {
            if (tabla.matrica[this.i][j] == 1) break;
            if (tabla.pozicije[this.i][j] == 0) moguciPokreti.push([this.i, j]);
        }
        for (let i = this.i - 1, j = this.j - 1; i >= 0 && j >= 0; i--, j--) {
            if (tabla.matrica[i][j] == 1) break;
            if (tabla.pozicije[i][j] == 0) moguciPokreti.push([i, j]);
        }

        setTimeout(() => {
            [this.i, this.j] = moguciPokreti[Math.floor(randRange(0, moguciPokreti.length))];
            potez = true;
        }, 1000);

    }
    crtaj() {
        let centarX = tabla.polje * this.j + tabla.polje / 2;
        let centarY = tabla.polje * this.i + tabla.polje / 2;
        krug(centarX, centarY, tabla.polje / 2 * 0.9, trenutnaBoja.bojaFigure);
        for (let i = this.i - 1; i >= 0; i--) {
            if (tabla.matrica[i][this.j] == 1) break;
            this.dozvoljeno[i][this.j] = 1;
            let centarY1 = tabla.polje * i + tabla.polje / 2;
            let bojaKruga = (tabla.pozicije[i][this.j] == 0) ? trenutnaBoja.bojaCilja : trenutnaBoja.bojaPokreta;
            krug(centarX, centarY1, tabla.polje / 2 * 0.5, bojaKruga);
        }
        for (let j = this.j - 1; j >= 0; j--) {
            if (tabla.matrica[this.i][j] == 1) break;
            this.dozvoljeno[this.i][j] = 1;
            let centarX1 = tabla.polje * j + tabla.polje / 2;
            let bojaKruga = (tabla.pozicije[this.i][j] == 0) ? trenutnaBoja.bojaCilja : trenutnaBoja.bojaPokreta;
            krug(centarX1, centarY, tabla.polje / 2 * 0.5, bojaKruga);
        }
        for (let i = this.i - 1, j = this.j - 1; i >= 0 && j >= 0; i--, j--) {
            if (tabla.matrica[i][j] == 1) break;
            this.dozvoljeno[i][j] = 1;
            let centarY1 = tabla.polje * i + tabla.polje / 2;
            let centarX1 = tabla.polje * j + tabla.polje / 2;
            let bojaKruga = (tabla.pozicije[i][j] == 0) ? trenutnaBoja.bojaCilja : trenutnaBoja.bojaPokreta;
            krug(centarX1, centarY1, tabla.polje / 2 * 0.5, bojaKruga);
        }
    }
}

function popuniCelu(){
    tabla.popuniCelu();
}

function crtaj() {

    document.querySelectorAll(".ne-crtam").forEach(elem => {
        elem.style.display = "none";
    });
    document.querySelectorAll(".crtam").forEach(elem => {
        elem.style.display = "inline";
    });
    modCrtanja = true;
    podesi();

}
function neCrtaj() {
    document.querySelectorAll(".crtam").forEach(elem => {
        elem.style.display = "none";
    });
    document.querySelectorAll(".ne-crtam").forEach(elem => {
        elem.style.display = "inline";
    });
    modCrtanja = false;
    tabla.izracunajPozicije();
    potez = true;
    if (tabla.pozicije[dimenzijaTable - 1][dimenzijaTable - 1]) {
        potez = false;
        figura.pomeriRacunar();
    }
}

birac.onchange = function () {
    trenutnaBoja = boje[this.value];
    document.body.style.backgroundColor = trenutnaBoja.bojaPozadine;
}

checkBoxMisere.onclick = function () {
    podesi();
}

sliderDimenzija.oninput = function () {
    dimenzijaTable = Number(this.value);
    podesi();
    dimenzijaIspis.innerHTML = this.value;
}

function pozicijaMisa(desavanje) {
    const rect = platno.getBoundingClientRect();
    let x, y;
    x = desavanje.clientX - rect.left;
    y = desavanje.clientY - rect.top;
    return [x, y];
}

platno.addEventListener("click", function (event) {

    [x, y] = pozicijaMisa(event);
    let i = Math.floor(y / tabla.polje);
    let j = Math.floor(x / tabla.polje);
    if (!modCrtanja) figura.pomeri(i, j);


});

platno.addEventListener("mousedown", function (event) {
    misJeDole = true;
});

platno.addEventListener("mouseup", function (event) {
    misJeDole = false;
});


platno.addEventListener("mousemove", function (event) {
    if (!modCrtanja || !misJeDole) return;
    [x, y] = pozicijaMisa(event);
    let i = Math.floor(y / tabla.polje);
    let j = Math.floor(x / tabla.polje);

    tabla.matrica[i][j] = 0;

});