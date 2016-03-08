// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.


import {Observable} from "rxjs";

import {Environment} from "webreed-core/lib/Environment";
import {Generator} from "webreed-core/lib/plugin/Generator";
import {Resource} from "webreed-core/lib/Resource";


/**
 * The standard generator implementation for webreed which applies transformations using
 * the resource's extension chain and then applies a specified template.
 */
export class StandardGenerator implements Generator {

  private _env: Environment;

  /**
   * @param env
   *   An environment that represents a webreed project.
   */
  constructor(env: Environment) {
    this._env = env;
  }

  public generate(sourceResource: Resource, context: Object): Observable<Resource> {
    let extensionChain = (sourceResource._extensionChain || sourceResource.__sourceExtensionChain || "");

    return this._env.invoke("applyExtensionChainToResource", sourceResource, extensionChain)
      .flatMap((transformedResource: Resource) => {
        let templateName = transformedResource._template;
        if (!!templateName) {
          return this._env.invoke("applyTemplateToResource", transformedResource, templateName)
        }
        else {
          return Observable.of(transformedResource);
        }
      });
  }

}
