// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.


import given from "mocha-testdata";
import should from "should";
import {Observable} from "rxjs";

import {Environment} from "webreed-core/lib/Environment";
import {ResourceType} from "webreed-core/lib/ResourceType";

import {StandardGenerator} from "../lib/StandardGenerator";


describe("StandardGenerator", function () {

  beforeEach(function () {
    this.env = new Environment();
    this.env.resourceTypes.set(".nunjucks", new ResourceType());

    this.standardGenerator = new StandardGenerator(this.env);
  });


  it("is named 'StandardGenerator'", function () {
    StandardGenerator.name
      .should.be.eql("StandardGenerator");
  });


  describe("#constructor()", function () {

    it("is a function", function () {
      StandardGenerator.prototype.constructor
        .should.be.a.Function();
    });

  });


  describe("#generate(sourceResource, context)", function () {

    it("is a function", function () {
      this.standardGenerator.generate
        .should.be.a.Function();
    });

    it("rejects with errors", function () {
      let sourceResource = this.env.createResource();

      this.env.behaviors.applyExtensionChainToResource = (env, resource, extensionChain) => {
        return Observable.throw(new Error("Epic fail!"));
      };

      return this.standardGenerator.generate(sourceResource, { })
        .toPromise()
        .should.be.rejectedWith("Epic fail!");
    });

    it("applies transformation chain to source resource", function () {
      let sourceResource = this.env.createResource();
      let transformedResource;

      this.env.behaviors.set("applyExtensionChainToResource", function (env, resource, extensionChain) {
        transformedResource = resource;
        return Observable.of(resource);
      });

      return this.standardGenerator.generate(sourceResource, { })
        .toPromise().then(() => {
          transformedResource
            .should.be.exactly(sourceResource);
        });
    });

    it("applies template to each output resource", function () {
      let sourceResource = this.env.createResource({ _template: "foo.nunjucks" });
      let renderedResources = [];

      this.env.behaviors.set("applyExtensionChainToResource", function (env, resource, extensionChain) {
        return Observable.of(
          resource.clone({ a: 1 }),
          resource.clone({ a: 2 })
        );
      });

      this.env.behaviors.set("applyTemplateToResource", function (env, resource, templateName) {
        renderedResources.push(resource);
        return Observable.of(resource);
      });

      return this.standardGenerator.generate(sourceResource, { })
        .toPromise().then(() => {
          renderedResources[0]
            .should.have.property("a", 1);
          renderedResources[1]
            .should.have.property("a", 2);
        });
    });

    it("yields each rendered output when templates ARE NOT applied", function () {
      let sourceResource = this.env.createResource();

      this.env.behaviors.set("applyExtensionChainToResource", function (env, resource, extensionChain) {
        return Observable.of(
          resource.clone({ a: 1 }),
          resource.clone({ a: 2 })
        );
      });

      return this.standardGenerator.generate(sourceResource, { })
        .toArray().toPromise().then(outputResources => {
          outputResources[0]
            .should.have.property("a", 1);
          outputResources[1]
            .should.have.property("a", 2);
        });
    });

    it("yields each rendered output when templates ARE applied", function () {
      let sourceResource = this.env.createResource({ _template: "foo.nunjucks" });

      this.env.behaviors.set("applyExtensionChainToResource", function (env, resource, extensionChain) {
        return Observable.of(
          resource.clone({ a: 1 }),
          resource.clone({ a: 2 })
        );
      });

      this.env.behaviors.set("applyTemplateToResource", function (env, resource, templateName) {
        return Observable.of(
          resource.clone({ b: resource.a + 1 })
        );
      });

      return this.standardGenerator.generate(sourceResource, { })
        .toArray().toPromise().then(outputResources => {
          outputResources[0]
            .should.have.property("b", 2);
          outputResources[1]
            .should.have.property("b", 3);
        });
    });

  });

});
