"use strict";

class ref_SatelliteW {
	constructor(scene) {
	this.scene = scene;
        this.satelliteRW = this.createREFSatellite();
        this.line = [];
        }
	
	createREFSatellite() {
        const scene = this.scene;
        var OneREFsatellite = BABYLON.MeshBuilder.CreateBox("OneREFsatellite", {}, scene);
        
        var Meterial_REFsate = new BABYLON.StandardMaterial("Meterial_REFsate", scene);
        Meterial_REFsate.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
        Meterial_REFsate.alpha = 0.5;
        OneREFsatellite.material = Meterial_REFsate;
        
        var solar1_r = BABYLON.MeshBuilder.CreatePlane("solar1_r", {height:0.75, width: 2.5, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
        solar1_r.parent = OneREFsatellite;
        solar1_r.position.x = 2;
        var solar2_r = BABYLON.MeshBuilder.CreatePlane("solar2_r", {height:0.75, width: 2.5, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
        solar2_r.parent=OneREFsatellite;
        solar2_r.position.x=-2;
        
        var msolars_r = new BABYLON.StandardMaterial("msolars_r", scene);
        //msolars_r.diffuseColor = new BABYLON.Color3(0, 0.5, 1);
        msolars_r.alpha = 0.5;
        solar1_r.material = msolars_r;
        solar2_r.material = msolars_r;
        
        return OneREFsatellite;
        }

    addSample(sample){
        
        var r = sample.hr;
        var theta = sample.theta;
        var w_0 = sample.w;
        var vx_r = w_0*r*Math.sin(theta);
        var vz_r = w_0*r*Math.cos(theta);
        var x_r = r*Math.sin(theta);
        var z_r = r*Math.cos(theta);
       
        this.satelliteRW.position.x = x_r;
        this.satelliteRW.position.z = z_r;
        
        var theta_r = theta;
        //this.satelliteRW.rotation.y = theta_r+Math.PI/2;
        
        var inpos_r= new BABYLON.Vector3(this.satelliteRW.position.x - vx_r,0,this.satelliteRW.position.z - vz_r);
        var circle_r = BABYLON.MeshBuilder.CreateLines("circle_r", {points:[inpos_r,new BABYLON.Vector3(this.satelliteRW.position.x,0,this.satelliteRW.position.z)]},scene);
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
    }
}
