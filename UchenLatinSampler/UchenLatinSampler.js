/* 
  * A to the K Studio 2021 Type Sampler
  Thanks to Karen ann Donnachie for the variablehelper.js for utilising variable fonts as textFont() in p5.js.
  */

let pvar=100;
//set starting variable type size
let typeSize = 0;
let cnv, mapper;
let pfat;
let fts;
let sound2, analyzer;
let txtcol1, txtcol2;
let volume, volcol, volcol2;
let content = '';
let content3 = '\'Uchen Latin\'';
let offset = 0;
let scrollspeed;
let playing;
let opac;


function preload(){
  sound2 = loadSound('data/Envy2.mp3');
}

function setup() {
  cnv = createCanvas (windowWidth,windowHeight);
  frameRate(60);
  textFont('uchenlatin', typeSize);
  background(243,244,228);
  noStroke();
  angleMode(DEGREES);
  
  analyzer = new p5.Amplitude();  
  analyzer.setInput(); 
    fft = new p5.FFT(0.9);
  fft.setInput();
  
  //a = createA('/data/UchenLatin.ttf', 'Download');
  b = createA('https://sylvain-girard.github.io/A-to-the-K/fontview/', 'Font View');


}


function draw() {
   updateVariableFont(pfat, 0, 900);

  background(243,244,228);
 
  let volume = analyzer.getLevel();
     if (sound2.isPlaying()){
background(volcol2);
  } else {
    background(243,244,228);
  }

 
  waveform = fft.waveform();                                                     
 push();
if(sound2.isPlaying()){
    stroke(50,100);
    strokeWeight(5);
} else {
stroke(243,244,228);
}
    beginShape();
  for (var i = 0; i< waveform.length; i++){
     noFill();
    curveVertex(i*2, map(waveform[i], -1,1, height, 0));
     }
  endShape();                                                                  
  pop();
  
  push();
  volume = volume * 2;
  volcol = map(volume,0,1,0,250);
  volcol2 =  map(volume,0,1,250,0);
  pop();
  volume = map(volume,0,1,100,900);

  txtcol1 = volcol;

if (sound2.isPlaying()){
pfat = volume;
stroke(156,36,21);
strokeWeight(5);
noFill();
typeSize = height/5 + (volume/3);
content = content;
  } else {
pfat = map(millis(),0,300000,0,900);
noStroke();
fill(210,211,186);
typeSize = height/30;
  }
  
  textSize(typeSize);
  let contwidth = textWidth(content);
  push();
  translate(width,0);
  rotate(180);
    for (let x = offset; x < width; x += contwidth+20) {
    textAlign(CENTER,CENTER);
    text(content, x, -height+(typeSize)); 
  }
  pop();
    for (let x = offset; x < width; x += contwidth+20) {
    textAlign(CENTER,CENTER);
  text(content, x, (typeSize)); 
  }

 
if(sound2.isPlaying()){
  translate((0.5*width),0);
  textAlign(RIGHT,CENTER);
  scrollspeed = 7;
 content3 = content;
 noStroke();
 fill(volcol);
 textSize(height/5 + (volume/30));
} else {
   scrollspeed = 0.1;
  textAlign(CENTER,CENTER);
  content3 = content3;
  fill(195,196,169);
  textSize(height/15);
}
 offset-=scrollspeed;
 
 if(sound2.isPlaying()){
text(content3, width/2, height/2);
 } else {
   translate(0,-50);
  text(content3, 0.3*width, 0.1*height, 0.4*width, 0.9*height); 
 }


if (sound2.isPlaying() && frameCount > 80){
   sound2.pause();
   frameCount = 0;
}
   
   if(sound2.isPaused()){
    opac = 'rgb(195,196,169,50)';
} else {
  opac = 'rgb(195,196,169,0)';
}

  //a.position(0.05*width, 0.95*(height/2));
  //a.style('color',opac);
  b.position(0.9*width, 0.95*(height/2));
  b.style('color',opac);
 


}


function keyTyped(){
content += key;
content3 += key;

 if( ! sound2.isPlaying()){       
   sound2.play(); 
   frameCount = 0;
 }  else {
  frameCount = 0;
}
}


function keyPressed(){
  //tlate += 100;
if (keyCode != 8){
 content = content; 
 content3 = content;}
 else if (keyCode == 8){
   content=content.substring(0, content.length-1);
   content3=content3.substring(0, content3.length-1);
 }
}
  

function mousePressed(){
  //saveCanvas('UchenLatin_###', 'jpg');
}
function windowResized(){
  resizeCanvas(windowWidth,windowHeight);
}
