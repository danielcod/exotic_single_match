var deepCopy=function(struct) {
    return JSON.parse(JSON.stringify(struct));
};

var ajaxErrHandler=function(xhr, ajaxOptions, thrownError) {
    console.log(xhr.responseText);    
};

