// Native diagnostic source. Emits a small relocation recipe shared by GML and CLI.
// Register evidence and memory ownership are documented in docs/milestone-1.md.
export function foundationRecipe() {
  const r = [], strings = [];
  const b = (...v) => r.push(['b', ...v]);
  const label = n => r.push(['label', n]);
  const abs = (op, n) => r.push(['abs', op, n]);
  const rel = (op, n) => r.push(['rel', op, n]);
  const imm = (op, v) => b(op, v);
  const mem = (op, a) => b(op, a & 255, a >> 8);
  const put = (a, v) => { imm(0xa9, v); mem(0x8d, a); };
  const print = text => {
    const n = 'text_' + strings.length;
    strings.push([n, text]);
    imm(0xa2, 0); label(n + '_loop'); abs(0xbd, n);
    rel(0xf0, n + '_end'); mem(0x20, 0xffd2); b(0xe8);
    rel(0xd0, n + '_loop'); label(n + '_end');
  };
  let serial = 0;
  const requireZ = destination => {
    const n = 'check_' + serial++;
    rel(0xf0, n); abs(0x4c, destination); label(n);
  };
  const requireNZ = destination => {
    const n = 'check_' + serial++;
    rel(0xd0, n); abs(0x4c, destination); label(n);
  };
  // Load address belongs to the PRG envelope, not the recipe.
  b(0x0b,0x08,0x0a,0x00,0x9e,0x32,0x30,0x36,0x31,0,0,0);
  label('start'); imm(0xa9, 0x93); mem(0x20, 0xffd2);
  print('C64 ULTIMATE ENGINE\rRUNTIME FOUNDATION 0.1\r\r');
  mem(0xad, 0xdf1d); imm(0x29, 0x7f); imm(0xc9, 0x49);
  rel(0xd0, 'uci_missing');
  print('UCI SIGNATURE FOUND\rMODEL NOT YET VERIFIED\r');
  abs(0x4c, 'uci_done'); label('uci_missing');
  print('UCI UNAVAILABLE OR NOT ENABLED\r'); label('uci_done');
  print('CPU SPEED LEFT UNCHANGED\r77 MHZ CONTROL PENDING VERIFICATION\r\r');
  print('DEDICATED REU DIAGNOSTIC ONLY\rRESERVES FIRST 256 REU BYTES\rBACKUP AND RESTORE WILL BE ATTEMPTED\rPRESS R TO TEST; OTHER KEY TO EXIT\r');
  label('key'); mem(0x20, 0xffe4); rel(0xf0, 'key');
  imm(0xc9, 0x52); rel(0xf0, 'test'); b(0x60);
  label('test'); b(0x08, 0x78); // Preserve flags and mask IRQ during scratch use.
  imm(0xa2, 8); label('save_regs'); mem(0xbd, 0xdf02);
  mem(0x9d, 0x3302); b(0xca); rel(0x10, 'save_regs');
  for (const v of [0x55, 0xaa]) {
    put(0xdf02, v); mem(0xad, 0xdf02); imm(0xc9, v); requireZ('absent');
  }
  // Read and clear stale completion status, then fetch original REU page.
  imm(0xa2, 0x31); imm(0xa9, 0x91); abs(0x20, 'dma');
  requireNZ('absent');
  put(0x3300, 0); // 0=pass, 1=test failure, 2=restoration failure.
  for (const mask of [0xa5, 0x5a]) {
    const n = 'pattern_' + mask;
    imm(0xa2, 0); label(n); b(0x8a); imm(0x49, mask);
    mem(0x9d, 0x3000); b(0xe8); rel(0xd0, n);
    imm(0xa2, 0x30); imm(0xa9, 0x90); abs(0x20, 'dma'); requireNZ('failed');
    imm(0xa2, 0); label(n + '_clear'); imm(0xa9, 0);
    mem(0x9d, 0x3000); b(0xe8); rel(0xd0, n + '_clear');
    imm(0xa2, 0x30); imm(0xa9, 0x91); abs(0x20, 'dma'); requireNZ('failed');
    imm(0xa2, 0); label(n + '_verify'); b(0x8a); imm(0x49, mask);
    mem(0xdd, 0x3000); requireZ('failed'); b(0xe8); rel(0xd0, n + '_verify');
  }
  abs(0x4c, 'restore'); label('failed'); put(0x3300, 1);
  label('restore'); imm(0xa2, 0x31); imm(0xa9, 0x90); abs(0x20, 'dma');
  requireNZ('restore_failed');
  imm(0xa2, 0x32); imm(0xa9, 0x91); abs(0x20, 'dma'); requireNZ('restore_failed');
  imm(0xa2, 0); label('restore_compare'); mem(0xbd, 0x3100);
  mem(0xdd, 0x3200); requireZ('restore_failed'); b(0xe8); rel(0xd0, 'restore_compare');
  abs(0x4c, 'report'); label('restore_failed'); put(0x3300, 2);
  label('report'); abs(0x20, 'restore_regs'); b(0x28);
  mem(0xad, 0x3300); rel(0xf0, 'passed'); imm(0xc9, 2); rel(0xf0, 'lost');
  print('REU TEST FAILED; ORIGINAL PAGE RESTORED\r'); b(0x60);
  label('lost'); print('REU RESTORE FAILED - CONTENTS UNCERTAIN\r'); b(0x60);
  label('passed'); print('REU 256-BYTE ROUND TRIP PASSED\rORIGINAL PAGE RESTORED\rTOTAL CAPACITY STILL UNKNOWN\r'); b(0x60);
  label('absent'); abs(0x20, 'restore_regs'); b(0x28);
  print('REU UNAVAILABLE OR TRANSFER FAILED\r'); b(0x60);
  label('restore_regs'); imm(0xa2, 8); label('regs_loop');
  mem(0xbd, 0x3302); mem(0x9d, 0xdf02); b(0xca); rel(0x10, 'regs_loop'); b(0x60);
  // A=immediate DMA direction command, X=C64 page. Only REU page zero is used.
  label('dma'); b(0x48); mem(0x8e, 0xdf03); imm(0xa9, 0);
  for (const a of [0xdf02,0xdf04,0xdf05,0xdf06,0xdf07,0xdf09,0xdf0a]) mem(0x8d, a);
  put(0xdf08, 1); mem(0xad, 0xdf00); b(0x68); mem(0x8d, 0xdf01);
  mem(0xad, 0xdf00); imm(0x29, 0x40); b(0x60);
  for (const [n, text] of strings) { label(n); b(...Array.from(text, c => c.charCodeAt(0)), 0); }
  return r;
}

export function assemble(recipe) {
  let pc = 0x0801;
  const labels = new Map();
  const size = row => row[0] === 'label' ? 0 : row[0] === 'b' ? row.length - 1 : row[0] === 'abs' ? 3 : row[0] === 'rel' ? 2 : (() => { throw Error('Unknown recipe operation'); })();
  for (const row of recipe) {
    if (row[0] === 'label') {
      if (labels.has(row[1])) throw Error('Duplicate label: ' + row[1]);
      labels.set(row[1], pc);
    }
    pc += size(row);
  }
  if (pc > 0x3000) throw Error('Runtime overlaps scratch RAM');
  const bytes = [1,8]; pc = 0x0801;
  for (const row of recipe) {
    const [kind, opcode, name] = row;
    if (kind === 'label') continue;
    if (kind === 'b') {
      for (const v of row.slice(1)) {
        if (!Number.isInteger(v) || v < 0 || v > 255) throw Error('Invalid byte');
        bytes.push(v);
      }
    } else {
      if (!labels.has(name)) throw Error('Unresolved label: ' + name);
      const address = labels.get(name);
      if (kind === 'abs') bytes.push(opcode, address & 255, address >> 8);
      else {
        const delta = address - pc - 2;
        if (delta < -128 || delta > 127) throw Error('Branch out of range: ' + name);
        bytes.push(opcode, delta & 255);
      }
    }
    pc += size(row);
  }
  return { bytes: Uint8Array.from(bytes), labels: Object.fromEntries(labels) };
}
