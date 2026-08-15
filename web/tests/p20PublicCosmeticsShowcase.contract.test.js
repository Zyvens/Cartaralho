'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const metagame=read('api/profile/metagame.js'),publicProfile=read('api/profile/public.js'),start=read('api/game/start.js'),showcaseLib=read('lib/playerShowcase.js'),identity=read('public/js/identityP20.js'),showcase=read('public/js/playerShowcaseP20.js'),profile=read('public/js/profileAppearanceP20.js'),playerList=read('public/js/components/playerList.js'),scoreboard=read('public/js/components/scoreboard.js'),css=read('public/css/p20.css'),index=read('public/index.html'),p18css=read('public/css/p18.css');
for(const[file,src]of[['identityP20.js',identity],['playerShowcaseP20.js',showcase],['profileAppearanceP20.js',profile]])test(`${file} compila`,()=>assert.doesNotThrow(()=>new Function(src)));

test('Gênese é garantida por entitlement no Perfil e perfil público',()=>{assert.match(metagame,/genese-celestial/);assert.match(metagame,/special_entitlements/);assert.match(metagame,/entitlement_type='frame'/);assert.match(publicProfile,/genese-celestial/);assert.match(p18css,/frame-genese-celestial/);});

test('Perfil oferece preview real antes de salvar título e moldura',()=>{assert.match(profile,/profile-appearance-live-preview/);assert.match(profile,/this\.avatar\(this\.draftAvatar,76,f\|\|null\)/);assert.match(profile,/data-profile-draft-title/);assert.match(profile,/data-profile-draft-frame/);assert.match(profile,/PRÉVIA PÚBLICA/);});

test('Home mostra identidade equipada e mantém o fundo de cartas visível',()=>{assert.match(identity,/equipped_frame_key/);assert.match(identity,/equipped_title_key/);assert.match(identity,/account-equipped-title/);assert.match(identity,/HomeScreen\.renderAccount/);assert.match(css,/#mode-selection\.home-form\{background:rgba\(9,8,16,\.18\)!important/);assert.match(css,/@media\(max-width:720px\).*#mode-selection\.home-form\{background:rgba\(8,8,14,\.07\)!important/s);});

test('Lobby e placar exibem moldura e título para todos os jogadores',()=>{for(const src of[playerList,scoreboard]){assert.match(src,/frameKey/);assert.match(src,/titleKey/);assert.match(src,/public-avatar-frame/);assert.match(src,/IdentityUI\?\.titleName/);}assert.match(identity,/player_list_update/);assert.match(identity,/App\.state\.scores=data\.players\.map\(p=>\(\{\.\.\.p/);});

test('game_started transporta showcase sem repetir avatar base64 no Pusher',()=>{assert.match(start,/playerShowcase\.build\(room\)/);assert.match(start,/showcase\}/);assert.doesNotMatch(showcaseLib,/avatarData:p\.avatarData/);assert.match(showcase,/App\.state\.players/);assert.match(showcase,/avatarData:known\.avatarData/);});

test('showcase prioriza carta famosa de autoria e depois maior progressão',()=>{assert.match(showcaseLib,/famous_authored/);assert.match(showcaseLib,/is_authored/);assert.match(showcaseLib,/times_won\|\|0\)>=5/);assert.match(showcaseLib,/matches_used\|\|0\)>10/);assert.match(showcaseLib,/highest_progression/);assert.match(showcaseLib,/platinum:4/);assert.match(showcaseLib,/gold:3/);assert.match(showcaseLib,/silver:2/);assert.match(showcaseLib,/copper:1/);});

test('showcase segura a primeira rodada apenas no cliente e narra a apresentação',()=>{assert.match(showcase,/playerShowcaseActive/);assert.match(showcase,/name==='round'\|\|name==='host'/);assert.match(showcase,/self\.pending=\{name,data\}/);assert.match(showcase,/CartNarrator\.speak/);assert.match(showcase,/Conheça os suspeitos/);assert.match(showcase,/showcaseCard/);});

test('P20 carrega por último e respeita P18/P19',()=>{const p19=index.indexOf('css/p19.css'),p20=index.indexOf('css/p20.css'),identityPos=index.indexOf('js/identityP20.js'),appearancePos=index.indexOf('js/profileAppearanceP20.js'),showcasePos=index.indexOf('js/playerShowcaseP20.js');assert.ok(p20>p19);assert.ok(identityPos>0&&appearancePos>identityPos&&showcasePos>appearancePos);});
