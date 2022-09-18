const platno = document.getElementById("platno");
const kontekst = platno.getContext("2d");
const fps = 60;

const bojaPokreta = "#DDB892";
const bojaZida = "#CCD5AE";
const bojaPozadine = "#E9EDC9";
const bojaIgraca = "#D4A373";
//const bojaOkviraIgraca = "#FFCFAD";
/* STA TREBA URADITI:
	- kretanje igraca GOTOVO
	- Vestacka Inteligencija (igrac 2)
	- drag&drop?
	- NIM-slicne igre
*/

function pozicijaMisa(desavanje) {
    const rect = platno.getBoundingClientRect()
    const x = desavanje.clientX - rect.left
    const y = desavanje.clientY - rect.top
    return [x,y];
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
		kontekst.strokeStyle = bojaZida;
		kontekst.fillStyle = bojaZida;
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
	dfs(vrsta, kolona, sansa){
		if(vrsta >= this.dimenzija-1 && kolona >= this.dimenzija){
			return;
		}
		this.matrica[vrsta][kolona]=1;
		if(vrsta == this.dimenzija-1){
			this.dfs(vrsta, kolona+1, sansa);
			return;
		}
		if(kolona == this.dimenzija-1){
			this.dfs(vrsta+1, kolona, sansa);
			return;
		}
		
		let rezultat = Math.random();
		if(rezultat >= sansa){
			this.dfs(vrsta+1, kolona, sansa);
		}
		else{
			this.dfs(vrsta, kolona+1, sansa);
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
		
		kontekst.fillStyle = bojaIgraca;
		//kontekst.strokeStyle = bojaOkviraIgraca;
		let centarX = this.tbl.strana * this.x + this.tbl.strana/2;
		let centarY = this.tbl.strana * this.y + this.tbl.strana/2;
		kontekst.beginPath();
		kontekst.arc(centarX, centarY, this.tbl.strana/2 * 0.8, 0, Math.PI * 2);
		//kontekst.stroke();
		kontekst.fill();
		kontekst.beginPath();
		kontekst.fillStyle = bojaPokreta;
		for(let i = this.najdaljiX; i<this.x; i++){
			let cntr = this.tbl.strana * i + this.tbl.strana/2;
			kontekst.arc(cntr, centarY, this.tbl.strana/4, 0, Math.PI * 2);
		}
		kontekst.fill();
		kontekst.beginPath();
		for(let i = this.najdaljiY; i<this.y; i++){
			let cntr = this.tbl.strana * i + this.tbl.strana/2;
			kontekst.arc(centarX, cntr, this.tbl.strana/4, 0, Math.PI * 2);
		}
		//kontekst.stroke();
		kontekst.fill();
	}
	pomeriAI(){
		for(let i = this.x; i>=0; i--){
			if(this.grandi[this.y][i]==-1)break;
			if(this.grandi[this.y][i]==0){
				this.x=i;
				this.nadjiNajdalje();
				return;
			}
		}
		for(let i = this.y; i>=0; i--){
			if(this.grandi[i][this.x]==-1)break;
			if(this.grandi[i][this.x]==0){
				this.y=i;
				this.nadjiNajdalje();
				return;
			}
		}
	}
	pomeri(klikX, klikY){
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
		this.pomeriAI();
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
		if(this.grandi[this.tbl.dimenzija-1][this.tbl.dimenzija-1])this.pomeriAI();
	}
}
let potez = 0;
let tabl;
let igrc;
platno.addEventListener('click', function(event){
	[x, y] = pozicijaMisa(event);
	igrc.pomeri(x,y);
});
function podesi(){
	tabl = new Tabla(6, 500);
	tabl.generisiPut();
	igrc = new Igrac(tabl);
	igrc.izracunajGrandi();
}
podesi();
function petlja(){
	kontekst.fillStyle = bojaPozadine;
	kontekst.fillRect(0,0,500,500);
	tabl.crtaj();
	igrc.crtaj();
	window.requestAnimationFrame(petlja);
}
window.requestAnimationFrame(petlja);

