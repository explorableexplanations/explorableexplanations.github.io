var w = document.body.clientWidth*2;
var h = document.body.clientHeight*2;

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Vertices = Matter.Vertices;

// create an engine
var engine = Engine.create();

// Canvas!
var canvas = document.createElement("canvas");
canvas.width = w;
canvas.height = h;
canvas.style.width = w/2+"px";
canvas.style.height = h/2+"px";
document.body.appendChild(canvas);
var context = canvas.getContext("2d");

var img = new Image();
if(window.SPLASH=="misc"){
    img.src="shrug.png";
}
if(window.SPLASH=="meta"){
    img.src="meta.png";
}

var images = {
    tv: new Image(),
    paper: new Image(),
    mike: new Image(),
    phone: new Image()
};
if(window.SPLASH=="journalism"){
    images.tv.src = "tv.png";
    images.paper.src = "paper.png";
    images.mike.src = "mike.png";
    images.phone.src = "phone.png";
}

(function render() {

    var bodies = Composite.allBodies(engine.world);
    //console.log(bodies.length);

    window.requestAnimationFrame(render);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();

    context.save();
    if(window.SPLASH=="journalism"){
        context.globalAlpha = 0.5;
    }

    // Draw all of 'em
    for (var i = 0; i < bodies.length; i += 1) {
    	if(i<7) continue;

        if(window.SPLASH){
            
            var body = bodies[i];
            context.save();
            context.translate(body.position.x, body.position.y);
            context.rotate(body.angle);
            var image = img;
            if(body._IMAGE_) image=images[body._IMAGE_];
            context.drawImage(image, -image.width/2, -image.height/2);
            context.restore();

        }else{

            var vertices = bodies[i].vertices;
            context.moveTo(vertices[0].x, vertices[0].y);
            for (var j = 1; j < vertices.length; j += 1) {
                context.lineTo(vertices[j].x, vertices[j].y);
            }
            context.lineTo(vertices[0].x, vertices[0].y);

        }

    }
    if(!window.SPLASH){
        context.lineWidth = 4;
        context.strokeStyle = "rgba(255,255,255,0.5)";
        context.stroke();
    }

    context.restore();

    // DRAW CIRCLE
    _drawCircle(context, 200);

})();


//////////////////////////////////
// CREATE BORDERS (with bump) ////
//////////////////////////////////

var thick = 50;
var lift = 0;

var weirdVertices = [
    { x: w/2-100, y: h-120-lift },
    { x: w/2, y: h-20-lift },
    { x: w/2-100, y: h-20-lift }
];
var weirdFloor = Matter.Body.create({
    position: Matter.Vertices.centre(weirdVertices),
    vertices: weirdVertices,
    isStatic: true
});
var weirdVertices = [
    { x: w/2+100, y: h-120-lift },
    { x: w/2+100, y: h-20-lift },
    { x: w/2, y: h-20-lift }
];
var weirdFloor2 = Matter.Body.create({
    position: Matter.Vertices.centre(weirdVertices),
    vertices: weirdVertices,
    isStatic: true
});

World.add(engine.world, [
    // walls
    Bodies.rectangle(       w/2,  -thick/2,     w, thick, { isStatic: true, restitution:1 }),
    Bodies.rectangle( w+thick/2,       h/2, thick,     h, { isStatic: true, restitution:1 }),
    Bodies.rectangle(  -thick/2,       h/2, thick,     h, { isStatic: true, restitution:1 }),
    
    Bodies.rectangle( (w/4)-50, h+thick/2-120-lift, (w/2)-100, thick, { isStatic: true, restitution:1 }),
    Bodies.rectangle( (w*3/4)+50, h+thick/2-120-lift, (w/2)-100, thick, { isStatic: true, restitution:1 }),
    weirdFloor,
    weirdFloor2
    //
]);


//////////////////////////////////
// LET THE BODIES HIT THE FLOOR //
//////////////////////////////////

var shapeW = 80;
if(window.SPLASH=="misc"){
    shapeW = 100;
}
if(window.SPLASH=="meta"){
    shapeW = 90;
}
var columns = Math.floor((w/2)/shapeW)-3;
var shapeH = 50;
if(window.SPLASH=="meta"){
    shapeH = 40;
}
var rows = Math.floor((h/2)/shapeH)-3;

var things = [
    {img:"tv", w:200, h:180},
    {img:"paper", w:150, h:160},
    {img:"mike", w:80, h:120},
    {img:"phone", w:80, h:120}
];

// add bodies
var stack = Composites.stack(shapeW, shapeH, columns, rows, shapeW, shapeH, function(x,y) {
    
    if(!window.SPLASH){
     
        var sides = Math.round(Common.random(1, 6));
        var shape = Bodies.polygon(x, y, sides, Common.random(25*2, 50*2), {restitution:0.75});
        //debugger;
        shape.position.x += (Math.random()-0.5)*50;
        shape.position.y += (Math.random()-0.5)*50;
        shape.angle += (Math.random()-0.5)*0.5;
        return shape;
    
    }else if(window.SPLASH=="misc"){
    
        var rect = Bodies.rectangle(x+(Math.random()-0.5)*200, y, 300, 75);
        Matter.Body.rotate(rect, (Math.random()-0.5)*0.5);
        return rect;

    }else if(window.SPLASH=="meta"){
    
        var rect = Bodies.rectangle(x+(Math.random()-0.5)*200, y, 200, 54);
        Matter.Body.rotate(rect, (Math.random()-0.5)*0.5);
        return rect;

    }else if(window.SPLASH=="journalism"){

        var thing = things[Math.floor(Math.random()*things.length)];
        var rect = Bodies.rectangle(x+(Math.random()-0.5)*100, y, thing.w, thing.h);
        Matter.Body.rotate(rect, (Math.random()-0.5)*0.5);
        rect._IMAGE_ = thing.img;
        return rect;

    }

});


World.add(engine.world, stack);


//////////////////////////////////
// ZE MOUSE //////////////////////
//////////////////////////////////

// add mouse control
var mouse = Mouse.create(canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.035,
            render: {
                visible: false
            }
        }
    });

mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

World.add(engine.world, mouseConstraint);

// run the engine
Engine.run(engine);
