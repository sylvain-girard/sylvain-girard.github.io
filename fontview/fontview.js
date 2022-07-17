let pvar=100;
//set starting variable type size
let typeSize = 100;
let cnv, mapper;
let pfat;
let fts;
let content = '\'Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz\' 0 1 2 3 4 5 6 7 8 9 .,;: -_ ~ < > ? ! @ + = # $ % ^ & * () [] {}/\\';

function setup() {
  cnv = createCanvas (windowWidth,windowHeight);
  frameRate(60);
  textFont('uchenlatin', typeSize);
  background(243,244,228);
  noStroke();
  textAlign(CENTER);

  a = createA('https://sylvain-girard.github.io/A-to-the-K/UchenLatinSampler/', 'Sampler');
  b = createA('https://sylvain-girard.github.io/A-to-the-K/fontview/', 'Font View');
  //c = createA('/data/UchenLatin.ttf', 'Download');
}


function draw() {
   updateVariableFont(pfat, 0, 900);
   background(243,244,228);
  pfat = map(mouseX,0,width,0,900);
  //textSize(typeSize);
  fill(60);
  text(content, 0.2*width, 0.05*height, 0.6*width, 0.9*height); 
    
  a.position(0.05*width, 0.9*(height/2));
  a.style('color','rgb(195,196,169,50)');
  b.position(0.9*width, 0.95*(height/2));
  b.style('color','rgb(195,196,169,50)');
  //c.position(0.05*width, 0.9*(height/2)+40);
  //c.style('color','rgb(195,196,169,50)');
}
  
  function keyTyped(){
    if (content == '\'Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz\' 0 1 2 3 4 5 6 7 8 9 .,;: -_ ~ < > ? ! @ + = # $ % ^ & * () [] {}/\\'){
   content = '';
    }
 content += key;
  }
  
  function keyPressed(){

if (keyCode != 8){
 content = content; }
 else if (keyCode == 8){
   content=content.substring(0, content.length-1);
 }
}

function mousePressed(){
  //saveCanvas('UchenLatin_###', 'jpg');
}
function windowResized(){
  resizeCanvas(windowWidth,windowHeight);
}
