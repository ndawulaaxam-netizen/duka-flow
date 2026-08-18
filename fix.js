(function(){
var _lib;
function fake(res){
var b={};
b.select=function(){return b;};
b.single=function(){return b;};
b.maybeSingle=function(){return b;};
b.then=function(f,g){return Promise.resolve(res).then(f,g);};
b.catch=function(g){return Promise.resolve(res).catch(g);};
return b;
}
Object.defineProperty(window,'supabase',{
configurable:true,
get:function(){return _lib;},
set:function(v){
_lib=v;
if(!v||!v.createClient||v.__df)return;
v.__df=1;
var oc=v.createClient.bind(v);
v.createClient=function(){
var c=oc.apply(v,arguments);
try{
var of=c.from.bind(c);
c.from=function(t){
var q=of(t);
if(t!=='shops')return q;
var oi=q.insert?q.insert.bind(q):null;
if(!oi)return q;
q.insert=function(body){
try{
var row=Array.isArray(body)?body[0]:body;
var ph=row&&(row.phone||row.phone_number);
if(!ph)return oi(body);
ph=String(ph).replace(/\D/g,'');
return of('shops').select('*').or('phone.eq.'+ph+',phone_number.eq.'+ph).then(function(r){
if(r&&r.data&&r.data.length){
return fake({data:Array.isArray(body)?r.data:r.data[0],error:null});}
return oi(body);
});
}catch(e){return oi(body);}
};
return q;
};
}catch(e){}
return c;
};
}});
})();