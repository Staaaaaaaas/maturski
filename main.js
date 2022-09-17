const platno = document.getElementById("platno");
const kontekst = platno.getContext("2d");
/* STA TREBA URADITI:
	- kretanje igraca
	- Vestacka Inteligencija (igrac 2)
	- drag&drop?
	- NIM-slicne igre
*/


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
		kontekst.strokeStye = "black";
		kontekst.lineWidth = 2.5;
		for(let i=0;i<this.dimenzija;i++){
			for(let j = 0;j<this.dimenzija;j++){
				if(!this.matrica[i][j]){
					kontekst.fillStyle = "black";
					kontekst.fillRect(i*this.strana, j*this.strana, this.strana, this.strana);
				}
				kontekst.strokeRect(i*this.strana, j*this.strana, this.strana, this.strana);
				
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
}

class Igrac{
	constructor(tbl){
		this.tbl = tbl;
		this.x = tbl.dimenzija-1;
		this.y = tbl.dimenzija-1;
	}
	crtaj(){
		kontekst.fillStyle = "grey";
		kontekst.strokeStyle = "black";
		let centarX = this.tbl.strana * this.x + this.tbl.strana/2;
		let centarY = this.tbl.strana * this.y + this.tbl.strana/2;
		kontekst.arc(centarX, centarY, this.tbl.strana/2, 0, Math.PI * 2);
		kontekst.stroke();
		kontekst.fill();
	}
	move(noviX, noviY){
		this.x = noviX;
		this.y = noviY;
	}
}
let tbl;
let igrc;
function podesi(){
	tbl = new Tabla(6, 500);
	igrc = new Igrac(tbl);
	tbl.generisiPut();
}
podesi();
function petlja(){
	tbl.crtaj();
	igrc.crtaj();
}


setInterval(petlja, 1000/60);

