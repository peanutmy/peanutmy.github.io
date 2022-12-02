//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// TABS set to 2.
//
// ORIGINAL SOURCE:
// RotatingTranslatedTriangle.js (c) 2012 matsuda
// HIGHLY MODIFIED to make:
//
// JT_MultiShader.js  for EECS 351-1, 
//									Northwestern Univ. Jack Tumblin

/* Show how to use 3 separate VBOs with different verts, attributes & uniforms. 
-------------------------------------------------------------------------------
	Create a 'VBObox' object/class/prototype & library to collect, hold & use all 
	data and functions we need to render a set of vertices kept in one Vertex 
	Buffer Object (VBO) on-screen, including:
	--All source code for all Vertex Shader(s) and Fragment shader(s) we may use 
		to render the vertices stored in this VBO;
	--all variables needed to select and access this object's VBO, shaders, 
		uniforms, attributes, samplers, texture buffers, and any misc. items. 
	--all variables that hold values (uniforms, vertex arrays, element arrays) we 
	  will transfer to the GPU to enable it to render the vertices in our VBO.
	--all user functions: init(), draw(), adjust(), reload(), empty(), restore().
	Put all of it into 'JT_VBObox-Lib.js', a separate library file.

USAGE:
------
1) If your program needs another shader program, make another VBObox object:
 (e.g. an easy vertex & fragment shader program for drawing a ground-plane grid; 
 a fancier shader program for drawing Gouraud-shaded, Phong-lit surfaces, 
 another shader program for drawing Phong-shaded, Phong-lit surfaces, and
 a shader program for multi-textured bump-mapped Phong-shaded & lit surfaces...)
 
 HOW:
 a) COPY CODE: create a new VBObox object by renaming a copy of an existing 
 VBObox object already given to you in the VBObox-Lib.js file. 
 (e.g. copy VBObox1 code to make a VBObox3 object).

 b) CREATE YOUR NEW, GLOBAL VBObox object.  
 For simplicity, make it a global variable. As you only have ONE of these 
 objects, its global scope is unlikely to cause confusions/errors, and you can
 avoid its too-frequent use as a function argument.
 (e.g. above main(), write:    var phongBox = new VBObox3();  )

 c) INITIALIZE: in your JS progam's main() function, initialize your new VBObox;
 (e.g. inside main(), write:  phongBox.init(); )

 d) DRAW: in the JS function that performs all your webGL-drawing tasks, draw
 your new VBObox's contents on-screen. 
 (NOTE: as it's a COPY of an earlier VBObox, your new VBObox's on-screen results
  should duplicate the initial drawing made by the VBObox you copied.  
  If that earlier drawing begins with the exact same initial position and makes 
  the exact same animated moves, then it will hide your new VBObox's drawings!
  --THUS-- be sure to comment out the earlier VBObox's draw() function call  
  to see the draw() result of your new VBObox on-screen).
  (e.g. inside drawAll(), add this:  
      phongBox.switchToMe();
      phongBox.draw();            )

 e) ADJUST: Inside the JS function that animates your webGL drawing by adjusting
 uniforms (updates to ModelMatrix, etc) call the 'adjust' function for each of your
VBOboxes.  Move all the uniform-adjusting operations from that JS function into the
'adjust()' functions for each VBObox. 

2) Customize the VBObox contents; add vertices, add attributes, add uniforms.
 ==============================================================================*/


// Global Variables  
//   (These are almost always a BAD IDEA, but here they eliminate lots of
//    tedious function arguments. 
//    Later, collect them into just a few global, well-organized objects!)
// ============================================================================
// for WebGL usage:--------------------
var gl;													// WebGL rendering context -- the 'webGL' object
																// in JavaScript with all its member fcns & data
var g_canvasID;									// HTML-5 'canvas' element ID#

// For multiple VBOs & Shaders:-----------------
worldBox = new VBObox0();		  // Holds VBO & shaders for 3D 'world' ground-plane grid, etc;
GouraudBox = new VBObox1();		  // "  "  for first set of custom-shaded 3D parts
PhongBox = new VBObox2();     // "  "  for second set of custom-shaded 3D parts

// For animation:---------------------
var g_lastMS = Date.now();			// Timestamp (in milliseconds) for our 
                                // most-recently-drawn WebGL screen contents.  
                                // Set & used by moveAll() fcn to update all
                                // time-varying params for our webGL drawings.
  // All time-dependent params (you can add more!)
var g_angleNow0  =  0.0; 			  // Current rotation angle, in degrees.
var g_angleRate0 = 45.0;				// Rotation angle rate, in degrees/second.
                                //---------------
var g_angleNow1  = 100.0;       // current angle, in degrees
var g_angleRate1 =  95.0;        // rotation angle rate, degrees/sec
var g_angleMax1  = 150.0;       // max, min allowed angle, in degrees
var g_angleMin1  =  60.0;
                                //---------------
var g_angleNow2  =  0.0; 			  // Current rotation angle, in degrees.
var g_angleRate2 = -62.0;				// Rotation angle rate, in degrees/second.

                                //---------------
var g_posNow0 =  0.0;           // current position
var g_posRate0 = 0.6;           // position change rate, in distance/second.
var g_posMax0 =  0.5;           // max, min allowed for g_posNow;
var g_posMin0 = -0.5;           
                                // ------------------
var g_posNow1 =  0.0;           // current position
var g_posRate1 = 0.5;           // position change rate, in distance/second.
var g_posMax1 =  1.0;           // max, min allowed positions
var g_posMin1 = -1.0;
                                //---------------
var g_angle01 = 0.0;                  // initial rotation angle
var g_angle01Rate = 45.0;           // rotation speed, in degrees/second 

var g_angle02 = 0.0;
var g_angle02Rate = 20.0;

var g_angleLink1 = 0.0;
var g_angleLink1Rate = 10.0;

var g_angleLink2 = 0.0;
var g_angleLink2Rate = 15.0;

var g_angleLink3 = 0.0;
var g_angleLink3Rate = 20.0;

var g_angleHead = 0.0;
var g_angleHeadRate = 20.0;

var g_angleHnow  =   0.0;       // init Current rotation angle, in degrees
var g_angleHrate = -22.0;       // init Rotation angle rate, in degrees/second.
var g_angleHbrake=	 1.0;				// init Speed control; 0=stop, 1=full speed.
var g_angleHmin  =-140.0;       // init min, max allowed angle, in degrees.
var g_angleHmax  =  40.0;


var g_angle1now  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle1rate =  64.0;				// init Rotation angle rate, in degrees/second.
var g_angle1brake=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle1min  = -60.0;       // init min, max allowed angle, in degrees
var g_angle1max  =  60.0;

var g_angle2now  =   0.0; 			// init Current rotation angle, in degrees.
var g_angle2rate =  89.0;				// init Rotation angle rate, in degrees/second.
var g_angle2brake=	 1.0;				// init Speed control; 0=stop, 1=full speed.
var g_angle2min  = -40.0;       // init min, max allowed angle, in degrees
var g_angle2max  = -20.0;			

var g_angle3now  =   0.0; 			// init Current rotation angle, in degrees.
var g_angle3rate =  31.0;				// init Rotation angle rate, in degrees/second.
var g_angle3brake=	 1.0;				// init Speed control; 0=stop, 1=full speed.
var g_angle3min  = -40.0;       // init min, max allowed angle, in degrees
var g_angle3max  =  40.0;	

var g_angle4now  =   0.0;       // init Current rotation angle, in degrees
var g_angle4rate = -22.0;       // init Rotation angle rate, in degrees/second.
var g_angle4brake=	 1.0;				// init Speed control; 0=stop, 1=full speed.
var g_angle4min  =-40.0;       // init min, max allowed angle, in degrees.
var g_angle4max  =  30.0;
// For mouse/keyboard:------------------------
var g_show0 = 1;								// 0==Show, 1==Hide VBO0 contents on-screen.
var g_show1 = 1;								// 	"					"			VBO1		"				"				" 
var g_show2 = 1;                //  "         "     VBO2    "       "       "

var g_currMatl;
var g_isBlinn = false;
var g_shiny;
var g_shinyInit;

var g_lightPosXInit = document.getElementById('posX').value;
var g_lightPosYInit = document.getElementById('posY').value;
var g_lightPosZInit = document.getElementById('posZ').value;

var g_lightDiffRInit = document.getElementById('diffR').value;
var g_lightDiffGInit = document.getElementById('diffG').value;
var g_lightDiffBInit = document.getElementById('diffB').value;

var g_lightAmbiRInit = document.getElementById('ambiR').value;
var g_lightAmbiGInit = document.getElementById('ambiG').value;
var g_lightAmbiBInit = document.getElementById('ambiB').value;

var g_lightSpecRInit = document.getElementById('specR').value;
var g_lightSpecGInit = document.getElementById('specG').value;
var g_lightSpecBInit = document.getElementById('specB').value;

var g_lightPosX;
var g_lightPosY;
var g_lightPosZ;

var g_lightDiffR;
var g_lightDiffG;
var g_lightDiffB;

var g_lightAmbiR;
var g_lightAmbiG;
var g_lightAmbiB;

var g_lightSpecR;
var g_lightSpecG;
var g_lightSpecB;


//
const UP_ARROW    = 38;
const LEFT_ARROW  = 37;
const RIGHT_ARROW = 39;
const DOWN_ARROW  = 40;

const W = 87;
const A = 65;
const S = 83;
const D = 68;

var g_camXInit = 6.5, g_camYInit = 5.5, g_camZInit = 5.0;
var g_lookXInit = 1.0, g_lookYInit = 1.0, g_lookZInit = 4.5;

var g_aimThetaInit = 215.0

var g_camX = g_camXInit, g_camY = g_camYInit, g_camZ = g_camZInit; //! Location of our camera
var g_lookX = g_lookXInit, g_lookY = g_lookYInit, g_lookZ = g_lookZInit; //! Where our camera is looking

var g_aimTheta = g_aimThetaInit;

var g_aimZDiff = g_lookZ - g_camZ;

var g_moveRate = 3.0;

g_worldMat = new Matrix4();

function main() {
//=============================================================================
  // Retrieve the HTML-5 <canvas> element where webGL will draw our pictures:
  g_canvasID = document.getElementById('webgl');	
  // Create the the WebGL rendering context: one giant JavaScript object that
  // contains the WebGL state machine adjusted by large sets of WebGL functions,
  // built-in variables & parameters, and member data. Every WebGL function call
  // will follow this format:  gl.WebGLfunctionName(args);

  // Create the the WebGL rendering context: one giant JavaScript object that
  // contains the WebGL state machine, adjusted by big sets of WebGL functions,
  // built-in variables & parameters, and member data. Every WebGL func. call
  // will follow this format:  gl.WebGLfunctionName(args);
  //SIMPLE VERSION:  gl = getWebGLContext(g_canvasID); 
  // Here's a BETTER version:
  gl = g_canvasID.getContext("webgl", { preserveDrawingBuffer: true});
	// This fancier-looking version disables HTML-5's default screen-clearing, so 
	// that our drawMain() 
	// function will over-write previous on-screen results until we call the 
	// gl.clear(COLOR_BUFFER_BIT); function. )
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  window.addEventListener('keydown', keyDown, false); // add event listener for the keyboard
  
  gl.clearColor(0.1, 0.3, 0.4, 1);	  // RGBA color for clearing <canvas>

  gl.enable(gl.DEPTH_TEST);
   /** 
  //----------------SOLVE THE 'REVERSED DEPTH' PROBLEM:------------------------
  // IF the GPU doesn't transform our vertices by a 3D Camera Projection Matrix
  // (and it doesn't -- not until Project B) then the GPU will compute reversed 
  // depth values:  depth==0 for vertex z == -1;   (but depth = 0 means 'near') 
  //		    depth==1 for vertex z == +1.   (and depth = 1 means 'far').
  //
  // To correct the 'REVERSED DEPTH' problem, we could:
  //  a) reverse the sign of z before we render it (e.g. scale(1,1,-1); ugh.)
  //  b) reverse the usage of the depth-buffer's stored values, like this:
  gl.enable(gl.DEPTH_TEST); // enabled by default, but let's be SURE.

  gl.clearDepth(0.0);       // each time we 'clear' our depth buffer, set all
                            // pixel depths to 0.0  (1.0 is DEFAULT)
  gl.depthFunc(gl.GREATER); // draw a pixel only if its depth value is GREATER
                            // than the depth buffer's stored value.
                            // (gl.LESS is DEFAULT; reverse it!)
  //------------------end 'REVERSED DEPTH' fix---------------------------------*/


  // Initialize each of our 'vboBox' objects: 
  worldBox.init(gl);		// VBO + shaders + uniforms + attribs for our 3D world,
                        // including ground-plane,                       
  GouraudBox.init(gl);		//  "		"		"  for 1st kind of shading & lighting

	PhongBox.init(gl);    //  "   "   "  for 2nd kind of shading & lighting
	
  //gl.clearColor(0.2, 0.2, 0.2, 1);	  // RGBA color for clearing <canvas>
  
  // ==============ANIMATION=============
  // Quick tutorials on synchronous, real-time animation in JavaScript/HTML-5: 
  //    https://webglfundamentals.org/webgl/lessons/webgl-animation.html
  //  or
  //  	http://creativejs.com/resources/requestanimationframe/
  //		--------------------------------------------------------
  // Why use 'requestAnimationFrame()' instead of the simpler-to-use
  //	fixed-time setInterval() or setTimeout() functions?  Because:
  //		1) it draws the next animation frame 'at the next opportunity' instead 
  //			of a fixed time interval. It allows your browser and operating system
  //			to manage its own processes, power, & computing loads, and to respond 
  //			to on-screen window placement (to skip battery-draining animation in 
  //			any window that was hidden behind others, or was scrolled off-screen)
  //		2) it helps your program avoid 'stuttering' or 'jittery' animation
  //			due to delayed or 'missed' frames.  Your program can read and respond 
  //			to the ACTUAL time interval between displayed frames instead of fixed
  //		 	fixed-time 'setInterval()' calls that may take longer than expected.
  //------------------------------------
  var tick = function() {		    // locally (within main() only), define our 
                                // self-calling animation function. 
    g_canvasID.width = innerWidth;
    g_canvasID.height = innerHeight *0.75;
    
    requestAnimationFrame(tick, g_canvasID); // browser callback request; wait
                                // til browser is ready to re-draw canvas, then
    timerAll();  // Update all time-varying params, and
    drawAll();                // Draw all the VBObox contents
    };
  //------------------------------------
  tick();                       // do it again!
}

function timerAll() {
//=============================================================================
// Find new values for all time-varying parameters used for on-screen drawing
  // use local variables to find the elapsed time.
  var nowMS = Date.now();             // current time (in milliseconds)
  var elapsedMS = nowMS - g_lastMS;   // 
  g_lastMS = nowMS;                   // update for next webGL drawing.
  if(elapsedMS > 1000.0) {            
    // Browsers won't re-draw 'canvas' element that isn't visible on-screen 
    // (user chose a different browser tab, etc.); when users make the browser
    // window visible again our resulting 'elapsedMS' value has gotten HUGE.
    // Instead of allowing a HUGE change in all our time-dependent parameters,
    // let's pretend that only a nominal 1/30th second passed:
    elapsedMS = 1000.0/30.0;
    }
  // Find new time-dependent parameters using the current or elapsed time:
  // Continuous rotation:
  g_angleNow0 = g_angleNow0 + (g_angleRate0 * elapsedMS) / 1000.0;
  g_angleNow1 = g_angleNow1 + (g_angleRate1 * elapsedMS) / 1000.0;
  g_angleNow2 = g_angleNow2 + (g_angleRate2 * elapsedMS) / 1000.0;
  g_angleHnow += g_angleHrate * g_angleHbrake * (elapsedMS * 0.001);
  g_angle1now += g_angle1rate * g_angle1brake * (elapsedMS * 0.001);
  g_angle2now += g_angle2rate * g_angle2brake * (elapsedMS * 0.001);
  g_angle4now += g_angle4rate * g_angle4brake * (elapsedMS * 0.001);
  g_angleNow0 %= 360.0;   // keep angle >=0.0 and <360.0 degrees  
  g_angleNow1 %= 360.0;   
  g_angleNow2 %= 360.0;
  /**if(g_angleNow1 > g_angleMax1) { // above the max?
    g_angleNow1 = g_angleMax1;    // move back down to the max, and
    g_angleRate1 = -g_angleRate1; // reverse direction of change.
    }
  else if(g_angleNow1 < g_angleMin1) {  // below the min?
    g_angleNow1 = g_angleMin1;    // move back up to the min, and
    g_angleRate1 = -g_angleRate1;
    }*/
  // Continuous movement:
  g_posNow0 += g_posRate0 * elapsedMS / 1000.0;
  g_posNow1 += g_posRate1 * elapsedMS / 1000.0;
  // apply position limits
  if(g_posNow0 > g_posMax0) {   // above the max?
    g_posNow0 = g_posMax0;      // move back down to the max, and
    g_posRate0 = -g_posRate0;   // reverse direction of change
    }
  else if(g_posNow0 < g_posMin0) {  // or below the min? 
    g_posNow0 = g_posMin0;      // move back up to the min, and
    g_posRate0 = -g_posRate0;   // reverse direction of change.
    }
  if(g_posNow1 > g_posMax1) {   // above the max?
    g_posNow1 = g_posMax1;      // move back down to the max, and
    g_posRate1 = -g_posRate1;   // reverse direction of change
    }
  else if(g_posNow1 < g_posMin1) {  // or below the min? 
    g_posNow1 = g_posMin1;      // move back up to the min, and
    g_posRate1 = -g_posRate1;   // reverse direction of change.
    }

    var g_angle01min = -60.0;
	var g_angle01max =  60.0;

	var angleLink1min = -60.0;
	var angleLink1max =  60.0;

	var angleLink2min = -50.0;
	var angleLink2max =  50.0;

	var angleLink3min = -40.0;
	var angleLink3max =  40.0; 

	var angleHeadmin = -45.0;
	var angleHeadmax =  45.0;

	// Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +120 and -120 degrees:
  if(g_angle01 >  g_angle01max && g_angle01Rate > 0) g_angle01Rate = -g_angle01Rate;
	if(g_angle01 <  g_angle01min && g_angle01Rate < 0) g_angle01Rate = -g_angle01Rate;

	if(g_angleLink1 >  angleLink1max && g_angleLink1Rate > 0) g_angleLink1Rate = -g_angleLink1Rate;
	if(g_angleLink1 <  angleLink1min && g_angleLink1Rate < 0) g_angleLink1Rate = -g_angleLink1Rate;

	if(g_angleLink2 >  angleLink2max && g_angleLink2Rate > 0) g_angleLink2Rate = -g_angleLink2Rate;
	if(g_angleLink2 <  angleLink2min && g_angleLink2Rate < 0) g_angleLink2Rate = -g_angleLink2Rate;

	if(g_angleLink3 >  angleLink3max && g_angleLink3Rate > 0) g_angleLink3Rate = -g_angleLink3Rate;
	if(g_angleLink3 <  angleLink3min && g_angleLink3Rate < 0) g_angleLink3Rate = -g_angleLink3Rate;
	
	if(g_angleLink3 >  angleHeadmax && g_angleHeadRate > 0) g_angleHeadRate = -g_angleHeadRate;
	if(g_angleLink3 <  angleHeadmin && g_angleHeadRate < 0) g_angleHeadRate = -g_angleHeadRate;

  if((g_angleHnow >= g_angleHmax && g_angleHrate > 0) || // going over max, or
           (g_angleHnow <= g_angleHmin && g_angleHrate < 0)  ) // going under min ?
           g_angleHrate *= -1;	// YES: reverse direction.

  if((g_angle1now >= g_angle1max && g_angle1rate > 0) || // going over max, or
           (g_angle1now <= g_angle1min && g_angle1rate < 0) )	 // going under min ?
           g_angle1rate *= -1;	// YES: reverse direction.
  if((g_angle2now >= g_angle2max && g_angle2rate > 0) || // going over max, or
           (g_angle2now <= g_angle2min && g_angle2rate < 0) )	 // going under min ?
           g_angle2rate *= -1;	// YES: reverse direction.
  if((g_angle3now >= g_angle3max && g_angle3rate > 0) || // going over max, or
           (g_angle3now <= g_angle3min && g_angle3rate < 0) )	 // going under min ?
           g_angle3rate *= -1;	// YES: reverse direction.
  if((g_angle4now >= g_angle4max && g_angle4rate > 0) || // going over max, or
           (g_angle4now <= g_angle4min && g_angle4rate < 0) )	 // going under min ?
           g_angle4rate *= -1;	// YES: reverse direction.
	

  if(g_angleHmin > g_angleHmax)	
        {// if min and max don't limit the angle, then
            if(     g_angleHnow < -180.0) g_angleHnow += 360.0;	// go to >= -180.0 or
            else if(g_angleHnow >  180.0) g_angleHnow -= 360.0;	// go to <= +180.0
        }

  if(g_angle1min > g_angle1max)
        {
            if(     g_angle1now < -180.0) g_angle1now += 360.0;	// go to >= -180.0 or
            else if(g_angle1now >  180.0) g_angle1now -= 360.0;	// go to <= +180.0
        }
  if(g_angle2min > g_angle2max)
        {
            if(     g_angle2now < -180.0) g_angle2now += 360.0;	// go to >= -180.0 or
            else if(g_angle2now >  180.0) g_angle2now -= 360.0;	// go to <= +180.0
        }
  if(g_angle3min > g_angle3max)
        {
            if(     g_angle3now < -180.0) g_angle3now += 360.0;	// go to >= -180.0 or
            else if(g_angle3now >  180.0) g_angle3now -= 360.0;	// go to <= +180.0
        }
  if(g_angle4min > g_angle4max)
        {
            if(     g_angleheadnow < -180.0) g_angleheadnow += 360.0;	// go to >= -180.0 or
            else if(g_angleheadnow >  -180.0) g_angleheadnow -= 360.0;	// go to <= +180.0
        }
	g_angleLink1 = (g_angleLink1 + (g_angleLink1Rate * elapsedMS) / 1000.0)  % 360;
	g_angleLink2 = (g_angleLink2 + (g_angleLink2Rate * elapsedMS) / 1000.0)  % 360;
	g_angleLink3 = (g_angleLink3 + (g_angleLink3Rate * elapsedMS) / 1000.0)  % 360;	
	g_angleHead  = (g_angleHead  + (g_angleHeadRate  * elapsedMS) / 1000.0)  % 360;


}

function drawAll() {
//=============================================================================
  // Clear on-screen HTML-5 <canvas> object:
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  g_currMatl = getMatl();
  g_shiny = document.getElementById("shiny").value;
  setCamera();
  getUsrValues();

var b4Draw = Date.now();
var b4Wait = b4Draw - g_lastMS;

	if(g_show0 == 1) {	// IF user didn't press HTML button to 'hide' VBO0:
	  worldBox.switchToMe();  // Set WebGL to render from this VBObox.
		worldBox.adjust();		  // Send new values for uniforms to the GPU, and
		worldBox.draw();			  // draw our VBO's contents using our shaders.
  }
  if(g_show1 == 1) { // IF user didn't press HTML button to 'hide' VBO1:
    GouraudBox.switchToMe();  // Set WebGL to render from this VBObox.
  	GouraudBox.adjust();		  // Send new values for uniforms to the GPU, and
  	GouraudBox.draw();			  // draw our VBO's contents using our shaders.
	  }
	if(g_show2 == 1) { // IF user didn't press HTML button to 'hide' VBO2:
	  PhongBox.switchToMe();  // Set WebGL to render from this VBObox.
  	PhongBox.adjust();		  // Send new values for uniforms to the GPU, and
  	PhongBox.draw();			  // draw our VBO's contents using our shaders.
  	}
/* // ?How slow is our own code?  	
var aftrDraw = Date.now();
var drawWait = aftrDraw - b4Draw;
console.log("wait b4 draw: ", b4Wait, "drawWait: ", drawWait, "mSec");
*/
}

function VBO0toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO0'.
  if(g_show0 != 1) g_show0 = 1;				// show,
  else g_show0 = 0;										// hide.
  console.log('g_show0: '+g_show0);
}

function VBO1toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO1'.
  if(g_show1 != 1) g_show1 = 1;			// show,
  //document.getElementById('toggleShading').innerText = "Toggle Phong Shading";}
  else g_show1 = 0;									// hide.
  //document.getElementById('toggleShading').innerText= "Toggle Gouraud Shading";}
  console.log('g_show1: '+g_show1);
}

function VBO2toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO2'.
  if(g_show2 != 1) g_show2 = 1;			// show,
  else g_show2 = 0;									// hide.
  console.log('g_show2: '+g_show2);
}

function toggleBlinn() {
  if(!g_isBlinn) g_isBlinn = true;
  else g_isBlinn = false;
  console.log('g_isBlinn: '+ g_isBlinn);
}

function setCamera() {
  g_worldMat.setIdentity();

  g_lookX = g_camX + Math.cos(toRadians(g_aimTheta));
	g_lookY = g_camY + Math.sin(toRadians(g_aimTheta));
  g_lookZ = g_camZ + g_aimZDiff;

  gl.viewport(0,											 				// Viewport lower-left corner
    0, 			// location(in pixels)
    g_canvasID.width, 					// viewport width,
    g_canvasID.height);			// viewport height in pixels.

  
  g_worldMat.perspective(42.0, // FOV
    g_canvasID.width/g_canvasID.height, // Aspect ratio
    1.0, // z-near
    100.0,); // z-far
    
  g_worldMat.lookAt( g_camX,  g_camY,  g_camZ, // camera position
                     g_lookX, g_lookY, g_lookZ, // looking position
                     0.0,     0.0,     1.0,);// up vector
}

function keyDown(ev) {
  var xd = g_camX - g_lookX;
	var yd = g_camY - g_lookY;
	var zd = g_camZ - g_lookZ;

	var len = Math.sqrt(Math.pow(xd, 2) + Math.pow(yd, 2) + Math.pow(zd, 2));

	var moveRateRad = toRadians(g_moveRate);
	
	switch(ev.keyCode) {
		case LEFT_ARROW:
			g_aimTheta += g_moveRate;

			if(g_aimTheta > 360) g_aimTheta -= 360.0;
			if(g_aimTheta < 0) g_aimTheta += 360.0;

			break;
		case RIGHT_ARROW: 
			g_aimTheta -= g_moveRate;

			if(g_aimTheta > 360) g_aimTheta -= 360.0;
			if(g_aimTheta < 0) g_aimTheta += 360.0;

			break;
		case UP_ARROW:
			g_aimZDiff += moveRateRad;
			break;
		case DOWN_ARROW:
			g_aimZDiff -= moveRateRad;
			break;
		case W: 
			g_lookX -= (xd / len);
			g_lookY -= (yd / len);
			g_lookZ -= (zd / len);

			g_camX -= (xd / len);
			g_camY -= (yd / len);
			g_camZ -= (zd / len);

			break;
		case S: 
			g_lookX += (xd / len);
			g_lookY += (yd / len);
			g_lookZ += (zd / len);

			g_camX += (xd / len);
			g_camY += (yd / len);
			g_camZ += (zd / len);

			break;
		case A:
			var xStrafe = Math.cos(toRadians(g_aimTheta + 90));
			var yStrafe = Math.sin(toRadians(g_aimTheta + 90));

			g_camX += xStrafe / len;
			g_camY += yStrafe / len;

			break;
		case D:
			var xStrafe = Math.cos(toRadians(g_aimTheta + 90));
			var yStrafe = Math.sin(toRadians(g_aimTheta + 90));

			g_camX -= xStrafe / len;
			g_camY -= yStrafe / len;

			break;
	}
}

function toRadians(angle) {
	return angle * (Math.PI/180);
}

function getMatl() {
  matlSelect = document.getElementById('materials').value;
  if (g_currMatl != matlSelect){
    var matl = new Material(parseInt(matlSelect));
    g_shinyInit = matl.K_shiny;
    document.getElementById('shiny').value = g_shinyInit;
    return matlSelect;
  }
  return g_currMatl;
}

function getUsrValues() {
  var usrPosX, usrPosY, usrPosZ, 
      usrAmbiR, usrAmbiG, usrAmbiB, 
      usrDiffR, usrDiffG, usrDiffB, 
      usrSpecR, usrSpecG, usrSpecB;


  // * Light position in world coords
  
  usrPosX = document.getElementById('posX').value;
  /**if(!isNaN(usrPosX))*/ g_lightPosX = usrPosX;

  usrPosY = document.getElementById('posY').value;
  if(!isNaN(usrPosY)) g_lightPosY = usrPosY

  usrPosZ = document.getElementById('posZ').value;
  if (!isNaN(usrPosZ)) g_lightPosZ = usrPosZ;

  // * Ambient light color

  usrAmbiR = document.getElementById('ambiR').value;
  if(!isNaN(usrAmbiR)) g_lightAmbiR = usrAmbiR;

  usrAmbiG = document.getElementById('ambiG').value;
  if(!isNaN(usrAmbiG)) g_lightAmbiG = usrAmbiG;

  usrAmbiB = document.getElementById('ambiB').value;
  if(!isNaN(usrAmbiB)) g_lightAmbiB = usrAmbiB;

  // * Diffuse light color

  usrDiffR = document.getElementById('diffR').value;
  if(!isNaN(usrDiffR)) g_lightDiffR = usrDiffR;

  usrDiffG = document.getElementById('diffG').value;
  if(!isNaN(usrDiffG)) g_lightDiffG = usrDiffG;

  usrDiffB = document.getElementById('diffB').value;
  if(!isNaN(usrDiffB)) g_lightDiffB = usrDiffB;

  // * Specular light color

  usrSpecR = document.getElementById('specR').value;
  if(!isNaN(usrSpecR)) g_lightSpecR = usrSpecR;

  usrSpecG = document.getElementById('specG').value;
  if(!isNaN(usrSpecG)) g_lightSpecG = usrSpecG;

  usrSpecB = document.getElementById('specB').value;
  if(!isNaN(usrSpecB)) g_lightSpecB = usrSpecB;
}

function resetLightPos() {
  document.getElementById('posX').value = g_lightPosXInit;
  document.getElementById('posY').value = g_lightPosYInit;
  document.getElementById('posZ').value = g_lightPosZInit;
}

function resetLightAmbi() {
  document.getElementById('ambiR').value = g_lightAmbiRInit;
  document.getElementById('ambiG').value = g_lightAmbiGInit;
  document.getElementById('ambiB').value = g_lightAmbiBInit;
}

function resetLightDiff() {
  document.getElementById('diffR').value = g_lightDiffRInit;
  document.getElementById('diffG').value = g_lightDiffGInit;
  document.getElementById('diffB').value = g_lightDiffBInit;
}

function resetLightSpec() {
  document.getElementById('specR').value = g_lightSpecRInit;
  document.getElementById('specG').value = g_lightSpecGInit;
  document.getElementById('specB').value = g_lightSpecBInit;
}

function resetShiny() {
  document.getElementById('shiny').value = g_shinyInit;
}

function LightControl(selectObject) {
	var value = selectObject.value;
	if (value == 1) {
	document.getElementById('posX').value = 0;
  document.getElementById('posY').value = 0;
  document.getElementById('posZ').value = 10.0;
  document.getElementById('ambiR').value = 0.4;
  document.getElementById('ambiG').value = 0.4;
  document.getElementById('ambiB').value = 0.4;
  document.getElementById('diffR').value = 1.0;
  document.getElementById('diffG').value = 1.0;
  document.getElementById('diffB').value = 1.0;
  document.getElementById('specR').value = 1.0;
  document.getElementById('specG').value = 1.0;
  document.getElementById('specB').value = 1.0;

	} else {
  document.getElementById('posX').value = 0;
  document.getElementById('posY').value = 0;
  document.getElementById('posZ').value = 0;
  document.getElementById('ambiR').value = 0;
  document.getElementById('ambiG').value = 0;
  document.getElementById('ambiB').value = 0;
  document.getElementById('diffR').value = 0;
  document.getElementById('diffG').value = 0;
  document.getElementById('diffB').value = 0;
  document.getElementById('specR').value = 0;
  document.getElementById('specG').value = 0;
  document.getElementById('specB').value = 0;
		

	}
}

