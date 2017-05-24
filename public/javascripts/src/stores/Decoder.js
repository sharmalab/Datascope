var Decoder = class Decoder {
  constructor(dataDescription){
    //convert dataDescription.json file to decoder datastructure.
  
    var D = {};
    for(var i=0; i<dataDescription.length; i++){
      var d = dataDescription[i];
      var attr = d.attributeName;
      if(d.dictionary){
        D[attr] = {};
        console.log(d.dictionary);
        var dictionary = d.dictionary;
        for(var j in dictionary){
          if(dictionary.hasOwnProperty(j)){
            D[attr][j] = dictionary[j];
          }
        }
      }
    }
    this.decoder = D;

  }

  decode(data){
    var decoder = this.decoder;
    for(var i in decoder){
      if(!decoder.hasOwnProperty(i)){
        continue;
      }
      var dictionary = decoder[i];

      if(data[i]){
        var attributeData = data[i].values;
        for(var d in attributeData){
          if(!attributeData.hasOwnProperty(d)){
            continue;
          }

          if(dictionary[attributeData[d].key]){
            attributeData[d].key = dictionary[attributeData[d].key];     
          }
        }
        data[i].values = attributeData;
      }   

    }
    return data;  
  }
};

module.exports = Decoder;
