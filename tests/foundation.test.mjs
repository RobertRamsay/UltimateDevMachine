import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { foundationRecipe, assemble } from '../tools/foundation.mjs';

// Instruction-level harness, not a cycle-accurate emulator. KERNAL and REU are
// simulated to exercise actual generated branches and cleanup paths.
function run({reu=true, signature=0xc9, key=0x52, corruptTransfer=0, noCompletion=0}={}) {
  const {bytes,labels}=assemble(foundationRecipe());
  const ram=new Uint8Array(65536), expansion=Uint8Array.from({length:256},(_,i)=>(i*7+19)&255);
  const original=expansion.slice(), registers=Uint8Array.from({length:9},(_,i)=>i+10);
  ram.set(bytes.subarray(2),0x0801); ram.set(registers,0xdf02);
  let a=0,x=0,z=false,n=false,pc=labels.start, transfers=0,text='',steps=0;
  const calls=[], stack=[], writes=[];
  const flag=v=>{v&=255;z=v===0;n=!!(v&128);return v;};
  const read=addr=>{
    if(addr===0xdf1d) return signature;
    if(addr>=0xdf00&&addr<=0xdf0a&&!reu) return 255;
    const v=ram[addr]; if(addr===0xdf00)ram[addr]=0; return v;
  };
  const write=(addr,v)=>{
    writes.push([addr,v]);
    if(addr>=0xdf00&&addr<=0xdf0a&&!reu)return;
    ram[addr]=v;
    if(addr===0xdf01) {
      transfers++;
      const dest=ram[0xdf02]+256*ram[0xdf03], count=ram[0xdf07]+256*ram[0xdf08];
      assert.equal(count,256); assert.equal(ram[0xdf04]|ram[0xdf05]|ram[0xdf06],0);
      assert.equal(ram[0xdf09]|ram[0xdf0a],0);
      if((v&1)===1)ram.set(expansion,dest); else expansion.set(ram.subarray(dest,dest+count));
      if(transfers===corruptTransfer)ram[dest+17]^=1;
      ram[0xdf00]=transfers===noCompletion?0:0x40;
    }
  };
  const byte=()=>ram[pc++];
  const word=()=>byte()+256*byte();
  const branch=take=>{const off=byte();if(take)pc+=(off<128?off:off-256);};
  while(++steps<200000) {
    const at=pc,op=byte();
    switch(op) {
      case 0xa9:a=flag(byte());break;
      case 0xa2:x=flag(byte());break;
      case 0xad:a=flag(read(word()));break;
      case 0xbd:a=flag(read((word()+x)&65535));break;
      case 0x8d:write(word(),a);break;
      case 0x9d:write((word()+x)&65535,a);break;
      case 0x8e:write(word(),x);break;
      case 0xc9:flag(a-byte());break;
      case 0xdd:flag(a-read((word()+x)&65535));break;
      case 0x29:a=flag(a&byte());break;
      case 0x49:a=flag(a^byte());break;
      case 0xe8:x=flag(x+1);break;
      case 0xca:x=flag(x-1);break;
      case 0x8a:a=flag(x);break;
      case 0xf0:branch(z);break;
      case 0xd0:branch(!z);break;
      case 0x10:branch(!n);break;
      case 0x4c:pc=word();break;
      case 0x48:stack.push(a);break;
      case 0x68:a=flag(stack.pop());break;
      case 0x08:stack.push({z,n});break;
      case 0x28:({z,n}=stack.pop());break;
      case 0x78:break;
      case 0x20:{
        const dest=word();
        if(dest===0xffd2)text+=String.fromCharCode(a);
        else if(dest===0xffe4)a=flag(key);
        else {calls.push(pc);pc=dest;}
        break;
      }
      case 0x60:
        if(calls.length)pc=calls.pop();
        else return {text,ram,expansion,original,registers,transfers,stack,writes};
        break;
      default:throw Error(`Unknown opcode ${op.toString(16)} at ${at.toString(16)}`);
    }
  }
  throw Error('Runtime failed to return');
}

test('shared recipe is current and BASIC entry matches machine code',()=>{
  const recipe=JSON.parse(readFileSync(new URL('../datafiles/foundation.json',import.meta.url),'utf8'));
  assert.deepEqual(recipe,foundationRecipe());
  const result=assemble(recipe);
  assert.equal(result.labels.start,2061);
  assert.deepEqual([...result.bytes.slice(0,14)],[1,8,11,8,10,0,158,50,48,54,49,0,0,0]);
});
test('round trip verifies two patterns and restores original data and registers',()=>{
  const r=run(); assert.match(r.text,/ROUND TRIP PASSED/);
  assert.deepEqual(r.expansion,r.original);
  assert.deepEqual(r.ram.slice(0xdf02,0xdf0b),r.registers);
  assert.equal(r.transfers,7);assert.equal(r.stack.length,0);
  assert(!r.writes.some(([a])=>a===0xd030||a===0xd031));
});
test('missing REU exits without a false pass',()=>{
  const r=run({reu:false,signature:255});
  assert.match(r.text,/UCI UNAVAILABLE/);assert.match(r.text,/REU UNAVAILABLE/);
  assert.equal(r.transfers,0);assert(!r.text.includes('PASSED'));
});
test('user skip makes no writes to REU or turbo registers',()=>{
  const r=run({key:0x20}); assert.equal(r.writes.length,0);
});
test('UCI IRQ signature also reports interface, never a verified board',()=>{
  const r=run({signature:0x49,key:0x20});
  assert.match(r.text,/SIGNATURE FOUND/);assert.match(r.text,/MODEL NOT YET VERIFIED/);
});
test('corrupt readback fails and restores original data',()=>{
  const r=run({corruptTransfer:3}); assert.match(r.text,/TEST FAILED; ORIGINAL PAGE RESTORED/);
  assert.deepEqual(r.expansion,r.original);assert.equal(r.stack.length,0);
});
test('missing completion before backup stops without writing REU data',()=>{
  const r=run({noCompletion:1}); assert.match(r.text,/REU UNAVAILABLE/);
  assert.equal(r.transfers,1);assert.deepEqual(r.expansion,r.original);
});
test('failed completion after write still attempts restoration',()=>{
  const r=run({noCompletion:2}); assert.match(r.text,/TEST FAILED; ORIGINAL PAGE RESTORED/);
  assert.deepEqual(r.expansion,r.original);
});
test('restoration readback corruption is reported distinctly',()=>{
  const r=run({corruptTransfer:7}); assert.match(r.text,/RESTORE FAILED/);
  assert(!r.text.includes('PASSED'));
});
test('assembler rejects unresolved labels, overflow and long branches',()=>{
  assert.throws(()=>assemble([['abs',0x4c,'missing']]),/Unresolved/);
  assert.throws(()=>assemble([['rel',0xd0,'far'],['b',...Array(128).fill(0)],['label','far']]),/range/);
  assert.throws(()=>assemble([['b',256]]),/Invalid byte/);
  assert.throws(()=>assemble([['label','x'],['label','x']]),/Duplicate/);
});
