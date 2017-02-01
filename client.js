var Poll = require('../models/Polls.js');

exports.vote = function(socket) {
          socket.on('send:vote', function(data) {
            var ip = socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;    
            Poll.findById(data.poll_id, function(err, poll) {
              var choice = poll.choices.id(data.choice);
              choice.ipvotes.push({ ip: ip });      
              poll.UpDown(choice.text);
              console.log(socket.handshake.headers['x-forwarded-for'] + '  ' + socket.request.connection.remoteAddress);
              poll.save(function(err, doc) {
                var theDoc = { 
                  title: doc.title, 
                  intro: doc.intro, 
                  _id: doc._id, 
                  Up: doc.Up, 
                  Down: doc.Down, 
                  UpPercent: doc.UpPercent, 
                  DownPercent: doc.DownPercent,
                  tagList: doc.tagList, 
                  userVoted: false
                };
                for(var i = 0, ln = doc.choices.length; i < ln; i++) {
                  var choice = doc.choices[i]; 
                  for(var j = 0, jLn = choice.ipvotes.length; j < jLn; j++) {
                    var vote = choice.ipvotes[j];
                    theDoc.ip = ip;
                    if(vote.ip === ip) {
                      theDoc.userVoted = true;
                      theDoc.userChoice = { _id: choice._id, text: choice.text };
                    }
                  }
                }  
                console.log(theDoc);
                socket.emit('myvote', theDoc);
                socket.broadcast.emit('vote', theDoc);
              });     
            });
          });
};