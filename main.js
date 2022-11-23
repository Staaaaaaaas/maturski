const platno = document.getElementById("platno");
const kontekst = platno.getContext("2d");

const checkBoxMisere = document.getElementById("misereCheck");

const birac = document.getElementById("biracBoja");

const sliderDimenzija = document.getElementById("sliderDimenzija");
const dimenzijaIspis = document.getElementById("dimenzijaIspis");
const checkBoxGrandi = document.getElementById("grandiCheck");
dimenzijaIspis.innerHTML = sliderDimenzija.value;


const sirina = platno.width;
let dimenzijaTable = 10;

let tabla;
let figura;
let potez;

function podesi(){
    potez = true;
    kontekst.textAlign = "center";
    tabla = new Tabla(sirina);
    figura = new Figura();
    tabla.podesi();
    if(tabla.grandi[dimenzijaTable-1][dimenzijaTable-1]){
        potez = false;
        figura.pomeriRacunar();
    }
    window.requestAnimationFrame(petlja);
}

function petlja(){
    kontekst.fillStyle = trenutnaBoja.bojaPozadine;
    kontekst.fillRect(0,0,500,500);
    tabla.crtaj();
    figura.crtaj();
    tabla.crtajGrandi();
    window.requestAnimationFrame(petlja);
}


function nadjiNajdesnijuNulu(broj){
	broj = ~broj;
	let stepen = (broj&~(broj-1));
	let odgovor = 0;
	while(stepen!=1){
		stepen>>=1;
		odgovor++;
	}
	return odgovor;
}

function randRange(min, max){
	let ret = Math.random()*(max-min)+min;
	return ret;
}

function izmesajNiz(niz){
    for(let i=niz.length-1;i>=0;i--){
        let j = Math.floor(randRange(0,i+1));
        [niz[i], niz[j]] = [niz[j], niz[i]];
    }
}


class Tema{
	constructor(pokret, pokretAI, cilj, zid, pozadina, figura){
		this.bojaPokreta = pokret;
		this.bojaPokretaAI = pokretAI;
		this.bojaCilja = cilj;
		this.bojaZida = zid;
		this.bojaPozadine = pozadina;
		this.bojaFigure = figura;
	}
}

const boje = {
	"default": new Tema("#696969", "#000000","#AAAAAA","#000000","#FFFFFF", "#000000"),
	"priroda": new Tema("#DDB892", "#CCD5AE", "#CCB092", "#CCD5AE", "#E9EDC9","#D4A373"),
	"roze": new Tema( "#A2D2FF","#BDE0FE", "#CDB4DB", "#CDB4DB", "#FFC8DD","#A2D2FF"),
	"funky": new Tema( "#00BBF9","#00BBF9", "#FEE440", "#9B5DE5", "#00F5D4","#00BBF9"),
};

let trenutnaBoja = boje["default"];
document.body.style.backgroundColor = trenutnaBoja.bojaPozadine;

function tekst(rec, boja, velicina, x, y){
	kontekst.fillStyle = boja;
    kontekst.font = velicina+"px roboto";
	kontekst.fillText(rec, x, y);
}

function krug(x, y, r, boja){
	kontekst.beginPath();
	kontekst.fillStyle = boja;
	kontekst.arc(x, y, r, 0, Math.PI * 2);
	kontekst.fill();
}

class Tabla{
    constructor(velicinaUPixelima){
        this.velicina = velicinaUPixelima;
        this.strana = this.velicina/dimenzijaTable;
        this.matrica = [];
        this.grandi = [];
        for(let i = 0; i<dimenzijaTable; i++){
			let novaDuzina = this.matrica.push([]);
            this.grandi.push([]);
			for(let j = 0; j<dimenzijaTable; j++){
				this.matrica[novaDuzina-1].push(1);	
                this.grandi[novaDuzina-1].push(0);
			}
		}
    }
    generisiPutV1(){
        let put = [];
        for(let j=0;j<2*(dimenzijaTable-1);j++){
            if(j<dimenzijaTable-1)put.push(0);
            else put.push(1);
        }
        izmesajNiz(put);
        let x = 0, y = 0;
        this.matrica[x][y] = 0;
        for(let j=0;j<2*(dimenzijaTable-1);j++){
            if(put[j] == 0) y++;
            else x++;
            this.matrica[x][y] = 0;
        }
    }
    generisiPutV2(){
        let matrica = this.matrica;
        function dfs(i,j,params=null){
            matrica[i][j]=0;
            if(i==dimenzijaTable-1 && j==dimenzijaTable-1)return;
            if(i==dimenzijaTable-1){dfs(i,j+1);return;}
            if(j==dimenzijaTable-1){dfs(i+1,j);return;}
            let [a,b,c,zameni] = params;
            let x = i+j+a;
            let verovDole = b*(Math.sin(2*x/c)+Math.sin(Math.PI*x)+2);
            let verovGore = 1/(1+verovDole);
            verovDole *= verovGore;
            if(zameni==1)[verovDole, verovGore] = [verovGore, verovDole] ;
            let biram = Math.random();
            if(biram <= verovDole){
                dfs(i+1,j,params);
            }
            else dfs(i,j+1,params);
        }
        dfs(0,0,[randRange(-100,100), randRange(0.1,2), randRange(1,5), Math.floor(randRange(0,2))]);
    }
    generisiTablu(){
        let brojPuteva =5//Math.floor(dimenzijaTable * randRange(0.5, 1));
        for(let i=0;i<brojPuteva;i++){
            //this.generisiPutV1();
            this.generisiPutV2();
        }
    }
    izracunajGrandi(){
        let kolona = [];
        let dijag = [];
        let vrsta = 0;
        if(checkBoxMisere.checked)this.grandi[0][0]=1;
        for(let i=0;i<dimenzijaTable;i++){
            vrsta = 0;
            for(let j=0;j<dimenzijaTable;j++){
                if(this.matrica[i][j]==1){
                    vrsta = 0;
                    kolona[j]=0;
                    dijag[i-j+dimenzijaTable]=0;
                    this.grandi[i][j]=-1;
                    continue;
                }
                let mex = nadjiNajdesnijuNulu(vrsta | kolona[j] | dijag[i-j+dimenzijaTable]);
                if(this.grandi[i][j]) mex = this.grandi[i][j];
                vrsta|=(1<<mex);
				kolona[j]|=(1<<mex);
				dijag[i-j+dimenzijaTable]|=(1<<mex);
                this.grandi[i][j]=mex;
            }
        }
    }
    podesi(){
        this.generisiTablu();
        this.izracunajGrandi();
        
    }
    crtaj(){
        kontekst.strokeStyle = trenutnaBoja.bojaZida;
        kontekst.fillStyle = trenutnaBoja.bojaZida;
        for(let i=0;i<dimenzijaTable;i++){
			for(let j=0;j<dimenzijaTable;j++){
				if(this.matrica[i][j]){
					kontekst.fillRect(j*this.strana, i*this.strana, this.strana, this.strana);
				}
				kontekst.strokeRect(j*this.strana, i*this.strana, this.strana, this.strana);
				
			}
		}
    }
    crtajGrandi(){
        if(!checkBoxGrandi.checked)return;
        kontekst.translate(this.strana*0.5, this.strana*0.65);
        for(let i = 0; i<dimenzijaTable; i++){
            for(let j=0; j<dimenzijaTable; j++)if(this.grandi[i][j]>=-1){
                tekst(this.grandi[i][j],"grey",this.strana*0.5,this.strana*j, this.strana*i);
            }
        }
        kontekst.translate(-this.strana*0.5, -this.strana*0.65);
    
    }
}

class Figura{
    constructor(){
        this.i = dimenzijaTable-1;
        this.j = dimenzijaTable-1;
        this.dozvoljeno = [];
        for(let i = 0; i<dimenzijaTable; i++){
			let novaDuzina = this.dozvoljeno.push([]);
			for(let j = 0; j<dimenzijaTable; j++){
				this.dozvoljeno[novaDuzina-1].push(false);
			}
		}
    }
    pomeri(i, j){
        if(!potez)return;
        if(!this.dozvoljeno[i][j])return;
        if(i>=this.i && j >= this.j || i>this.i || j>this.j)return;
        [this.i, this.j]=[i, j];
        potez = 0;
        this.pomeriRacunar();
    }
    pomeriRacunar(){
        if(this.i==0 && this.j==0)return;
        let moguciPokreti = [];
        for(let i=this.i-1;i>=0;i--){
            if(tabla.matrica[i][this.j]==1)break;
            if(tabla.grandi[i][this.j]==0)moguciPokreti.push([i,this.j]);
        }
        for(let j=this.j-1;j>=0;j--){
            if(tabla.matrica[this.i][j]==1)break;
            if(tabla.grandi[this.i][j]==0)moguciPokreti.push([this.i,j]);
        }
        for(let i=this.i-1, j=this.j-1;i>=0 && j>=0;i--, j--){
            if(tabla.matrica[i][j]==1)break;
            if(tabla.grandi[i][j]==0)moguciPokreti.push([i,j]);
        }
        
        setTimeout(()=>{
            [this.i, this.j] = moguciPokreti[Math.floor(randRange(0,moguciPokreti.length))];
        potez = true;
        }, 1000);
        
    }
    crtaj(){
        let centarX = tabla.strana * this.j + tabla.strana/2;
		let centarY = tabla.strana * this.i + tabla.strana/2;
        krug(centarX, centarY, tabla.strana/2 * 0.9, trenutnaBoja.bojaFigure);
        for(let i=this.i-1;i>=0;i--){
            if(tabla.matrica[i][this.j]==1)break;
            this.dozvoljeno[i][this.j]=1;
            let centarY1 = tabla.strana * i + tabla.strana/2;
            let bojaKruga = (tabla.grandi[i][this.j]==0) ? trenutnaBoja.bojaCilja : trenutnaBoja.bojaPokreta;
            krug(centarX, centarY1, tabla.strana/2 * 0.5, bojaKruga);
        }
        for(let j=this.j-1;j>=0;j--){
            if(tabla.matrica[this.i][j]==1)break;
            this.dozvoljeno[this.i][j]=1;
            let centarX1 = tabla.strana * j + tabla.strana/2;
            let bojaKruga = (tabla.grandi[this.i][j]==0) ? trenutnaBoja.bojaCilja : trenutnaBoja.bojaPokreta;
            krug(centarX1, centarY, tabla.strana/2 * 0.5, bojaKruga);
        }
        for(let i=this.i-1, j=this.j-1;i>=0 && j>=0;i--, j--){
            if(tabla.matrica[i][j]==1)break;
            this.dozvoljeno[i][j]=1;
            let centarY1 = tabla.strana * i + tabla.strana/2;
            let centarX1 = tabla.strana * j + tabla.strana/2;
            let bojaKruga = (tabla.grandi[i][j]==0) ? trenutnaBoja.bojaCilja : trenutnaBoja.bojaPokreta;
            krug(centarX1, centarY1, tabla.strana/2 * 0.5, bojaKruga);
        }
    }
}

birac.onchange = function(){
    trenutnaBoja = boje[this.value];
    document.body.style.backgroundColor = trenutnaBoja.bojaPozadine;
}

checkBoxMisere.onclick = function(){
    podesi();
}

sliderDimenzija.oninput = function(){
    dimenzijaTable = this.value;
    podesi();
    dimenzijaIspis.innerHTML = this.value;
}

function pozicijaMisa(desavanje) {
    const rect = platno.getBoundingClientRect();
	let x, y;
    x = desavanje.clientX - rect.left;
    y = desavanje.clientY - rect.top;
    return [x,y];
}

platno.addEventListener("click", function(event){
	[x, y] = pozicijaMisa(event);
    let i = Math.floor(y/tabla.strana);
    let j = Math.floor(x/tabla.strana);
	figura.pomeri(i,j);
});
