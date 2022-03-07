#!/bin/bash

function ts {
    yarn tsc --noEmit
}

function ts:watch {
    yarn tsc --noEmit --watch
}

function run {
    yarn ts-node src/Lox.ts
}

function fmt {
    yarn prettier --write src/**/*.ts
}

"$@"
