const platno = document.getElementById("platno");
const kontekst = platno.getContext("2d");
kontekst.translate(0.5, 0.5);
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


function nadjiNajdesnijuNulu(broj){
	broj = ~broj;
	let stepen = (broj&~(broj-1));
	let odgovor = 0;
	while(stepen){
		stepen/=2;
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
		this.dfs(0,0);
		let red = [];
		for(let i=0;i<this.dimenzija;i++){
			for(let j = 0;j<this.dimenzija;j++){
				if(this.matrica[i][j]){
					red.push([i,j]);
				}
				
			}
		}
		const smerovi = [[0,1], [1,0]];
		while(red.length){
			let [vrsta, kolona] = red.shift();
			if(vrsta > this.dimenzija-1 || kolona > this.dimenzija-1 || vrsta < 0 || kolona < 0 || this.matrica[vrsta][kolona]==2) continue;
			this.matrica[vrsta][kolona]=2;
			smerovi.forEach(([x, y]) => {
				if(Math.random() < 0.5){
					red.push([vrsta+y,kolona+x]);
				}
			});
		}
	}
	izracunajGrandi(){
		let red = [];
		red.push([0,0,0]);

	}
}

class Igrac{
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
	
	pomeri(klikX, klikY){
		let noviX = Math.floor(klikX/this.tbl.strana);
		let noviY = Math.floor(klikY/this.tbl.strana);
		if(noviX==this.x && noviY==this.y)return;
		if(noviX!=this.x && noviY!=this.y)return;
		if(noviX<this.najdaljiX || noviY<this.najdaljiY)return;
		if(noviX>this.x || noviY > this.y)return;
		this.x = noviX;
		this.y = noviY;
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
}

let tabl;
let igrc;
platno.addEventListener('click', function(event){
	igrc.pomeri(event.offsetX, event.offsetY);
});
function podesi(){
	tabl = new Tabla(6, 500);
	tabl.generisiPut();
	igrc = new Igrac(tabl);
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

