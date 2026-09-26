import * as THREE from 'three';
import { USDLoader } from 'three/addons/loaders/USDLoader.js?v=2';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const $ = selector => document.querySelector(selector);
const section = $('.experience'), mount = $('#product-stage');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const pointer = new THREE.Vector2(), softPointer = new THREE.Vector2(), parts = {};
const smooth = x => { const v = THREE.MathUtils.clamp(x, 0, 1); return v*v*(3-2*v); };
const mix = THREE.MathUtils.lerp;
const chapters = [
  ['Muito além<br>do que se ouve.', 'Uma silhueta inconfundível. Explore os materiais e as camadas que dão forma ao som.'],
  ['Leveza em<br>cada curva.', 'O arco de aço inoxidável encontra a malha respirável. Estrutura e suavidade, em equilíbrio.'],
  ['Conforto,<br>camada a camada.', 'Alumínio, tecido e espuma viscoelástica. Um encontro de texturas que você sente antes da primeira música.'],
  ['Maciez que<br>se adapta.', 'A espuma viscoelástica é envolvida em tecido de malha. As almofadas magnéticas se acomodam ao redor das orelhas.'],
  ['O detalhe<br>está no encaixe.', 'As almofadas se conectam magneticamente à concha. Um encaixe preciso que permite remover e recolocar cada uma.'],
  ['Precisão<br>por fora.', 'Alumínio anodizado, curvas contínuas e uma Digital Crown para ajustar o volume com precisão.'],
  ['Tudo em<br>perfeita sintonia.', 'Cada curva, cada textura, cada encaixe. Detalhes que fazem parte de uma experiência inteira.']
];
// Absolute poses keep forward and reverse scroll identical, with no accumulated transforms.
const poses = [
  { at:0, ry:-.12, rz:-.045, rx:.035, open:0, macro:0, slices:0 },
  { at:.23, ry:Math.PI*2-.12, rz:-.035, rx:.07, open:0, macro:0, slices:0 },
  { at:.36, ry:Math.PI*2-.60, rz:-.045, rx:.10, open:.26, macro:0, slices:0 },
  { at:.48, ry:Math.PI*2-.92, rz:-.02, rx:.08, open:1, macro:0, slices:0 },
  { at:.54, ry:Math.PI*2-.50, rz:-.02, rx:.06, open:1, macro:0, slices:0 },
  { at:.61, ry:Math.PI*2+.72, rz:.52, rx:-.05, open:1, macro:1, slices:.28 },
  { at:.66, ry:Math.PI*2+.72, rz:.52, rx:-.05, open:1, macro:1, slices:.28 },
  { at:.73, ry:Math.PI*2+.82, rz:.52, rx:-.08, open:1, macro:1, slices:.65 },
  { at:.77, ry:Math.PI*2+.82, rz:.52, rx:-.08, open:1, macro:1, slices:.65 },
  { at:.84, ry:Math.PI*2+.65, rz:.52, rx:-.06, open:1, macro:1, slices:1 },
  { at:.87, ry:Math.PI*2+.65, rz:.52, rx:-.06, open:1, macro:1, slices:1 },
  { at:.93, ry:Math.PI*2+.2, rz:.02, rx:.035, open:1, macro:0, slices:0 },
  { at:.995, ry:Math.PI*2+.08, rz:.02, rx:.035, open:0, macro:0, slices:0 },
  { at:1, ry:Math.PI*2+.08, rz:.02, rx:.035, open:0, macro:0, slices:0 }
];
let renderer, camera, scene, model, frame=0, previousChapter=-1;
let viewport={w:innerWidth,h:innerHeight}, progress=0, inView=false;
const ui={number:$('.chapter-number'),title:$('.chapter-copy h2'),copy:$('.chapter-copy p'),block:$('.chapter-copy'),line:$('.callout-lines'),path:$('.callout-lines path'),dot:$('.callout-lines circle'),label:$('.material-label')};

function requestFrame(){if(!frame&&!document.hidden)frame=requestAnimationFrame(render);}
function resize(){
  viewport={w:mount.clientWidth,h:mount.clientHeight};
  if(camera&&renderer){const aspect=viewport.w/viewport.h;camera.left=-2*aspect;camera.right=2*aspect;camera.top=2;camera.bottom=-2;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,viewport.w<600?1.4:1.6));renderer.setSize(viewport.w,viewport.h);}
  updateScroll();
}
function updateScroll(){
  progress=THREE.MathUtils.clamp((scrollY-section.offsetTop)/(section.offsetHeight-viewport.h),0,1);
  const rect=section.getBoundingClientRect();inView=rect.top<viewport.h&&rect.bottom>0;
  $('.chapter-progress span').style.transform=`scaleX(${progress})`;
  $('.stage-percent').textContent=String(Math.round(progress*100)).padStart(2,'0');
  updateCopy();requestFrame();
}
function updateCopy(){
  const index=progress<.26?0:progress<.39?1:progress<.54?2:progress<.67?3:progress<.78?4:progress<.88?5:6;
  if(index!==previousChapter){ui.title.innerHTML=chapters[index][0];ui.copy.textContent=chapters[index][1];ui.number.textContent=index>=3&&index<=5?`POR DENTRO / 0${index-2}`:`0${index+1} / 07`;previousChapter=index;}
  const distance=Math.min(...[.26,.39,.54,.67,.78,.88].map(p=>Math.abs(progress-p)));
  const fade=reduceMotion.matches?1:.15+.85*smooth(distance/.014);
  ui.block.style.opacity=fade;ui.block.style.transform=`translateY(${(1-fade)*10}px)`;
  $('.experience-type').style.opacity=1-smooth(progress/.22)*.8;
}
function samplePose(p){
  let a=poses[0],b=poses[1];for(let i=0;i<poses.length-1;i++)if(p>=poses[i].at){a=poses[i];b=poses[i+1];}
  const t=smooth((p-a.at)/(b.at-a.at));return Object.fromEntries(['ry','rz','rx','open','macro','slices'].map(k=>[k,mix(a[k],b[k],t)]));
}
function move(name,x,y,z,e,rotation=0){
  const part=parts[name];if(!part)return;
  part.position.copy(part.userData.home).addScaledVector(new THREE.Vector3(x,y,z),e);part.rotation.z=rotation*e;
}
function poseParts(e){
  move('band',-.13,.16,-.07,e,-.06);move('canopy',-.13,.34,-.07,e,-.06);
  move('leftCup',-.19,-.10,-.07,e,-.07);move('leftPad',-.10,-.10,.11,e,-.07);
  move('rightCup',.43,-.09,0,e,.06);move('rightTrim',.25,-.02,.03,e,.06);
  move('rightPlate',.06,.05,.06,e,.06);move('rightPad',-.18,.14,.10,e,.06);
  move('crown',.43,.06,0,e,.06);
}
function poseSlices(pose,mobile){
  const spread=.25+pose.slices*.75;
  const offsets=mobile?{rightCup:[.25,-.14,0],rightTrim:[.11,.04,.025],rightPlate:[-.04,.22,.05],rightPad:[-.22,.45,.08],crown:[.28,.0,0]}:{rightCup:[.43,-.14,0],rightTrim:[.16,.015,.025],rightPlate:[-.10,.165,.05],rightPad:[-.43,.35,.08],crown:[.47,.06,0]};
  for(const [name,offset] of Object.entries(offsets)){
    const part=parts[name];if(!part)continue;
    const target=part.userData.home.clone().addScaledVector(new THREE.Vector3(...offset),spread);
    part.position.lerp(target,pose.macro);part.rotation.z*=1-pose.macro;
  }
  for(const name of ['band','canopy','leftCup','leftPad']){
    const part=parts[name];if(!part)continue;
    part.visible=pose.macro<.999;
    part.traverse(o=>{if(!o.isMesh)return;const alpha=1-pose.macro;o.material.opacity=alpha*o.userData.originalOpacity;o.material.transparent=alpha<1||o.userData.originalTransparent;o.material.depthWrite=alpha>.5;});
  }
}
function render(){
  frame=0;softPointer.lerp(pointer,.12);
  if(!reduceMotion.matches){$('.hero-product').style.transform=`translate3d(${softPointer.x*9}px,${softPointer.y*6}px,0)`;$('.hero-macro').style.transform=`translate3d(${-softPointer.x*13}px,${-softPointer.y*8}px,0)`;}
  if(model&&inView){
    const mobile=viewport.w<600,p=reduceMotion.matches?[0,.36,.48,.64,.75,.85,1][previousChapter]:progress,pose=samplePose(p);poseParts(pose.open);poseSlices(pose,mobile);
    model.rotation.set(pose.rx+softPointer.y*.025,pose.ry+softPointer.x*.06,mix(pose.rz,-.40,mobile?pose.macro:0));
    // Fit the transformed parts, not only the assembled headphone, so no layer clips on mobile.
    model.scale.setScalar(1);model.position.set(0,0,0);model.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
    const detailBounds=new THREE.Box3();for(const name of ['rightCup','rightTrim','rightPlate','rightPad','crown'])if(parts[name])detailBounds.expandByObject(parts[name]);
    size.lerp(detailBounds.getSize(new THREE.Vector3()),pose.macro);center.lerp(detailBounds.getCenter(new THREE.Vector3()),pose.macro);
    const height=4,width=4*viewport.w/viewport.h;
    const scale=Math.min(height*(mobile?.43:.75)/size.y,width*(mobile?.87:.58)/size.x);
    model.scale.setScalar(scale);model.position.copy(center).multiplyScalar(-scale).add(new THREE.Vector3(width*(mobile?0:-.17),height*(mobile?.20:-.015),0));
    model.updateMatrixWorld(true);camera.updateMatrixWorld(true);drawCallout(pose);renderer.render(scene,camera);
  }
  if(pointer.distanceTo(softPointer)>.002)requestFrame();
}
function drawCallout(pose){
  const mobile=viewport.w<600,canopy=progress>=.29&&progress<.39,pad=progress>=.43&&progress<.54,macro=progress>=.59&&progress<.88;
  const selected=previousChapter===4?'rightPlate':previousChapter===5?'rightCup':'rightPad';
  const part=parts[canopy?'canopy':macro?selected:'rightPad'];
  const opacity=canopy?smooth((progress-.29)/.025)*(1-smooth((progress-.37)/.02)):pad?smooth((progress-.43)/.025)*(1-smooth((progress-.52)/.02)):macro?pose.macro:0;
  ui.line.style.opacity=opacity;ui.label.style.opacity=opacity;if(!part||!opacity)return;
  const anchor=new THREE.Vector3(0,canopy?.015:.06,canopy?.02:.1);part.localToWorld(anchor);anchor.project(camera);
  const x=(anchor.x*.5+.5)*viewport.w,y=(-anchor.y*.5+.5)*viewport.h;
  const endX=viewport.w*(mobile?.12:.11),endY=viewport.h*(mobile?(canopy?.105:.53):(canopy?.16:.77));
  ui.label.textContent=canopy?'Malha respirável':macro?(previousChapter===4?'Encaixe magnético':previousChapter===5?'Alumínio anodizado':'Almofada em tecido de malha'):'Tecido e espuma viscoelástica';ui.label.style.left=`${endX}px`;ui.label.style.top=`${endY-23}px`;
  ui.path.setAttribute('d',`M ${x} ${y} L ${endX+48} ${endY} L ${endX} ${endY}`);ui.dot.setAttribute('cx',x);ui.dot.setAttribute('cy',y);
}
function ancestorNames(mesh){const names=[];let p=mesh;while(p){names.push(p.name);p=p.parent;}return names;}
function partName(mesh){
  const names=ancestorNames(mesh),name=mesh.name;
  if(names.includes('JjKVtwdjSQdCKHl'))return 'canopy';
  if(names.includes('hBURqLjPIDRbbZP'))return 'band';
  if(names.includes('ziSQFTXXZsWWCQr'))return 'leftPad';
  if(names.includes('BKzYzYUwqbzjmei'))return 'leftCup';
  if(names.includes('CzXQVvrzlSXpCZf'))return 'rightPad';
  if(['SyVSojihMXRRDQS','EanmGUcqgNIWhbE'].includes(name))return 'crown';
  if(name==='jRRzRRtRgiueTBu')return 'rightTrim';
  if(['qvDSumHMkLUGcbo','PEXpfFyZVAqKvlo','UzZFPQyevnNcmzs','KjseTHcTVutoQqu','nDuTpWAXTFQplsn','gEKYRmpHezcBUXD'].includes(name))return 'rightPlate';
  return 'rightCup';
}
function organizeModel(raw){
  raw.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(raw),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),meshes=[];
  raw.traverse(o=>{if(o.isMesh)meshes.push({mesh:o,part:partName(o),matrix:o.matrixWorld.clone()});});
  model=new THREE.Group();const materials=new Set();
  for(const {mesh,part,matrix} of meshes){
    if(!parts[part]){parts[part]=new THREE.Group();parts[part].name=part;model.add(parts[part]);}
    mesh.geometry.applyMatrix4(matrix).translate(-center.x,-center.y,-center.z).scale(1/size.y,1/size.y,1/size.y);
    mesh.position.set(0,0,0);mesh.quaternion.identity();mesh.scale.set(1,1,1);mesh.matrix.identity();mesh.matrixAutoUpdate=true;parts[part].add(mesh);
    mesh.material=mesh.material.clone();mesh.userData.originalOpacity=mesh.material.opacity;mesh.userData.originalTransparent=mesh.material.transparent;
    const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];mats.forEach(mat=>materials.add(mat));
  }
  for(const part of Object.values(parts)){
    const pivot=new THREE.Box3().setFromObject(part).getCenter(new THREE.Vector3());
    part.children.forEach(mesh=>mesh.geometry.translate(-pivot.x,-pivot.y,-pivot.z));part.position.copy(pivot);part.userData.home=pivot.clone();
  }
  for(const mat of materials){
    for(const key of ['map','normalMap','roughnessMap','metalnessMap'])if(mat[key])mat[key].anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    // Match the connected shell surface in Apple's USD, which also contains disconnected preview shaders.
    if(mat.name==='MTRHhwhohJSiUDc'){mat.color.setRGB(.28543872,.39071435,.5194114);mat.emissive.setRGB(.021012217,.04079916,.073238954);mat.metalness=1;mat.envMapIntensity=1.5;}
    if(mat.name==='AzTHNcTldyIRZgQ'){mat.color.setRGB(.020255517,.061656322,.13286829);mat.emissive.setRGB(0,0,0);mat.envMapIntensity=.6;}
    mat.needsUpdate=true;
  }
  scene.add(model);
}
async function initialize(){
  try{
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.setClearColor(0x000000,0);mount.append(renderer.domElement);
    camera=new THREE.OrthographicCamera(-2,2,2,-2,.1,100);camera.position.set(0,0,8);scene=new THREE.Scene();
    const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;scene.environmentIntensity=.9;room.dispose();pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xe8f6ff,0x9cbbc7,.5));
    const key=new THREE.DirectionalLight(0xffffff,1.8);key.position.set(-4,6,6);scene.add(key);
    const fill=new THREE.DirectionalLight(0xe0f1ff,1.2);fill.position.set(5,2,-4);scene.add(fill);
    const raw=await new USDLoader().loadAsync('/assets/airpods-max.usdz');organizeModel(raw);mount.classList.add('model-ready');resize();
    renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();mount.classList.remove('model-ready');});
    renderer.domElement.addEventListener('webglcontextrestored',()=>{mount.classList.add('model-ready');requestFrame();});
  }catch(error){console.error('Não foi possível iniciar a experiência 3D.',error);renderer?.domElement.remove();mount.classList.add('model-fallback');}
}
addEventListener('scroll',updateScroll,{passive:true});addEventListener('resize',resize,{passive:true});
addEventListener('pointermove',event=>{if(reduceMotion.matches||event.pointerType!=='mouse')return;pointer.set(event.clientX/innerWidth*2-1,event.clientY/innerHeight*2-1);requestFrame();},{passive:true});
document.addEventListener('pointerleave',()=>{pointer.set(0,0);requestFrame();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestFrame();});
reduceMotion.addEventListener('change',()=>{pointer.set(0,0);softPointer.set(0,0);updateScroll();});
document.querySelectorAll('a[href="#explorar"]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();const fractions=[0,.34,.64],chapter=Number(link.dataset.chapter||0);history.replaceState(null,'','#explorar');scrollTo({top:section.offsetTop+(section.offsetHeight-mount.clientHeight)*fractions[chapter],behavior:reduceMotion.matches?'instant':'smooth'});
}));
resize();initialize();
