var message = "Hello, Sujan Shrestha! How are you?";
for(var i=0; i<message.length; i++) {
    message = message.slice(0, i) + "Dipen" + message.slice(i+5);
}

console.log(message);