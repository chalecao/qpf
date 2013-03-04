define(function(require){
	
	var XMLParser = require("core/xmlparser");
	var shaders =  require("./shaders");
	var ko = require("knockout");
	
	var viewportWidth = window.innerWidth;
	var viewportHeight = window.innerHeight;

	var viewModel = {
		left : viewportWidth-400,
		top : 100,
		spawnNumber : ko.observable(2),
		particleNumber : ko.observable(512) 
	};

	$.get("main.xml", function(xmlString){
		var dom = XMLParser.parse(xmlString);
		document.body.appendChild(dom);
		ko.applyBindings(viewModel, dom);
	}, "text");

	//-------------------------------------
	var renderer = new THREE.WebGLRenderer({
		canvas : document.getElementById('Viewport')
	});
	renderer.setSize(window.innerWidth, window.innerHeight);

	//main scene
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 2000);
	camera.position.z = 0.6;

	CurlNoise.setShaderStrings( shaders );
	var spawns = [];
	for(var i = 0; i < viewModel.spawnNumber(); i++){
		spawns.push(CurlNoise.spawn({
			size : viewModel.particleNumber(),
			position : new THREE.Vector3(Math.random()*4-2, Math.random()*4-2, 0),
			// color : new THREE.Color(0xffffff*Math.random())
		}))
	}			
	spawns.forEach(function(spawn){
		scene.add(spawn.particleSystem);
	})


	function run(){

		var startTime = Date.now();

		function step(timestamp){

			requestAnimationFrame(step);

			var now = Date.now();
			var delta = now - startTime;
			startTime = now;

			spawns.forEach(function(spawn){
				spawn.update(renderer, delta);
			})
			renderer.render(scene, camera);
		}

		step();
	}

	run();
})