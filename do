#!/bin/bash

function ts {
    yarn tsc --noEmit
}

function ts:watch {
    yarn tsc --noEmit --watch
}

function run {
    yarn ts-node src/index.ts
}

"$@"
