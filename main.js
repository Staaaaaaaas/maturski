const platno = document.getElementById("platno");
const kontekst = platno.getContext("2d");
const fps = 60;
const birac = document.getElementById("biracBoja");
const menjac = document.getElementById("menjacModa");
const checkBox = document.getElementById("grandiCheck");
const checkBoxMisere = document.getElementById("misereCheck");
const labelaMisere = document.getElementById("labelaMisere");
const restartDugme = document.getElementById("restartDugme");
const menjacCrtanja = document.getElementById("menjacCrtanja");
const labelaGrandi = document.getElementById("labelaGrandi");
let pvp = 1;
let modCrtanja = false;
let crtam = false;
const dimenzijaTable = 15;
let misere = 0;

function promeniDimenzije(novaDimenzija){
	dimenzijaTable=novaDimenzija;
	podesi();
}
class Tema{
	constructor(pokret, pokretAI, cilj, zid, pozadina, igrac){
		this.bojaPokreta = pokret;
		this.bojaPokretaAI = pokretAI;
		this.bojaCilja = cilj;
		this.bojaZida = zid;
		this.bojaPozadine = pozadina;
		this.bojaIgraca = igrac;
	}
}
const modovi = ["Protiv racunara", "1v1"];
const boje = {
	"default": new Tema("#696969", "black","#aaaaaa","black","#ffffff", "black"),
	"priroda": new Tema("#DDB892", "#CCD5AE", "#CCB092", "#CCD5AE", "#E9EDC9","#D4A373"),
	"roze": new Tema( "#A2D2FF","#BDE0FE", "#CDB4DB", "#CDB4DB", "#FFC8DD","#A2D2FF"),
	"funky": new Tema( "#00BBF9","#00BBF9", "#FEE440", "#9B5DE5", "#00F5D4","#00BBF9"),
};
let temaIgre = boje["default"];
document.body.style.backgroundColor = temaIgre.bojaPozadine;

function promeniTemu(_novaTema){
	temaIgre = boje[_novaTema];
	document.body.style.backgroundColor = temaIgre.bojaPozadine;
}

function promeniMod(){
	menjac.innerText = modovi[pvp];
	pvp = 1-pvp;
	podesi();
}
function promeniModCrtanja(){
	modCrtanja = 1-modCrtanja;
	if(modCrtanja){
		podesi();
		menjac.style.display = "none";
		checkBox.style.display = "none";
		checkBoxMisere.style.display = "none";
		restartDugme.style.display = "none";
		labelaGrandi.style.display = "none";
		labelaMisere.style.display = "none";
		menjacCrtanja.innerText = "GOTOVO";
	}
	else{
		menjac.style.display = "";
		checkBox.style.display = "";
		checkBoxMisere.style.display = "";
		restartDugme.style.display = "";
		labelaGrandi.style.display = "";
		labelaMisere.style.display = "";
		menjacCrtanja.innerText = "CRTAJ";
		crtam=false;
		igrc = new Igrac(tabl);
		if(!pvp)igrc.potez=0
		igrc.izracunajGrandi();

	}
}
function pozicijaMisa(_desavanje) {
    const rect = platno.getBoundingClientRect()
    const x = _desavanje.clientX - rect.left
    const y = _desavanje.clientY - rect.top
    return [x,y];
}

function spavaj(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

function krug(x, y, r, boja){
	kontekst.beginPath();
	kontekst.fillStyle = boja;
	kontekst.arc(x, y, r, 0, Math.PI * 2);
	kontekst.fill();
}

function tekst(rec, boja, velicina, x, y){
	kontekst.textAlign = "center";
	kontekst.font = velicina+"px roboto";
	kontekst.fillStyle = boja;
	kontekst.fillText(rec, x, y);
}

class Tabla{
	constructor(dimenzija, velicina){
		this.dimenzija = dimenzija;
		this.velicina = velicina;
		this.strana = this.velicina/this.dimenzija;
		this.matrica = [];
		for(let i = 0; i<this.dimenzija; i++){
			let novaDuzina = this.matrica.push([]);
			for(let j = 0; j<this.dimenzija; j++){
				this.matrica[novaDuzina-1].push(0);	
			}
		}
		// if(modCrtanja){
		// 	this.matrica[this.tabl.dimenzija-1][this.tabl.dimenzija-1]=1;
		// }
	}
	obojiPolje(x, y){
		let kolona = Math.floor(x/this.strana);
		let vrsta = Math.floor(y/this.strana);
		this.matrica[vrsta][kolona] = 1;
	}
	crtaj(){
		kontekst.strokeStyle = temaIgre.bojaZida;
		kontekst.fillStyle = temaIgre.bojaZida;
		//kontekst.lineWidth = 2.5;
		for(let i=0;i<this.dimenzija;i++){
			for(let j = 0;j<this.dimenzija;j++){
				if(!this.matrica[i][j]){
					kontekst.fillRect(j*this.strana, i*this.strana, this.strana, this.strana);
				}
				kontekst.strokeRect(j*this.strana, i*this.strana, this.strana, this.strana);
				
			}
		}
	}
	dfs(vrsta, kolona, coef, offset){
		if(vrsta > this.dimenzija-1 || kolona > this.dimenzija-1){
			return;
		}
		this.matrica[vrsta][kolona]=1;
		if(kolona==this.dimenzija-1){
			this.dfs(vrsta+1, kolona, coef, offset);
			return;
		}
		if(vrsta==this.dimenzija-1){
			this.dfs(vrsta, kolona+1, coef, offset);
			return;
		}
		let x = vrsta+kolona+offset;
		let verovY = coef*(2*Math.cos(2*x) + Math.PI*Math.cos(Math.PI*x));
		let verovX = 1/(1+verovY);
		verovY *= verovX;
		let rezultat = Math.random();
		if(rezultat >= verovX){
			
			this.dfs(vrsta+1, kolona, coef, offset);
		}
		else{
			this.dfs(vrsta, kolona+1,coef, offset);
		}
		
	}
	generisiPut(){
		let brojPuteva = Math.floor(this.dimenzija/2)+	Math.floor(Math.random()*this.dimenzija/2);
		for(let i=0;i<brojPuteva;i++){
			this.dfs(0,0, Math.random(), Math.random()*1000);
		}
	}
	
}

class Igrac{
	nadjiNajdalje(){
		for(let i = this.x; i>=0; i--){
			if(this.tbl.matrica[this.y][i]==0)break;
			this.najdaljiX = i;
		}
		for(let i = this.y; i>=0; i--){
			if(this.tbl.matrica[i][this.x]==0)break;
			this.najdaljiY = i;
		}
		for(let i = this.y, j = this.x; i>=0 && j>=0; i--, j--){
			if(this.tbl.matrica[i][j]==0)break;
			this.najdaljiDiag = i;
		}
	}
	constructor(tbl){
		this.prikaziGrandi = checkBox.checked;
		this.potez = 1;
		this.tbl = tbl;
		this.x = tbl.dimenzija-1;
		this.y = tbl.dimenzija-1;
		this.najdaljiX=this.x;
		this.najdaljiY=this.y;
		this.najdaljiDiag=this.y;
		this.nadjiNajdalje();
		this.grandi = [];
		for(let i = 0; i<this.tbl.dimenzija; i++){
			let novaDuzina = this.grandi.push([]);
			for(let j=0; j<this.tbl.dimenzija; j++){
				this.grandi[novaDuzina-1].push(0);
			}
		}
	}
	crtaj(){
		//crtam grandi
		
		let centarX = this.tbl.strana * this.x + this.tbl.strana/2;
		let centarY = this.tbl.strana * this.y + this.tbl.strana/2;
		krug(centarX, centarY, this.tbl.strana/2 * 0.9, temaIgre.bojaIgraca);
		let bojaPoteza = temaIgre.bojaPokreta;
		if(!this.potez)bojaPoteza = temaIgre.bojaPokretaAI;
		
		for(let i = this.x-1; i>=this.najdaljiX; i--){
			let boja = bojaPoteza;
			if(pvp == 0 && this.grandi[this.y][i]==0)boja = temaIgre.bojaCilja;
			let cntr = this.tbl.strana * i + this.tbl.strana/2;
			krug(cntr, centarY, this.tbl.strana/4, boja);
		}
		for(let i = this.y-1; i>=this.najdaljiY; i--){
			let boja = bojaPoteza;
			if(pvp==0 && this.grandi[i][this.x]==0)boja = temaIgre.bojaCilja;
			let cntr = this.tbl.strana * i + this.tbl.strana/2;
			krug(centarX, cntr, this.tbl.strana/4, boja);
		}
		for(let i = this.y-1, j = this.x-1; i>=this.najdaljiDiag; i--,j--){
			//console.log(i,j);
			let boja = bojaPoteza;
			if(pvp==0 && this.grandi[i][j]==0)boja = temaIgre.bojaCilja;
			let cntr = this.tbl.strana * i + this.tbl.strana/2;
			let cntr2 = this.tbl.strana * j + this.tbl.strana/2;
			krug(cntr2, cntr, this.tbl.strana/4, boja);
			
		}
		if(this.prikaziGrandi){
			kontekst.translate(this.tbl.strana*0.5, this.tbl.strana*0.65);
			for(let i = 0; i<this.tbl.dimenzija; i++){
				for(let j=0; j<this.tbl.dimenzija; j++)if(this.grandi[i][j]>=0){
					tekst(this.grandi[i][j],"grey",this.tbl.strana*0.5,this.tbl.strana*j, this.tbl.strana*i);
				}
			}
			kontekst.translate(-this.tbl.strana*0.5, -this.tbl.strana*0.65);
		}
	}
	pomeriAI(){
		if((this.x==0 || this.tbl.matrica[this.y][this.x-1]==0) && (this.y==0 || this.tbl.matrica[this.y-1][this.x]==0))return;
		let noviX = -1;
		let noviY = -1;
		let noviDiag = [-1,-1];
		for(let i = this.x; i>=0; i--){
			if(this.grandi[this.y][i]==-1)break;
			if(this.grandi[this.y][i]==0){
				noviX = i;
				break;
			}
		}
		for(let i = this.y; i>=0; i--){
			if(this.grandi[i][this.x]==-1)break;
			if(this.grandi[i][this.x]==0){
				//console.log('a');
				noviY=i;
				break;
			}
		}
		for(let i = this.y, j =this.x; i>=0 && j>=0; i--, j--){
			if(this.grandi[i][j]==-1)break;
			if(this.grandi[i][j]==0){
				noviDiag=[i,j];
				break;
			}
		}
		//let izbor = Math.floor(Math.random()*3);
		if(noviX!=-1){
			this.x=noviX;
		}
		else if(noviY!=-1){
			this.y=noviY;
		}
		else{
			[this.y, this.x] = noviDiag;
		}
		this.nadjiNajdalje();
		this.potez=1;
	}
 	pomeri(klikX, klikY){
		if(!this.potez)return;
		let noviX = Math.floor(klikX/this.tbl.strana);
		let noviY = Math.floor(klikY/this.tbl.strana);
		if(noviX==this.x && noviY==this.y)return;
		//console.log(klikX);
		if(noviX!=this.x && noviY!=this.y && noviY-noviX!=this.y-this.x)return;
		if(noviY==this.y && noviX<this.najdaljiX || noviX==this.x && noviY<this.najdaljiY || noviY-noviX==this.y-this.x && noviY<this.najdaljiDiag)return;
		if(noviY==this.y && noviX>this.x || noviX==this.x && noviY>this.y || noviY-noviX==this.y-this.x && noviY>this.y)return;
		this.x=noviX;
		this.y=noviY;
		this.nadjiNajdalje();
		if(pvp==0){
			this.potez = 0;
			spavaj(1000).then(() => {
				this.pomeriAI();
			});
		}
		
		
	}
	
	izracunajGrandi(){
		let kolona = Array(this.tbl.dimenzija);
		let diag = Array(2*this.tbl.dimenzija);
		let vrsta = 0;

		if(misere){
			for(let i =0;i<this.tbl.dimenzija;i++){
				for(let j =0;j<this.tbl.dimenzija;j++){
					if((i==0 || this.tbl.matrica[i-1][j]==0)&& (j==0 || this.tbl.matrica[i][j-1]==0 )){
						this.grandi[i][j]=1;
					}
				}
			}
		}
		
		for(let i=0;i<this.tbl.dimenzija;i++){
			
			vrsta=0;
			for(let j=0;j<this.tbl.dimenzija;j++){
				if(this.tbl.matrica[i][j]==0){
					vrsta = 0;
					kolona[j]=0;
					diag[i-j+this.tbl.dimenzija]=0;
					this.grandi[i][j]=-1;
					continue;
				}
				let mex = nadjiNajdesnijuNulu(vrsta | kolona[j] | diag[i-j+this.tbl.dimenzija]);
				if(this.grandi[i][j])mex=this.grandi[i][j];
				vrsta|=(1<<mex);
				kolona[j]|=(1<<mex);
				diag[i-j+this.tbl.dimenzija]|=(1<<mex);
				this.grandi[i][j]=mex;
			}
		}
		if(pvp)return;
		if(this.grandi[this.tbl.dimenzija-1][this.tbl.dimenzija-1]){
			spavaj(1000).then(() => {
				this.pomeriAI();
			});
		}
		else this.potez = 1;
	}
}
let tabl;
let igrc;

birac.addEventListener("change", function(event){
	//console.log(event);
	promeniTemu(birac.options[birac.selectedIndex].value);
	//console.log(birac.options[birac.selectedIndex].value);
});


platno.addEventListener("click", function(event){
	if(modCrtanja)return;
	[x, y] = pozicijaMisa(event);
	igrc.pomeri(x,y);
});
platno.addEventListener("mousedown", function(event){
	if(!modCrtanja)return;
	crtam = 1;
});
platno.addEventListener("mouseup", function(event){
	if(!modCrtanja)return;
	crtam = 0;
});
platno.addEventListener("mousemove", function(event){
	if(!crtam)return;
	[x, y] = pozicijaMisa(event);
	tabl.obojiPolje(x,y);
});

checkBox.addEventListener("click", function(event){
	igrc.prikaziGrandi = !igrc.prikaziGrandi;
});
checkBoxMisere.addEventListener("click", function(event){
	misere=1-misere;
	podesi();	
});

function podesi(){
	kontekst.fillStyle = temaIgre.bojaPozadine;
	kontekst.fillRect(0,0,500,500);
	tabl = new Tabla(dimenzijaTable, 500);
	tabl.matrica[tabl.dimenzija-1][tabl.dimenzija-1]=1;
	if(!modCrtanja){
		tabl.generisiPut();
		igrc = new Igrac(tabl);
		if(!pvp)igrc.potez=0
		igrc.izracunajGrandi();
	}
	
	window.requestAnimationFrame(petlja);
}



function petlja(){
	kontekst.fillStyle = temaIgre.bojaPozadine;
	kontekst.fillRect(0,0,500,500);
	tabl.crtaj();
	if(!modCrtanja)igrc.crtaj();
	window.requestAnimationFrame(petlja);
}


