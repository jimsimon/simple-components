#
# Modified to work with Travis CI automated builds
# Original license follows
#
# @license
# Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
# This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
# The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
# The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
# Code distributed by Google as part of the polymer project is also
# subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
#

# This script pushes a demo-friendly version of your element and its
# dependencies to gh-pages.

# usage gp Polymer core-item [branch]
# Run in a clean directory passing in a GitHub org and repo name
org=$1
repo=$2
name=$3
email=$4
branch=${5:-"master"} # default to master when branch isn't specified

# switch to gh-pages branch
git branch -D gh-pages || true
git checkout --orphan gh-pages

# move contents of repo to a subdirectory
mkdir $repo
shopt -s extglob
mv !($repo) $repo
shopt -u extglob

# move any node modules required for the demo to work to the same level as our component folder, then kill anything left over
cd $repo
mv node_modules/polymer node_modules/webcomponentsjs node_modules/custom-elements node_modules/shadydom node_modules/shadycss node_modules/iron-component-page node_modules/hydrolysis node_modules/iron-ajax node_modules/iron-doc-viewer node_modules/iron-flex-layout node_modules/iron-icons node_modules/iron-selector node_modules/app-layout node_modules/paper-styles node_modules/paper-button node_modules/paper-behaviors node_modules/iron-behaviors node_modules/font-roboto node_modules/marked-element node_modules/prism-highlighter node_modules/prism-element node_modules/iron-icon node_modules/paper-ripple node_modules/iron-a11y-keys-behavior node_modules/iron-meta node_modules/iron-iconset-svg node_modules/iron-scroll-target-behavior node_modules/iron-resizable-behavior node_modules/marked node_modules/prism ../
rm -rf node_modules
cd ..

# redirect by default to the correct folder
echo "<META http-equiv="refresh" content=\"0;URL=$repo/\">" > index.html

git config user.name $name
git config user.email $email

# send it all to github
git add -A .
git commit -am 'Deploy to GitHub Pages'
git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" gh-pages