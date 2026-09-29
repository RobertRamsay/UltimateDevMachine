// One-time project wiring; leaves the existing room and platform options intact.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = p => JSON.parse(readFileSync(new URL(p, root), 'utf8').replace(/,\s*([}\]])/g, '$1'));
const write = (p,v) => writeFileSync(new URL(p, root), JSON.stringify(v,null,2) + '\n');
const parent = {name:'UltimateDevMachine',path:'UltimateDevMachine.yyp'};
const resource = (type,name) => ({['$'+type]:'v1','%Name':name,name,resourceType:type,resourceVersion:'2.0'});
mkdirSync(new URL('scripts/ue_foundation/',root),{recursive:true});
mkdirSync(new URL('objects/obj_foundation/',root),{recursive:true});
write('scripts/ue_foundation/ue_foundation.yy',{...resource('GMScript','ue_foundation'),isCompatibility:false,isDnD:false,parent});
write('objects/obj_foundation/obj_foundation.yy',{
  ...resource('GMObject','obj_foundation'), '$GMObject':'', parent, spriteId:null, spriteMaskId:null,
  solid:false,visible:true,managed:true,persistent:false,parentObjectId:null,
  eventList:[[0,0],[3,0],[8,64]].map(([eventType,eventNum])=>({
    '$GMEvent':'v1','%Name':'',name:'',eventType,eventNum,isDnD:false,
    collisionObjectId:null,resourceType:'GMEvent',resourceVersion:'2.0'})),
  overriddenProperties:[],properties:[],physicsObject:false,physicsSensor:false,
  physicsShape:1,physicsDensity:0.5,physicsRestitution:0.1,physicsGroup:1,
  physicsLinearDamping:0.1,physicsAngularDamping:0.1,physicsFriction:0.2,
  physicsStartAwake:true,physicsKinematic:false,physicsShapePoints:[]
});
const project=read('UltimateDevMachine.yyp');
for (const [name,path] of [['ue_foundation','scripts/ue_foundation/ue_foundation.yy'],['obj_foundation','objects/obj_foundation/obj_foundation.yy']]) {
  if (!project.resources.some(r=>r.id.name===name)) project.resources.push({id:{name,path}});
}
project.IncludedFiles=[{'$GMIncludedFile':'','%Name':'foundation.json',name:'foundation.json',CopyToMask:-1,filePath:'datafiles',resourceType:'GMIncludedFile',resourceVersion:'2.0'}];
write('UltimateDevMachine.yyp',project);
const room=read('rooms/Room1/Room1.yy');
const name='inst_foundation';
room.instanceCreationOrder=[{name,path:'rooms/Room1/Room1.yy'}];
room.layers.find(l=>l.name==='Instances').instances=[{
  '$GMRInstance':'v4','%Name':name,name,colour:4294967295,frozen:false,
  hasCreationCode:false,ignore:false,imageIndex:0,imageSpeed:1,inheritCode:false,
  inheritedItemId:null,inheritItemSettings:false,isDnd:false,
  objectId:{name:'obj_foundation',path:'objects/obj_foundation/obj_foundation.yy'},
  properties:[],resourceType:'GMRInstance',resourceVersion:'2.0',rotation:0,
  scaleX:1,scaleY:1,x:0,y:0
}];
write('rooms/Room1/Room1.yy',room);
