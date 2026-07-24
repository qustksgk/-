const canvas = document.querySelector('#game'), ctx = canvas.getContext('2d');
const timerEl = document.querySelector('#timer'), messageEl = document.querySelector('#message'), clueList = document.querySelector('#clue-list'), loopCount = document.querySelector('#loop-count');
const player = { x: 110, y: 420, r: 12, speed: 185 }, keys = new Set(), clues = [];
let loop = 1, seconds = 1200, lastFrame = performance.now(), complete = false, started = false;
const objects = [
  { id:'student', name:'불안해하는 학생', x:260, y:205, color:'#b98ac5', kind:'npc' }, { id:'worker', name:'말없는 직장인', x:595, y:325, color:'#658bbb', kind:'npc' }, { id:'master', name:'역무원', x:765, y:195, color:'#c78b63', kind:'npc' },
  { id:'board', name:'전광 안내판', x:130, y:100, color:'#4e9aaa', kind:'thing' }, { id:'bench', name:'플랫폼 벤치', x:325, y:390, color:'#566476', kind:'thing' }, { id:'vending', name:'자판기', x:85, y:285, color:'#467f91', kind:'thing' },
  { id:'locker', name:'분실물 보관함', x:480, y:175, color:'#8797a8', kind:'thing' }, { id:'office', name:'닫힌 역무실 문', x:825, y:295, color:'#795d4d', kind:'thing' }, { id:'cctv', name:'CCTV 화면', x:845, y:105, color:'#6e8498', kind:'thing' }
];
const has = id => clues.some(c => c.id === id);
function addClue(id, title) { if (has(id)) return; clues.push({id,title}); clueList.innerHTML = clues.map(c => `<li>${c.title}</li>`).join(''); }
function say(text) { messageEl.textContent = text; }
function interact(o) {
  if (o.id === 'student') { if (!has('location')) { addClue('location','자판기 아래의 열쇠'); say('학생: “누군가 열쇠를 자판기 아래에 숨겼어요. 다음번에는 꼭 확인해 봐요.”'); } else say('학생은 같은 말을 되풀이한다. “다음번에는 자판기 아래를…”'); }
  else if (o.id === 'worker') say('직장인은 멈춘 시계를 바라본다. 시곗바늘은 11시 40분에서 움직이지 않는다.');
  else if (o.id === 'master') say('역무원: “막차는 이미 떠났습니다. 하지만 오늘은 아무도 이 역을 떠날 수 없어요.”');
  else if (o.id === 'board') say('전광판에는 “종착역: 마지막 정거장”이라는 문구만 희미하게 점멸한다.');
  else if (o.id === 'bench') say('벤치 아래에는 젖은 우산과, “돌아가야 한다”라고 적힌 쪽지가 있다.');
  else if (o.id === 'vending') { if (!has('location')) say('자판기 아래는 어둡다. 무엇을 찾아야 하는지 알 수 없다.'); else if (!has('lockerKey')) { addClue('lockerKey','분실물 보관함 열쇠'); say('자판기 아래에서 작은 황동 열쇠를 찾았다. 보관함 번호가 새겨져 있다.'); } else say('자판기 아래에는 이제 아무것도 없다.'); }
  else if (o.id === 'locker') { if (!has('lockerKey')) say('보관함은 잠겨 있다. 열쇠가 필요하다.'); else if (!has('officeKey')) { addClue('officeKey','역무실 열쇠'); say('보관함 안에는 역무실 열쇠와 오래된 CCTV 테이프가 있다.'); } else say('텅 빈 보관함 안에서 차가운 바람이 새어 나온다.'); }
  else if (o.id === 'office') { if (!has('officeKey')) say('역무실 문은 굳게 잠겨 있다.'); else say('열쇠가 돌아가며 문이 열린다. 안쪽의 CCTV 화면이 켜져 있다.'); }
  else if (o.id === 'cctv') { if (!has('officeKey')) say('CCTV 화면은 역무실 안에 있다. 먼저 문을 열어야 한다.'); else if (!complete) { complete=true; addClue('truth','실종 사건의 기록'); say('CCTV에는 역무원이 한 승객을 선로 쪽으로 유도한 장면이 보인다. 실종 사건의 진실에 가까워졌다.'); } else say('화면 속 시계는 반복이 시작된 시각, 11시 40분을 가리킨다.'); }
}
function nearest() { let found=null, best=42; for (const o of objects) { const d=Math.hypot(o.x-player.x,o.y-player.y); if(d<best) {best=d;found=o;} } return found; }
function resetLoop(auto=false) { loop++; seconds=1200; player.x=110; player.y=420; loopCount.textContent=`반복 ${loop}회차`; say(auto?'안내 방송이 울리고, 모든 것이 다시 11시 40분으로 돌아간다.':'시간을 되돌렸다. 단서만이 반복을 기억한다.'); }
function update(dt) { if (!started) return; let dx=(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('a')?1:0), dy=(keys.has('arrowdown')||keys.has('s')?1:0)-(keys.has('arrowup')||keys.has('w')?1:0); if(dx||dy){const n=Math.hypot(dx,dy);player.x+=dx/n*player.speed*dt;player.y+=dy/n*player.speed*dt;} player.x=Math.max(22,Math.min(938,player.x));player.y=Math.max(62,Math.min(518,player.y));seconds-=dt;if(seconds<=0)resetLoop(true);const m=Math.floor(seconds/60),s=Math.floor(seconds%60);timerEl.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
function draw() {
  ctx.clearRect(0,0,960,540);
  ctx.fillStyle='#0a111b'; ctx.fillRect(0,0,960,540);
  ctx.fillStyle='#172637'; ctx.fillRect(0,54,960,292);
  ctx.fillStyle='#263b4d'; ctx.fillRect(0,346,960,12);
  ctx.fillStyle='#d5ad51'; ctx.fillRect(0,352,960,3);
  ctx.fillStyle='#05080d'; ctx.fillRect(0,358,960,182);
  ctx.fillStyle='#121b26'; ctx.fillRect(0,394,960,8); ctx.fillRect(0,474,960,8);
  for(let x=0;x<960;x+=120) { ctx.fillStyle='#25394a';ctx.fillRect(x+18,55,16,292);ctx.fillStyle='#536b7c';ctx.fillRect(x+21,55,3,292); }
  ctx.fillStyle='#d9e5ed';ctx.fillRect(85,72,180,42);ctx.fillStyle='#1d3242';ctx.fillRect(91,78,168,30);ctx.fillStyle='#e2b85b';ctx.font='bold 16px sans-serif';ctx.textAlign='left';ctx.fillText('LAST STOP',105,99);
  ctx.fillStyle='#1c2c39';ctx.fillRect(40,195,95,115);ctx.fillStyle='#3a9fb5';ctx.fillRect(48,204,79,66);ctx.fillStyle='#a8e8ed';ctx.fillRect(58,215,59,7);ctx.fillStyle='#18212b';ctx.fillRect(55,279,64,20);
  ctx.fillStyle='#4d5967';ctx.fillRect(276,378,100,13);ctx.fillRect(286,391,9,28);ctx.fillRect(355,391,9,28);
  ctx.fillStyle='#798997';ctx.fillRect(444,136,74,78);for(let x=450;x<512;x+=15){ctx.fillStyle='#384856';ctx.fillRect(x,143,10,26);ctx.fillRect(x,177,10,29);}
  ctx.fillStyle='#55443a';ctx.fillRect(785,244,134,94);ctx.fillStyle='#2b2020';ctx.fillRect(799,253,92,78);ctx.fillStyle='#e5c987';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText('STATION OFFICE',845,276);
  ctx.fillStyle='#182532';ctx.fillRect(810,75,72,45);ctx.fillStyle='#6fc0db';ctx.fillRect(816,81,60,29);ctx.fillStyle='#daeff7';ctx.font='10px sans-serif';ctx.fillText('REC  23:40',846,99);
  ctx.fillStyle='#b8c9d7';ctx.fillRect(0,34,960,5);for(let x=95;x<960;x+=190){ctx.fillStyle='#eef4f4';ctx.fillRect(x,28,100,10);}
  ctx.font='11px sans-serif';ctx.textAlign='center';
  for(const o of objects) { if(o.kind!=='npc') continue;ctx.fillStyle='#1b2530';ctx.beginPath();ctx.ellipse(o.x,o.y+25,19,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=o.color;ctx.beginPath();ctx.arc(o.x,o.y,14,0,Math.PI*2);ctx.fill();ctx.fillStyle='#dbe6ee';ctx.fillRect(o.x-9,o.y+13,18,19);ctx.fillStyle='#0c1520';ctx.fillRect(o.x-5,o.y-2,2,2);ctx.fillRect(o.x+3,o.y-2,2,2);ctx.fillStyle='#c7d7e3';ctx.fillText(o.name,o.x,o.y+47); }
  const o=nearest();if(o){ctx.strokeStyle='#f4c56b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(o.x,o.y,29,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#f7dc9d';ctx.fillText(`[E] ${o.name}`,o.x,o.y+63);}
  ctx.fillStyle='#1b2530';ctx.beginPath();ctx.ellipse(player.x,player.y+14,15,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f3d17d';ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#24303d';ctx.fillRect(player.x-7,player.y+9,14,10);ctx.fillStyle='#fff';ctx.fillRect(player.x-5,player.y-3,3,3);ctx.fillRect(player.x+3,player.y-3,3,3);
}
function frame(now) { const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;update(dt);draw();requestAnimationFrame(frame); }
function startGame() { started=true; document.querySelector('#intro-screen').classList.add('hidden'); say('플랫폼에 발을 디뎠다. 누군가 당신을 기다리고 있는 듯하다.'); }
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if (!started && k === 'enter') { startGame(); return; } if(['arrowup','arrowdown','arrowleft','arrowright',' ','e','r'].includes(k))e.preventDefault(); if (!started) return; if(k==='e'||k===' '){const o=nearest();o?interact(o):say('조사할 대상 가까이로 이동하세요.');}if(k==='r')resetLoop();keys.add(k);});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));document.querySelector('#reset-button').addEventListener('click',()=>{if(started)resetLoop();});document.querySelector('#start-button').addEventListener('click',startGame);requestAnimationFrame(frame);
