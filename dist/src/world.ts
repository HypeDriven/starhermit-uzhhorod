import {scene,renderer,Color,Group,Mesh,PlaneGeometry,MeshBasicMaterial,OrthographicCamera,TextureLoader,GLTFLoader,AmbientLight,DirectionalLight,Box3,Vector3,SRGBColorSpace,NoToneMapping} from 'starhermit:scene';
import type {RiverState} from './river.js';
const camera=new OrthographicCamera(-720,720,450,-450,.1,3000),boat=new Group();
const backgrounds:Mesh<MeshBasicMaterial>[]=[];
let cameraX=720,visibleWidth=1440;
let hull:Group|null=null;
export let worldReady=false,worldError='';
export async function createWorld(){
 renderer.camera=camera;renderer.antialias='fxaa';renderer.toneMapping=NoToneMapping;
 scene.background=new Color('#122d33');camera.position.set(0,0,1000);camera.lookAt(0,0,0);
 scene.add(new AmbientLight(0xdbe5e0,2.1));const sun=new DirectionalLight(0xffdec1,2.6);sun.position.set(-300,600,900);scene.add(sun);
 try{
  const loader=new TextureLoader();
  for(const name of ['quay','garden','bridge']){
   const texture=await loader.loadAsync('assets/'+name+'.webp');
   texture.colorSpace=SRGBColorSpace;
   const material=new MeshBasicMaterial({map:texture,toneMapped:false});
   const plane=new Mesh(new PlaneGeometry(1440,960),material);plane.position.z=-100;plane.visible=backgrounds.length===0;scene.add(plane);backgrounds.push(plane);
  }
  const gltf=await new GLTFLoader().loadAsync('assets/mailboat.glb');
  const bounds=new Box3().setFromObject(gltf.scene),size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3());
  gltf.scene.position.sub(center);const cradle=new Group();cradle.add(gltf.scene);
  const scale=115/Math.max(size.x,size.y,size.z);cradle.scale.setScalar(scale);
  cradle.rotation.set(.88,Math.PI/2,0);hull=cradle;boat.add(cradle);scene.add(boat);worldReady=true;
 }catch(error){worldError=String(error);console.error('Could not prepare river scene:',worldError);}
}
export function updateWorld(s:RiverState,w:number,h:number,dt:number,title:boolean){
 visibleWidth=Math.min(1900,900*w/h);
 const desired=title?720:Math.max(visibleWidth/2,Math.min(1440-visibleWidth/2,s.x));
 cameraX+=(desired-cameraX)*Math.min(1,dt*5);if(visibleWidth>=1440)cameraX=720;
 camera.left=-visibleWidth/2;camera.right=visibleWidth/2;camera.updateProjectionMatrix();camera.position.x=cameraX-720;
 backgrounds.forEach((mesh,i)=>{mesh.visible=i===s.chapter;mesh.scale.x=Math.max(1,visibleWidth/1440);});
 boat.position.set(s.x-720,450-s.y+Math.sin(s.time*1.7)*2,0);
 boat.rotation.z=Math.sin(s.time*1.3)*.025-s.vy*.001;
 if(hull)hull.rotation.y=Math.PI/2+Math.sin(s.time*.7)*.035+(s.vx< -15?Math.PI:0);
}
export function screenPoint(x:number,y:number,w:number,h:number){return{x:(x-cameraX)/visibleWidth*w+w/2,y:y/900*h};}
export function riverPoint(x:number,y:number,w:number,h:number){return{x:(x-w/2)/w*visibleWidth+cameraX,y:y/h*900};}
