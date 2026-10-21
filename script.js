(function(){
  var COLORS=['#ffd1e3','#d6e6ff','#fff1b8','#d4f5e2','#e6d9ff','#ffdcc8','#c9f1f5','#f9d3f0'];
  var defaults=[['Strawberry',1],['Sunshine',0],['Cupcake',1],['Bunny',0],['Marshmallow',0],['Rainbow',1],['Boba',0],['Kitty',0],['Daisy',0],['Cloud',0],['Sprinkles',1],['Peach',0],['Bubbles',0],['Mochi',0],['Starlight',0]];
  var words=defaults.map(function(d){return{t:d[0],star:!!d[1]}});
  try{var s=localStorage.getItem('wheel-words');if(s){var p=JSON.parse(s);if(Array.isArray(p)&&p.length>1)words=p}}catch(e){}
  function save(){try{localStorage.setItem('wheel-words',JSON.stringify(words))}catch(e){}}

  var cv=document.getElementById('wheel'),ctx=cv.getContext('2d'),rot=0,spinning=false,size=0;
  function fit(){var r=cv.getBoundingClientRect(),d=window.devicePixelRatio||1;size=r.width;cv.width=size*d;cv.height=size*d;ctx.setTransform(d,0,0,d,0,0);draw()}
  function draw(){
    var n=words.length,c=size/2,R=c-8,seg=2*Math.PI/n;
    ctx.clearRect(0,0,size,size);
    ctx.beginPath();ctx.arc(c,c,c-2,0,7);ctx.fillStyle='#fff';ctx.fill();
    for(var i=0;i<n;i++){
      var a=rot-Math.PI/2+i*seg;
      ctx.beginPath();ctx.moveTo(c,c);ctx.arc(c,c,R,a,a+seg);ctx.closePath();
      ctx.fillStyle=COLORS[i%COLORS.length];ctx.fill();
      ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
      ctx.save();ctx.translate(c,c);ctx.rotate(a+seg/2);
      ctx.fillStyle='#6b4f7a';ctx.textAlign='right';ctx.textBaseline='middle';
      var fs=Math.max(11,Math.min(18,size/26,(R*seg)/2.2));
      ctx.font='500 '+fs+'px Fredoka, Trebuchet MS, sans-serif';
      ctx.fillText(words[i].t,R-16,0);ctx.restore();
    }
    ctx.beginPath();ctx.arc(c,c,R,0,7);ctx.strokeStyle='#ffb8d6';ctx.lineWidth=5;ctx.stroke();
    for(var k=0;k<n;k++){var b=rot-Math.PI/2+k*seg;ctx.beginPath();ctx.arc(c+Math.cos(b)*(R+1),c+Math.sin(b)*(R+1),3.5,0,7);ctx.fillStyle='#fff';ctx.fill()}
  }

  function pickIndex(){
    var starred=[];words.forEach(function(w,i){if(w.star)starred.push(i)});
    var pool=starred.length?starred:words.map(function(_,i){return i});
    return pool[Math.floor(Math.random()*pool.length)];
  }

  function spin(){
    if(spinning||words.length<2)return;
    spinning=true;document.getElementById('spin').disabled=true;
    var n=words.length,seg=2*Math.PI/n,idx=pickIndex();
    var jitter=(Math.random()-.5)*seg*.7;
    var desired=-((idx+.5)*seg+jitter);
    var TWO=2*Math.PI,cur=rot%TWO;
    var delta=(((desired-cur)%TWO)+TWO)%TWO;
    var start=rot,total=TWO*(5+Math.floor(Math.random()*3))+delta,dur=4800,t0=performance.now();
    function step(now){
      var t=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-t,4);
      rot=start+total*e;draw();
      if(t<1)requestAnimationFrame(step);
      else{rot=rot%TWO;draw();spinning=false;document.getElementById('spin').disabled=false;show(words[idx].t)}
    }
    requestAnimationFrame(step);
  }

  function show(w){
    document.getElementById('result').textContent=w;
    document.getElementById('modal').classList.add('on');
    var h=['💖','🌸','✨','🍓','🎀','☁️'];
    for(var i=0;i<26;i++){
      var el=document.createElement('span');el.className='heart';el.textContent=h[i%h.length];
      el.style.left=Math.random()*100+'vw';el.style.animationDuration=(2+Math.random()*2.5)+'s';el.style.animationDelay=(Math.random()*.6)+'s';
      document.body.appendChild(el);setTimeout(function(x){x.remove()},5500,el);
    }
  }

  var chips=document.getElementById('chips'),status=document.getElementById('status');
  function render(){
    chips.innerHTML='';
    words.forEach(function(w,i){
      var d=document.createElement('div');d.className='chip'+(w.star?' star':'');
      var l=document.createElement('button');l.textContent=(w.star?'⭐ ':'')+w.t;l.title='Toggle star';
      l.onclick=function(){w.star=!w.star;save();render()};
      var x=document.createElement('button');x.textContent='✕';x.title='Remove';
      x.onclick=function(){if(words.length>2){words.splice(i,1);save();render();draw()}};
      d.appendChild(l);d.appendChild(x);chips.appendChild(d);
    });
    var n=words.filter(function(w){return w.star}).length;
    status.innerHTML=n?'<span class="tag">Targeted: '+n+' starred of '+words.length+'</span>':'<span class="tag">Fair spin (no stars)</span>';
    draw();
  }
  function add(){
    var inp=document.getElementById('newWord'),v=inp.value.trim();
    if(!v||words.length>=30)return;
    words.push({t:v,star:false});inp.value='';save();render();
  }

  document.getElementById('spin').onclick=spin;
  document.getElementById('close').onclick=function(){document.getElementById('modal').classList.remove('on')};
  document.getElementById('add').onclick=add;
  document.getElementById('newWord').onkeydown=function(e){if(e.key==='Enter')add()};
  document.getElementById('clearStars').onclick=function(){words.forEach(function(w){w.star=false});save();render()};
  var panel=document.getElementById('panel'),cbtn=document.getElementById('creatorBtn');
  cbtn.onclick=function(){panel.style.display=panel.style.display==='none'?'block':'none'};
  document.getElementById('hidePanel').onclick=function(){panel.style.display='none';cbtn.style.display='none'};
  var taps=0,tm;
  document.getElementById('title').onclick=function(){
    taps++;clearTimeout(tm);tm=setTimeout(function(){taps=0},900);
    if(taps>=3){taps=0;cbtn.style.display='inline-block';panel.style.display='block';panel.scrollIntoView({behavior:'smooth'})}
  };
  window.addEventListener('resize',fit);
  render();fit();
})();