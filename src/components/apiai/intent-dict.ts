import { unifierInterfaces } from "assistant-source";

// Taken from: http://stackoverflow.com/questions/23013573/swap-key-with-value-json
let swap = function(json) {
  let ret = {};
  for (let key in json) {
    ret[json[key]] = key;
  }
  return ret;
};

export const apiaiToGenericIntent: {[name: string]: unifierInterfaces.GenericIntent} = {
  "yesGenericIntent": unifierInterfaces.GenericIntent.Yes,
  "noGenericIntent": unifierInterfaces.GenericIntent.No,
  "helpGenericIntent": unifierInterfaces.GenericIntent.Help,
  "cancelGenericIntent": unifierInterfaces.GenericIntent.Cancel
};

export const genericIntentToApiai: {[intent: number]: string} = swap(apiaiToGenericIntent);