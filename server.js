var PythonShell = require('python-shell');
var express = require('express');
var pokedata = require('./pokedata');
var colors = require('colors');

var app = express();
app.set('view engine', 'ejs');
var port = process.env.PORT || 8080;
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
app.use(express.static(__dirname + "/public"));

app.get('/', function(req, res){
  res.send("THANKS FOR VISITING");
})

app.get('/getpokemon/', function (req, res) {
 res.setHeader('Content-Type', 'application/json');
 console.log("");
 console.log("\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\".blue);
 console.log("getpokemon request Started".blue);
  var username = req.query.u;
  var password = req.query.p;
  var location = req.query.l;
  var options = {
    mode: 'text',
    args: ['-a', 'google', '-u', username, '-p' , password, '-l' , location]
  };
  var responses;
  var run;
  PythonShell.run('pokecli.py',options, function(err, results){}).on('message', function(message) {
                if(JSON.parse(message).error){
                  console.log("error".red);
                  console.log("//////////////////////////////////////".red);
                  console.log("");
                  res.send(message);
                }else{
                  responses = JSON.parse(message).responses.GET_INVENTORY.inventory_delta.inventory_items;
                  res.send(loopResponsePokemon(responses));
                }

              });
});

app.get('/getuserinfo/', function (req, res) {
  console.log("");
  console.log("\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\".magenta);
  console.log("getuserinfo request Started".magenta);
  res.setHeader('Content-Type', 'application/json');
  var username = req.query.u;
  var password = req.query.p;
  var location = req.query.l;
  var options = {
    mode: 'text',
    args: ['-a', 'google', '-u', username, '-p' , password, '-l' , location]
  };
  var responses;
  PythonShell.run('pokecli.py',options, function(err, results){}).on('message', function(message) {
                if(JSON.parse(message).error){
                    res.send(message);
                    console.log("error".red);
                    console.log("//////////////////////////////////////".red);
                    console.log("");
                }else{

                  //res.send(JSON.parse(message));
                  responsesItems = JSON.parse(message).responses.GET_INVENTORY.inventory_delta.inventory_items;
                  responsesUser = JSON.parse(message).responses.GET_PLAYER.player_data;
                  res.send(loopResponseUser(responsesItems, responsesUser));
                }
              });
});
// app.listen(port, function () {
//   console.log('Example app listening on port ' + port);
// });

app.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
});

function loopResponseUser(responses, responsesUser) {
  var userdata = {
    "username": responsesUser.username,
    "pokecoin": responsesUser.currencies[0].amount,
    "stardust": responsesUser.currencies[1].amount,
    "max_item": responsesUser.max_item_storage,
    "creation_time": responsesUser.creation_timestamp_ms,
    "team": responsesUser.team,
    "max_pokemon": responsesUser.max_pokemon_storage
  }
  var pokemon_count = 0;
  var egg_count = 0;
  var incubator_count = 0;
  responses.forEach(function(responseItems){
    var player_stats = responseItems.inventory_item_data.player_stats;
    var pokemon_data = responseItems.inventory_item_data.pokemon_data;
    var items = responseItems.inventory_item_data.item;
    var egg_incubators = responseItems.inventory_item_data.egg_incubators;

    if(player_stats){
      userdata.pokemons_encountered = player_stats.pokemons_encountered;
      userdata.pokemon_deployed = player_stats.pokemon_deployed;
      userdata.battle_attack_total = player_stats.battle_attack_total;
      userdata.next_level_xp = player_stats.next_level_xp;
      userdata.pokemons_captured = player_stats.pokemons_captured;
      userdata.battle_attack_won = player_stats.battle_attack_won;
      userdata.prestige_raised_total = player_stats.prestige_raised_total;
      userdata.pokeballs_thrown = player_stats.pokeballs_thrown;
      userdata.eggs_hatched = player_stats.eggs_hatched;
      userdata.prestige_dropped_total = player_stats.prestige_dropped_total;
      userdata.prev_level_xp = player_stats.prev_level_xp;
      userdata.unique_pokedex_entries = player_stats.unique_pokedex_entries;
      userdata.km_walked = player_stats.km_walked;
      userdata.level = player_stats.level;
      userdata.experience = player_stats.experience;
      userdata.poke_stop_visits = player_stats.poke_stop_visits;
      userdata.evolutions = player_stats.evolutions;
    }else if (pokemon_data) {
      if(pokemon_data.is_egg){
        egg_count++;
      }else{
        pokemon_count++;
      }
    }else if (egg_incubators) {
      incubator_count++;
    }else if (items) {
        if(items.item_id === 1){
            userdata.pokeball_count = items.count;
        }else if(items.item_id === 2){
          userdata.greatball_count = items.count;
        }else if (items.item_id === 3) {
          userdata.ultra_count = items.count
        }else if (items.item_id === 4) {
          userdata.master_count = items.count
        }else if(items.item_id === 101){
          userdata.potion_count = items.count
        }else if(items.item_id === 102){
          userdata.sup_potion_count = items.count
        }else if(items.item_id === 103){
          userdata.hyp_potion_count = items.count
        }else if(items.item_id === 201){
          userdata.revive_count = items.count
        }else if(items.item_id === 701){
          userdata.razz_count = items.count
        }
    }
  });
  userdata.egg_count = egg_count;
  userdata.pokemon_count = pokemon_count;
  console.log("RETURNING USERDATA".magenta.bold.underline);
  console.log("//////////////////////////////////////".magenta);
  console.log("");
  return userdata;
}



function loopResponsePokemon(responses) {
var arrayOfPoke = [];
  responses.forEach(function(response){
    var pokemon_data = response.inventory_item_data.pokemon_data;
    if(pokemon_data){
      if(pokemon_data.is_egg){
      } else {

        pokemon_data.sprite = pokedata.pokemon[pokemon_data.pokemon_id].pic;
        pokemon_data.next_evo = pokedata.pokemon[pokemon_data.pokemon_id].next_evo;
        pokemon_data.name = pokedata.pokemon[pokemon_data.pokemon_id].Name;
        pokemon_data.base_stamina = pokedata.pokemon[pokemon_data.pokemon_id].BaseStamina;
        pokemon_data.base_attack = pokedata.pokemon[pokemon_data.pokemon_id].BaseAttack;
        pokemon_data.base_defense = pokedata.pokemon[pokemon_data.pokemon_id].BaseDefense;
        pokemon_data.type1 = pokedata.pokemon[pokemon_data.pokemon_id].Type1;
        pokemon_data.type2 = pokedata.pokemon[pokemon_data.pokemon_id].Type2;
        pokemon_data.next_evo_cp = [];
        pokemon_data.next_evo_name = [];

          if(pokemon_data.next_evo != 0){
            var nextEvo = pokedata.pokemon[pokemon_data.next_evo];
            var cpm = pokemon_data.cp_multiplier;
            var acpm = pokemon_data.additional_cp_multiplier;
            if(!pokemon_data.individual_attack){
                pokemon_data.individual_attack = 0;
            }
            if(!pokemon_data.individual_defense){
              pokemon_data.individual_defense = 0;
            }
            if(!pokemon_data.individual_stamina){
              pokemon_data.individual_stamina = 0;
            }
            if(!acpm){
              acpm = 0;
            }
            var ecpm = cpm + acpm;

            if(pokemon_data.pokemon_id == 133){
              pokemon_data.next_evo.forEach(function(eevoid){
                var eevo = pokedata.pokemon[eevoid];
                pokemon_data.next_evo_cp.push((eevo.BaseAttack + pokemon_data.individual_attack) * Math.pow((eevo.BaseDefense + pokemon_data.individual_defense),0.5) * Math.pow((eevo.BaseStamina + pokemon_data.individual_stamina),0.5) * Math.pow(ecpm,2) /10);
                pokemon_data.next_evo_name.push(eevo.Name);
              });
            }else{
              pokemon_data.next_evo_cp.push((nextEvo.BaseAttack + pokemon_data.individual_attack) * Math.pow((nextEvo.BaseDefense + pokemon_data.individual_defense),0.5) * Math.pow((nextEvo.BaseStamina + pokemon_data.individual_stamina),0.5) * Math.pow(ecpm,2) /10);
              pokemon_data.next_evo_name.push(nextEvo.Name);
            if(pokedata.pokemon[pokemon_data.next_evo].next_evo != 0){
              var nextNextEvo = pokedata.pokemon[nextEvo.next_evo];
              pokemon_data.next_evo_cp.push((nextNextEvo.BaseAttack + pokemon_data.individual_attack) * Math.pow((nextNextEvo.BaseDefense + pokemon_data.individual_defense),0.5) * Math.pow((nextNextEvo.BaseStamina + pokemon_data.individual_stamina),0.5) * Math.pow(ecpm,2) /10);
              pokemon_data.next_evo_name.push(nextNextEvo.Name);
            }
          }
        }else{
          pokemon_data.next_evo_cp.push(0);
          pokemon_data.next_evo_name.push("N/A");
        }
        arrayOfPoke.push(pokemon_data);
      }
    }
  });
  console.log("RETURNING POKEMON".blue.bold.underline);
  console.log("//////////////////////////////////////".blue);
  console.log("");
  return arrayOfPoke;
}
