export  function getDescriptionById(enums, id) {
    var description = 'undefined';
    for(var key in enums){
        if(enums[key].value != undefined && enums[key].value == id){
            description = enums[key].description;
        }
    }
    return description;
} 