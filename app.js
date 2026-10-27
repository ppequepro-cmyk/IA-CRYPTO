(function(){
'use strict';
var symbols=['BTCUSDT','ETHUSDT','SOLUSDT'];
var latest={};
var history=[];
var currency=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2});
var number=new Intl.NumberFormat('en-US',{maximumFractionDigits:6});
var socket=null,reconnectDelay=2000,pollTimer=null,reconnectTimer=null;
var $=function(id){return document.getElementById(id)};
function fmt(v){return currency.format(Number(v)||0)}
function api(path){
return fetch('https://data-api.binance.vision/api/v3/'+path,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})
}
function renderCoins(){
var box=$('coins');box.innerHTML='';
symbols.forEach(function(s){var d=latest[s];var el=document.createElement('article');el.className='card';
if(!d){el.innerHTML='<span class="loading">Sin datos para '+s+'</span>';box.appendChild(el);return}
var positive=Number(d.priceChangePercent)>=0;
el.innerHTML='<div class="coin-head"><div class="coin-icon">'+s.slice(0,1)+'</div><div><div class="coin-name">'+({BTCUSDT:'Bitcoin',ETHUSDT:'Ethereum',SOLUSDT:'Solana'}[s])+'</div><div class="coin-symbol">'+s.replace('USDT','')+' / USD</div></div></div><div class="price">'+fmt(d.lastPrice)+'</div><div class="change '+(positive?'up':'down')+'">'+(positive?'+':'')+Number(d.priceChangePercent).toFixed(2)+'% <span class="tiny">24 h</span></div><div class="tiny" style="margin-top:8px">Máx. '+fmt(d.highPrice)+' · Mín. '+fmt(d.lowPrice)+'</div>';
box.appendChild(el)})
}
function mean(a){return a.reduce(function(x,y){return x+y},0)/a.length}
function rsi(values){if(values.length<15)return null;var gain=0,loss=0;for(var i=1;i<=14;i++){var d=values[i]-values[i-1];if(d>0)gain+=d;else loss-=d}var avgGain=gain/14,avgLoss=loss/14;for(var j=15;j<values.length;j++){var delta=values[j]-values[j-1];avgGain=(avgGain*13+Math.max(delta,0))/14;avgLoss=(avgLoss*13+Math.max(-delta,0))/14}if(avgLoss===0)return avgGain===0?50:100;var rs=avgGain/avgLoss;return 100-(100/(1+rs))}
function loadHistory(){
var symbol=$('asset').value,interval=$('interval').value;
$('refresh').disabled=true;$('signal').textContent='CARGANDO';$('signalText').textContent='Consultando historial público…';
return api('klines?symbol='+symbol+'&interval='+interval+'&limit=90').then(function(rows){
history=rows.map(function(x){return {time:x[0],close:Number(x[4])}}).filter(function(x){return Number.isFinite(x.close)});
var closes=history.map(function(x){return x.close});var last=closes[closes.length-1];var first=closes[0];var avg=mean(closes.slice(-20));var rv=rsi(closes);var change=((last-first)/first)*100;
$('mPrice').textContent=fmt(latest[symbol]?latest[symbol].lastPrice:last);$('mRsi').textContent=rv===null?'—':rv.toFixed(1);$('mSma').textContent=fmt(avg);$('mChange').textContent=(change>=0?'+':'')+change.toFixed(2)+'%';
var state='NEUTRAL',desc='Los indicadores no muestran una combinación clara.';
if(rv!==null&&rv<30){state='RSI BAJO';desc='El RSI está por debajo de 30 en el periodo seleccionado.'}
else if(rv!==null&&rv>70){state='RSI ALTO';desc='El RSI está por encima de 70 en el periodo seleccionado.'}
var relation=last>=avg?'El último cierre está por encima de la SMA 20.':'El último cierre está por debajo de la SMA 20.';
$('signal').textContent=state;$('signal').className='signal neutral';$('signalText').textContent=desc+' '+relation+' Es una descripción histórica, no una predicción.';
drawChart();
}).catch(function(e){$('signal').textContent='SIN DATOS';$('signal').className='signal neutral';$('signalText').textContent='No se pudo consultar el historial. Comprueba la conexión e inténtalo después.';console.error(e)}).finally(function(){$('refresh').disabled=false})
}
function drawChart(){
var canvas=$('chart'),rect=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
canvas.width=Math.max(1,Math.floor(rect.width*dpr));canvas.height=Math.max(1,Math.floor(rect.height*dpr));
var ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);var w=rect.width,h=rect.height;
ctx.clearRect(0,0,w,h);if(!history.length){ctx.fillStyle='#8fa2ba';ctx.fillText('No hay historial disponible',12,24);return}
var vals=history.map(function(x){return x.close}),min=Math.min.apply(null,vals),max=Math.max.apply(null,vals),pad=18,range=max-min||1;
ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;
for(var g=0;g<4;g++){var y=pad+(h-2*pad)*g/3;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
ctx.beginPath();vals.forEach(function(v,i){var x=pad+(w-2*pad)*i/(vals.length-1),y=h-pad-(v-min)/range*(h-2*pad);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});
ctx.strokeStyle='#55e6d1';ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.stroke();
ctx.lineTo(w-pad,h-pad);ctx.lineTo(pad,h-pad);ctx.closePath();ctx.fillStyle='rgba(85,230,209,.08)';ctx.fill();
ctx.fillStyle='#8fa2ba';ctx.font='10px system-ui';ctx.fillText(fmt(max),8,12);ctx.fillText(fmt(min),8,h-4)
}
function setConnection(label,ok){
var el=$('connection');if(!el)return;el.textContent=label;el.style.color=ok?'var(--cyan)':'var(--red)';el.style.borderColor=ok?'#55e6d155':'#ff788877';
}
function applyTicker(symbol,data){
if(!latest[symbol])latest[symbol]={};latest[symbol].symbol=symbol;
latest[symbol].lastPrice=data.c||data.lastPrice||latest[symbol].lastPrice;
latest[symbol].priceChangePercent=data.P||data.priceChangePercent||latest[symbol].priceChangePercent||'0';
latest[symbol].highPrice=data.h||data.highPrice||latest[symbol].highPrice;
latest[symbol].lowPrice=data.l||data.lowPrice||latest[symbol].lowPrice;
}
function connectStream(){
if(socket&&socket.readyState===WebSocket.OPEN)return;
try{
socket=new WebSocket('wss://data-stream.binance.vision:443/stream?streams=btcusdt@ticker/ethusdt@ticker/solusdt@ticker');
socket.onopen=function(){reconnectDelay=2000;setConnection('EN VIVO',true);if(pollTimer){clearInterval(pollTimer);pollTimer=null}};
socket.onmessage=function(event){try{var packet=JSON.parse(event.data),d=packet.data,s=d.s;if(symbols.indexOf(s)<0)return;applyTicker(s,d);renderCoins();$('updated').textContent='Último tick: '+new Date().toLocaleTimeString('es-MX')}catch(e){console.warn('Mensaje de mercado no válido',e)}};
socket.onerror=function(){setConnection('RECONECTANDO',false)};
socket.onclose=function(){setConnection('MODO ALTERNATIVO',false);startPolling();if(!reconnectTimer){reconnectTimer=setTimeout(function(){reconnectTimer=null;reconnectDelay=Math.min(reconnectDelay*2,30000);connectStream()},reconnectDelay)}};
}catch(e){setConnection('MODO ALTERNATIVO',false);startPolling()}
}
function startPolling(){
if(pollTimer)return;
pollTimer=setInterval(function(){api('ticker/24hr?symbols='+encodeURIComponent(JSON.stringify(symbols))).then(function(rows){rows.forEach(function(x){applyTicker(x.symbol,x)});renderCoins();$('updated').textContent='Consulta periódica: '+new Date().toLocaleTimeString('es-MX')}).catch(function(e){setConnection('SIN CONEXIÓN',false);$('updated').textContent='No se pudo actualizar el mercado';console.error(e)})},30000)
}
function refreshAll(){
setConnection('CARGANDO',false);
return Promise.all([
api('ticker/24hr?symbols='+encodeURIComponent(JSON.stringify(symbols))).then(function(rows){rows.forEach(function(x){applyTicker(x.symbol,x)});renderCoins();$('updated').textContent='Datos consultados: '+new Date().toLocaleTimeString('es-MX')}).catch(function(e){$('updated').textContent='No se pudo cargar el mercado';setConnection('SIN CONEXIÓN',false);console.error(e)}),
loadHistory()
]).then(function(){connectStream()})
}
$('refresh').addEventListener('click',refreshAll);$('asset').addEventListener('change',loadHistory);$('interval').addEventListener('change',loadHistory);
window.addEventListener('resize',drawChart);window.addEventListener('online',function(){refreshAll()});refreshAll();
})();
