import { GenericIntent } from "assistant-source";

// Taken from: http://stackoverflow.com/questions/23013573/swap-key-with-value-json
const swap = function(json) {
  const ret = {};
  // tslint:disable-next-line:forin
  for (const key in json) {
    ret[json[key]] = key;
  }
  return ret;
};

export const apiaiToGenericIntent: { [name: string]: GenericIntent } = {
  yesGenericIntent: GenericIntent.Yes,
  noGenericIntent: GenericIntent.No,
  helpGenericIntent: GenericIntent.Help,
  cancelGenericIntent: GenericIntent.Cancel,
  stopGenericIntent: GenericIntent.Stop,
  invokeGenericIntent: GenericIntent.Invoke,
};

export const genericIntentToApiai: { [intent: number]: string } = swap(apiaiToGenericIntent);
