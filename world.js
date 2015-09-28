/*
 *  build by rhj 2015/09/27
 */
function World(id){
    //各部件Obj
    this.container = document.getElementById(id);
    this.renderer  = null;
    this.scene     = null;
    this.camera    = null;
    this.light     = null;
    this.world     = null;
    this.cloud     = null;

    //常量
    this.constObj  = {
        ANGLE_INCLINED      : Math.PI / 6,
        ROTATION_WORLD_RATE : 0.001,
        ROTATION_CLOUD_RATE : 0.0012,
        FIELD_OF_VIEW       : 45,
        NEAR_CLIPPING_PLANE : 1,
        FAR_CLIPPING_PLANE  : 10,
        WORLD_SHININESS     : 15,

        //云层高约10km，地球半径6371km，云层球体半径R=(6371+10)/6371≈1.0016
        WORLD_RADIUS        : 1,
        CLOUD_RADIUS        : 1.0016,
        GLOBE_RESOLUTION    : 64
    }
}

World.prototype.initRender = function(){
    var container = this.container;
    var renderer  = null;

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(container.offsetWidth, container.offsetHeight);

    this.renderer = renderer;
    this.container.appendChild( this.renderer.domElement );
}

World.prototype.initScene = function(){
    this.scene = new THREE.Scene();
}

World.prototype.initCamera = function(){
    var container = this.container;
    var CONST     = this.constObj;
    var camera    = null;

    camera = new THREE.PerspectiveCamera(
        CONST.FIELD_OF_VIEW, 
        container.offsetWidth/container.offsetHeight,
        CONST.NEAR_CLIPPING_PLANE, 
        CONST.FAR_CLIPPING_PLANE
    );
    //相机坐标
    camera.position.set(0, 0, 3);

    this.camera = camera;

    this.scene.add(this.camera);
}

World.prototype.initLight = function(){
    var light = null;

    light = new THREE.DirectionalLight(0xffffff, 1.5);
    //光源坐标
    light.position.set(0, 0, 1);

    this.light = light;

    this.scene.add(this.light);
}

World.prototype.initWorld = function(){
    var shader   = null;
    var uniforms = null;
    var material = null;
    var geometry = null;

    var CONST = this.constObj;

    var surfaceMap  = THREE.ImageUtils.loadTexture("images/earth_surface.jpg");
    var normalMap   = THREE.ImageUtils.loadTexture("images/earth_normal.jpg");
    var specularMap = THREE.ImageUtils.loadTexture("images/earth_specular.jpg");

    shader   = THREE.ShaderUtils.lib["normal"];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    //法线贴图、漫反射贴图、高光贴图
    uniforms["tNormal"].texture   = normalMap;
    uniforms["tDiffuse"].texture  = surfaceMap;
    uniforms["tSpecular"].texture = specularMap;

    uniforms["enableAO"].value       = false;
    uniforms["enableDiffuse"].value  = true;
    uniforms["enableSpecular"].value = true;

    //物体表面光滑度
    uniforms["uShininess"].value = CONST.WORLD_SHININESS;

    //着色器
    material = new THREE.ShaderMaterial({
        fragmentShader : shader.fragmentShader,
        vertexShader   : shader.vertexShader,
        uniforms       : uniforms,
        lights         : true
    });
    
    //球体网格(半径、纬线顶点数、经线顶点数)
    geometry = new THREE.SphereGeometry(CONST.WORLD_RADIUS, CONST.GLOBE_RESOLUTION, CONST.GLOBE_RESOLUTION);
    geometry.computeTangents();

    world = new THREE.Mesh(geometry, material);
    
    world.rotation.x = CONST.ANGLE_INCLINED;
    world.rotation.y = CONST.ANGLE_INCLINED;

    this.world = world;

    this.scene.add(this.world);
}

World.prototype.initCloud = function(){
    var cloudsMap      = null;
    var cloudsMaterial = null;
    var cloudsGeometry = null;

    var CONST = this.constObj;

    cloudsMap      = THREE.ImageUtils.loadTexture("images/earth_clouds.png");
    cloudsMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, map: cloudsMap, transparent: true});

    //云层球体网格(半径、纬线顶点数、经线顶点数)
    cloudsGeometry = new THREE.SphereGeometry(CONST.CLOUD_RADIUS, CONST.GLOBE_RESOLUTION, CONST.GLOBE_RESOLUTION);
    cloud          = new THREE.Mesh(cloudsGeometry, cloudsMaterial);

    cloud.rotation.y = CONST.ANGLE_INCLINED;

    this.cloud = cloud;

    this.scene.add(this.cloud);
}

World.prototype.build = function(){
    this.initRender();
    this.initScene();
    this.initCamera();
    this.initLight();
    this.initWorld();
    this.initCloud();
}

World.prototype.rotate = function(self){
    var CONST = self.constObj;

    self.renderer.render(self.scene, self.camera);
    self.world.rotation.y += CONST.ROTATION_WORLD_RATE;
    self.cloud.rotation.y += CONST.ROTATION_CLOUD_RATE;
    requestAnimationFrame( function(){ self.rotate(self); } );

    console.log(1);
}
