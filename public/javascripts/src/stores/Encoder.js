
var Encoder = class Encoder {
  constructor(dataDescription){
    //convert dataDescription.json to encoder datastructure.
    var E = {};
    for(var  i=0; i<dataDescription.length; i++){
      var d = dataDescription[i];
      var attr = d.attributeName;
      if(d.dictionary){
        E[attr] = {};
        var dictionary = d.dictionary;
        for(var j in dictionary){
          if(dictionary.hasOwnProperty(j)){
            E[attr][dictionary[j]] = j;
          }
        }
      }
    }
    this.encoder = E;
  }

  encode(queryFilter) {
    var encoder = this.encoder;
    for(var key in queryFilter){
      if(queryFilter.hasOwnProperty(key)){
          
           
           var qf = queryFilter[key];
           if(encoder[key]){ //encoding exists for key?
              var e = encoder[key];
              var encodedQf = [];
              for(var i=0; i<qf.length; i++){
                if(e[qf[i]]){
                  encodedQf.push(e[qf[i]]);
                } else {
                  encodedQf.push(qf[i]);
                }
              }
              qf = encodedQf;
              queryFilter[key] = qf;
           }
      }
    }
    return queryFilter;
  }
};

module.exports = Encoder;
