(function(){
'use strict';
var symbols=['BTCUSDT','ETHUSDT','SOLUSDT'];
var latest={};
var history=[];
var currency=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2});
var number=new Intl.NumberFormat('en-US',{maximumFractionDigits:6});
var socket=null,reconnectDelay=2000,pollTimer=null,reconnectTimer=null,historyTimer=null,historyRequest=0;
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
function renderTechnicalMetrics(symbol){
if(!history.length)return;
var closes=history.map(function(x){return x.close}).filter(Number.isFinite);
if(!closes.length)return;
var last=closes[closes.length-1],first=closes[0],avg=mean(closes.slice(-20)),rv=rsi(closes),change=first?((last-first)/first)*100:0;
$('mPrice').textContent=fmt(latest[symbol]?latest[symbol].lastPrice:last);
$('mRsi').textContent=rv===null?'—':rv.toFixed(1);
$('mSma').textContent=fmt(avg);
$('mChange').textContent=(change>=0?'+':'')+change.toFixed(2)+'%';
var state='NEUTRAL',desc='Los indicadores no muestran una combinación clara.';
if(rv!==null&&rv<30){state='RSI BAJO';desc='El RSI está por debajo de 30 en el periodo seleccionado.'}
else if(rv!==null&&rv>70){state='RSI ALTO';desc='El RSI está por encima de 70 en el periodo seleccionado.'}
var relation=last>=avg?'El último cierre está por encima de la SMA 20.':'El último cierre está por debajo de la SMA 20.';
$('signal').textContent=state;$('signal').className='signal neutral';$('signalText').textContent=desc+' '+relation+' Es una descripción histórica, no una predicción.';
}
function updateLiveCandle(symbol,price){
if(symbol!==$('asset').value||!history.length||!Number.isFinite(price))return;
var candle=history[history.length-1];
candle.close=price;candle.high=Math.max(candle.high,price);candle.low=Math.min(candle.low,price);
renderTechnicalMetrics(symbol);drawChart();
}
function loadHistory(){
var symbol=$('asset').value,interval=$('interval').value,requestId=++historyRequest;
$('refresh').disabled=true;$('signal').textContent='CARGANDO';$('signalText').textContent='Consultando historial público…';
return api('klines?symbol='+symbol+'&interval='+interval+'&limit=90').then(function(rows){
if(requestId!==historyRequest)return;
if(!Array.isArray(rows)||!rows.length)throw new Error('Binance no devolvió velas para este activo e intervalo.');
history=rows.map(function(x){return {time:Number(x[0]),open:Number(x[1]),high:Number(x[2]),low:Number(x[3]),close:Number(x[4])}}).filter(function(x){return Number.isFinite(x.open)&&Number.isFinite(x.high)&&Number.isFinite(x.low)&&Number.isFinite(x.close)});
renderTechnicalMetrics(symbol);
drawChart();
}).catch(function(e){if(requestId!==historyRequest)return;$('signal').textContent='SIN DATOS';$('signal').className='signal neutral';$('signalText').textContent='No se pudo consultar el historial. Comprueba la conexión e inténtalo después. Se conservaron los últimos datos válidos.';console.error(e)}).finally(function(){if(requestId===historyRequest)$('refresh').disabled=false})
}
function drawChart(){
var canvas=$('chart'),rect=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
canvas.width=Math.max(1,Math.floor(rect.width*dpr));canvas.height=Math.max(1,Math.floor(rect.height*dpr));
var ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);var w=rect.width,h=rect.height;
ctx.clearRect(0,0,w,h);if(!history.length){ctx.fillStyle='#8fa2ba';ctx.fillText('No hay historial disponible',12,24);return}
var min=Math.min.apply(null,history.map(function(x){return x.low})),max=Math.max.apply(null,history.map(function(x){return x.high}));
var left=12,right=12,top=18,bottom=18,plotW=Math.max(1,w-left-right),plotH=Math.max(1,h-top-bottom),range=max-min||1;
var y=function(v){return top+(max-v)/range*plotH};
ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;
for(var g=0;g<4;g++){var gy=top+plotH*g/3;ctx.beginPath();ctx.moveTo(left,gy);ctx.lineTo(w-right,gy);ctx.stroke()}
var step=plotW/history.length,bodyW=Math.max(1,Math.min(9,step*.68));
history.forEach(function(candle,i){
var x=left+step*(i+.5),up=candle.close>=candle.open,color=up?'#55e6d1':'#ff7888';
ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,Math.min(2,step*.22));
ctx.beginPath();ctx.moveTo(x,y(candle.high));ctx.lineTo(x,y(candle.low));ctx.stroke();
var bodyTop=y(Math.max(candle.open,candle.close)),bodyBottom=y(Math.min(candle.open,candle.close));
ctx.fillStyle=color;ctx.fillRect(x-bodyW/2,bodyTop,bodyW,Math.max(1.5,bodyBottom-bodyTop));
});
ctx.fillStyle='#8fa2ba';ctx.font='10px system-ui';ctx.textAlign='left';ctx.fillText(fmt(max),left,11);ctx.textAlign='right';ctx.fillText(fmt(min),w-right,h-3);
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
socket.onmessage=function(event){try{var packet=JSON.parse(event.data),d=packet.data,s=d.s;if(symbols.indexOf(s)<0)return;applyTicker(s,d);updateLiveCandle(s,Number(d.c));renderCoins();$('updated').textContent='Último tick: '+new Date().toLocaleTimeString('es-MX')}catch(e){console.warn('Mensaje de mercado no válido',e)}};
socket.onerror=function(){setConnection('RECONECTANDO',false)};
socket.onclose=function(){setConnection('MODO ALTERNATIVO',false);startPolling();if(!reconnectTimer){reconnectTimer=setTimeout(function(){reconnectTimer=null;reconnectDelay=Math.min(reconnectDelay*2,30000);connectStream()},reconnectDelay)}};
}catch(e){setConnection('MODO ALTERNATIVO',false);startPolling()}
}
function startPolling(){
if(pollTimer)return;
pollTimer=setInterval(function(){api('ticker/24hr?symbols='+encodeURIComponent(JSON.stringify(symbols))).then(function(rows){rows.forEach(function(x){applyTicker(x.symbol,x);updateLiveCandle(x.symbol,Number(x.lastPrice))});renderCoins();$('updated').textContent='Consulta periódica: '+new Date().toLocaleTimeString('es-MX')}).catch(function(e){setConnection('SIN CONEXIÓN',false);$('updated').textContent='No se pudo actualizar el mercado';console.error(e)})},30000)
}
function refreshAll(){
setConnection('CARGANDO',false);
return Promise.all([
api('ticker/24hr?symbols='+encodeURIComponent(JSON.stringify(symbols))).then(function(rows){rows.forEach(function(x){applyTicker(x.symbol,x)});renderCoins();$('updated').textContent='Datos consultados: '+new Date().toLocaleTimeString('es-MX')}).catch(function(e){$('updated').textContent='No se pudo cargar el mercado';setConnection('SIN CONEXIÓN',false);console.error(e)}),
loadHistory()
]).then(function(){connectStream()})
}

function mlFeatures(c,i){
  var ret=function(k){return Math.log(c[i]/c[i-k])};
  var rs=[];for(var j=i-9;j<=i;j++)rs.push(Math.log(c[j]/c[j-1]));
  var avg=rs.reduce(function(a,b){return a+b},0)/rs.length;
  var variance=rs.reduce(function(a,b){return a+(b-avg)*(b-avg)},0)/rs.length;
  var sma=0;for(var m=i-19;m<=i;m++)sma+=c[m];sma/=20;
  var gains=0,losses=0;
  for(var r=i-13;r<=i;r++){var d=c[r]-c[r-1];if(d>0)gains+=d;else losses-=d}
  var rv=losses===0?(gains===0?50:100):100-100/(1+(gains/14)/(losses/14));
  return [ret(1),ret(3),ret(6),ret(12),c[i]/sma-1,Math.sqrt(variance),rv/100];
}
function mlSigmoid(z){if(z>35)return 1;if(z< -35)return 0;return 1/(1+Math.exp(-z))}
function mlScaler(rows){
  var means=[],scales=[];
  for(var j=0;j<rows[0].length;j++){
    var vals=rows.map(function(x){return x[j]});
    var m=vals.reduce(function(a,b){return a+b},0)/vals.length;
    var v=vals.reduce(function(a,b){return a+(b-m)*(b-m)},0)/vals.length;
    means.push(m);scales.push(Math.sqrt(v)||1);
  }
  return {apply:function(x){return x.map(function(v,j){return (v-means[j])/scales[j]})}};
}
function mlTrain(rows,labels){
  var scaler=mlScaler(rows),weights=new Array(rows[0].length+1).fill(0);
  for(var epoch=0;epoch<900;epoch++){
    var grad=new Array(weights.length).fill(0);
    rows.forEach(function(raw,k){
      var x=scaler.apply(raw),z=weights[0];
      for(var j=0;j<x.length;j++)z+=weights[j+1]*x[j];
      var e=mlSigmoid(z)-labels[k];grad[0]+=e;
      for(var q=0;q<x.length;q++)grad[q+1]+=e*x[q];
    });
    for(var w=0;w<weights.length;w++)weights[w]-=.12*(grad[w]/rows.length+(w===0?0:.001*weights[w]));
  }
  return {predict:function(raw){
    var x=scaler.apply(raw),z=weights[0];
    for(var j=0;j<x.length;j++)z+=weights[j+1]*x[j];
    return mlSigmoid(z);
  }};
}
function mlAccuracy(model,rows,labels){
  var correct=0;rows.forEach(function(x,i){if((model.predict(x)>=.5?1:0)===labels[i])correct++});
  return rows.length?correct/rows.length:0;
}
function trainEducationalModel(){
  var button=$('trainModel'),status=$('mlStatus');
  if(!button||button.disabled)return;
  button.disabled=true;status.textContent='Descargando historial público y preparando el experimento…';
  var symbol=$('asset').value,interval=$('interval').value;
  api('klines?symbol='+symbol+'&interval='+interval+'&limit=1000').then(function(raw){
    var candles=raw.map(function(x){return Number(x[4])}).filter(function(x){return Number.isFinite(x)&&x>0});
    if(candles.length<180)throw new Error('El historial disponible es demasiado corto.');
    var rows=[],labels=[];
    for(var i=20;i<candles.length-1;i++){rows.push(mlFeatures(candles,i));labels.push(candles[i+1]>candles[i]?1:0)}
    var trainEnd=Math.floor(rows.length*.70),valEnd=Math.floor(rows.length*.85);
    var trainX=rows.slice(0,trainEnd),trainY=labels.slice(0,trainEnd);
    var valX=rows.slice(trainEnd,valEnd),valY=labels.slice(trainEnd,valEnd);
    var testX=rows.slice(valEnd),testY=labels.slice(valEnd);
    if(trainX.length<80||valX.length<10||testX.length<10)throw new Error('No hay suficientes muestras para separar los conjuntos.');
    var model=mlTrain(trainX,trainY),testAcc=mlAccuracy(model,testX,testY),valAcc=mlAccuracy(model,valX,valY);
    var positive=trainY.reduce(function(a,b){return a+b},0);
    var majority=positive>=trainY.length/2?1:0;
    var baseline=testY.filter(function(y){return y===majority}).length/testY.length;
    var estimate=model.predict(mlFeatures(candles,candles.length-2));
    $('mlSamples').textContent=String(testX.length);
    $('mlAccuracy').textContent=(testAcc*100).toFixed(1)+'%';
    $('mlBaseline').textContent=(baseline*100).toFixed(1)+'%';
    $('mlEstimate').textContent=(estimate*100).toFixed(1)+'% arriba';
    status.textContent='Terminado · '+symbol+' · '+interval+' · entrenamiento '+trainX.length+' · validación '+valX.length+' ('+(valAcc*100).toFixed(1)+'%) · prueba cronológica '+testX.length+'. Estimación de la última vela cerrada; no es una recomendación.';
  }).catch(function(error){
    ['mlSamples','mlAccuracy','mlBaseline','mlEstimate'].forEach(function(id){$(id).textContent='—'});
    status.textContent='No se pudo completar el experimento: '+error.message;
  }).finally(function(){button.disabled=false});
}

$('trainModel').addEventListener('click',trainEducationalModel);
$('refresh').addEventListener('click',refreshAll);$('asset').addEventListener('change',loadHistory);$('interval').addEventListener('change',loadHistory);
window.addEventListener('resize',drawChart);window.addEventListener('online',function(){refreshAll()});
// Refresca historial, gráfico e indicadores cada 60 segundos, independientemente del WebSocket de precios.
if(historyTimer)clearInterval(historyTimer);
historyTimer=setInterval(function(){if(document.visibilityState==='visible')loadHistory()},60000);
refreshAll();
})();
