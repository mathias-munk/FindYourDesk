
PImage image1;
PImage image2;
PImage image3;
PImage image4;
PImage image5;
PImage currentimage;

Button_c button1;  // 3 instances of our Button_c class.
Button_c button2;
Button_c button3;


void setup() {

  
 size( 900, 700 );
 

  
 image1 = loadImage("image5.jpg");
 image2 = loadImage("image4.jpg");
 image3 = loadImage("image3.jpg");
 image4 = loadImage("image2.jpg");
 image5 = loadImage("image1.jpg");
 currentimage = image1;
  background( 0 );
  
  button1 = new Button_c(250, 250, 50);
  button2 = new Button_c(200, 200, 50);
  button3 = new Button_c(670, 560, 50);

}


void draw() {
  

currentimage.resize(900, 0);
image( currentimage, 0, 0 );

if(currentimage == image1){
}
if(currentimage == image2){
  button1.draw();
}
if(currentimage == image3){
  button2.draw();
}
if(currentimage == image4){
  button3.draw();
}
if(currentimage == image5){
}
  
}


// Check the status of our buttons
void mouseReleased() {
  
  if( button1.checkClick() ) {
     currentimage = image3; 
  }
  
  if( button2.checkClick() ) {
     currentimage = image4; 
  }
  
  if( button3.checkClick() ) {
     currentimage = image5; 
  }
    
}



void keyPressed() {
  
  // Run some code if one of these keys is pressed.
  // Note, we check for lower and upper case here by
  // using a logical OR statement ||
  if( currentimage == image1 ) {
    if( key == '\n' || key == ' '){
      currentimage = image2;
    }   
  } 
  
}
