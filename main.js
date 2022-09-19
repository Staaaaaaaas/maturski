const platno = document.getElementById("platno");
const kontekst = platno.getContext("2d");
const fps = 60;



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

const boje = {
	"default": new Tema("#DDB892", "#CCD5AE", "red", "#CCD5AE", "#E9EDC9","#D4A373"),
	"roze": new Tema( "#A2D2FF","#BDE0FE", "#CDB4DB", "#CDB4DB", "#FFC8DD","#A2D2FF"),
	"funky": new Tema( "#00BBF9","#00BBF9", "#FEE440", "#9B5DE5", "#00F5D4","#00BBF9"),
}
const temaIgre = boje["default"];
document.body.style.backgroundColor = temaIgre.bojaPozadine;

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
	dfs(vrsta, kolona){
		if(vrsta >= this.dimenzija-1 && kolona >= this.dimenzija){
			return;
		}
		this.matrica[vrsta][kolona]=1;
		if(vrsta == this.dimenzija-1){
			this.dfs(vrsta, kolona+1);
			return;
		}
		if(kolona == this.dimenzija-1){
			this.dfs(vrsta+1, kolona);
			return;
		}
		
		let rezultat = Math.random();
		if(rezultat >= 0.5){
			this.dfs(vrsta+1, kolona);
		}
		else{
			this.dfs(vrsta, kolona+1);
		}
		
	}
	generisiPut(){
		let brojPuteva = 3+	Math.floor(Math.random()*this.dimenzija);
		for(let i=0;i<brojPuteva;i++){
			this.dfs(0,0, Math.random());
		}
	}
	
}

class Igrac{
	nadjiNajdalje(){
		this.najdaljiX=this.x;
		this.najdaljiY=this.y;
		for(let i = this.x; i>=0; i--){
			if(this.tbl.matrica[this.y][i]==0)break;
			this.najdaljiX = i;
		}
		for(let i = this.y; i>=0; i--){
			if(this.tbl.matrica[i][this.x]==0)break;
			this.najdaljiY = i;
		}
	}
	constructor(tbl){
		this.potez = 0;
		this.tbl = tbl;
		this.x = tbl.dimenzija-1;
		this.y = tbl.dimenzija-1;
		this.najdaljiX = this.x;
		for(let i=this.x;i>=0;i--){
			if(this.tbl.matrica[this.y][i]==0)break;
			this.najdaljiX=i;
		}
		this.najdaljiY = this.y;
		for(let i=this.y;i>=0;i--){
			if(this.tbl.matrica[i][this.x]==0)break;
			this.najdaljiY=i;
		}
		this.grandi = [];
		for(let i = 0; i<this.tbl.dimenzija; i++){
			let novaDuzina = this.grandi.push([]);
			for(let j=0; j<this.tbl.dimenzija; j++){
				this.grandi[novaDuzina-1].push(0);
			}
		}
	}
	crtaj(){
		
		//kontekst.strokeStyle = bojaOkviraIgraca;
		let centarX = this.tbl.strana * this.x + this.tbl.strana/2;
		let centarY = this.tbl.strana * this.y + this.tbl.strana/2;
		krug(centarX, centarY, this.tbl.strana/2 * 0.9, temaIgre.bojaIgraca);
		let bojaPoteza = temaIgre.bojaPokreta;
		if(!this.potez)bojaPoteza = temaIgre.bojaPokretaAI;
		for(let i = this.x-1; i>=this.najdaljiX; i--){
			let boja = bojaPoteza;
			if(this.grandi[this.y][i]==0)boja = temaIgre.bojaCilja;
			let cntr = this.tbl.strana * i + this.tbl.strana/2;
			krug(cntr, centarY, this.tbl.strana/4, boja);
		}
		for(let i = this.y-1; i>=this.najdaljiY; i--){
			let boja = bojaPoteza;
			if(this.grandi[i][this.x]==0)boja = temaIgre.bojaCilja;
			let cntr = this.tbl.strana * i + this.tbl.strana/2;
			krug(centarX, cntr, this.tbl.strana/4, boja);
		}
		//kontekst.stroke();
	}
	pomeriAI(){
		let noviX = -1;
		let noviY = -1;
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
				noviY=i;
				break;
			}
		}
		if(noviX==-1){
			this.y=noviY;
		}
		else if(noviY==-1){
			this.x=noviX;
		}
		else{
			if(Math.random()>=0.5)this.y=noviY;
			else this.x=noviX;
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
		if(noviX!=this.x && noviY!=this.y)return;
		if(noviX<this.najdaljiX || noviY<this.najdaljiY)return;
		if(noviX>this.x || noviY > this.y)return;
		this.x=noviX;
		this.y=noviY;
		this.nadjiNajdalje();
		this.potez = 0;
		spavaj(1000).then(() => {
			this.pomeriAI();
		});
		
		
	}
	
	izracunajGrandi(){
		let kolona = Array(this.tbl.dimenzija);
		let vrsta = 0;
		for(let i=0;i<this.tbl.dimenzija;i++){
			vrsta=0;
			for(let j=0;j<this.tbl.dimenzija;j++){
				if(this.tbl.matrica[i][j]==0){
					vrsta = 0;
					kolona[j]=0;
					this.grandi[i][j]=-1;
					continue;
				}
				let mex = nadjiNajdesnijuNulu(vrsta | kolona[j]);
				vrsta|=(1<<mex);
				kolona[j]|=(1<<mex);
				this.grandi[i][j]=mex;
			}
		}
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

platno.addEventListener('click', function(event){
	[x, y] = pozicijaMisa(event);
	igrc.pomeri(x,y);
});
function podesi(){
	tabl = new Tabla(10, 500);
	tabl.generisiPut();
	igrc = new Igrac(tabl);
	igrc.izracunajGrandi();
	window.requestAnimationFrame(petlja);
}

function petlja(){
	kontekst.fillStyle = temaIgre.bojaPozadine;
	kontekst.fillRect(0,0,500,500);
	tabl.crtaj();
	igrc.crtaj();
	window.requestAnimationFrame(petlja);
}


