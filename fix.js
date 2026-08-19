(function(){
function fake(res){
var b={};
b.select=function(){return b;};
b.single=function(){return b;};
b.maybeSingle=function(){return b;};
b.then=function(f,g){return Promise.resolve(res).then(f,g);};
b.catch=function(g){return Promise.resolve(res).catch(g);};
return b;
}
function digits(s){
s=String(s||'').replace(/\D/g,'');
return s.slice(-9);
}
function getPhone(row){
return row&&(row.phone||row.phone_number||
row.phonenumber||row.contact||row.owner_phone||'');
}
function wrapLib(v){
if(!v||!v.createClient||v.__df)return v;
v.__df=1;
var oc=v.createClient.bind(v);
v.createClient=function(){
var c=oc.apply(v,arguments);
try{
var of=c.from.bind(c);
c.from=function(t){
var q=of(t);
if(t!=='shops')return q;
['insert','upsert'].forEach(function(m){
var om=q[m]?q[m].bind(q):null;
if(!om)return;
q[m]=function(body){
try{
var row=Array.isArray(body)?body[0]:body;
var ph=digits(getPhone(row));
if(ph.length<9)return om(body);
return of('shops').select('*').then(function(r){
if(r&&r.data){
for(var i=0;i<r.data.length;i++){
if(digits(getPhone(r.data[i]))===ph){
return fake({data:Array.isArray(body)?
[r.data[i]]:r.data[i],error:null});}}
}
return om(body);
});
}catch(e){return om(body);}
};
});
return q;
};
}catch(e){}
return c;
};
return v;
}
if(window.supabase){wrapLib(window.supabase);}
var _l=window.supabase;
try{
Object.defineProperty(window,'supabase',{
configurable:true,
get:function(){return _l;},
set:function(v){_l=wrapLib(v);}});
}catch(e){}
setTimeout(function(){
var els=document.querySelectorAll('footer,div,p');
for(var i=0;i<els.length;i++){
if(els[i].innerText&&
els[i].innerText.indexOf('DukaFlow v')>-1&&
els[i].innerText.indexOf('🛡')<0){
els[i].innerText=els[i].innerText+' 🛡';
break;}}
},2500);
})();