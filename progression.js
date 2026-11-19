const KEY='neon-progression';
const COSTUMES=[
 {id:'zero-cyan',name:'ZERO // CYAN',color:0x00eaff,level:1},
 {id:'pulse-violet',name:'PULSE // VIOLET',color:0x9b6cff,level:3},
 {id:'crimson-edge',name:'CRIMSON // EDGE',color:0xff477e,level:5},
 {id:'solar-gold',name:'SOLAR // GOLD',color:0xffc857,level:8}
];
const ACHIEVEMENTS=[
 {id:'first-run',name:'Первый запуск',desc:'Завершить первый забег'},
 {id:'distance-1000',name:'Городской спринтер',desc:'Преодолеть 1 000 метров суммарно'},
 {id:'crystals-25',name:'Сборщик энергии',desc:'Собрать 25 кристаллов'},
 {id:'level-5',name:'Новый уровень',desc:'Достичь 5 уровня'},
 {id:'runs-10',name:'Постоянный житель',desc:'Завершить 10 забегов'}
];
const fresh=()=>({xp:0,level:1,coins:0,totalDistance:0,totalRuns:0,bestScore:0,totalCrystals:0,missions:[],achievements:[],selectedCostume:'zero-cyan',daily:{day:'',progress:{},claimed:[]}});
const dayKey=()=>new Date().toISOString().slice(0,10);
const saveTimes=new WeakMap();
const DAILY=[
 {id:'distance',title:'Пробежать 500 м',target:500,reward:40,unit:'м'},
 {id:'crystals',title:'Собрать 5 кристаллов',target:5,reward:50,unit:'шт.'},
 {id:'score',title:'Набрать 1 500 очков',target:1500,reward:60,unit:'очк.'}
];
function normalize(p){if(!p.daily||p.daily.day!==dayKey())p.daily={day:dayKey(),progress:{},claimed:[]};p.daily.progress=p.daily.progress||{};p.daily.claimed=p.daily.claimed||[];p.achievements=p.achievements||[];return p;}
export function createProgression(){try{return normalize({...fresh(),...JSON.parse(localStorage.getItem(KEY)||'{}')});}catch{return normalize(fresh());}}
function save(p){try{localStorage.setItem(KEY,JSON.stringify(p));}catch{}}
export function addXP(p,n){if(!p)return; p.xp+=Math.max(0,n);while(p.xp>=p.level*500){p.xp-=p.level*500;p.level++;}save(p);}
export function addCoins(p,n){if(!p)return;p.coins+=Math.max(0,n);save(p);}
export function startRun(p){if(p){normalize(p);p.run={distance:0,score:0,crystals:0};save(p);}}
function advanceDaily(p,key,amount){const q=DAILY.find(x=>x.id===key);if(!q||p.daily.claimed.includes(key))return;p.daily.progress[key]=Math.min(q.target,(p.daily.progress[key]||0)+Math.max(0,amount));if(p.daily.progress[key]>=q.target){p.daily.claimed.push(key);p.coins+=q.reward;p.xp+=50;while(p.xp>=p.level*500){p.xp-=p.level*500;p.level++;}}}
export function updateProgress(p,d={}){if(!p)return;normalize(p);p.run=p.run||{distance:0,score:0,crystals:0};p.run.distance=d.distance??p.run.distance;p.run.score=d.score??p.run.score;const oldCrystals=p.run.crystals||0;p.run.crystals=d.crystals??p.run.crystals;const delta=Math.max(0,d.deltaDistance||0);p.totalDistance+=delta;advanceDaily(p,'distance',delta);advanceDaily(p,'crystals',Math.max(0,(p.run.crystals||0)-oldCrystals));if(d.scoreDelta)advanceDaily(p,'score',d.scoreDelta);const now=Date.now();if(now-(saveTimes.get(p)||0)>1500){save(p);saveTimes.set(p,now);}}
export function completeMission(p,id){if(!p)return;if(!p.missions.includes(id))p.missions.push(id);save(p);}
export function checkAchievements(p){if(!p)return[];const earned=[];const tests=[['first-run',p.totalRuns>=1],['distance-1000',p.totalDistance>=1000],['crystals-25',p.totalCrystals>=25],['level-5',p.level>=5],['runs-10',p.totalRuns>=10]];for(const [id,ok] of tests)if(ok&&!p.achievements.includes(id)){p.achievements.push(id);earned.push(ACHIEVEMENTS.find(a=>a.id===id)?.name||id);}save(p);return earned;}
export function finishRun(p){if(!p)return{};normalize(p);p.totalRuns++;p.totalCrystals+=p.run?.crystals||0;p.bestScore=Math.max(p.bestScore,p.run?.score||0);const reward=25+Math.floor((p.run?.distance||0)/10)+(p.run?.crystals||0)*2;p.coins+=Math.floor((p.run?.crystals||0)*2);p.xp+=reward;while(p.xp>=p.level*500){p.xp-=p.level*500;p.level++;}const earned=checkAchievements(p);save(p);return{...(p.run||{}),earned,reward};}
export function getProgress(p){normalize(p);return{...p,daily:{...p.daily,progress:{...p.daily.progress},claimed:[...p.daily.claimed]},achievements:[...p.achievements]};}
export function getDailyMissions(p){normalize(p);return DAILY.map(q=>({...q,progress:Math.min(q.target,p.daily.progress[q.id]||0),completed:p.daily.claimed.includes(q.id)}));}
export function getCostumes(p){return COSTUMES.map(c=>({...c,unlocked:(p?.level||1)>=c.level,selected:p?.selectedCostume===c.id}));}
export function cycleCostume(p){if(!p)return COSTUMES[0];const unlocked=COSTUMES.filter(c=>p.level>=c.level),i=unlocked.findIndex(c=>c.id===p.selectedCostume);p.selectedCostume=unlocked[(i+1)%unlocked.length].id;save(p);return unlocked[(i+1)%unlocked.length];}
export function getSelectedCostume(p){return COSTUMES.find(c=>c.id===p?.selectedCostume)||COSTUMES[0];}
export function getAchievementList(p){return ACHIEVEMENTS.map(a=>({...a,unlocked:(p?.achievements||[]).includes(a.id)}));}
export function resetProgress(p){if(!p)return;Object.assign(p,fresh());normalize(p);save(p);}
export function getRunStats(p){return p?.run?{...p.run}:{distance:0,score:0,crystals:0};}
