class car{
    constructor(x,y,width,height,controlType,maxSpeed=3){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
     
        this.speed=0;
        this.acceleration=0.2;
        this.maxspeed=3;
        this.friction=0.05;
        this.angle=0;
        this.damage=false;

        this.useBrain=controlType=="AI";

        if(controlType!="DUMMY"){
            this.sensor=new Sensor(this);
            this.brain=new NeuralNetwork(
                [this.sensor.rayCount,6,4]
            ); 
        }
        this.controls=new controls(controlType);
    }

    update(roadBorders, traffic){
        if(!this.damaged){
            this.#move();
            this.polygon=this.#craetePolygon();
            this.damage=this.#assessDamage(roadBorders, traffic);
        }if(this.sensor){
            this.sensor.update(roadBorders, traffic);
            const offsets=this.sensor.readings.map(
                s=>s==null?0:1-s.offsets
            );
            const outputs=NeuralNetwork.feedForward(offsets,this.brain);
            console.log(outputs);

            if(this.useBrain){
                this.controls.forward=outputs[0];
                this.controls.left=outputs[1];
                this.controls.right=outputs[2];
                this.controls.reverse=outputs[3];
            }
        }
    }

    #assessDamage(roadBorders,traffic){
        for(let i=0;i<roadBorders.length;i++){
            if(polysIntersect(this.polygon,roadBorders[i])){
                return true;
            }
        }
        for(let i=0;i<traffic.length;i++){
            if(polysIntersect(this.polygon,traffic[i].polygon)){
                return true;
            }
        }
        return false
    }

    #craetePolygon(){
        const points=[];
        const rad=Math.hypot(this.width,this.height)/2;
        const alpha=Math.atan2(this.width,this.height);
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        });
        return points;
    }

    #move(){
        
        if(this.controls.forward){
            this.speed+=this.acceleration;
        }
        if(this.controls.reverse){
            this.speed-=this.acceleration;
        }
        if(this.speed>this.maxspeed){
            this.speed=this.maxspeed;
        }
        if(this.speed<-this.maxspeed/2){
            this.speed=-this.maxspeed/2;
        }
        if(this.speed>0){
            this.speed-=this.friction;
        }
        if(this.speed<0){
            this.speed+=this.friction;
        }
        if(Math.abs(th.speed)<this.friction){
            this.speed=0;
        }
        if(this.speed!=0){
            const flip=this.speed>0?1:-1;
        }
        if(this.controls.left){
            this.angle+=0.03*flip;
        }
        if(this.controls.right){
            this.angle-=0.03*flip;
        }

        this.x-=Math.sin(this.angle)*this.speed;
        this.y-Math.cos(this.angle)*this.speed;
    }
    draw(ctx,color,drawSensor=false){
        if(this.damaged,color){
            ctx.fillStyle="grey";
        }else{
            ctx.fillStyle=color;
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x,this.polygon[0].y);
        for(let i=1;i<this.polygon.length;i++){
            ctx.lineTo(this.polygon[i].x,this.polygon[1].y);
        }
        ctx.fill();

        if(this.sensor && drawSensor){
            this.sensor.draw(ctx)
        }
        
    }
}