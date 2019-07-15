"use strict";

class ref_Satellite{
	constructor(scene) {
		this.scene = scene;
        this.satelliteR = this.createREFSatellite();
        this.line = [];
        this.iscrashed = false;
        var d = new Date();
        var n = d.getTime();
        this.timenow = n;
        }
	
	createREFSatellite() {
        const scene = this.scene;
        var OneREFsatellite = BABYLON.MeshBuilder.CreateBox("OneREFsatellite", {}, scene);

        var Meterial_REFsate = new BABYLON.StandardMaterial("Meterial_REFsate", scene);
        Meterial_REFsate.diffuseColor = new BABYLON.Color3(0.9, 0.5, 0);
        OneREFsatellite.material = Meterial_REFsate;
        
        var solar1_r = BABYLON.MeshBuilder.CreatePlane("solar1_r", {height:0.75, width: 2.5, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
        solar1_r.parent = OneREFsatellite;
        solar1_r.position.x = 2;
        var solar2_r = BABYLON.MeshBuilder.CreatePlane("solar2_r", {height:0.75, width: 2.5, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
        solar2_r.parent=OneREFsatellite;
        solar2_r.position.x=-2;
        
        var msolars_r = new BABYLON.StandardMaterial("msolars_r", scene);
        //msolars_r.diffuseColor = new BABYLON.Color3(1, 0.8, 0.8);
        msolars_r.alpha = 0.5;
        solar1_r.material = msolars_r;
        solar2_r.material = msolars_r;
        
        this.nozzle1 = BABYLON.MeshBuilder.CreateCylinder("nozzle1", {height:0.3, diameterTop: 0.1, diameterBottom: 0.2, tessellation:6 , subdivisions: 1}, scene);
        this.nozzle1.parent = OneREFsatellite;
        this.nozzle1.rotation.x = -Math.PI/2;
        this.nozzle1.position.z = 0.55;

        this.nozzle2 = BABYLON.MeshBuilder.CreateCylinder("nozzle2", {height:0.3, diameterTop: 0.1, diameterBottom: 0.2, tessellation:6 , subdivisions: 1}, scene);
        this.nozzle2.parent = OneREFsatellite;
        this.nozzle2.rotation.x = Math.PI/2;
        this.nozzle2.position.z=-0.55;
        
        this.nozzle3 = BABYLON.MeshBuilder.CreateCylinder("nozzle3", {height:0.3, diameterTop: 0.1, diameterBottom: 0.2, tessellation:6 , subdivisions: 1}, scene);
        this.nozzle3.parent = OneREFsatellite;
        this.nozzle3.rotation.x = -Math.PI/2;
        this.nozzle3.rotation.y = Math.PI/2;
        this.nozzle3.position.x = 0.55;
        
        this.nozzle4 = BABYLON.MeshBuilder.CreateCylinder("nozzle4", {height:0.3, diameterTop: 0.1, diameterBottom: 0.2, tessellation:6 , subdivisions: 1}, scene);
        this.nozzle4.parent = OneREFsatellite;
        this.nozzle4.rotation.x = Math.PI/2;
        this.nozzle4.rotation.y = Math.PI/2;
        this.nozzle4.position.x = -0.55;
        
        return OneREFsatellite;
        }

    addSample(sample){
       
        this.x_r = sample.pos_x_r;
        this.z_r = sample.pos_z_r;
        this.r_r = Math.sqrt(this.x_r*this.x_r+this.z_r*this.z_r);
        var vx_r = sample.vx_r;
        var vz_r = sample.vz_r;
        
        if(this.r_r<=14.9){
             var d = new Date();
             var n = d.getTime();
             var interval = n-this.timenow;
             this.timenow = n;
             if(interval>2000){
             this.iscrashed = true;}
             
         }
        
        if(this.iscrashed == false){
        this.satelliteR.position.x = this.x_r;
        this.satelliteR.position.z = this.z_r;
        }
        
        this.theta_r = Math.atan(this.x_r/this.z_r);
        //this.satelliteR.rotation.y = theta_r+Math.PI/2;
        
        var inpos_r= new BABYLON.Vector3(this.satelliteR.position.x - vx_r,0,this.satelliteR.position.z - vz_r);
        var circle_r = BABYLON.MeshBuilder.CreateLines("circle_r", {points:[inpos_r,new BABYLON.Vector3(this.satelliteR.position.x,0,this.satelliteR.position.z)]},scene);
        this.line.push(circle_r);
        if (this.line.length>600){
            this.line.shift().dispose();
        }
        circle_r.color = new BABYLON.Color3(1, 1, 0.2);
    }
    
    resetLine(){
        for (var i=0; i<this.line.length; i++)
            {
                  this.line[i].dispose();
            }
        
        this.line.length = 0;
        var d = new Date();
        var n = d.getTime();
        this.timenow = n;
        this.iscrashed = false;
    }
    
    push_animation(){
        this.ps1 = new BABYLON.ParticleSystem("particlesm", 100, scene);
        this.ps1.particleTexture = new BABYLON.Texture("http://i166.photobucket.com/albums/u83/j1m68/star.jpg", scene);
        this.ps1.emitter = this.nozzle1;
        this.ps1.emitRate = 100;
        this.ps1.minLifeTime = 3;
        this.ps1.maxLifeTime = 7;
        this.ps1.updateSpeed = 0.3;
        this.ps1.minEmitBox = new BABYLON.Vector3(-0, -0, -0); // Starting all From
        this.ps1.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
        this.ps1.start();
        this.ps1.targetStopDuration = 10;
        //this.satelliteM.rotation.y = this.theta_m+Math.PI/2;
    }
    
    pull_animation(){
        this.ps2 = new BABYLON.ParticleSystem("particlesm", 100, scene);
        this.ps2.particleTexture = new BABYLON.Texture("http://i166.photobucket.com/albums/u83/j1m68/star.jpg", scene);
        this.ps2.emitter = this.nozzle2;
        this.ps2.emitRate = 100;
        this.ps2.minLifeTime = 3;
        this.ps2.maxLifeTime = 7;
        this.ps2.updateSpeed = 0.3;
        this.ps2.minEmitBox = new BABYLON.Vector3(-0, -0, -0); // Starting all From
        this.ps2.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
        this.ps2.start();
        this.ps2.targetStopDuration = 10;
        //this.satelliteM.rotation.y = this.theta_m+Math.PI/2;
    }
    
    begain_action(){
        this.satelliteR.rotation.y = this.theta_r+Math.PI/2;
    }
    
    end_action(){
        function sleep (time) {
            return new Promise((resolve) => setTimeout(resolve, time));
        };

        sleep(2000).then(() => {
            this.satelliteR.rotation.y = 0;
        });
    }
    
    explosion_start(){

        this.smokeSystem = new BABYLON.ParticleSystem("firem", 1000, scene);
	    this.smokeSystem.particleTexture = new BABYLON.Texture("lib/textures/flare.png", scene);
	    this.smokeSystem.emitter = this.satelliteR; // the starting object, the emitter
        this.smokeSystem.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5); // Starting all from
        this.smokeSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0, 0.5); // To...
	
	    this.smokeSystem.color1 = new BABYLON.Color4(0.1, 0.1, 0.1, 1.0);
        this.smokeSystem.color2 = new BABYLON.Color4(0.1, 0.1, 0.1, 1.0);
        this.smokeSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
	
	    this.smokeSystem.minSize = 0.3;
        this.smokeSystem.maxSize = 1;

        this.smokeSystem.minLifeTime = 0.3;
        this.smokeSystem.maxLifeTime = 1.5;

        this.smokeSystem.emitRate = 350;

        // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
        this.smokeSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

        this.smokeSystem.gravity = new BABYLON.Vector3(0, 0, 0);

        this.smokeSystem.direction1 = new BABYLON.Vector3(0.5*this.x_r, 0, 0.5*this.z_r);
        this.smokeSystem.direction2 = new BABYLON.Vector3(0.5*this.x_r, 0, 0.5*this.z_r);

        this.smokeSystem.minAngularSpeed = 0;
	    this.smokeSystem.maxAngularSpeed = Math.PI;

        this.smokeSystem.minEmitPower = 0.5;
        this.smokeSystem.maxEmitPower = 1.5;
        this.smokeSystem.updateSpeed = 0.005;

        this.smokeSystem.start();
        this.smokeSystem.targetStopDuration = 1;
        
        // Create a particle system
        this.fireSystem = new BABYLON.ParticleSystem("firem", 2000, scene);

        //Texture of each particle
        this.fireSystem.particleTexture = new BABYLON.Texture("lib/textures/flare.png", scene);

        // Where the particles come from
        this.fireSystem.emitter = this.satelliteR; // the starting object, the emitter
        this.fireSystem.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5); // Starting all from
        this.fireSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0, 0.5); // To...

        // Colors of all particles
        this.fireSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        this.fireSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        this.fireSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);

        // Size of each particle (random between...
        this.fireSystem.minSize = 0.3;
        this.fireSystem.maxSize = 1;

        // Life time of each particle (random between...
        this.fireSystem.minLifeTime = 0.2;
        this.fireSystem.maxLifeTime = 0.4;

        // Emission rate
        this.fireSystem.emitRate = 600;

        // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
        this.fireSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

        // Set the gravity of all particles
        this.fireSystem.gravity = new BABYLON.Vector3(0, 0, 0);

        // Direction of each particle after it has been emitted
        this.fireSystem.direction1 = new BABYLON.Vector3(0.5*this.x_r, 0, 0.5*this.z_r);
        this.fireSystem.direction2 = new BABYLON.Vector3(0.5*this.x_r, 0, 0.5*this.z_r);

        // Angular speed, in radians
        this.fireSystem.minAngularSpeed = 0;
        this.fireSystem.maxAngularSpeed = Math.PI;

        // Speed
        this.fireSystem.minEmitPower = 1;
        this.fireSystem.maxEmitPower = 3;
        this.fireSystem.updateSpeed = 0.007;

        // Start the particle system
        this.fireSystem.start();
        this.fireSystem.targetStopDuration = 1;
    }
    
    explosion_stop(){
        this.smokeSystem.stop();
        this.fireSystem.stop();
    }
    
    stop(){
        this.satelliteR.position.x = 0;
        this.satelliteR.position.z = 0;
    }
}
