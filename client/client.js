
Scores = new Mongo.Collection('scores');



poep = function(){
  console.log(
    Session.get('start'),
    Session.get('stage-1'),
    Session.get('stage-2'),
    Session.get('stage-3'),
    Session.get('stage-4'),
    Session.get('finish')
  )
}
// counter starts at 0
Session.setDefault('playing', false);
Session.setDefault('finished',false);

var gameTick = Meteor.setInterval(function(){
  if (Session.get('playing')){
    Session.set('finish',moment().valueOf())
  }
  //poep();
},2)

pad2 = function(x){
  if (parseInt(x) < 10) {
    return '0' + x;
  } else {
    return x;
  }
}
pad3 = function(x){
  if (parseInt(x) < 10) {
    return '00' + x;
  } else if (parseInt(x) < 100){
    return '0' + x;
  } else {
    return x;
  }
}
diffDuration = function(start,end){
  var startTime = moment(parseInt(start));
  var finishTime = moment(parseInt(end));
  var d = moment.duration(finishTime.diff(startTime));
  return d;
}
niceDuration = function(d){
  if (d.get('m')) {
    return d.get('m') + ":" + pad2(d.get('s')) + '.' + pad3(d.get('ms'));
  } else {
    return d.get('s') + '.' + pad3(d.get('ms'));
  }
}
rawDuration = function(start,end){
  var startTime = moment(parseInt(start));
  var finishTime = moment(parseInt(end));
  return finishTime.diff(startTime);
}


game_start = function(){
  Session.set('playing',true);
  Session.set('start',undefined);
  Session.set('stage-1',undefined);
  Session.set('stage-2',undefined);
  Session.set('stage-3',undefined);
  Session.set('stage-4',undefined);
  Session.set('finished',false);
  Session.set('failed',false);

  Session.set('start',moment().valueOf());
  Session.set('finish',moment().valueOf())
}

game_stage1 = function(){
  Session.set('stage-1',moment().valueOf());
}
game_stage2 = function(){
  Session.set('stage-2',moment().valueOf());
}
game_stage3 = function(){
  Session.set('stage-3',moment().valueOf());
}
game_stage4 = function(){
  Session.set('stage-4',moment().valueOf());
}
game_finish = function(){
  Session.set('finish',moment().valueOf());
  Session.set('playing',false);
  Session.set('finished',true);

  poep();
}
game_reset = function(){
  Session.set('playing',false);
  Session.set('start',undefined);
  Session.set('stage-1',undefined);
  Session.set('stage-2',undefined);
  Session.set('stage-3',undefined);
  Session.set('stage-4',undefined);
  Session.set('finish',undefined)
  Session.set('finished',false);
}
game_fail = function(){
  game_reset();
  Session.set('failed',true);
}
game_input = function(str){
  if (str === 'game') {
    game_reset();
    game_start();
    Session.set('pos',1);
  } else if (str === 'game_1' && Session.get('pos') === 1) {
    Session.set('pos',2);
    game_stage1();
  } else if (str === 'game_2' && Session.get('pos') === 2) {
    Session.set('pos',3);
    game_stage2();
  } else if (str === 'game_3' && Session.get('pos') === 3) {
    Session.set('pos',4);
    game_stage3();
  } else if (str === 'game_4' && Session.get('pos') === 4) {
    Session.set('pos',5);
    game_stage4();
  } else if (str === 'game_5' && Session.get('pos') === 5) {
    Session.set('pos',6);
    game_finish();
  } else if (Session.get('pos') === 6 && str) {
    var score = {
      lap1  : rawDuration(Session.get('start'),Session.get('stage-1')),
      lap2  : rawDuration(Session.get('stage-1'),Session.get('stage-2')),
      lap3  : rawDuration(Session.get('stage-2'),Session.get('stage-3')),
      lap4  : rawDuration(Session.get('stage-3'),Session.get('stage-4')),
      lap5  : rawDuration(Session.get('stage-4'),Session.get('finish')),
      final : rawDuration(Session.get('start'),Session.get('finish')),
      name  : str
    }
    Scores.insert(score);
    game_reset();
  } else {
    game_fail();
  }

}

Template.main.events({
  'click .start':function(){
    game_start();
    Session.set('pos',1);
  },
  'click .stage1':function(){
    game_stage1();
    Session.set('pos',2);
  },
  'click .stage2':function(){
    game_stage2();
    Session.set('pos',3);
  },
  'click .stage3':function(){
    game_stage3();
    Session.set('pos',4);
  },
  'click .stage4':function(){
    game_stage4();
    Session.set('pos',5);
  },
  'click .finish':function(){
    game_finish();
    Session.set('pos',6);
  },
  'click .reset':function(){
    game_reset();
    Session.set('pos',0);
  },
  'submit form':function(e,t){
    e.preventDefault();
    var input = t.find('.usertext').value;
    console.log(input);
    t.find('.usertext').value = '';
    t.find('.usertext').focus();
    game_input(input);
  }
})



Template.main.rendered = function(){
  this.$('.usertext').focus();
}
Template.main.helpers({
  idle:function(){
    return !Session.get('playing') && !Session.get('finished');
  },
  playerTime:function(){
    return niceDuration(diffDuration(Session.get('start'),Session.get('finish')));
  },
  stage1Time:function(){
    return niceDuration(diffDuration(Session.get('start'),Session.get('stage-1')));
  },
  stage2Time:function(){
    return niceDuration(diffDuration(Session.get('start'),Session.get('stage-2')));
  },
  stage3Time:function(){
    return niceDuration(diffDuration(Session.get('start'),Session.get('stage-3')));
  },
  stage4Time:function(){
    return niceDuration(diffDuration(Session.get('start'),Session.get('stage-4')));
  },
  stage1Distance:function(){
    return niceDuration(diffDuration(Session.get('start'),Session.get('stage-1')));
  },
  stage2Distance:function(){
    return niceDuration(diffDuration(Session.get('stage-1'),Session.get('stage-2')));
  },
  stage3Distance:function(){
    return niceDuration(diffDuration(Session.get('stage-2'),Session.get('stage-3')));
  },
  stage4Distance:function(){
    return niceDuration(diffDuration(Session.get('stage-3'),Session.get('stage-4')));
  },
  finishDistance:function(){
    return niceDuration(diffDuration(Session.get('stage-4'),Session.get('finish')));
  },
  stage1:function(){
    return Session.get('stage-1');
  },
  stage2:function(){
    return Session.get('stage-2');
  },
  stage3:function(){
    return Session.get('stage-3');
  },
  stage4:function(){
    return Session.get('stage-4');
  },
  finished:function(){
    return Session.get('finished');
  },
  failed:function(){
    return Session.get('failed');
  }
})




Template.highscore.helpers({
  top10:function(){
    var scores = Scores.find({},{sort:{final:1},limit:10}).fetch();
    return _.map(scores,function(item){
      item['place'] = _.indexOf(scores,item) + 1
      return item;
    });
  },
  niceDuration:function(duration){
    var d = moment.duration(duration);
    return niceDuration(d);
  }
})
