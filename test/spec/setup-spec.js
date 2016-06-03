// Copyright (c) Rotorz Limited. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root.

"use strict";


const given = require("mocha-testdata");
const should = require("should");

const Environment = require("webreed-core/lib/Environment").Environment;

const setup = require("../../lib/setup").default;
const StandardGenerator = require("../../lib/StandardGenerator").StandardGenerator;


describe("#setup(env, options)", function () {

  it("is a function", function () {
    setup
      .should.be.a.Function();
  });

  it("adds 'standard' generator to the environment", function () {
    let env = new Environment();
    setup(env);
    env.generators.get("standard")
      .should.be.instanceOf(StandardGenerator);
  });

});
