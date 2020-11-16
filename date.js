

exports.getDate = function (){
  const date = new Date();
  let options = {weekday: "long", month: "short", day: "numeric"};
  today = date.toLocaleDateString("en-us", options);
  return today;
};

exports.getDay = function (){
  const date = new Date();
  let options = {weekday: "long"};
  day = date.toLocaleDateString("en-us", options);
  return day;
};
