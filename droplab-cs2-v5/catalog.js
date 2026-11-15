// DROPLAB catalog — all values are fictional simulator credits.
const SKIN_ROWS = [
// id, name, rarity, in-simulator sale value (credits)
['ak-redline','AK-47 | Redline','pink',185],
['ak-slate','AK-47 | Slate','blue',58],
['ak-neon','AK-47 | Neon Revolution','red',560],
['ak-empress','AK-47 | The Empress','red',690],
['ak-vulcan','AK-47 | Vulcan','red',940],
['ak-asiimov','AK-47 | Asiimov','pink',275],
['ak-fire','AK-47 | Fire Serpent','gold',3870],
['ak-nightwish','AK-47 | Nightwish','pink',310],
['ak-anubis','AK-47 | Legion of Anubis','purple',130],
['ak-inheritance','AK-47 | Inheritance','red',1040],
['awp-asiimov','AWP | Asiimov','red',880],
['awp-atheris','AWP | Atheris','blue',56],
['awp-neo','AWP | Neo-Noir','pink',310],
['awp-hyper','AWP | Hyper Beast','pink',390],
['awp-dragon','AWP | Dragon Lore','gold',15500],
['awp-lightning','AWP | Lightning Strike','red',990],
['awp-chromatic','AWP | Chromatic Aberration','purple',118],
['m4-howl','M4A4 | Howl','gold',10200],
['m4-space','M4A4 | Desolate Space','purple',115],
['m4-neo','M4A4 | Neo-Noir','pink',285],
['m4-temukau','M4A4 | Temukau','red',680],
['m4a-print','M4A1-S | Printstream','red',930],
['m4a-player','M4A1-S | Player Two','pink',280],
['m4a-hyper','M4A1-S | Hyper Beast','purple',150],
['m4a-deci','M4A1-S | Decimator','purple',125],
['m4a-blue','M4A1-S | Blue Phosphor','red',1170],
['m4a-lotus','M4A1-S | Black Lotus','purple',180],
['deag-print','Desert Eagle | Printstream','red',840],
['deag-blaze','Desert Eagle | Blaze','red',1100],
['deag-ocean','Desert Eagle | Ocean Drive','pink',285],
['deag-code','Desert Eagle | Code Red','pink',265],
['usp-kill','USP-S | Kill Confirmed','red',1020],
['usp-print','USP-S | Printstream','red',790],
['usp-cortex','USP-S | Cortex','purple',135],
['usp-ticket','USP-S | Ticket to Hell','blue',45],
['glock-water','Glock-18 | Water Elemental','purple',115],
['glock-vogue','Glock-18 | Vogue','purple',120],
['glock-neo','Glock-18 | Neo-Noir','pink',270],
['glock-bullet','Glock-18 | Bullet Queen','pink',325],
['p250-see','P250 | See Ya Later','pink',220],
['p90-asiimov','P90 | Asiimov','purple',115],
['mp9-star','MP9 | Starlight Protector','pink',218],
['mac-neon','MAC-10 | Neon Rider','pink',235],
['famas-comm','FAMAS | Commemoration','pink',190],
['57-hyper','Five-SeveN | Hyper Beast','pink',192],
['tec-fuel','Tec-9 | Fuel Injector','purple',124],
['galil-chrom','Galil AR | Chromatic Aberration','purple',92],
['ssg-dragon','SSG 08 | Dragonfire','pink',228],
['scar-blood','SCAR-20 | Bloodsport','purple',120],
['karambit-doppler','★ Karambit | Doppler','gold',9000],
['karambit-fade','★ Karambit | Fade','gold',12300],
['butterfly-fade','★ Butterfly Knife | Fade','gold',12800],
['butterfly-doppler','★ Butterfly Knife | Doppler','gold',9800],
['m9-web','★ M9 Bayonet | Crimson Web','gold',5700],
['bayonet-marble','★ Bayonet | Marble Fade','gold',4650],
['sport-vice','★ Sport Gloves | Vice','gold',7500],
['sport-pandora','★ Sport Gloves | Pandora’s Box','gold',9500],
['driver-snake','★ Driver Gloves | King Snake','gold',4500],
['specialist-fade','★ Specialist Gloves | Fade','gold',4250],
['wraps-cobalt','★ Hand Wraps | Cobalt Skulls','gold',3650],
];

// Additional real CS2 finish names, with fictional virtual-Credit prices.
const EXTRA_ROWS = [
['glock-candy','Glock-18 | Candy Apple','blue',8],
['glock-ground','Glock-18 | Groundwater','blue',5],
['glock-iron','Glock-18 | Ironwork','blue',9],
['glock-ox','Glock-18 | Oxide Blaze','blue',11],
['glock-wraith','Glock-18 | Wraiths','blue',13],
['glock-high','Glock-18 | High Beam','blue',7],
['glock-bunsen','Glock-18 | Bunsen Burner','blue',10],
['glock-warhawk','Glock-18 | Warhawk','blue',10],
['glock-clear','Glock-18 | Clear Polymer','blue',12],
['usp-forest','USP-S | Forest Leaves','blue',6],
['usp-torque','USP-S | Torque','blue',16],
['usp-black','USP-S | Black Lotus','blue',23],
['usp-lead','USP-S | Lead Conduit','blue',12],
['usp-check','USP-S | Check Engine','blue',9],
['usp-flash','USP-S | Flashback','blue',16],
['usp-blood','USP-S | Blood Tiger','blue',17],
['p250-sand','P250 | Sand Dune','blue',5],
['p250-iron','P250 | Iron Clad','blue',7],
['p250-ripple','P250 | Ripple','blue',7],
['p250-cassette','P250 | Cassette','blue',8],
['p250-contam','P250 | Contamination','blue',8],
['p250-valence','P250 | Valence','blue',12],
['p250-verdigris','P250 | Verdigris','blue',13],
['p250-re','P250 | Re.built','blue',12],
['fiv-scap','Five-SeveN | Scumbria','blue',7],
['fiv-forest','Five-SeveN | Forest Night','blue',5],
['fiv-scrawl','Five-SeveN | Scrawl','blue',9],
['fiv-copper','Five-SeveN | Copper Galaxy','blue',21],
['tec-avalanche','Tec-9 | Avalanche','blue',26],
['tec-sand','Tec-9 | Sandstorm','blue',8],
['tec-cracked','Tec-9 | Cracked Opal','blue',9],
['tec-rebel','Tec-9 | Rebel','blue',11],
['deagle-bronze','Desert Eagle | Bronze Deco','blue',12],
['deagle-trigger','Desert Eagle | Trigger Discipline','blue',20],
['deagle-corinth','Desert Eagle | Corinthian','blue',9],
['deagle-oxide','Desert Eagle | Oxide Blaze','blue',13],
['ak-elite','AK-47 | Elite Build','blue',18],
['ak-unchartered','AK-47 | Uncharted','blue',12],
['ak-safari','AK-47 | Safari Mesh','blue',7],
['ak-steel','AK-47 | Steel Delta','blue',19],
['ak-ice','AK-47 | Ice Coaled','blue',31],
['ak-olive','AK-47 | Olive Polycam','blue',9],
['ak-predator','AK-47 | Predator','blue',13],
['ak-safety','AK-47 | Safety Net','blue',29],
['ak-emerald','AK-47 | Emerald Pinstripe','blue',26],
['m4-magnes','M4A4 | Magnesium','blue',11],
['m4-converter','M4A4 | Converter','blue',12],
['m4-urban','M4A4 | Urban DDPAT','blue',14],
['m4-mainframe','M4A4 | Mainframe','blue',18],
['m4a-nitro','M4A1-S | Nitro','blue',25],
['m4a-boreal','M4A1-S | Boreal Forest','blue',8],
['m4a-wash','M4A1-S | Wash me plz','blue',18],
['m4a-brief','M4A1-S | Briefing','blue',17],
['awp-cap','AWP | Capillary','blue',26],
['awp-worm','AWP | Worm God','blue',27],
['awp-sun','AWP | Sun in Leo','blue',34],
['awp-ach','AWP | Acheron','blue',16],
['awp-paw','AWP | PAW','blue',29],
['awp-black','AWP | Black Nile','blue',27],
['ssg-fever','SSG 08 | Fever Dream','blue',21],
['ssg-slash','SSG 08 | Slashed','blue',9],
['ssg-ghost','SSG 08 | Ghost Crusader','blue',23],
['ssg-blue','SSG 08 | Blue Spruce','blue',5],
['mp9-dart','MP9 | Dart','blue',11],
['mp9-air','MP9 | Airlock','blue',27],
['mp9-sand','MP9 | Sand Scale','blue',7],
['mp9-ruby','MP9 | Ruby Poison Dart','blue',25],
['mp7-cirrus','MP7 | Cirrus','blue',13],
['mp7-armour','MP7 | Armor Core','blue',8],
['mp7-guerrilla','MP7 | Guerrilla','blue',10],
['mac-pipe','MAC-10 | Pipe Down','blue',20],
['mac-heat','MAC-10 | Heat','blue',24],
['mac-button','MAC-10 | Button Masher','blue',14],
['mac-sakkaku','MAC-10 | Sakkaku','blue',24],
['p90-traction','P90 | Traction','blue',11],
['p90-chopper','P90 | Chopper','blue',16],
['p90-offworld','P90 | Off World','blue',10],
['ump-expo','UMP-45 | Exposure','blue',15],
['ump-moon','UMP-45 | Moonrise','blue',19],
['ump-delusion','UMP-45 | Delusion','blue',11],
['famas-crypsis','FAMAS | Crypsis','blue',14],
['famas-decommission','FAMAS | Decommissioned','blue',11],
['famas-survivor','FAMAS | Survivor Z','blue',15],
['galil-signal','Galil AR | Signal','blue',14],
['galil-cold','Galil AR | Cold Fusion','blue',13],
['galil-vandal','Galil AR | Vandal','blue',9],
['galil-black','Galil AR | Black Sand','blue',10],
['nova-wild','Nova | Wild Six','blue',20],
['nova-koi','Nova | Koi','blue',23],
['nova-clear','Nova | Clear Polymer','blue',11],
['xm-ziggy','XM1014 | Ziggy','blue',16],
['xm-oxide','XM1014 | Oxide Blaze','blue',8],
['sawed-morris','Sawed-Off | Morris','blue',9],
['sawed-spiral','Sawed-Off | Spiraled','blue',7],
['negev-lion','Negev | Lionfish','blue',14],
['negev-dazzle','Negev | Dazzle','blue',14],
['bizon-space','PP-Bizon | Space Cat','blue',14],
['bizon-judg','PP-Bizon | Judgement of Anubis','purple',95],
['p250-super','P250 | Supernova','purple',45],
['p250-xray','P250 | X-Ray','purple',55],
['p250-wings','P250 | Wingshot','purple',49],
['p250-muertos','P250 | Muertos','purple',73],
['usp-guardian','USP-S | Guardian','purple',64],
['usp-cyrex','USP-S | Cyrex','purple',77],
['usp-royal','USP-S | Royal Blue','purple',61],
['glock-nuclear','Glock-18 | Nuclear Garden','purple',70],
['glock-weasel','Glock-18 | Weasel','purple',45],
['glock-twilight','Glock-18 | Twilight Galaxy','purple',93],
['glock-grinder','Glock-18 | Grinder','purple',50],
['deagle-light','Desert Eagle | Light Rail','purple',44],
['deagle-mecha','Desert Eagle | Mecha Industries','purple',107],
['deagle-naga','Desert Eagle | Naga','purple',72],
['deagle-conspiracy','Desert Eagle | Conspiracy','purple',101],
['ak-phantom','AK-47 | Phantom Disruptor','purple',120],
['ak-front','AK-47 | Frontside Misty','purple',126],
['ak-point','AK-47 | Point Disarray','purple',135],
['ak-cartel','AK-47 | Cartel','purple',96],
['ak-royal','AK-47 | Royal Blue','purple',82],
['ak-explained','AK-47 | Rat Rod','purple',70],
['m4-evil','M4A4 | Evil Daimyo','purple',87],
['m4-dragon','M4A4 | Dragon King','purple',116],
['m4a-night','M4A1-S | Night Terror','purple',63],
['m4a-guardian','M4A1-S | Guardian','purple',118],
['m4a-basilisk','M4A1-S | Basilisk','purple',94],
['awp-elite','AWP | Elite Build','purple',87],
['awp-phobos','AWP | Phobos','purple',88],
['awp-exo','AWP | Exoskeleton','purple',93],
['awp-pop','AWP | POP AWP','purple',78],
['awp-duality','AWP | Duality','purple',107],
['mp7-blood','MP7 | Bloodsport','purple',120],
['mp9-food','MP9 | Food Chain','purple',104],
['mac-disco','MAC-10 | Disco Tech','purple',117],
['mac-allure','MAC-10 | Allure','purple',70],
['ump-arctic','UMP-45 | Arctic Wolf','purple',58],
['ump-primal','UMP-45 | Primal Saber','purple',94],
['p90-trigon','P90 | Trigon','purple',88],
['p90-shallow','P90 | Shallow Grave','purple',95],
['famas-neural','FAMAS | Neural Net','purple',62],
['famas-mecha','FAMAS | Mecha Industries','purple',105],
['galil-eco','Galil AR | Eco','purple',80],
['galil-sugar','Galil AR | Sugar Rush','purple',113],
['tec-remote','Tec-9 | Remote Control','purple',79],
['tec-bamboozle','Tec-9 | Bamboozle','purple',55],
['five-angry','Five-SeveN | Angry Mob','pink',250],
['five-monkey','Five-SeveN | Monkey Business','pink',175],
['p250-visions','P250 | Visions','pink',170],
['ak-bloodsport','AK-47 | Bloodsport','pink',390],
['ak-aquamarine','AK-47 | Aquamarine Revenge','pink',325],
['ak-fuel','AK-47 | Fuel Injector','pink',330],
['ak-iceco','AK-47 | Wasteland Rebel','pink',220],
['ak-orbit','AK-47 | Orbit Mk01','pink',205],
['ak-leet','AK-47 | Leet Museo','pink',315],
['m4a-golden','M4A1-S | Golden Coil','pink',360],
['m4a-chant','M4A1-S | Chantico’s Fire','pink',355],
['m4a-atomic','M4A1-S | Atomic Alloy','pink',210],
['m4-hellfire','M4A4 | Hellfire','pink',335],
['m4-royal','M4A4 | Royal Paladin','pink',320],
['m4-xray','M4A4 | X-Ray','pink',205],
['awp-manowar','AWP | Man-o’-war','pink',260],
['awp-wild','AWP | Wildfire','pink',390],
['awp-fever','AWP | Fever Dream','pink',220],
['awp-containment','AWP | Containment Breach','pink',420],
['awp-boom','AWP | BOOM','pink',395],
['deagle-kumicho','Desert Eagle | Kumicho Dragon','pink',260],
['deagle-hypnotic','Desert Eagle | Hypnotic','pink',270],
['usp-orion','USP-S | Orion','pink',310],
['usp-serum','USP-S | Serum','pink',205],
['glock-fade','Glock-18 | Fade','pink',390],
['glock-twilight2','Glock-18 | Snack Attack','pink',230],
['mp7-nemesis','MP7 | Nemesis','pink',240],
['mp9-rose','MP9 | Rose Iron','pink',200],
['p90-death','P90 | Death by Kitty','pink',275],
['ak-wildlotus','AK-47 | Wild Lotus','red',1700],
['ak-head','AK-47 | Head Shot','red',780],
['ak-xray','AK-47 | X-Ray','red',1100],
['ak-gold','AK-47 | Gold Arabesque','red',1490],
['awp-desert','AWP | Desert Hydra','red',1900],
['awp-prince','AWP | The Prince','red',2800],
['awp-fade','AWP | Fade','red',1750],
['awp-gungnir','AWP | Gungnir','red',2450],
['m4a-hot','M4A1-S | Hot Rod','red',1250],
['m4a-welcome','M4A1-S | Welcome to the Jungle','red',1600],
['m4a-knight','M4A1-S | Knight','red',1450],
['m4a-icarus','M4A1-S | Icarus Fell','red',1370],
['m4-pos','M4A4 | Poseidon','red',1530],
['m4-buzz','M4A4 | Buzz Kill','red',620],
['deagle-fennec','Desert Eagle | Fennec Fox','red',1280],
['usp-target','USP-S | Target Acquired','red',1050],
['glock-gamma','Glock-18 | Gamma Doppler','red',1370],
['ak-polar','AK-47 | Case Hardened','red',1110],
['butterfly-slaughter','★ Butterfly Knife | Slaughter','gold',7100],
['butterfly-lore','★ Butterfly Knife | Lore','gold',10500],
['karambit-tiger','★ Karambit | Tiger Tooth','gold',6900],
['karambit-marble','★ Karambit | Marble Fade','gold',9500],
['m9-doppler','★ M9 Bayonet | Doppler','gold',7300],
['m9-lore','★ M9 Bayonet | Lore','gold',9400],
['bayonet-fade','★ Bayonet | Fade','gold',6100],
['skeleton-fade','★ Skeleton Knife | Fade','gold',8900],
['talon-doppler','★ Talon Knife | Doppler','gold',6800],
['stiletto-fade','★ Stiletto Knife | Fade','gold',5200],
['huntsman-gamma','★ Huntsman Knife | Gamma Doppler','gold',4700],
['nomad-crimson','★ Nomad Knife | Crimson Web','gold',3900],
['sport-amphibious','★ Sport Gloves | Amphibious','gold',8100],
['specialist-crimson','★ Specialist Gloves | Crimson Kimono','gold',11500],
['driver-imperial','★ Driver Gloves | Imperial Plaid','gold',4500],
];
SKIN_ROWS.push(...EXTRA_ROWS);

// Verified CS2 finishes and exceptional real-world collectible combinations.
// These values are INVENTED simulator CR; rare pattern/sticker crafts are not separate factory skins.
SKIN_ROWS.push(
 ['awp-medusa','AWP | Medusa','gold',24000],
 ['ak-casehardened','AK-47 | Case Hardened','red',3500],
 ['ak-bluegem-661','StatTrak™ AK-47 | Case Hardened (Pattern 661, FN)','gold',1200000],
 ['karambit-bluegem-387','★ Karambit | Case Hardened (Pattern 387, FN)','gold',1800000],
 ['awp-souvenir-dragon','Souvenir AWP | Dragon Lore (FN)','gold',500000],
 ['awp-dragon-titan','AWP | Dragon Lore (4× Titan Holo Katowice 2014)','gold',280000],
 ['ak-wildlotus-craft','AK-47 | Wild Lotus (4× Reason Holo Katowice 2014)','gold',420000],
 ['m4-howl-craft','StatTrak™ M4A4 | Howl (4× iBUYPOWER Holo Katowice 2014)','gold',230000],
 ['butterfly-emerald','★ Butterfly Knife | Gamma Doppler (Emerald)','gold',42000],
 ['karambit-sapphire','★ Karambit | Doppler (Sapphire)','gold',36000],
 ['karambit-ruby','★ Karambit | Doppler (Ruby)','gold',28000],
 ['karambit-web','★ Karambit | Crimson Web','gold',15500],
 ['sport-hedge','★ Sport Gloves | Hedge Maze','gold',32000],
 ['moto-spearmint','★ Moto Gloves | Spearmint','gold',12500],
 ['butterfly-tiger','★ Butterfly Knife | Tiger Tooth','gold',9900],
 ['ak-gold-arabesque','AK-47 | Gold Arabesque','gold',19000],
 ['m4a-hotrod','M4A1-S | Hot Rod','red',6500],
 ['mp9-hydra','MP9 | Hydra','purple',175],
 ['mp9-foodchain','MP9 | Food Chain','pink',315],
 ['mp9-roseiron','MP9 | Rose Iron','purple',130],
 ['m4a-chantico','M4A1-S | Chantico’s Fire','red',940],
 ['ak-jaguar','AK-47 | Jaguar','pink',370],
 ['awp-wildfire','AWP | Wildfire','red',760]
);

// Single canonical ID per finish; raise select premium specimen values in this fictional economy.
const premiumBasePrices={'ak-wildlotus':42000,'ak-xray':16000,'awp-prince':18000,'awp-fade':18000,'awp-gungnir':31000,'m4a-knight':12000,'m4a-icarus':5400,'m9-doppler':11000,'specialist-crimson':17000};
for(const row of SKIN_ROWS)if(premiumBasePrices[row[0]])row[3]=premiumBasePrices[row[0]];
const SKINS = SKIN_ROWS.map(([id,name,rarity,price])=>({id,name,rarity,price,image:''}));
const INDEX = Object.fromEntries(SKINS.map(s=>[s.id,s]));
const RARITIES={
 blue:{name:'Армейское',color:'#5ba8ee'},
 purple:{name:'Запрещённое',color:'#ad7cfb'},
 pink:{name:'Засекреченное',color:'#e66bc8'},
 red:{name:'Тайное',color:'#ff536b'},
 gold:{name:'Особое',color:'#ffbf58'}
};
const covers=['neon-green','cyber-ai','inferno','cosmic','ice','demon','thunder','toxic','sakura','royal','city','chrome'];
// id, title, virtual opening cost, cover art index, label, symbol, subtitle
const CASE_ROWS=[
 ['67','67 CASE',67,0,'MEME','67','КУЛЬТ ЧИСЛА'],
 ['chatgpt','CHATGPT CASE',249,1,'NEW','AI','ПРОМПТ НА УДАЧУ'],
 ['kilowatt','KILOWATT',149,6,'POPULAR','⚡','HIGH VOLTAGE'],
 ['revolution','REVOLUTION',189,5,'HOT','✳','ПОЛНЫЙ ПЕРЕВОРОТ'],
 ['knife','KNIFE HUNT',1200,9,'PREMIUM','✦','ПОД ОСТРИЁМ'],
 ['nightcity','NIGHT CITY',345,10,'','☾','НЕОНОВЫЙ МРАК'],
 ['dragon','DRAGON LORE',690,2,'LEGEND','♛','ОГНЕННОЕ СОКРОВИЩЕ'],
 ['eco','ECO ROUND',39,11,'BUDGET','$','БЮДЖЕТНЫЙ РАУНД'],
 ['printstream','WHITEOUT',350,4,'','◈','БЕЛАЯ ТЕМАТИКА'],
 ['gloves','GLOVE BOX',950,8,'PREMIUM','✋','HAND CHECK'],
 ['recoil','RECOIL CASE',129,7,'','✺','ПОЛНЫЙ АВТОМАТ'],
 ['godmode','GOD MODE',1999,9,'ULTRA','♢','ЛЕГЕНДАРНЫЕ ПРЕДМЕТЫ'],
 ['gremlin','ГРЕМЛИН',119,2,'NEW','☠','МАЛЕНЬКИЙ ХАОС'],
 ['alien','ЧУЖОЙ',49,3,'NEW','✧','СИГНАЛ ИЗ КОСМОСА'],
 ['scream','КРИК',99,5,'HOT','☠','ХОРРОР НОЧЬ'],
 ['saw','ПИЛА',499,5,'','✕','ИГРА НАЧАЛАСЬ'],
 ['chucky','ЧАКИ',159,8,'MEME','CH','КУКОЛЬНЫЙ УЖАС'],
 ['koen','КОЭН',49,4,'','◉','ХОЛОДНЫЙ РАСЧЁТ'],
 ['lacra','ЛАКРА',149,3,'MEME','LA','VIOLET DREAM'],
 ['ksante','КСАНТЕ',499,7,'','♜','ИГРОК ЛЕГЕНДА'],
 ['brensys','БРЕНСИС',899,5,'PREMIUM','BR','RED ZONE'],
 ['dawnwalker','BLOOD OF DAWNWALKER',1299,2,'LEGEND','✦','КРОВАВЫЙ РАССВЕТ'],
 ['toxic','TOXIC WASTE',79,7,'','☣','ВЫЖИВАЙ В ДЫМУ'],
 ['frost','FROSTBITE',99,4,'','❄','ЛЕДЯНОЙ ХЕДШОТ'],
 ['anime','ANIME DROP',179,8,'POPULAR','♡','KAWAII / FIRE'],
 ['king','KING’S VAULT',999,9,'PREMIUM','♛','ЗОЛОТО И КОРОНА'],
 ['matrix','MATRIX 404',67,1,'MEME','404','СБОЙ РЕАЛЬНОСТИ'],
 ['cyber','CYBERPUNK',289,10,'NEW','77','НОЧНОЙ МЕГАПОЛИС'],
 ['blackhole','BLACK HOLE',499,3,'','◎','ГРАВИТАЦИЯ УДАЧИ'],
 ['hell','HELLFIRE',599,2,'HOT','♨','ИНФЕРНАЛЬНЫЙ ДРОП'],
 ['silver','SILVER RUSH',79,11,'','Ag','ХРОМИРОВАННАЯ СКОРОСТЬ'],
 ['thunder','THUNDERBOLT',239,6,'','ϟ','ШТОРМ НАЧАЛСЯ'],
 ['serpent','SERPENT QUEEN',649,7,'LEGEND','♞','ОПАСНЫЙ ЯД'],
 ['midnight','MIDNIGHT',199,3,'','☾','12:00 AM'],
 ['lotus','LOTUS BLOOM',319,8,'NEW','✿','САКУРА В ОГНЕ'],
 ['headshot','ONE TAP',89,6,'POPULAR','1T','ОДНА ПУЛЯ'],
 ['omega','OMEGA',1499,9,'ULTRA','Ω','ПОСЛЕДНИЙ УРОВЕНЬ'],
 ['bronze','BRONZE STASH',29,11,'BUDGET','B','СТАРТОВЫЙ НАБОР'],
 ['hacker','HACKER.exe',199,1,'MEME','>_','ACCESS GRANTED'],
 ['neon','NEON NIGHTS',399,10,'NEW','N','ЯРКИЕ МОМЕНТЫ'],
];
// Community-inspired and meme/fan cases. All rewards are virtual; the names imply no affiliation.
CASE_ROWS.push(
 ['speed','SPEED STREAM',139,6,'STREAM','⚡','ЭНЕРГИЯ СТРИМА'],
 ['beast','BEAST MODE',499,9,'FAN','B','ГИГАНТСКИЙ ДРОП'],
 ['pewdie','BRO FIST',99,5,'FAN','BRO','НОСТАЛЬГИЯ YOUTUBE'],
 ['minecraft','BLOCK WORLD',79,7,'MEME','□','КУБИЧЕСКИЙ ВАЙБ'],
 ['sigma','SIGMA EDIT',67,11,'MEME','Σ','ПОЗА 10 ИЗ 10'],
 ['brainrot','BRAINROT 2026',49,8,'MEME','🌀','НЕ ВЫБИРАЙ ЭТО'],
 ['skibidi','SKIBIDI DROP',35,1,'MEME','S','ВООБЩЕ ЛЕГЕНДА'],
 ['rizz','RIZZ MASTER',129,8,'MEME','R','ТОТ САМЫЙ AURA'],
 ['gigachad','GIGACHAD',149,9,'MEME','G','ABSOLUTE UNIT'],
 ['npc','NPC LOOT',29,11,'MEME','NPC','+100 К ХАРИЗМЕ'],
 ['shrek','SWAMP LEGEND',279,7,'MEME','S','БОЛОТНЫЙ БОСС'],
 ['streamer','STREAMER LUCK',329,10,'FAN','LIVE','ЧАТ РЕШАЕТ'],
 ['cat','CAT ENERGY',59,8,'MEME','ฅ','МЯУ МЯУ'],
 ['sus','AMOGUS',89,5,'MEME','ඞ','СЛИШКОМ ПОДОЗРИТЕЛЬНО'],
 ['ohio','OHIO FINAL',179,3,'MEME','OH','ФИНАЛЬНЫЙ БОСС'],
 ['backrooms','BACKROOMS',199,6,'HOT','▤','УРОВЕНЬ 0'],
 ['aura','9999 AURA',699,9,'PREMIUM','A','ЛЕГЕНДАРНЫЙ СИГМА'],
 ['clickbait','CLICKBAIT',269,2,'STREAM','!!!','СРОЧНО! НЕВЕРОЯТНО'],
 ['pinkdream','PINK DREAM',249,8,'NEW','♡','РОЗОВЫЕ СНЫ'],
 ['violet','VIOLET HEAT',389,3,'NEW','✧','ФИОЛЕТОВЫЙ ПУЛЬС'],
 // Dedicated free earned-currency shop; prices measured in stars, not CR.
 ['coin-spark','STAR SPARK',25,6,'COINS','✦','МОНЕТНЫЙ СТАРТ'],
 ['coin-meme','MEME VAULT',40,8,'COINS','☺','КОПИ И ОТКРЫВАЙ'],
 ['coin-lucky','LUCKY 777',60,9,'COINS','777','ЗВЁЗДНЫЙ БИЛЕТ'],
 ['coin-cyber','CYBER COINS',85,1,'COINS','◈','ДРУГАЯ ВАЛЮТА'],
 ['coin-cat','KITTY TOKEN',110,8,'COINS','ฅ','КОТЯЧИЙ ЛУТ'],
 ['coin-neon','NEON BONUS',140,10,'COINS','N','ПОТРАЧЕННЫЕ МОНЕТЫ'],
 ['coin-legend','LEGEND TOKEN',200,9,'COINS','♛','ПОПЫТКА КАМБЭКА'],
 ['coin-omega','OMEGA COIN',300,2,'COINS','Ω','САМЫЙ ДЕРЗКИЙ']
);
const tiers=['blue','purple','pink','red','gold'];
function stableNumber(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
// Value-based loot tables. Rarity still affects visuals, but not whether an expensive
// case can randomly give an item worth 12 CR. All probabilities are virtual.
// The brackets deliberately make low-cost cases riskier than high-cost cases.
function valueBrackets(price,currency){
 const cheap=price<=150&&currency!=='COIN',premium=price>=650||currency==='COIN';
 if(cheap)return [
  {lo:.12,hi:.35,weight:60.5,cap:20},
  {lo:.35,hi:.68,weight:21,cap:17},
  {lo:.68,hi:1.15,weight:12,cap:13},
  {lo:1.15,hi:2.35,weight:6.3,cap:10},
  {lo:2.35,hi:8.0,weight:.2,cap:5}
 ];
 if(premium)return [
  {lo:.40,hi:.70,weight:38,cap:20},
  {lo:.70,hi:.98,weight:29,cap:17},
  {lo:.98,hi:1.28,weight:22,cap:12},
  {lo:1.28,hi:1.75,weight:9,cap:10},
  {lo:1.75,hi:3.8,weight:2,cap:6}
 ];
 return [
  {lo:.23,hi:.52,weight:52,cap:20},
  {lo:.52,hi:.82,weight:25,cap:17},
  {lo:.82,hi:1.20,weight:14,cap:13},
  {lo:1.20,hi:1.85,weight:7.5,cap:10},
  {lo:1.85,hi:3.5,weight:1.5,cap:5}
 ];
}
function buildDrops(id,price,currency){
 // Coin cases give credits as loot; COIN is an earned currency, not 1:1 with CR.
 const reference=currency==='COIN'?price*2.4:price;
 const brackets=valueBrackets(price,currency);
 const selections=[];
 const already=new Set();
 for(let tier=0;tier<brackets.length;tier++){
  const b=brackets[tier];
  let group=SKINS.filter(s=>s.price>=Math.ceil(reference*b.lo)&&s.price<=reference*b.hi&&!already.has(s.id));
  // Keep every category populated even when the catalog has large price gaps.
  // For expensive cases, never loosen the strict minimum payout floor.
  if(!group.length){const floor=Math.ceil(reference*(price>=650||currency==='COIN'?.40:.12));
   group=SKINS.filter(s=>s.price>=floor&&!already.has(s.id)).sort((x,y)=>
    Math.abs(Math.log(x.price/(reference*(b.lo+b.hi)/2)))-Math.abs(Math.log(y.price/(reference*(b.lo+b.hi)/2)))).slice(0,3);
  }
  // Rotate each list deterministically so differently named cases differ in contents.
  group.sort((x,y)=>x.price-y.price);
  const shift=group.length?stableNumber(id+':'+tier)%group.length:0;
  group=[...group.slice(shift),...group.slice(0,shift)].slice(0,b.cap);
  for(const item of group){already.add(item.id);selections.push({id:item.id,weight:b.weight/group.length,band:tier});}
 }
 const total=selections.reduce((sum,s)=>sum+s.weight,0);
 return selections.map(s=>({...s,probability:100*s.weight/total}));
}
// Weapon-specific, trophy and rotating seasonal events.
CASE_ROWS.push(
 ['awp-only','AWP SNIPER',349,4,'AWP','AWP','ТОЛЬКО СНАЙПЕРКИ'],
 ['ak-only','AK-47 ELITE',399,2,'AK-47','AK','ЛЕГЕНДАРНЫЕ АК'],
 ['m4-only','M4 ARMORY',329,10,'M4','M4','M4A1-S И M4A4'],
 ['mp9-only','MP9 MANIA',119,1,'MP9','MP9','СКОРОСТЬ И СТИЛЬ'],
 ['pistol-only','PISTOL RUSH',89,6,'PISTOL','P','ПИСТОЛЕТНАЯ СЕРИЯ'],
 ['knife-elite','KNIFE KING',11000,9,'ULTRA','★','КЛИНКИ БЕЗ ДЕШЁВОГО ЛУТА'],
 ['knife-royalty','ROYAL KNIVES',26500,9,'GRAIL','✦','ВЫСШИЙ КЛАСС'],
 ['bluegem','BLUE GEM',7500,1,'ULTRA','661','СИНИЕ ПАТТЕРНЫ'],
 ['dragon-grail','DRAGON GRAIL',450000,2,'GRAIL','AWP','СУВЕНИРЫ И РЕДКИЕ КРАФТЫ'],
 ['millionaire','MILLIONAIRE',650000,9,'ULTRA','∞','ПРЕДМЕТЫ-КОЛЛЕКЦИИ'],
 ['thanksgiving26','THANKSGIVING 2026',399,2,'LIMITED','🦃','СЕЗОННЫЙ КЕЙС НОЯБРЯ'],
 ['winter26','WINTER DROP 2026',899,4,'LIMITED','❄','ЗИМНЕЕ СОБЫТИЕ'],
 ['stream-legend','STREAM LEGENDS',699,10,'STREAM','LIVE','КЕЙС ФАНАТОВ СТРИМОВ'],
 ['youtube-chaos','YOUTUBE CHAOS',199,5,'MEME','▶','ИСТОРИИ И МЕМЫ'],
 ['memegold','GOLDEN MEMES',1999,8,'MEME','★','ЛЕГЕНДАРНЫЕ МЕМЫ']
);
const CASES=CASE_ROWS.map(([id,name,price,cover,tag,glyph,subtitle])=>({
 id,name,subtitle,price,currency:id.startsWith('coin-')?'COIN':'CR',tag,theme:['#baff54','#3ae6ee','#ff692e','#a97aff','#70c4ff','#ff435a','#ffd14c','#78ef71','#ff88c9','#e5b45b','#d26aff','#a9bccf'][cover],glyph,
 image:'/assets/covers/'+covers[cover]+'.webp',featured:['67','chatgpt','knife','dragon','scream','anime','omega'].includes(id),
 drops:buildDrops(id,price,id.startsWith('coin-')?'COIN':'CR')
}));
// Special weapon-type cases use actual finish names for the chosen weapon.
const typeFilters={
 'awp-only':s=>s.name.startsWith('AWP |')||s.name.startsWith('Souvenir AWP |'),
 'ak-only':s=>s.name.includes('AK-47 |'),
 'm4-only':s=>/^M4A4 |^M4A1-S |^StatTrak™ M4A4 /.test(s.name),
 'mp9-only':s=>s.name.startsWith('MP9 |'),
 'pistol-only':s=>/^(Glock-18|USP-S|Desert Eagle|P250|Five-SeveN|Tec-9) \|/.test(s.name),
 'knife-elite':s=>s.name.includes('Knife |')||s.name.includes('Karambit |')||s.name.includes('Bayonet |'),
 'knife-royalty':s=>s.name.includes('Knife |')||s.name.includes('Karambit |')||s.name.includes('Bayonet |'),
 'bluegem':s=>/Case Hardened/.test(s.name),
 'dragon-grail':s=>s.price>=15000,
 'millionaire':s=>s.price>=16000
};
for(const c of CASES){
 if(c.id==='thanksgiving26')c.limitedUntil=Date.UTC(2026,11,1,0,0,0);
 if(c.id==='winter26')c.limitedUntil=Date.UTC(2027,0,10,0,0,0);
 if(!typeFilters[c.id])continue;
 const items=SKINS.filter(typeFilters[c.id]);
 // Select valuable baseline items appropriate to each premium case.
 const floor=['millionaire','dragon-grail','knife-royalty','knife-elite','bluegem'].includes(c.id)?Math.ceil(c.price*.4):Math.max(5,c.price*.18);
 const options=items.filter(x=>x.price>=floor).sort((a,b)=>a.price-b.price);
 if(!options.length)continue;
 // Calibrate positive odds against each case's virtual price; target expected return ≈82%.
 const target=c.price*(c.id==='mp9-only'?.64:.82);
 const average=power=>{const ws=options.map(x=>Math.pow(c.price/x.price,power));const sum=ws.reduce((a,b)=>a+b,0);return options.reduce((a,x,i)=>a+x.price*ws[i],0)/sum;};
 let low=-6,high=24;
 for(let i=0;i<100;i++){const mid=(low+high)/2;if(average(mid)>target)low=mid;else high=mid;}
 const power=(low+high)/2;
 const raw=options.map(x=>({id:x.id,weight:Math.pow(c.price/x.price,power)}));
 const total=raw.reduce((n,x)=>n+x.weight,0);
 c.drops=raw.map(x=>({...x,probability:x.weight/total*100}));
}
// Guarantee that older special collections remain non-profitable in expectation
// even when the catalog grows with extraordinarily valuable pattern crafts.
for(const c of CASES){
 if(c.currency==='COIN')continue;
 const ev=c.drops.reduce((a,d)=>a+INDEX[d.id].price*d.probability/100,0);
 if(ev<c.price)continue;
 const target=c.price*.83;
 const avg=(power)=>{const ws=c.drops.map(d=>d.probability*Math.pow(c.price/INDEX[d.id].price,power)),sum=ws.reduce((a,b)=>a+b,0);return c.drops.reduce((a,d,i)=>a+INDEX[d.id].price*ws[i]/sum,0);};
 let lo=-5,hi=30;for(let i=0;i<90;i++){const mid=(lo+hi)/2;if(avg(mid)>target)lo=mid;else hi=mid;}
 const power=(lo+hi)/2,w=c.drops.map(d=>d.probability*Math.pow(c.price/INDEX[d.id].price,power)),sum=w.reduce((a,b)=>a+b,0);
 c.drops=c.drops.map((d,i)=>({...d,probability:100*w[i]/sum}));
}
// Individually illustrated covers for fan/meme and special coin cases.
const newArt=['speed','beast','pewdie','minecraft','sigma','brainrot','aura','pinkdream','gigachad','npc','shrek','streamer','cat','sus','ohio','backrooms'];
const coverById=Object.fromEntries(newArt.map((id,i)=>[id,`/assets/covers/bonus-${String(i+1).padStart(2,'0')}.webp`]));
Object.assign(coverById,{
 skibidi:coverById.brainrot,rizz:coverById.sigma,clickbait:coverById.streamer,violet:coverById.speed,
 'coin-spark':coverById.beast,'coin-meme':coverById.pewdie,'coin-lucky':coverById.beast,
 'coin-cyber':coverById.gigachad,'coin-cat':coverById.cat,'coin-neon':coverById.pinkdream,
 'coin-legend':coverById.ohio,'coin-omega':coverById.aura
});
for(const c of CASES)if(coverById[c.id])c.image=coverById[c.id];
function chooseDrop(cs){
 const crypto=require('node:crypto');
 const roll=crypto.randomInt(100000000)/1000000;
 let value=0;
 for(const entry of cs.drops){value+=entry.probability;if(roll<value)return INDEX[entry.id];}
 return INDEX[cs.drops[cs.drops.length-1].id];
}
function getCaseOdds(cs){return cs.drops.map(d=>({...INDEX[d.id],probability:d.probability}));}
function getCaseStats(cs){
 const items=getCaseOdds(cs);
 const expected=items.reduce((sum,s)=>sum+s.price*s.probability/100,0);
 const floor=Math.min(...items.map(s=>s.price));
 const breakEven=cs.currency==='COIN'?null:items.filter(s=>s.price>=cs.price).reduce((sum,s)=>sum+s.probability,0);
 return {expectedReturn:Math.round(expected*100)/100,returnPct:cs.currency==='COIN'?null:Math.round(expected/cs.price*1000)/10,minDrop:floor,breakEvenPct:breakEven===null?null:Math.round(breakEven*100)/100};
}
module.exports={SKINS,INDEX,CASES,RARITIES,chooseDrop,getCaseOdds,getCaseStats};
