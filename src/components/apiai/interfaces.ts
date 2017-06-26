import { unifierInterfaces } from "assistant-source";

export interface OptionalConfiguration {
  /** Route for api.ai requests, default: '/apiai */
  route?: string;

  /** Entitiy configuration for api.ai */
  entities?: { [name: string]: string };
};

export interface Configuration extends OptionalConfiguration {};

export interface Extraction extends 
  unifierInterfaces.MinimalRequestExtraction,
  unifierInterfaces.OptionalExtractions.SpokenTextExtraction {}

export interface HandlerInterface extends
  unifierInterfaces.MinimalResponseHandler {};