let len = 600, wid = 600, max_hp = 100, max_mana = 100;
let winner;
let game_over = false;

class Player {
  constructor(x, y, {up, down, left, right, power, vortex}, id){
    this.pos = createVector(x, y);
    this.F = createVector(0, 0);
    this.kb = {up, down, left, right, power, vortex};
    this.hp = max_hp;
    this.mana = max_mana;
    this.charge = false;
    this.recharge = false;
    this.id = id;
    this.ang = 0;
    this.r = 14;
    this.regen = 0.1;
    this.speed = 0;
  }
  update(){
    if(this.hp < 0){
      game_over = true;
      winner = 1 - this.id;
    }
    if(this.mana < max_mana) this.mana = min(max_mana, this.mana + this.regen);
    if(this.recharge) this.mana += this.regen*2;
    if(this.mana >= max_mana && this.recharge) this.recharge = 0;
    if(this.mana <= 0 && !this.recharge) this.recharge = true;
    if(!this.recharge && keyIsDown(this.kb.power)) this.mana --, this.charge = true;
		else if((!this.recharge && keyIsDown(this.kb.vortex)) || (this.id == 0)){
			this.mana -= 0.5;
			let OP = createVector(P[this.id].pos.x - P[1- this.id].pos.x, P[this.id].pos.y - P[1 - this.id].pos.y);
			
			P[this.id].F.add(OP.normalize().mult(-0.4));
		}
    else this.charge = false;
    let DF = createVector(0,0);
    if(keyIsDown(this.kb.up)) DF.y --;
    if(keyIsDown(this.kb.down)) DF.y ++;
    if(keyIsDown(this.kb.left)) DF.x --;
    if(keyIsDown(this.kb.right)) DF.x ++;
    DF.normalize().mult(0.1);
    let rate = (this.charge ? 4.2 : 1)*2
    this.F.x += rate*DF.x; this.F.y += rate*DF.y;
		this.F.mult(0.99);
    this.pos.x += this.F.x*0.75; this.pos.y += this.F.y*0.75;
    //console.log(this.pos.x + " " + this.pos.y);
    let knock = false;
    this.speed = sqrt((this.F.x)*(this.F.x) + (this.F.y)*(this.F.y));
    if(this.pos.x <= 0 || this.pos.x >= len) {
      this.pos.x = (this.pos.x <= 0 ? 0 : len);
      this.F.x *= -0.5;
      this.F.y *= 0.5;
      this.hp -= this.speed*(this.charge ? 0.5 : 1);
    }
    if(this.pos.y <= 0 || this.pos.y >= wid) {
      this.pos.y = (this.pos.y <= 0 ? 0 : wid);
      this.F.x *= 0.5;
      this.F.y *= -0.5;
      this.hp -= this.speed*(this.charge ? 0.5 : 1);
    }
  }
  display(){
    this.ang += (this.charge ? 4.2 : 1) * PI/30;
    if(this.ang == PI*2) this.ang = 0;
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.ang);
    let cl = (this.charge ? 255 : 120);
    if(this.id == 0){
      fill(cl,0,0);
      square(-15, -15, 30);
    }
    if(this.id == 1){
      fill(0,0,cl);
      square(-15, -15, 30);
    }
    pop();
    let rate = 24/max_hp;
    push();
    translate(this.pos.x,this.pos.y);
    fill(255);
    rect(-12, 24, 24, 3);
    fill(255,120,0);
    rect(-12, 24, this.hp*rate, 3);
    fill(255);
    rect(-12, 28, 24, 3);
    fill(0,120,255);
    rect(-12, 28, this.mana*rate, 3);
    pop();
  }
}
function checkCol(){
  let dis = sqrt((P[0].pos.x - P[1].pos.x)*(P[0].pos.x - P[1].pos.x) + (P[0].pos.y - P[1].pos.y)*(P[0].pos.y - P[1].pos.y));
  if(dis<= 30){
    let FC = P[0].speed + P[1].speed;
    let FX = createVector(P[1].pos.x - P[0].pos.x, P[1].pos.y - P[0].pos.y);
    FX.normalize().mult(0.5);
    FX.mult(FC);
    P[1].F.add(FX);
    FX.mult(-1);
    P[0].F.add(FX);
    P[0].hp -= (FC + 4*P[1].speed)*0.5;
    //P[0].hp -= P[1].charge*15;
    P[1].hp -= (FC + 4*P[0].speed)*0.5;
    //P[1].hp -= P[0].charge*15;
    //console.log("collide");
  }
  // console.log(dis);
}
let P = [];
function setup() {
  createCanvas(len, wid);
	frameRate(90);
  P.push(new Player(50, 50, {up: 87,down: 83,left: 65,right: 68, power: 71, vortex: 72}, 0));
  P.push(new Player(350,350, {up: 38,down: 40,left: 37, right: 39, power: 45, vortex: 35}, 1));  
}

function draw() {
  background(220);
	push()
  stroke(3);
  noFill();
  rect(0,0,len-1,wid-1);
  pop();
	if(!game_over){
    P[0].update();
    P[0].display();
    P[1].update();
    P[1].display();
  }
  else{
    text("player "+ winner + " won",len/2 - 100,wid/2);
    if(keyIsDown(13)){
      P = [];
      P.push(new Player(50, 50, {up: 87,down: 83,left: 65,right: 68, power: 32}, 1));
  P.push(new Player(350,350, {up: 38,down: 40,left: 37, right: 39, power: 45}, 2));  
      game_over = false;
    }
  }
  checkCol();
}
