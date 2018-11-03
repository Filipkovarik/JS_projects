const Discord = require("discord.js");
const client = new Discord.Client();
const http = require("http");
const auth = require("./auth.json");
const req = require("./req.json")
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const prefix = "§";

parseargs = (x, delimiter='"') => 
x.split(" ").reduce( 
(arr, val) => {
    let strEnd = val[val.length-1] === delimiter && val[val.length-2] !== "\\";
    if (strEnd) val = val.substring(0, val.length - 1);
    return ((arr[arr.length-1] || "")[0] !== delimiter) ? arr.concat([val]) : [arr.pop().substring(strEnd ? 1 : 0) + " " + val, ...(arr.reverse()) ].reverse() },
[] ).map(x => x.replace(new RegExp('\\\\' + delimiter, 'gm'), delimiter).replace(/\\\\/gm, "\\"));

splitarray = (array, callback) => {
	let indices = [0], chunks = [];
	array.forEach((elem, index, arr) => callback(elem, index, arr) && indices.push(index)); 
	indices.push(array.length);
	for (i = 1; i < indices.length; i++) chunks.push(array.slice( indices[i - 1] , indices[i] ))
	return chunks
}


class Command {
    constructor (name, func, desc="", syntax="", argdesc={}, argcheck=()=>true, perms=0b0) {
        this.name = name; 
        Command._commands[name] = this;
        this.func = func; this.permissions = perms; this.syntax = syntax; 
        this.description = desc; this.argcheck = argcheck; this.argdesc = argdesc;
    }

    run(member, args, message) {
        if (args[0] === "/?") return this.help(message);
        let validation = this.argcheck.apply(args);
        if (validation === false) {message.channel.send("Nesprávná syntax"); this.help(message); return false;}
        if (!auth_check(member)) return message.channel.send("Nedostatečné oprávnění")
        func.call(message.channel, message, args)
    }

    auth_check(member){
        return member.permissions.has(this.permissions);
    }

    help(message){
        return message.channel.send(
        this.name + ": " +
        this.description + "\n" +
        this.name + " " + this.syntax + "\n\n" +
        Object.keys(this.argdesc)
        .map(k => k.padEnd(10) + this.argdesc[k]).join("\n")
        );
    }
}

Command._commands = {};

class IRequest {
	constructor(){
		this.creq = http.get(req.url, {path: req.path, auth: req.user+":"+req.pass}, res => {
			console.log("[IReq] Status " + res.statusCode);
			if (res.statusCode !== 200) { res.resume(); return; }
			res.setEncoding("windows-1250");
			let rawData = '';
			res.on('data', chunk => rawData += chunk );
			res.on('end', _ => this.parse(rawData) );
		}
		this.timestamp = +(new Date());
	}
	
	parse(html) {
		console.log("[IReq] Data received");
		const dom = new JSDOM(html);
		const win = dom.window;
		//const win = document // for in-page testing
		const focusSelector = "body > center:nth-child(3) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > center:nth-child(1) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(4) > center:nth-child(1) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > center:nth-child(1)";
		const elems = splitarray(Array.prototype.filter.call(win.querySelector(focusSelector).children, 
			(elem, index, arr) => 
				["font", "table", "center"].indexOf(elem.nodeName.toLowerCase()) > -1 
				&& ( index == arr.length-1 || (elem.nodeName + arr[index+1].nodeName).toLowerCase() !== "tabletable" ) ), 
			(elem) => elem.nodeName.toLowerCase() === "center"
			)
		return new IData(elems, this.timestamp);
		}
}

class IData {
	constructor(arr, timestamp){
		if (arr.length === 0) throw new TypeError("No IData provided"); 
		this.entries = arr.map(idata => (([_,d,m,y]) => Date.parse(m+"/"+d+"/"+y))(idata[0].match(/(\d+)\.(\d+)\.(\d+)/)))
		.map((idata)=>[idata[0], new IData.Day(this, ...idata)])
		this.timestamp = timestamp;
	}
}

IData.Day = class Day {
	constructor(head, date, table, extras=""){
		this.head = head;
		this.date = date;
		this.table = table;
		this.extrasstr = extras;
		this.entries = [];
		this.extras = [];
		this.reloc = [];
		this.parseTable();
	}
	parseTable(){
		let table = Array.prototype.slice.call(this.table.querySelectorAll("tr"), 2)
		.map(row => row.children.map(cell => cell.innerText))
		for (i = 0; i < table.length; i++) table[i][0] == (table[i][0].length <= 2) ? table[i-1][0] : table[i][0];
	}
}


(()=>{

function ping() { this.send("pong!") }
function idata() { this.send("Na hledači suplování se stále tvrdě pracuje.") }
function help(message, [cmdname])
    {
        if (cmdname === undefined) return this.send("Pro zadání parametrů příkazů obsahující mezery ohraničte parametr uvozovkami: `" + prefix + "role přidat \"Velký okoun\"`\nDostupné příkazy:\n\n" + Object.values(Command._commands).map(cmd => cmd.name.padEnd(10)+cmd.description).join("\n")); 
        if (Command._commands.hasOwnProperty(cmdname)) Command._commands[cmdname].help(message);
        else this.send("Neznámý příkaz. Napište '" + prefix + "help' pro seznam všech příkazů."); 
    }
function selfrole(message, [action, rolequery]){
    let role = Object.entries(this.guild.roles).filter( ([ID, rolename]) => rolename === rolequery );
    if (role.length > 1) return this.send("Existuje více rolí s tímto jménem. Prosím obtěžujte administrátory, ať toto nedopatření napraví.");
    if (role.length === 0) return this.send(`Role "${rolequery}" neexistuje.`);
    [role] = role;
    let member = message.member;
    let availroles = Object.entries(arguments.callee._roles)
    .filter( ([perms, roles]) => perms & member.permissions === perms )
    .reduce( ([perms, roles], cur) => cur.concat(roles), [] );
    if (availroles.indexOf(role) === -1) return this.send(`Role "${rolequery}" není dostupná.`);
    if (action === "přidat") member.addRole(role, "Bot self-assignment");
    else member.removeRole(role, "Bot self-unassignment");
    return true;
} 
selfrole._roles = {
0b0: []
}

     
new Command("ping", ping, "Pošle zpět odezvu");
new Command("supl", idata, "[WIP] Zobrazí personalizované suplování"
);
new Command("help", help, "Vypíše seznam všech dostupných příkazů, nebo vypíše nápovědu k zadanému příkazu.", "help *příkaz*",
 {"*příkaz*": "Jméno příkazu, k němuž se má zobrazit nápověda."});
new Command("role", selfrole, "Umožní uživateli si přidat či odebrat dostupné role / označení.", 
"role přidat/odebrat *role*", {"přidat": "Umožní přidání role", "odebrat": "Umožní odebrání role" , "*role*": "Role, která se má uživateli přidat/odebrat"}, 
(action) => action === "přidat" || action === "odebrat" );


})()

/*const commands = {
    "echo": (message, args) => {
        var a = [];
        for (var i in args) if(i!=0) a.push(args[i]);;
        message.channel.send(a.join(" "))
    }
}*/

class Reaction{
    constructor (check, react){}
}

const reactions = {
   /*"zacina noc": "drž hubu!",
    "začíná noc": "drž hubu!",
    "la nuit commence": "tais toi!",
    "the game": "I just lost.",
    "klutzy": "Draconequus",
    "supl": "Did somepone say supl?",
    "knock, knock": "Who's there?"*/
}

client.on("message", message => {
    console.log("Message detected: " + message.content);
    let prefix = "§";
    if(message.content.substring(0, prefix.length) === prefix) {
        console.log("Detected command call");
        var args = message.content.substring(prefix.length).split(" ");
        var cmd = args.shift();
        console.log(`Detected "${cmd}" command call`);
        args = parseargs(args.join(" "))
        console.log("Arguments: " + args.join("+"));
        console.log("Command exists: " + Command._commands.hasOwnProperty(cmd));
        if(Command._commands.hasOwnProperty(cmd)) 
            Commands._commands[cmd].run(message.member, args, message);
        else message.channel.send("Neznámý příkaz, pro seznam příkazů napiš '" + prefix + "help'.");
    }
    else {
        for(var k in reactions) {
            if(message.content.toLowerCase().includes(k) && !message.member.roles.some(x=>x.name==="Bot")){
                message.reply(reactions[k]);
                break;
            }
        }
    }
});

console.log("Bot started");

client.login(auth.token);

