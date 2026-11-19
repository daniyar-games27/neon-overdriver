import * as THREE from 'three';

const MAT = {
  dark: new THREE.MeshStandardMaterial({color:0x111827,metalness:.7,roughness:.35}),
  armor: new THREE.MeshStandardMaterial({color:0x26364c,metalness:.8,roughness:.25}),
  cyan: new THREE.MeshStandardMaterial({color:0x00eaff,emissive:0x00aabb,emissiveIntensity:2}),
  visor: new THREE.MeshStandardMaterial({color:0x061b2b,emissive:0x007caa,emissiveIntensity:1.3,metalness:.8})
};

function part(parent, geometry, material, position, name){
  const mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(...position); mesh.castShadow=true; mesh.receiveShadow=true;
  if(name) mesh.name=name;
  parent.add(mesh); return mesh;
}

export function createPlayer(scene){
  const root=new THREE.Group(); root.name='ZERO';
  const parts={};
  parts.body=new THREE.Group(); root.add(parts.body);
  part(parts.body,new THREE.BoxGeometry(.8,1.05,.42),MAT.dark,[0,1.45,0],'torso');
  part(parts.body,new THREE.BoxGeometry(.68,.28,.46),MAT.armor,[0,1.8,-.02]);
  part(parts.body,new THREE.SphereGeometry(.12,12,12),MAT.cyan,[0,1.52,.24]);
  parts.head=new THREE.Group(); parts.head.position.y=2.25; parts.body.add(parts.head);
  part(parts.head,new THREE.SphereGeometry(.31,16,12),MAT.dark,[0,0,0]);
  part(parts.head,new THREE.BoxGeometry(.48,.13,.08),MAT.visor,[0,.02,.27]);
  part(parts.body,new THREE.BoxGeometry(.18,.5,.22),MAT.armor,[-.48,1.45,0]);
  part(parts.body,new THREE.BoxGeometry(.18,.5,.22),MAT.armor,[.48,1.45,0]);
  parts.leftArm=new THREE.Group(); parts.leftArm.position.set(-.52,1.75,0); parts.body.add(parts.leftArm);
  parts.rightArm=new THREE.Group(); parts.rightArm.position.set(.52,1.75,0); parts.body.add(parts.rightArm);
  for(const [arm,sign] of [[parts.leftArm,-1],[parts.rightArm,1]]){
    part(arm,new THREE.BoxGeometry(.2,.62,.22),MAT.dark,[0,-.28,0]);
    part(arm,new THREE.BoxGeometry(.22,.22,.25),MAT.cyan,[0,-.58,.02]);
  }
  parts.leftLeg=new THREE.Group(); parts.leftLeg.position.set(-.22,.95,0); parts.body.add(parts.leftLeg);
  parts.rightLeg=new THREE.Group(); parts.rightLeg.position.set(.22,.95,0); parts.body.add(parts.rightLeg);
  for(const leg of [parts.leftLeg,parts.rightLeg]){
    part(leg,new THREE.BoxGeometry(.27,.62,.3),MAT.armor,[0,-.3,0]);
    part(leg,new THREE.BoxGeometry(.3,.18,.48),MAT.dark,[0,-.63,.08]);
    part(leg,new THREE.BoxGeometry(.29,.07,.06),MAT.cyan,[0,-.1,.16]);
  }
  part(parts.body,new THREE.BoxGeometry(.52,.62,.2),MAT.dark,[0,1.55,-.31]);
  root.position.set(0,0,0);
  root.userData.animationParts=parts;
  scene.add(root);
  return root;
}

export function updatePlayerAnimation(player,delta,state='run',speed=1){
  if(!player?.userData.animationParts)return;
  const p=player.userData.animationParts; player.userData.animTime=(player.userData.animTime||0)+delta*speed*8;
  const t=player.userData.animTime;
  if(state==='slide'){
    p.body.rotation.x=.55; p.body.position.y=-.35;
    p.leftLeg.rotation.x=-.8;p.rightLeg.rotation.x=-.8;
    p.leftArm.rotation.x=.5;p.rightArm.rotation.x=.5;
  }else if(state==='jump'){
    p.body.rotation.x=-.08;p.body.position.y=.12;
    p.leftLeg.rotation.x=-.45;p.rightLeg.rotation.x=.35;
    p.leftArm.rotation.x=-.7;p.rightArm.rotation.x=-.7;
  }else{
    p.body.rotation.x=0;p.body.position.y=Math.abs(Math.sin(t*2))*.035;
    p.leftLeg.rotation.x=Math.sin(t)*.75;p.rightLeg.rotation.x=-Math.sin(t)*.75;
    p.leftArm.rotation.x=-Math.sin(t)*.55;p.rightArm.rotation.x=Math.sin(t)*.55;
  }
  p.head.rotation.y=Math.sin(t*.5)*.035;
}
export function setPlayerColor(player,color){
  if(!player)return;
  player.traverse(o=>{if(o.material===MAT.cyan) o.material.color.set(color);});
}
export function removePlayer(player,scene){if(player&&scene)scene.remove(player);}
